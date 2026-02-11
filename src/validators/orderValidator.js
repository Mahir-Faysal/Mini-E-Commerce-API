const { body } = require('express-validator');

const placeOrderValidator = [
  body('shippingAddress')
    .optional()
    .trim()
    .isLength({ min: 5 }).withMessage('Shipping address must be at least 5 characters'),
];

const updateOrderStatusValidator = [
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Invalid status. Must be one of: pending, confirmed, shipped, delivered, cancelled'),
];

const simulatePaymentValidator = [
  body('paymentMethod')
    .notEmpty().withMessage('Payment method is required')
    .isIn(['credit_card', 'debit_card', 'mobile_banking', 'cash_on_delivery', 'paypal', 'bank_transfer'])
    .withMessage('Invalid payment method. Must be one of: credit_card, debit_card, mobile_banking, cash_on_delivery, paypal, bank_transfer'),
];

module.exports = { placeOrderValidator, updateOrderStatusValidator, simulatePaymentValidator };
