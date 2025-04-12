const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { 
  updateUserDetails, 
  updatePassword, 
  deleteUser 
} = require('../controllers/users');

// Routes
router.put('/update', protect, updateUserDetails);
router.put('/updatepassword', protect, updatePassword);
router.delete('/delete', protect, deleteUser);

module.exports = router; 