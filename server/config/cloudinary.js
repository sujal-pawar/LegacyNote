const cloudinary = require('cloudinary').v2;

// Configure Cloudinary with the provided credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dfubsjkel',
  api_key: process.env.CLOUDINARY_API_KEY || '867391979334999',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'kf7JVmfQin35Mf780rzT3Y8d4Wc',
  secure: true // Use HTTPS for all URLs
});

module.exports = cloudinary; 