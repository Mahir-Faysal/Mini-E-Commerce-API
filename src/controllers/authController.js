const jwt = require('jsonwebtoken');
const { sequelize, User, Cart } = require('../models');

/**
 * Generate a JWT token for a user.
 */
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

/**
 * POST /api/auth/register
 * Register a new user and create their cart.
 */
const register = async (req, res, next) => {
  const t = await sequelize.transaction();

  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email }, transaction: t });
    if (existingUser) {
      await t.rollback();
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    // Create user (inside transaction)
    const user = await User.create(
      {
        name,
        email,
        password,
        role: role || 'customer',
      },
      { transaction: t }
    );

    // Create cart for the user (inside same transaction)
    await Cart.create({ userId: user.id }, { transaction: t });

    // Commit - both user and cart are created atomically
    await t.commit();

    // Generate token
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'Registration successful.',
      data: {
        user: user.toJSON(),
        token,
      },
    });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token.
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Compare passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Generate token
    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        user: user.toJSON(),
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/profile
 * Get the authenticated user's profile.
 */
const getProfile = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: { user: req.user.toJSON() },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getProfile };
