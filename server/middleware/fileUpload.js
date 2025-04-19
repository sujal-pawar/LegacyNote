const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const { cloudinary, optimizedImageTransformation } = require('../config/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Define storage strategy based on environment
const getStorage = () => {
  // For Cloudinary storage (preferred for production)
  if (process.env.STORAGE_TYPE === 'cloudinary' || true) { // Default to Cloudinary
    console.log('Using Cloudinary storage configuration');
    
    return new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: process.env.CLOUDINARY_UPLOAD_FOLDER || 'legacy_note_uploads',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'mp3', 'wav', 'mp4', 'webm', 'mov'],
        use_filename: true,
        unique_filename: true,
        format: async (req, file) => {
          // For images, maintain the original format
          if (file.mimetype.includes('image/')) {
            return file.mimetype.split('/')[1];
          }
          return undefined; // Let Cloudinary determine format for other file types
        },
        public_id: (req, file) => {
          const randomString = crypto.randomBytes(8).toString('hex');
          const uniqueSuffix = Date.now() + '-' + randomString;
          
          // Include user ID in path if available
          const userFolder = req.user ? req.user.id : 'anonymous';
          
          // Keep original filename without extension for readability
          const originalName = path.basename(file.originalname, path.extname(file.originalname));
          const safeOriginalName = originalName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 40);
          
          return `${userFolder}/${safeOriginalName}_${uniqueSuffix}`;
        },
        resource_type: 'auto', // Auto-detect resource type
        // Add image optimization transformations
        transformation: (req, file) => {
          // Apply optimization only to image files
          if (file.mimetype.includes('image/')) {
            return [
              { quality: 'auto:good' },           // Auto quality optimization
              { fetch_format: 'auto' },           // Auto format selection (WebP, AVIF, etc.)
              { width: 2000, crop: 'limit' },     // Limit max width while preserving aspect ratio
              { dpr: 'auto' },                    // Auto device pixel ratio
              // Generate responsive variants for different screen sizes
              { responsive: true, width: 'auto' },
              // Create a thumbnail version
              { transformation: [
                  { width: 300, height: 300, crop: 'fill', gravity: 'auto' }, 
                  { quality: 'auto' }
                ]
              }
            ];
          }
          return []; // No transformations for non-image files
        }
      }
    });
  } 
  
  // Fallback to local storage for development
  console.log('Using local storage configuration');
  return multer.diskStorage({
    destination: function (req, file, cb) {
      // Store files in the uploads directory with relative path
      cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
      // Generate unique filename with timestamp and random string
      const randomString = crypto.randomBytes(8).toString('hex');
      const uniqueSuffix = Date.now() + '-' + randomString;
      const fileExt = path.extname(file.originalname);
      cb(null, uniqueSuffix + fileExt);
    }
  });
};

// File filter to allow only certain file types
const fileFilter = (req, file, cb) => {
  // Define allowed file types
  const allowedFileTypes = [
    // Images
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    // Documents
    'application/pdf', 'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    // Audio
    'audio/mpeg', 'audio/wav', 'audio/ogg',
    // Video
    'video/mp4', 'video/webm', 'video/quicktime'
  ];
  
  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, documents, audio, and video files are allowed.'), false);
  }
};

// Set up upload middleware with file size limit of 15MB per file, 50MB total
const upload = multer({
  storage: getStorage(),
  fileFilter: fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB per file
    files: 5,                    // Maximum 5 files
  }
});

module.exports = upload; 