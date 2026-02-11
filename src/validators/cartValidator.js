/**
 * Cart request validators.
 * Validates add-to-cart (productId + optional quantity) and
 * update-cart-item (required quantity) requests.
 */
const { body } = require('express-validator');

// Validates adding a product to cart - productId required, quantity defaults to 1
const addToCartValidator = [
  body('productId')
    .notEmpty().withMessage('Product ID is required')
    .isInt({ min: 1 }).withMessage('Product ID must be a positive integer'),

  body('quantity')
    .optional()
    .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
];

// Validates updating a cart item's quantity
const updateCartItemValidator = [
  body('quantity')
    .notEmpty().withMessage('Quantity is required')
    .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
];

module.exports = { addToCartValidator, updateCartItemValidator };
