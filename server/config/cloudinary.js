const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Define optimized image transformation settings
const optimizedImageTransformation = {
  quality: 'auto:good',
  fetch_format: 'auto',
  responsive: true,
  width: 'auto',
  dpr: 'auto',
  crop: 'limit',
  responsive_placeholder: 'blank'
};

// Define thumbnail transformation settings
const thumbnailTransformation = {
  width: 200,
  height: 200,
  crop: 'fill',
  quality: 'auto:good',
  fetch_format: 'auto'
};

/**
 * Get an optimized URL for an image from Cloudinary
 * @param {string} url - The original Cloudinary URL
 * @returns {string} The optimized URL
 */
const getOptimizedUrl = (url) => {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }

  // Extract parts of the Cloudinary URL
  const urlParts = url.split('/upload/');
  if (urlParts.length !== 2) {
    return url;
  }

  // Build the optimized URL with transformations
  const transformationString = Object.entries(optimizedImageTransformation)
    .map(([key, value]) => `${key}_${value}`)
    .join(',');

  return `${urlParts[0]}/upload/${transformationString}/${urlParts[1]}`;
};

/**
 * Get a thumbnail URL for an image from Cloudinary
 * @param {string} url - The original Cloudinary URL
 * @returns {string} The thumbnail URL
 */
const getThumbnailUrl = (url) => {
  if (!url || !url.includes('cloudinary.com')) {
    return null;
  }

  // Extract parts of the Cloudinary URL
  const urlParts = url.split('/upload/');
  if (urlParts.length !== 2) {
    return null;
  }

  // Build the thumbnail URL with transformations
  const transformationString = Object.entries(thumbnailTransformation)
    .map(([key, value]) => `${key}_${value}`)
    .join(',');

  return `${urlParts[0]}/upload/${transformationString}/${urlParts[1]}`;
};

// Create CloudinaryStorage instance with configuration
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: process.env.NODE_ENV === 'production' ? 'legacy-note-prod' : 'legacy-note-dev',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'mp3', 'mp4', 'mov', 'avi'],
    format: async (req, file) => {
      // Keep original format for non-image files
      if (!file.mimetype.startsWith('image/')) {
        return undefined;
      }
      
      // For images, use original format or convert to webp
      if (file.mimetype === 'image/gif') {
        return 'gif'; // Preserve animated GIFs
      }
      return 'auto'; // Let Cloudinary decide best format
    },
    transformation: [
      {
        width: 2000,
        height: 2000,
        crop: 'limit',
        quality: 'auto:good'
      }
    ],
    public_id: (req, file) => {
      // Generate a unique filename: userId_timestamp_originalName
      const userId = req.user && req.user.id ? req.user.id : 'anonymous';
      const timestamp = Date.now();
      const filename = file.originalname.replace(/\s+/g, '_').toLowerCase();
      return `${userId}_${timestamp}_${filename}`.substring(0, 100);
    }
  }
});

module.exports = {
  cloudinary,
  storage,
  optimizedImageTransformation,
  thumbnailTransformation,
  getOptimizedUrl,
  getThumbnailUrl
}; 