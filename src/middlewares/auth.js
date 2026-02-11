const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * Authentication middleware.
 * Verifies the JWT Bearer token from the Authorization header.
 * On success, attaches the full user object to req.user so
 * downstream handlers can access the authenticated user's data.
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    // Extract the token from "Bearer <token>" format
    const token = authHeader.split(' ')[1];

    // Verify token signature and decode the payload (contains user id, email, role)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch the full user record from DB to ensure the user still exists
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.',
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired.',
      });
    }
    next(error);
  }
};

module.exports = authenticate;
