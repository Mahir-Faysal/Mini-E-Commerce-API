/**
 * Server entry point.
 * Connects to the PostgreSQL database, syncs Sequelize models,
 * and starts the Express HTTP server.
 */
const path = require('path');
// Load environment variables from .env file (resolved relative to this file)
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const app = require('./app');
const { sequelize } = require('./models');

// Use the PORT from environment variables, default to 3000 for local development
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log(' Database connection established successfully.');

    // Sync models (creates tables if they don't exist)
    // In production: sync() only creates missing tables (safe)
    // In development: alter:true updates existing tables to match models
    if (process.env.NODE_ENV === 'production') {
      await sequelize.sync();
    } else {
      await sequelize.sync({ alter: true });
    }
    console.log(' Database models synchronized.');

    // Start Express server
    app.listen(PORT, () => {
      console.log(` Server is running on http://localhost:${PORT}`);
      console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error(' Unable to start server:', error.message);
    process.exit(1);
  }
};

startServer();
