/**
 * Product request validators.
 * Validates product creation, update, and stock update requests.
 * All fields are required for creation; optional for updates (partial updates supported).
 */
const { body } = require('express-validator');

// Validates new product creation - all core fields required
const createProductValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Product name is required')
    .isLength({ min: 2, max: 200 }).withMessage('Name must be between 2 and 200 characters'),

  body('description')
    .optional()
    .trim(),

  body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ min: 0.01 }).withMessage('Price must be greater than 0'),

  body('stock')
    .notEmpty().withMessage('Stock is required')
    .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),

  body('imageUrl')
    .optional()
    .trim()
    .isURL().withMessage('Image URL must be a valid URL'),
];

// Validates product update - all fields optional (supports partial updates)
const updateProductValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 }).withMessage('Name must be between 2 and 200 characters'),

  body('description')
    .optional()
    .trim(),

  body('price')
    .optional()
    .isFloat({ min: 0.01 }).withMessage('Price must be greater than 0'),

  body('stock')
    .optional()
    .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),

  body('imageUrl')
    .optional()
    .trim()
    .isURL().withMessage('Image URL must be a valid URL'),
];

// Validates stock-only update
const updateStockValidator = [
  body('stock')
    .notEmpty().withMessage('Stock value is required')
    .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
];

module.exports = { createProductValidator, updateProductValidator, updateStockValidator };
