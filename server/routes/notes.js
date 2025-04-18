const express = require('express');
const router = express.Router();
const { protect, emailVerified, optionalAuth } = require('../middleware/auth');
const { 
  getNotes, 
  getNote, 
  createNote, 
  updateNote, 
  deleteNote, 
  shareNote,
  getSharedNote
} = require('../controllers/notes');
const upload = require('../middleware/fileUpload');

// Routes with email verification required
router.route('/')
  .get(protect, emailVerified, getNotes)
  .post(protect, emailVerified, upload.array('mediaFiles', 5), createNote);

router.route('/:id')
  .get(protect, emailVerified, getNote)
  .put(protect, emailVerified, upload.array('mediaFiles', 5), updateNote)
  .delete(protect, emailVerified, deleteNote);

router.route('/:id/share')
  .post(protect, emailVerified, shareNote);

// Public route with optional authentication
router.route('/shared/:id/:accessKey').get(optionalAuth, getSharedNote);

module.exports = router; 