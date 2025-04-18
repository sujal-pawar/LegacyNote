const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
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

// Routes
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

// Google authentication
router.post('/google', googleAuth);

// Email verification
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', sendVerificationOTP);

module.exports = router; 