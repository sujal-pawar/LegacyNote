const Note = require('../models/Note');
const { sendNoteEmail } = require('../utils/email');

// @desc    Get all notes for a user
// @route   GET /api/notes
// @access  Private
exports.getNotes = async (req, res, next) => {
  try {
    const notes = await Note.find({ user: req.user.id });

    res.status(200).json({
      success: true,
      count: notes.length,
      data: notes,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single note
// @route   GET /api/notes/:id
// @access  Private
exports.getNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id).select('+encryptedContent');

    if (!note) {
      return res.status(404).json({
        success: false,
        error: 'Note not found',
      });
    }

    // Make sure user owns the note
    if (note.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this note',
      });
    }

    // Decrypt content
    note.content = note.decryptContent();

    res.status(200).json({
      success: true,
      data: note,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new note
// @route   POST /api/notes
// @access  Private
exports.createNote = async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.user = req.user.id;

    const note = await Note.create(req.body);

    res.status(201).json({
      success: true,
      data: note,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update note
// @route   PUT /api/notes/:id
// @access  Private
exports.updateNote = async (req, res, next) => {
  try {
    let note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        success: false,
        error: 'Note not found',
      });
    }

    // Make sure user owns the note
    if (note.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this note',
      });
    }

    // Check if note is already delivered
    if (note.isDelivered) {
      return res.status(400).json({
        success: false,
        error: 'Cannot update a note that has already been delivered',
      });
    }

    note = await Note.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: note,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete note
// @route   DELETE /api/notes/:id
// @access  Private
exports.deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        success: false,
        error: 'Note not found',
      });
    }

    // Make sure user owns the note
    if (note.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to delete this note',
      });
    }

    await note.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Share note (generate shareable link)
// @route   POST /api/notes/:id/share
// @access  Private
exports.shareNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        success: false,
        error: 'Note not found',
      });
    }

    // Make sure user owns the note
    if (note.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to share this note',
      });
    }

    // Generate shareable link
    const shareableLink = note.generateShareableLink();
    
    // Set note to public
    note.isPublic = true;
    
    await note.save();

    res.status(200).json({
      success: true,
      data: {
        shareableLink,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get shared note
// @route   GET /api/notes/shared/:id/:accessKey
// @access  Public
exports.getSharedNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id)
      .select('+accessKey +encryptedContent');

    if (!note || note.accessKey !== req.params.accessKey || !note.isPublic) {
      return res.status(404).json({
        success: false,
        error: 'Note not found or access denied',
      });
    }

    // Check if time condition is met
    const currentDate = new Date();
    if (currentDate < note.deliveryDate && !note.isDelivered) {
      return res.status(403).json({
        success: false,
        error: 'This note is not yet available for viewing',
        availableOn: note.deliveryDate,
      });
    }

    // Decrypt content
    note.content = note.decryptContent();

    // Remove sensitive fields
    note.accessKey = undefined;

    res.status(200).json({
      success: true,
      data: note,
    });
  } catch (err) {
    next(err);
  }
}; 