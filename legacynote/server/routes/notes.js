const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { 
  getNotes, 
  getNote, 
  createNote, 
  updateNote, 
  deleteNote, 
  shareNote,
  getSharedNote
} = require('../controllers/notes');

// Protected routes
router.route('/')
  .get(protect, getNotes)
  .post(protect, createNote);

router.route('/:id')
  .get(protect, getNote)
  .put(protect, updateNote)
  .delete(protect, deleteNote);

router.post('/:id/share', protect, shareNote);

// Public route for accessing shared notes
router.get('/shared/:id/:accessKey', getSharedNote);

module.exports = router; 