// Simple script to test Cloudinary configuration
require('dotenv').config();
const cloudinary = require('./config/cloudinary');

async function testCloudinaryConnection() {
  console.log('Testing Cloudinary connection...');
  
  try {
    // Get account information
    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary connection successful!');
    console.log('Response:', result);
    
    // Display configured details
    console.log('\nCloudinary Configuration:');
    console.log('- Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME || 'dfubsjkel');
    console.log('- Upload Preset:', process.env.CLOUDINARY_UPLOAD_PRESET || 'legacynote');
    console.log('- Upload Folder:', process.env.CLOUDINARY_UPLOAD_FOLDER || 'legacy_note_uploads');
    
    return true;
  } catch (error) {
    console.error('❌ Cloudinary connection failed:', error.message);
    console.error('Please check your credentials and internet connection');
    return false;
  }
}

// Run the test
testCloudinaryConnection()
  .then(success => {
    if (success) {
      console.log('\n🚀 Your Cloudinary integration is ready to use!');
    } else {
      console.log('\n⚠️ Please fix the Cloudinary configuration issues before continuing.');
    }
    // Exit process
    process.exit(success ? 0 : 1);
  }); 