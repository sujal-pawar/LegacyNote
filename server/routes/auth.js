const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const cors = require('cors');
const { 
  register, 
  login, 
  getMe, 
  forgotPassword, 
  resetPassword,
  googleAuth,
  verifyEmail,
  sendVerificationOTP
} = require('../controllers/auth');

// Specific CORS configuration for Google auth
const googleCorsOptions = {
  origin: true, // This allows all origins but respects the CORS middleware's decision
  credentials: true,
  methods: ['POST', 'OPTIONS'],
  maxAge: 600, // Cache preflight request for 10 minutes
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Auth-Type']
};

// Routes
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

// Google authentication - add special CORS handling
router.options('/google', cors(googleCorsOptions)); // Handle preflight request
router.post('/google', cors(googleCorsOptions), googleAuth);

// Email verification
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', sendVerificationOTP);

module.exports = router;