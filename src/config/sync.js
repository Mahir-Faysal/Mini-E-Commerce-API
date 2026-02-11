/**
 * Database sync utility.
 * Run with: npm run db:sync
 *
 * WARNING: Using { force: true } will DROP all tables and recreate them.
 * Use { alter: true } to modify tables without losing data.
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { sequelize } = require('../models');

const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established.');

    // Use force: true to drop and recreate all tables (dev only!)
    // Use alter: true to update tables without dropping
    const option = process.argv[2] || 'alter';

    if (option === 'force') {
      console.log('⚠️  Force sync — dropping and recreating all tables...');
      await sequelize.sync({ force: true });
    } else {
      console.log('🔄 Alter sync — updating tables...');
      await sequelize.sync({ alter: true });
    }

    console.log('✅ Database synchronized successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database sync failed:', error.message);
    process.exit(1);
  }
};

syncDatabase();
