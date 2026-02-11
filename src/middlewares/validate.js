const { validationResult } = require('express-validator');

/**
 * Validation middleware.
 * Runs after express-validator checks in the route chain.
 * If any validation errors exist, returns a 400 response with
 * structured error details (field name + message for each error).
 * If validation passes, calls next() to continue to the controller.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

module.exports = validate;
