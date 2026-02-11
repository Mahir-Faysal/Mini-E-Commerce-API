/**
 * Order request validators.
 * Validates order placement, status updates, and payment simulation requests.
 * Payment methods include: credit_card, debit_card, mobile_banking,
 * cash_on_delivery, paypal, and bank_transfer.
 */
const { body } = require('express-validator');

// Validates order placement - shipping address is optional
const placeOrderValidator = [
  body('shippingAddress')
    .optional()
    .trim()
    .isLength({ min: 5 }).withMessage('Shipping address must be at least 5 characters'),
];

// Validates admin status update - must be a valid order status
const updateOrderStatusValidator = [
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Invalid status. Must be one of: pending, confirmed, shipped, delivered, cancelled'),
];

// Validates payment simulation - must include a supported payment method
const simulatePaymentValidator = [
  body('paymentMethod')
    .notEmpty().withMessage('Payment method is required')
    .isIn(['credit_card', 'debit_card', 'mobile_banking', 'cash_on_delivery', 'paypal', 'bank_transfer'])
    .withMessage('Invalid payment method. Must be one of: credit_card, debit_card, mobile_banking, cash_on_delivery, paypal, bank_transfer'),
];

module.exports = { placeOrderValidator, updateOrderStatusValidator, simulatePaymentValidator };
