const { Product } = require('../models');
const { Op } = require('sequelize');

/**
 * POST /api/products
 * Create a new product (Admin only).
 */
const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, stock, imageUrl } = req.body;

    const product = await Product.create({
      name,
      description,
      price,
      stock,
      imageUrl,
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      data: { product },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/products
 * Get all products with pagination, search, and sorting.
 */
const getAllProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      minPrice,
      maxPrice,
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Build filter conditions
    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }
    if (minPrice) where.price = { ...where.price, [Op.gte]: parseFloat(minPrice) };
    if (maxPrice) where.price = { ...where.price, [Op.lte]: parseFloat(maxPrice) };

    const { count, rows: products } = await Product.findAndCountAll({
      where,
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset,
    });

    res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/products/:id
 * Get a single product by ID.
 */
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: { product },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/products/:id
 * Update a product (Admin only).
 */
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    const { name, description, price, stock, imageUrl } = req.body;

    await product.update({
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(price !== undefined && { price }),
      ...(stock !== undefined && { stock }),
      ...(imageUrl !== undefined && { imageUrl }),
    });

    res.status(200).json({
      success: true,
      message: 'Product updated successfully.',
      data: { product },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/products/:id
 * Delete a product (Admin only).
 */
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    await product.destroy();

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/products/:id/stock
 * Update product stock (Admin only).
 */
const updateStock = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    const { stock } = req.body;

    await product.update({ stock });

    res.status(200).json({
      success: true,
      message: 'Stock updated successfully.',
      data: { product },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  updateStock,
};
