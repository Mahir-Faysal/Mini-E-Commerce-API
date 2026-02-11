/**
 * Cart model.
 * Each user has exactly one cart (1:1 relationship, enforced by unique userId).
 * The cart is automatically created when a user registers.
 * Contains CartItems which reference products and quantities.
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Cart = sequelize.define('Cart', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
}, {
  timestamps: true,
  tableName: 'carts',
});

module.exports = Cart;
