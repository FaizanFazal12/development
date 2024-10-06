// errorMiddleware.js

const errorMiddleware = (err, req, res, next) => {
    console.error(err); // Log the error for debugging
  
    // Check if it's a Joi validation error
    if (err.isJoi) {
      return res.status(400).json({
        success: false,
        message: err.details[0].message, // Send only the Joi error message
      });
    }
  
    // Handle other types of errors
    const statusCode = err.status || 500; // Use the error status if provided, otherwise default to 500
    const message = err.message || 'Internal Server Error'; // Default message if none provided
  
    res.status(statusCode).json({
      success: false,
      status: statusCode,
      message: message,
    });
  };
  
  export default errorMiddleware;
  