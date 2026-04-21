const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error('MONGODB_URI is not set');
  }

  try {
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    const message = error?.message || 'Unknown MongoDB connection error';
    throw new Error(`Failed to connect to MongoDB. ${message}`);
  }
};

module.exports = connectDB; 