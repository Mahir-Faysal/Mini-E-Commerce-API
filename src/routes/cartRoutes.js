/**
 * Cart routes.
 * All cart operations require authentication and the 'customer' role.
 * Supports viewing, adding, updating, removing items, and clearing the cart.
 */
const express = require('express');
const router = express.Router();
const {
  getCart,
  addItem,
  updateItemQuantity,
  removeItem,
  clearCart,
} = require('../controllers/cartController');
const { addToCartValidator, updateCartItemValidator } = require('../validators/cartValidator');
const validate = require('../middlewares/validate');
const authenticate = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');

// All cart routes require authentication and customer role
router.use(authenticate, authorize('customer'));

// GET /api/cart
router.get('/', getCart);

// POST /api/cart/items
router.post('/items', addToCartValidator, validate, addItem);

// PUT /api/cart/items/:itemId
router.put('/items/:itemId', updateCartItemValidator, validate, updateItemQuantity);

// DELETE /api/cart/items/:itemId
router.delete('/items/:itemId', removeItem);

// DELETE /api/cart  (clear entire cart)
router.delete('/', clearCart);

module.exports = router;
