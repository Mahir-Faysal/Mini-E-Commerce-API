/**
 * OrderItem model.
 * Represents a single product entry within an order.
 * The priceAtPurchase field captures the product's price at the time of
 * order placement, ensuring order totals remain accurate even if the
 * product price is updated later.
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'orders',
      key: 'id',
    },
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id',
    },
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      isInt: { msg: 'Quantity must be a whole number' },
      min: { args: [1], msg: 'Quantity must be at least 1' },
    },
  },
  priceAtPurchase: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Snapshot of product price at time of order placement',
  },
}, {
  timestamps: true,
  tableName: 'order_items',
});

module.exports = OrderItem;
