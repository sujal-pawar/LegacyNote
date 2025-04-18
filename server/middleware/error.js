const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for dev
  console.error('Error details:', err);

  // Multer errors (file uploads)
  if (err.name === 'MulterError') {
    const message = err.message || 'File upload error';
    let details = '';
    
    // Handle specific multer errors
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        details = 'File is too large. Maximum size is 15MB per file.';
        break;
      case 'LIMIT_FILE_COUNT':
        details = 'Too many files. Maximum 5 files allowed.';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        details = 'Unexpected file field. Files should be uploaded as mediaFiles.';
        break;
      default:
        details = `Upload error: ${err.code}`;
    }
    
    error = new Error(message);
    error.statusCode = 400;
    error.details = details;
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found`;
    error = new Error(message);
    error.statusCode = 404;
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new Error(message);
    error.statusCode = 400;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = new Error(message);
    error.statusCode = 400;
  }

  // Check for payload too large error
  if (err.type === 'entity.too.large') {
    error = new Error('Request entity too large');
    error.statusCode = 413;
    error.details = 'The uploaded file is too large. Please reduce the file size.';
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
    details: error.details || null
  });
};

module.exports = errorHandler; 