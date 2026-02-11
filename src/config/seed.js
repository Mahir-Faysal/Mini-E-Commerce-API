/**
 * Database seed script.
 * Run with: npm run seed
 *
 * Creates:
 * - 1 Admin user
 * - 1 Customer user
 * - Sample products
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { sequelize, User, Product, Cart } = require('../models');

const seedData = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established.');

    // Sync tables
    await sequelize.sync({ alter: true });

    // ==================== SEED USERS ====================

    const [adminUser, adminCreated] = await User.findOrCreate({
      where: { email: 'admin@ecommerce.com' },
      defaults: {
        name: 'Admin User',
        email: 'admin@ecommerce.com',
        password: 'admin123',
        role: 'admin',
      },
    });

    if (adminCreated) {
      console.log('👤 Admin user created: admin@ecommerce.com / admin123');
    } else {
      console.log('👤 Admin user already exists.');
    }

    const [customerUser, customerCreated] = await User.findOrCreate({
      where: { email: 'customer@ecommerce.com' },
      defaults: {
        name: 'John Customer',
        email: 'customer@ecommerce.com',
        password: 'customer123',
        role: 'customer',
      },
    });

    if (customerCreated) {
      console.log('👤 Customer user created: customer@ecommerce.com / customer123');
      // Create cart for customer
      await Cart.findOrCreate({ where: { userId: customerUser.id } });
    } else {
      console.log('👤 Customer user already exists.');
    }

    // Create cart for admin too (in case they want to test)
    await Cart.findOrCreate({ where: { userId: adminUser.id } });

    // ==================== SEED PRODUCTS ====================

    const products = [
      {
        name: 'Wireless Bluetooth Headphones',
        description: 'High-quality over-ear headphones with noise cancellation and 30-hour battery life.',
        price: 79.99,
        stock: 50,
        imageUrl: 'https://example.com/images/headphones.jpg',
      },
      {
        name: 'USB-C Fast Charging Cable',
        description: 'Durable 6ft braided USB-C cable with 100W fast charging support.',
        price: 12.99,
        stock: 200,
        imageUrl: 'https://example.com/images/cable.jpg',
      },
      {
        name: 'Mechanical Gaming Keyboard',
        description: 'RGB backlit mechanical keyboard with Cherry MX Blue switches.',
        price: 129.99,
        stock: 30,
        imageUrl: 'https://example.com/images/keyboard.jpg',
      },
      {
        name: 'Portable Power Bank 20000mAh',
        description: 'Compact power bank with dual USB ports and LED indicator.',
        price: 34.99,
        stock: 100,
        imageUrl: 'https://example.com/images/powerbank.jpg',
      },
      {
        name: 'Smart Fitness Watch',
        description: 'Waterproof fitness tracker with heart rate monitor, GPS, and sleep tracking.',
        price: 199.99,
        stock: 25,
        imageUrl: 'https://example.com/images/watch.jpg',
      },
      {
        name: 'Laptop Stand - Adjustable',
        description: 'Ergonomic aluminum laptop stand with adjustable height and angle.',
        price: 45.99,
        stock: 75,
        imageUrl: 'https://example.com/images/stand.jpg',
      },
      {
        name: 'Wireless Mouse',
        description: 'Ergonomic wireless mouse with silent click and adjustable DPI.',
        price: 24.99,
        stock: 150,
        imageUrl: 'https://example.com/images/mouse.jpg',
      },
      {
        name: 'Phone Case - Clear',
        description: 'Slim transparent phone case with shock-absorbing bumper.',
        price: 9.99,
        stock: 300,
        imageUrl: 'https://example.com/images/phonecase.jpg',
      },
    ];

    let productsCreated = 0;
    for (const productData of products) {
      const [product, created] = await Product.findOrCreate({
        where: { name: productData.name },
        defaults: productData,
      });
      if (created) productsCreated++;
    }

    console.log(`📦 ${productsCreated} new products seeded (${products.length - productsCreated} already existed).`);

    console.log('\n✅ Seeding complete!');
    console.log('='.repeat(50));
    console.log('Test Credentials:');
    console.log('  Admin:    admin@ecommerce.com / admin123');
    console.log('  Customer: customer@ecommerce.com / customer123');
    console.log('='.repeat(50));

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    console.error(error);
    process.exit(1);
  }
};

seedData();
