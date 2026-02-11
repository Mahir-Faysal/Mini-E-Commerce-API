/**
 * Role-based authorization middleware factory.
 * Returns a middleware function that checks if the authenticated user
 * has one of the specified roles. Must be used AFTER the authenticate
 * middleware (which sets req.user).
 *
 * Usage: authorize('admin') or authorize('customer', 'admin')
 *
 * @param  {...string} roles - Allowed roles (e.g., 'admin', 'customer')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role(s): ${roles.join(', ')}`,
      });
    }

    next();
  };
};

module.exports = authorize;
