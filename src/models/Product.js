/**
 * Product model.
 * Represents items available for purchase in the store.
 * Price is stored as DECIMAL(10,2) for accurate currency handling.
 * Stock is tracked and validated (cannot go negative).
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Product name is required' },
      len: { args: [2, 200], msg: 'Name must be between 2 and 200 characters' },
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      isDecimal: { msg: 'Price must be a valid number' },
      min: { args: [0.01], msg: 'Price must be greater than 0' },
    },
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      isInt: { msg: 'Stock must be a whole number' },
      min: { args: [0], msg: 'Stock cannot be negative' },
    },
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  timestamps: true,
  tableName: 'products',
});

module.exports = Product;
