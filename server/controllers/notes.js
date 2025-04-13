const Note = require('../models/Note');
const User = require('../models/User');
const { sendNoteEmail, sendNoteCreationConfirmation } = require('../utils/email');

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

    // Create the note
    const note = await Note.create(req.body);
    
    // Get the user who created the note
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }
    
    try {
      // Send confirmation email to the user
      await sendNoteCreationConfirmation({
        email: user.email,
        note: note,
        user: user
      });
      
      console.log(`Confirmation email sent to ${user.email} for note ${note._id}`);
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError);
      // Continue execution even if email fails - don't let this prevent note creation
    }

    res.status(201).json({
      success: true,
      data: note,
    });
  } catch (err) {
    console.error('Error creating note:', err);
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
    // Try to find the note with proper data
    const note = await Note.findById(req.params.id)
      .select('+accessKey');

    if (!note) {
      return res.status(404).json({
        success: false,
        error: 'Note not found',
        details: 'The note you are trying to share does not exist'
      });
    }

    // Make sure user owns the note
    if (note.user.toString() !== req.user.id) {
      console.error(`Unauthorized share attempt: User ${req.user.id} tried to share note ${note._id} owned by ${note.user}`);
      return res.status(401).json({
        success: false,
        error: 'Not authorized to share this note',
        details: 'You must be the creator of this note to share it'
      });
    }

    let shareableLink;
    
    // Regenerate the link if it doesn't exist or force regeneration was requested
    if (!note.shareableLink || req.body.regenerate === true) {
      // Generate shareable link
      shareableLink = note.generateShareableLink();
      console.log(`Generated new shareable link for note ${note._id}`);
    } else {
      // Use existing link
      shareableLink = note.shareableLink;
      console.log(`Using existing shareable link for note ${note._id}`);
    }
    
    // Set note to public
    note.isPublic = true;
    
    try {
      await note.save();
    } catch (saveError) {
      console.error(`Error saving note when sharing ${note._id}:`, saveError);
      return res.status(500).json({
        success: false,
        error: 'Failed to save share settings',
        details: 'There was an error making your note shareable'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        shareableLink,
        isPublic: note.isPublic
      },
    });
  } catch (err) {
    console.error('Error in shareNote:', err);
    
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid note ID format',
        details: 'The note ID provided is not in a valid format'
      });
    }
    
    next(err);
  }
};

// @desc    Get shared note
// @route   GET /api/notes/shared/:id/:accessKey
// @access  Public
exports.getSharedNote = async (req, res, next) => {
  try {
    const { id, accessKey } = req.params;
    
    if (!id || !accessKey) {
      return res.status(400).json({
        success: false,
        error: 'Invalid link parameters',
        details: 'The shared link is malformed or incomplete'
      });
    }

    // Try to find the note with the provided ID and access key
    const note = await Note.findById(id)
      .select('+accessKey +encryptedContent');

    // Check if note exists
    if (!note) {
      console.error(`Shared note access failed: Note with ID ${id} not found`);
      return res.status(404).json({
        success: false,
        error: 'Note not found',
        details: 'The note may have been deleted or the link is invalid'
      });
    }

    // Check if access key is valid and note is public
    if (note.accessKey !== accessKey) {
      console.error(`Shared note access failed: Invalid access key for note ${id}`);
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        details: 'The access key provided is not valid'
      });
    }

    if (!note.isPublic) {
      console.error(`Shared note access failed: Note ${id} is not marked as public`);
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        details: 'This note is not available for public access'
      });
    }

    // Check if time condition is met
    const currentDate = new Date();
    if (currentDate < note.deliveryDate && !note.isDelivered) {
      return res.status(403).json({
        success: false,
        error: 'This note is not yet available for viewing',
        availableOn: note.deliveryDate,
        details: 'The note will be available after the scheduled delivery date'
      });
    }

    try {
      // Decrypt content
      note.content = note.decryptContent();
    } catch (decryptionError) {
      console.error(`Error decrypting note ${id}:`, decryptionError);
      return res.status(500).json({
        success: false,
        error: 'Could not process note content',
        details: 'There was an error decrypting the note content'
      });
    }

    // Remove sensitive fields
    note.accessKey = undefined;
    note.encryptedContent = undefined;

    console.log(`Shared note ${id} successfully accessed`);
    
    res.status(200).json({
      success: true,
      data: note,
    });
  } catch (err) {
    console.error('Error in getSharedNote:', err);
    
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid note ID format',
        details: 'The note ID in the link is not in a valid format'
      });
    }
    
    next(err);
  }
}; 