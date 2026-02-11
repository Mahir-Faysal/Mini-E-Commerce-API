const express = require('express');
const cors = require('cors');
const errorHandler = require('./middlewares/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();

// ===================== GLOBAL MIDDLEWARE =====================

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===================== ROUTES =====================

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Mini E-Commerce API is running 🛒',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      cart: '/api/cart',
      orders: '/api/orders',
    },
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// ===================== 404 HANDLER =====================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found.`,
  });
});

// ===================== ERROR HANDLER =====================

app.use(errorHandler);

module.exports = app;
