const { body } = require('express-validator');

const addToCartValidator = [
  body('productId')
    .notEmpty().withMessage('Product ID is required')
    .isInt({ min: 1 }).withMessage('Product ID must be a positive integer'),

  body('quantity')
    .optional()
    .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
];

const updateCartItemValidator = [
  body('quantity')
    .notEmpty().withMessage('Quantity is required')
    .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
];

module.exports = { addToCartValidator, updateCartItemValidator };
