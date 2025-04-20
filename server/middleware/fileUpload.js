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
        resource_type: 'auto',
      },
    });
  }
  
  // Fallback to local storage (for development)
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      const randomString = crypto.randomBytes(8).toString('hex');
      const uniqueSuffix = Date.now() + '-' + randomString;
      const extension = path.extname(file.originalname);
      
      // Keep original filename for readability
      const originalName = path.basename(file.originalname, extension);
      const safeOriginalName = originalName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 40);
      
      cb(null, `${safeOriginalName}_${uniqueSuffix}${extension}`);
    },
  });
  
  return storage;
};

// File filter function to determine which files to accept
const fileFilter = (req, file, cb) => {
  // Debug log for received file
  console.log(`Received file upload request: ${file.originalname}, MIME: ${file.mimetype}, Size: ${file.size ? file.size : 'unknown'}`);
  
  // Define allowed MIME types for different file categories
  const allowedMimeTypes = {
    images: [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'
    ],
    documents: [
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-word.document.12',
      'application/vnd.ms-word.document.macroEnabled.12',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/rtf',
      'text/plain',
      'application/octet-stream' // Fallback for some systems that might not report correct MIME types
    ],
    audio: [
      'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'
    ],
    video: [
      'video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm', 'video/x-msvideo'
    ]
  };
  
  // Combine all allowed MIME types
  const allAllowedMimeTypes = [
    ...allowedMimeTypes.images,
    ...allowedMimeTypes.documents,
    ...allowedMimeTypes.audio,
    ...allowedMimeTypes.video
  ];
  
  // Check if file MIME type is allowed
  if (allAllowedMimeTypes.includes(file.mimetype)) {
    console.log(`File accepted: ${file.originalname} (MIME: ${file.mimetype})`);
    return cb(null, true);
  }
  
  // If MIME type check fails, try to check by file extension as a fallback
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx', 
                          '.xls', '.xlsx', '.ppt', '.pptx', '.mp3', '.wav', '.mp4', 
                          '.webm', '.mov', '.avi', '.txt', '.rtf'];
  
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(fileExtension)) {
    console.log(`File accepted based on extension: ${file.originalname} with extension ${fileExtension}`);
    return cb(null, true);
  }
  
  // If all checks fail, reject the file
  console.log(`File rejected: ${file.originalname} (MIME: ${file.mimetype}, Extension: ${fileExtension})`);
  cb(new Error(`File type not allowed. Allowed files: images, documents, audio, and video.
                Detected MIME type: ${file.mimetype}`), false);
};

// Configure multer
const upload = multer({
  storage: getStorage(),
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

module.exports = upload; 