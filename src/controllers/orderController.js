/**
 * Order controller.
 * Handles the complete order lifecycle:
 *   - Place order (converts cart to order with database transaction + row-level locking)
 *   - View orders (role-based: customers see own, admins see all)
 *   - Cancel order (with stock restoration and fraud prevention)
 *   - Update order status (admin only, enforces valid state transitions)
 *   - Simulate payment (90% success rate for demo purposes)
 */
const { sequelize, Cart, CartItem, Order, OrderItem, Product, User } = require('../models');
const { Op } = require('sequelize');

/**
 * POST /api/orders
 * Place an order from the current cart.
 * Uses a database transaction to ensure data consistency.
 */
const placeOrder = async (req, res, next) => {
  const t = await sequelize.transaction();

  try {
    const { shippingAddress } = req.body;
    const userId = req.user.id;

    // 1. Get the user's cart with items
    const cart = await Cart.findOne({
      where: { userId },
      include: [
        {
          model: CartItem,
          as: 'items',
          include: [{ model: Product, as: 'product' }],
        },
      ],
      transaction: t,
    });

    if (!cart || cart.items.length === 0) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Cart is empty. Add items before placing an order.',
      });
    }

    // 2. Validate stock for all items and calculate total
    let totalAmount = 0;
    const orderItemsData = [];

    for (const item of cart.items) {
      // Lock the product row (SELECT ... FOR UPDATE) to prevent race conditions
      // where two users might try to buy the last item simultaneously
      const product = await Product.findByPk(item.productId, {
        lock: t.LOCK.UPDATE,
        transaction: t,
      });

      if (!product) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: `Product "${item.product.name}" is no longer available.`,
        });
      }

      if (product.stock < item.quantity) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Requested: ${item.quantity}, Available: ${product.stock}`,
        });
      }

      const itemTotal = parseFloat(product.price) * item.quantity;
      totalAmount += itemTotal;

      orderItemsData.push({
        productId: product.id,
        quantity: item.quantity,
        priceAtPurchase: product.price,
      });
    }

    // 3. Create the order
    const order = await Order.create(
      {
        userId,
        totalAmount: parseFloat(totalAmount.toFixed(2)),
        status: 'pending',
        paymentStatus: 'unpaid',
        shippingAddress: shippingAddress || null,
      },
      { transaction: t }
    );

    // 4. Create order items
    const orderItems = await OrderItem.bulkCreate(
      orderItemsData.map((item) => ({
        ...item,
        orderId: order.id,
      })),
      { transaction: t }
    );

    // 5. Deduct stock from products
    for (const item of orderItemsData) {
      await Product.decrement('stock', {
        by: item.quantity,
        where: { id: item.productId },
        transaction: t,
      });
    }

    // 6. Clear the cart
    await CartItem.destroy({
      where: { cartId: cart.id },
      transaction: t,
    });

    // 7. Commit the transaction
    await t.commit();

    // Fetch complete order
    const completeOrder = await Order.findByPk(order.id, {
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'imageUrl'] }],
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully.',
      data: { order: completeOrder },
    });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

/**
 * GET /api/orders
 * Get orders - customers see own orders, admins see all.
 */
const getOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const where = {};

    // Customers only see their own orders
    if (req.user.role === 'customer') {
      where.userId = req.user.id;
    }

    if (status) {
      where.status = status;
    }

    const { count, rows: orders } = await Order.findAndCountAll({
      where,
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'imageUrl'] }],
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/orders/:id
 * Get a single order by ID.
 */
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'price', 'imageUrl'] }],
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    // Customers can only view their own orders
    if (req.user.role === 'customer' && order.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own orders.',
      });
    }

    res.status(200).json({
      success: true,
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/orders/:id/cancel
 * Cancel an order. Restores stock. Includes fraud prevention.
 */
const cancelOrder = async (req, res, next) => {
  const t = await sequelize.transaction();

  try {
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';
    const maxCancellations = parseInt(process.env.MAX_CANCELLATIONS_PER_DAY) || 3;

    // Fraud prevention: limit how many orders a customer can cancel per day.
    // This prevents abuse (e.g., repeatedly ordering to reserve stock then cancelling).
    // Admins are exempt from this limit.
    const user = await User.findByPk(userId, { transaction: t });
    const today = new Date().toISOString().split('T')[0];

    if (!isAdmin && user.lastCancellationDate === today && user.cancellationCount >= maxCancellations) {
      await t.rollback();
      return res.status(429).json({
        success: false,
        message: `Cancellation limit reached. You can cancel up to ${maxCancellations} orders per day.`,
      });
    }

    // Find the order
    const order = await Order.findByPk(req.params.id, {
      include: [{ model: OrderItem, as: 'items' }],
      transaction: t,
    });

    if (!order) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    // Customers can only cancel their own orders
    if (req.user.role === 'customer' && order.userId !== userId) {
      await t.rollback();
      return res.status(403).json({
        success: false,
        message: 'Access denied.',
      });
    }

    // Only pending or confirmed orders can be cancelled
    if (!['pending', 'confirmed'].includes(order.status)) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order with status "${order.status}". Only pending or confirmed orders can be cancelled.`,
      });
    }

    // Restore stock for each item
    for (const item of order.items) {
      await Product.increment('stock', {
        by: item.quantity,
        where: { id: item.productId },
        transaction: t,
      });
    }

    // Update order status
    await order.update(
      {
        status: 'cancelled',
        paymentStatus: order.paymentStatus === 'paid' ? 'refunded' : order.paymentStatus,
      },
      { transaction: t }
    );

    // Update cancellation tracking (only for customers, not admins)
    let cancellationCount = 0;
    if (!isAdmin) {
      cancellationCount = user.lastCancellationDate === today
        ? user.cancellationCount + 1
        : 1;

      await user.update(
        {
          cancellationCount,
          lastCancellationDate: today,
        },
        { transaction: t }
      );
    }

    await t.commit();

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully. Stock has been restored.',
      data: {
        order: await Order.findByPk(order.id, {
          include: [
            {
              model: OrderItem,
              as: 'items',
              include: [{ model: Product, as: 'product', attributes: ['id', 'name'] }],
            },
          ],
        }),
        cancellationsToday: cancellationCount,
        maxCancellationsPerDay: maxCancellations,
      },
    });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

