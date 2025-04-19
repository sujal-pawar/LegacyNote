const { StatusCodes } = require('http-status-codes');
const { CustomAPIError } = require('../errors');

const errorHandlerMiddleware = (err, req, res, next) => {
  console.error('Error:', err);

  let customError = {
    // Set default values
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    message: err.message || 'Something went wrong, please try again later'
  };

  // Check for specific error types
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    customError.message = Object.values(err.errors)
      .map(item => item.message)
      .join(', ');
    customError.statusCode = StatusCodes.BAD_REQUEST;
  }

  // Mongoose duplicate key error (usually for unique fields)
  if (err.code && err.code === 11000) {
    customError.message = `Duplicate value entered for ${Object.keys(
      err.keyValue
    )} field, please choose another value`;
    customError.statusCode = StatusCodes.BAD_REQUEST;
  }

  // MongoDB cast error (usually for invalid IDs)
  if (err.name === 'CastError') {
    customError.message = `No item found with id: ${err.value}`;
    customError.statusCode = StatusCodes.NOT_FOUND;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    customError.message = 'Authentication failed: Invalid token';
    customError.statusCode = StatusCodes.UNAUTHORIZED;
  }

  if (err.name === 'TokenExpiredError') {
    customError.message = 'Authentication failed: Token expired';
    customError.statusCode = StatusCodes.UNAUTHORIZED;
  }

  return res.status(customError.statusCode).json({ 
    success: false,
    error: customError.message
  });
};

module.exports = errorHandlerMiddleware; 