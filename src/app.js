/**
 * Main Express application configuration.
 * Sets up middleware, routes, and error handling.
 */
const express = require('express');
const cors = require('cors');
const errorHandler = require('./middlewares/errorHandler');

// Import route modules
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();

// ===================== GLOBAL MIDDLEWARE =====================
// Enable CORS for cross-origin requests (allows frontend on different port/domain)
app.use(cors());
// Parse incoming JSON request bodies
app.use(express.json());
// Parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// ===================== ROUTES =====================

// Root endpoint - provides API overview and available route prefixes
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Mini E-Commerce API is running',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      cart: '/api/cart',
      orders: '/api/orders',
    },
  });
});

// Mount route modules at their respective base paths
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// ===================== 404 HANDLER =====================
// Catch any requests that don't match a defined route
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found.`,
  });
});

// ===================== ERROR HANDLER =====================

app.use(errorHandler);

module.exports = app;
