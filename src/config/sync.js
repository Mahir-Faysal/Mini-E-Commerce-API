/**
 * Database sync utility.
 * Run with: npm run db:sync
 *
 * Synchronizes Sequelize models with the PostgreSQL database.
 * Two modes available (passed as command-line argument):
 *   - 'alter' (default): Modifies existing tables to match models without data loss
 *   - 'force': Drops ALL tables and recreates them (destroys all data!)
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { sequelize } = require('../models');

const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('[OK] Database connection established.');

    // Use force: true to drop and recreate all tables (dev only!)
    // Use alter: true to update tables without dropping
    const option = process.argv[2] || 'alter';

    if (option === 'force') {
      console.log('[WARNING] Force sync - dropping and recreating all tables...');
      await sequelize.sync({ force: true });
    } else {
      console.log('[SYNC] Alter sync - updating tables...');
      await sequelize.sync({ alter: true });
    }

    console.log('[OK] Database synchronized successfully.');
    process.exit(0);
  } catch (error) {
    console.error('[ERROR] Database sync failed:', error.message);
    process.exit(1);
  }
};

syncDatabase();
