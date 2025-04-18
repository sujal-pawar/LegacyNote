const cloudinary = require('../config/cloudinary');
const path = require('path');
const fs = require('fs');

/**
 * Upload a file directly to Cloudinary
 * @param {String} filePath - Path to local file
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Cloudinary upload result
 */
const uploadToCloudinary = async (filePath, options = {}) => {
  try {
    // Default options
    const defaultOptions = {
      folder: process.env.CLOUDINARY_UPLOAD_FOLDER || 'legacy_note_uploads',
      use_filename: true,
      unique_filename: true,
      resource_type: 'auto'
    };

    // Merge options
    const uploadOptions = { ...defaultOptions, ...options };
    
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(filePath, uploadOptions);
    
    // Return upload result
    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      resourceType: result.resource_type,
      size: result.bytes
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Delete a file from Cloudinary
 * @param {String} publicId - Cloudinary public ID
 * @returns {Promise<Object>} Deletion result
 */
const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return {
      success: result.result === 'ok',
      result
    };
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Migrate a local file to Cloudinary
 * @param {String} localFilePath - Path to local file
 * @param {String} userId - User ID for folder organization
 * @returns {Promise<Object>} Migration result
 */
const migrateFileToCloudinary = async (localFilePath, userId) => {
  try {
    // Check if file exists
    if (!fs.existsSync(localFilePath)) {
      return {
        success: false,
        error: 'File does not exist'
      };
    }

    // Create options with user folder
    const options = {
      folder: `${process.env.CLOUDINARY_UPLOAD_FOLDER || 'legacy_note_uploads'}/${userId || 'migrated'}`,
      use_filename: true
    };

    // Upload to Cloudinary
    const result = await uploadToCloudinary(localFilePath, options);
    
    // Return with original path for reference
    return {
      ...result,
      originalPath: localFilePath
    };
  } catch (error) {
    console.error('File migration error:', error);
    return {
      success: false,
      error: error.message,
      originalPath: localFilePath
    };
  }
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary,
  migrateFileToCloudinary
}; 