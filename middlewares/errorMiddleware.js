const Joi = require('joi');

const errorMiddleware = (err, req, res, next) => {
  if (err instanceof Joi.ValidationError) {
    const errors = {};
    
    err.details.forEach(detail => {
      errors[detail.path.join('.')] = detail.message; // Using dot notation for nested fields
    });

    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors,
    });
  }

  const statusCode = err.status || 500; // Use the error status if provided, otherwise default to 500
  const message = err.message || 'Internal Server Error'; // Default message if none provided

  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message: message,
  });
};

module.exports = errorMiddleware;
