const express = require('express');
const router = express.Router();
const {
  placeOrder,
  getOrders,
  getOrderById,
  cancelOrder,
  updateOrderStatus,
  simulatePayment,
} = require('../controllers/orderController');
const {
  placeOrderValidator,
  updateOrderStatusValidator,
  simulatePaymentValidator,
} = require('../validators/orderValidator');
const validate = require('../middlewares/validate');
const authenticate = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');

// All order routes require authentication
router.use(authenticate);

// Customer: place an order
router.post('/', authorize('customer'), placeOrderValidator, validate, placeOrder);

// Both: get orders (customers see own, admins see all)
router.get('/', getOrders);

// Both: get single order
router.get('/:id', getOrderById);

// Both: cancel an order (customers can cancel own orders, admins can cancel any)
router.put('/:id/cancel', authorize('customer', 'admin'), cancelOrder);

// Admin: update order status
router.patch('/:id/status', authorize('admin'), updateOrderStatusValidator, validate, updateOrderStatus);

// Both: simulate payment (customer pays own orders, admin can process any)
router.post('/:id/pay', authorize('customer', 'admin'), simulatePaymentValidator, validate, simulatePayment);

module.exports = router;
