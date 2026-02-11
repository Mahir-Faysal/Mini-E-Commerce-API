/**
 * Cart controller.
 * Manages the shopping cart for authenticated customers.
 * Each user has exactly one cart (created at registration).
 * Supports adding items, updating quantities (auto-increments duplicates),
 * removing individual items, and clearing the entire cart.
 * Validates stock availability before adding or updating items.
 */
const { Cart, CartItem, Product } = require('../models');

/**
 * GET /api/cart
 * Get the current user's cart with all items.
 */
const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({
      where: { userId: req.user.id },
      include: [
        {
          model: CartItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'price', 'stock', 'imageUrl'],
            },
          ],
        },
      ],
    });

    // Create cart if it doesn't exist (safety fallback)
    if (!cart) {
      cart = await Cart.create({ userId: req.user.id });
      cart = await Cart.findOne({
        where: { userId: req.user.id },
        include: [
          {
            model: CartItem,
            as: 'items',
            include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'price', 'stock', 'imageUrl'] }],
          },
        ],
      });
    }

    // Calculate cart total
    const cartTotal = cart.items.reduce((total, item) => {
      return total + parseFloat(item.product.price) * item.quantity;
    }, 0);

    res.status(200).json({
      success: true,
      data: {
        cart,
        cartTotal: parseFloat(cartTotal.toFixed(2)),
        itemCount: cart.items.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/cart/items
 * Add a product to the cart. If it already exists, increment quantity.
 */
const addItem = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // Validate product exists and has stock
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Only ${product.stock} items available.`,
      });
    }

    // Get or create the user's cart
    let cart = await Cart.findOne({ where: { userId: req.user.id } });
    if (!cart) {
      cart = await Cart.create({ userId: req.user.id });
    }

    // Check if product already in cart
    let cartItem = await CartItem.findOne({
      where: { cartId: cart.id, productId },
    });

    if (cartItem) {
      // Check if new total quantity exceeds stock
      const newQuantity = cartItem.quantity + quantity;
      if (newQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more. Cart already has ${cartItem.quantity} and only ${product.stock} available.`,
        });
      }

      await cartItem.update({ quantity: newQuantity });
    } else {
      cartItem = await CartItem.create({
        cartId: cart.id,
        productId,
        quantity,
      });
    }

    // Return updated cart item with product details
    cartItem = await CartItem.findByPk(cartItem.id, {
      include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'price', 'stock', 'imageUrl'] }],
    });

    res.status(200).json({
      success: true,
      message: 'Item added to cart.',
      data: { cartItem },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/cart/items/:itemId
 * Update the quantity of a specific cart item.
 */
const updateItemQuantity = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.findOne({ where: { userId: req.user.id } });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found.',
      });
    }

    const cartItem = await CartItem.findOne({
      where: { id: itemId, cartId: cart.id },
      include: [{ model: Product, as: 'product' }],
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found.',
      });
    }

    // Validate stock
    if (quantity > cartItem.product.stock) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Only ${cartItem.product.stock} items available.`,
      });
    }

    await cartItem.update({ quantity });

    res.status(200).json({
      success: true,
      message: 'Cart item updated.',
      data: { cartItem },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/cart/items/:itemId
 * Remove a specific item from the cart.
 */
const removeItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ where: { userId: req.user.id } });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found.',
      });
    }

    const cartItem = await CartItem.findOne({
      where: { id: itemId, cartId: cart.id },
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found.',
      });
    }

    await cartItem.destroy();

    res.status(200).json({
      success: true,
      message: 'Item removed from cart.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/cart
 * Clear all items from the user's cart.
 */
const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ where: { userId: req.user.id } });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found.',
      });
    }

    await CartItem.destroy({ where: { cartId: cart.id } });

    res.status(200).json({
      success: true,
      message: 'Cart cleared.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCart, addItem, updateItemQuantity, removeItem, clearCart };
