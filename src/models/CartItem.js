/**
 * CartItem model.
 * Represents a single product entry within a user's cart.
 * Links a cart to a product with a specified quantity.
 * Quantity must be at least 1; stock validation happens in the controller.
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CartItem = sequelize.define('CartItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  cartId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'carts',
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
    defaultValue: 1,
    validate: {
      isInt: { msg: 'Quantity must be a whole number' },
      min: { args: [1], msg: 'Quantity must be at least 1' },
    },
  },
}, {
  timestamps: true,
  tableName: 'cart_items',
});

module.exports = CartItem;
