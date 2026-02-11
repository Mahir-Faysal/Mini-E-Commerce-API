const express = require('express');
const router = express.Router();
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  updateStock,
} = require('../controllers/productController');
const {
  createProductValidator,
  updateProductValidator,
  updateStockValidator,
} = require('../validators/productValidator');
const validate = require('../middlewares/validate');
const authenticate = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');

// Public routes
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Admin-only routes
router.post('/', authenticate, authorize('admin'), createProductValidator, validate, createProduct);
router.put('/:id', authenticate, authorize('admin'), updateProductValidator, validate, updateProduct);
router.delete('/:id', authenticate, authorize('admin'), deleteProduct);
router.patch('/:id/stock', authenticate, authorize('admin'), updateStockValidator, validate, updateStock);

module.exports = router;
