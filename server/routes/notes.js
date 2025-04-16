const express = require('express');
const router = express.Router();
const { protect, emailVerified } = require('../middleware/auth');
const { 
  getNotes, 
  getNote, 
  createNote, 
  updateNote, 
  deleteNote, 
  shareNote,
  getSharedNote
} = require('../controllers/notes');

// Routes with email verification required
router.route('/')
  .get(protect, emailVerified, getNotes)
  .post(protect, emailVerified, createNote);

router.route('/:id')
  .get(protect, emailVerified, getNote)
  .put(protect, emailVerified, updateNote)
  .delete(protect, emailVerified, deleteNote);

router.route('/share/:id')
  .post(protect, emailVerified, shareNote);

// Public route - no email verification needed
router.route('/shared/:id').get(getSharedNote);

module.exports = router; 