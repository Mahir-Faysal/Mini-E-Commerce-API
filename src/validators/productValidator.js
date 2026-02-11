const { body } = require('express-validator');

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

const updateStockValidator = [
  body('stock')
    .notEmpty().withMessage('Stock value is required')
    .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
];

module.exports = { createProductValidator, updateProductValidator, updateStockValidator };