/**
 * PATCH /api/orders/:id/status
 * Update order status (Admin only).
 * Enforces valid status transitions.
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    // Define valid status transitions
    const validTransitions = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['shipped', 'cancelled'],
      shipped: ['delivered'],
      delivered: [],
      cancelled: [],
    };

    if (!validTransitions[order.status].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from "${order.status}" to "${status}". Allowed: ${validTransitions[order.status].join(', ') || 'none'}`,
      });
    }

    await order.update({ status });

    res.status(200).json({
      success: true,
      message: `Order status updated to "${status}".`,
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/orders/:id/pay
 * Simulate payment for an order.
 */
const simulatePayment = async (req, res, next) => {
  try {
    const { paymentMethod } = req.body;

    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    // Only order owner can pay
    if (req.user.role === 'customer' && order.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied.',
      });
    }

    // Cannot pay for cancelled orders
    if (order.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot pay for a cancelled order.',
      });
    }

    // Cannot pay again
    if (order.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Order is already paid.',
      });
    }

    // Simulate payment processing (random success/failure for realism)
    const paymentSuccess = Math.random() > 0.1; // 90% success rate

    if (!paymentSuccess) {
      return res.status(402).json({
        success: false,
        message: 'Payment failed. Please try again or use a different payment method.',
      });
    }

    // Update order payment info
    await order.update({
      paymentStatus: 'paid',
      paymentMethod,
      paidAt: new Date(),
      status: order.status === 'pending' ? 'confirmed' : order.status,
    });

    res.status(200).json({
      success: true,
      message: 'Payment processed successfully.',
      data: {
        order,
        payment: {
          method: paymentMethod,
          amount: order.totalAmount,
          paidAt: order.paidAt,
          status: 'completed',
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  placeOrder,
  getOrders,
  getOrderById,
  cancelOrder,
  updateOrderStatus,
  simulatePayment,
};
