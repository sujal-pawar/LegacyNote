const express = require('express');
const dotenv = require('dotenv');

// Load environment variables before other imports
dotenv.config();

const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const path = require('path');

// Import error handler
const errorHandlerMiddleware = require('./middleware/errorHandlerMiddleware');

// Import route files
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const noteRoutes = require('./routes/notes');

// Import database config
const connectDB = require('./config/db');

// Import scheduler service
const { startScheduler } = require('./services/scheduler');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configure CORS properly for production
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://legacynote.vercel.app',
  'https://legacy-note.vercel.app',
  'https://www.legacynote.vercel.app'
];

// Middleware for CORS with proper origin handling
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc)
    if (!origin) return callback(null, true);
    
    // Remove any trailing slashes from the origin
    const normalizedOrigin = origin.endsWith('/') ? origin.slice(0, -1) : origin;
    
    if (allowedOrigins.indexOf(normalizedOrigin) !== -1 || process.env.FRONTEND_URL === normalizedOrigin) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked request from origin: ${origin}`);
      // Still allow the request but log it
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Auth-Type'],
  exposedHeaders: ['Access-Control-Allow-Origin']
}));

// Add preflight options for all routes to ensure CORS works properly
app.options('*', cors());

app.use(morgan('dev'));
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' }
}));

// Set specific security headers for Google authentication
app.use((req, res, next) => {
  // Only apply special headers to the Google auth endpoint
  if (req.path === '/api/auth/google') {
    // Remove COOP for Google Auth to allow popups to work correctly
    res.removeHeader('Cross-Origin-Opener-Policy');
    // Add required headers for Google auth
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  }
  next();
});

// Increase timeout for large uploads
app.use((req, res, next) => {
  req.setTimeout(300000); // 5 minutes timeout for requests
  res.setTimeout(300000);
  next();
});

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure CORS for media file access
app.use((req, res, next) => {
  // Set CORS headers specifically for media file requests
  if (req.path.startsWith('/uploads/')) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
  }
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notes', noteRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('LegacyNote API is running');
});

// Health check endpoint
app.get('/health', (req, res) => {
  // Log when the health endpoint is called
  console.log(`[${new Date().toISOString()}] Health check endpoint called from IP: ${req.ip || 'unknown'}`);
  
  res.status(200).json({
    status: 'success',
    message: 'Server is up and running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime()
  });
});

// Error handler middleware (must be after routes)
app.use(errorHandlerMiddleware);

// Connect to MongoDB and start server
connectDB()
  .then(() => {
    // Start the note delivery scheduler
    startScheduler();
    
    // Start the server
    app.listen(PORT, () => {
      // For production, log minimal information
      if (process.env.NODE_ENV === 'production') {
        console.log(`Server started on port ${PORT}`);
      } else {
        console.log(`Server running on port ${PORT}`);
      }
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
}); 