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

// @desc    Create note
// @route   POST /api/notes
// @access  Private
exports.createNote = async (req, res, next) => {
  try {
    // Extract note data from request
    const { title, content, deliveryDate, isPublic } = req.body;
    
    // Handle recipients data - properly parse JSON string if it exists
    let recipientsData = [];
    let recipientData = {};
    
    // First try to parse recipients array from JSON string
    if (req.body.recipients) {
      try {
        recipientsData = JSON.parse(req.body.recipients);
        console.log('Successfully parsed recipients array:', recipientsData);
      } catch (parseError) {
        console.error('Error parsing recipients JSON:', parseError);
        return res.status(400).json({
          success: false,
          error: 'Invalid recipients data format',
          details: 'Recipients data could not be parsed properly'
        });
      }
    }
    
    // Also handle single recipient for backward compatibility
    if (req.body.recipient) {
      try {
        if (typeof req.body.recipient === 'string') {
          recipientData = JSON.parse(req.body.recipient);
        } else {
          recipientData = req.body.recipient;
        }
      } catch (parseError) {
        console.error('Error parsing recipient JSON:', parseError);
        // Continue without recipient if parsing fails
        recipientData = {};
      }
    }
    
    // Parse the exact delivery date and time
    const parsedDeliveryDate = new Date(deliveryDate);
    
    // Create note with basic data
    const noteData = {
      title,
      content,
      deliveryDate: parsedDeliveryDate,
      isPublic: isPublic === 'true' || isPublic === true,
      user: req.user.id,
      exactTimeDelivery: true // Flag to indicate this note should be delivered at exact time
    };

    // Flag to track if recipients are defined
    let hasRecipients = false;
    
    // Handle multiple recipients if provided
    if (recipientsData && Array.isArray(recipientsData) && recipientsData.length > 0) {
      // Validate maximum number of recipients
      if (recipientsData.length > 10) {
        return res.status(400).json({
          success: false,
          error: 'Too many recipients',
          details: 'Maximum of 10 recipients allowed'
        });
      }
      
      // Format and sanitize recipients data
      noteData.recipients = recipientsData.map(recipient => ({
        name: recipient.name,
        email: recipient.email.toLowerCase()
      }));
      
      // Check if any recipient is self (for self-message flag)
      if (recipientsData.some(r => r.email.toLowerCase() === req.user.email.toLowerCase())) {
        noteData.isSelfMessage = true;
      }
      
      hasRecipients = true;
      console.log(`Note will be created with ${noteData.recipients.length} recipients`);
    }
    // For backward compatibility, still handle single recipient
    else if (recipientData && recipientData.email) {
      noteData.recipient = {
        name: recipientData.name,
        email: recipientData.email.toLowerCase()
      };
      
      // Check if this is a self-message (sent to self)
      if (recipientData.email.toLowerCase() === req.user.email.toLowerCase()) {
        noteData.isSelfMessage = true;
      }
      
      hasRecipients = true;
      console.log(`Note will be created with single recipient: ${noteData.recipient.email}`);
    }
    
    // If no recipients are defined, make sure the note is public
    if (!hasRecipients && !noteData.isPublic) {
      noteData.isPublic = true;
      console.log(`Note created without recipients - automatically marked as public`);
    }

    // Add validation logging
    console.log('Creating note with data:', {
      title: noteData.title,
      hasRecipients,
      recipientCount: noteData.recipients ? noteData.recipients.length : 0,
      isPublic: noteData.isPublic
    });

    // Create the note
    const note = await Note.create(noteData);

    // Handle file uploads if present
    if (req.files && req.files.length > 0) {
      noteData.mediaFiles = req.files.map(file => ({
        fileName: file.originalname,
        // For Cloudinary files, use secure_url if available
        filePath: file.path || (file.secure_url ? file.secure_url : ''),
        fileType: file.mimetype,
        fileSize: file.size
      }));
      
      // Update note with media files
      await Note.findByIdAndUpdate(note._id, {
        mediaFiles: noteData.mediaFiles
      });
    }

    // Generate shareable link if the note is public
    if (noteData.isPublic) {
      note.generateShareableLink();
      await note.save();
    }

    // Send confirmation email to the user
    try {
      await sendNoteCreationConfirmation({
        email: req.user.email,
        note: note,
        user: req.user
      });
    } catch (emailError) {
      console.error('Failed to send note creation confirmation email:', emailError);
    }

    res.status(201).json({
      success: true,
      data: note
    });
  } catch (err) {
    console.error('Error in createNote:', err);
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: messages.join(', ')
      });
    }
    
    next(err);
  }
};

// @desc    Update note
// @route   PUT /api/notes/:id
// @access  Private
exports.updateNote = async (req, res, next) => {
  try {
    // Extract note data from request
    const { title, content, deliveryDate, isPublic } = req.body;
    
    // Handle recipients data - properly parse JSON string if it exists
    let recipientsData = [];
    let recipientData = {};
    
    // First try to parse recipients array from JSON string
    if (req.body.recipients) {
      try {
        if (typeof req.body.recipients === 'string') {
          recipientsData = JSON.parse(req.body.recipients);
          console.log('Successfully parsed recipients array for update:', recipientsData);
        } else {
          recipientsData = req.body.recipients;
        }
      } catch (parseError) {
        console.error('Error parsing recipients JSON for update:', parseError);
        return res.status(400).json({
          success: false,
          error: 'Invalid recipients data format',
          details: 'Recipients data could not be parsed properly'
        });
      }
    }
    
    // Also handle single recipient for backward compatibility
    if (req.body.recipient) {
      try {
        if (typeof req.body.recipient === 'string') {
          recipientData = JSON.parse(req.body.recipient);
        } else {
          recipientData = req.body.recipient;
        }
      } catch (parseError) {
        console.error('Error parsing recipient JSON for update:', parseError);
        // Continue without recipient if parsing fails
        recipientData = {};
      }
    }
    
    // Find the note
    let note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        success: false,
        error: 'Note not found',
        details: 'The note you are trying to update does not exist'
      });
    }

    // Check if user owns the note
    if (note.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized',
        details: 'You can only update notes that you created'
      });
    }

    // Check if note is already delivered
    if (note.isDelivered) {
      return res.status(400).json({
        success: false,
        error: 'Cannot update delivered note',
        details: 'This note has already been delivered and cannot be modified'
      });
    }

    // Parse the exact delivery date and time
    const parsedDeliveryDate = new Date(deliveryDate);

    // Prepare update data
    const updateData = {
      title,
      content,
      deliveryDate: parsedDeliveryDate,
      isPublic: isPublic === 'true' || isPublic === true,
      exactTimeDelivery: true // Update flag for exact time delivery
    };

    // Track if recipients are defined for logging
    let hasRecipients = false;

    // Handle multiple recipients if provided
    if (recipientsData && Array.isArray(recipientsData)) {
      // Validate maximum number of recipients
      if (recipientsData.length > 10) {
        return res.status(400).json({
          success: false,
          error: 'Too many recipients',
          details: 'Maximum of 10 recipients allowed'
        });
      }
      
      // If recipients array is empty, remove recipients field
      if (recipientsData.length === 0) {
        updateData.recipients = [];
      } else {
        // Format and sanitize recipients data
        updateData.recipients = recipientsData.map(recipient => ({
          name: recipient.name,
          email: recipient.email.toLowerCase()
        }));
        hasRecipients = true;
      }
      
      // Check if any recipient is self (for self-message flag)
      updateData.isSelfMessage = recipientsData.some(
        r => r.email?.toLowerCase() === req.user.email.toLowerCase()
      );
      
      console.log(`Note will be updated with ${updateData.recipients?.length || 0} recipients`);
    }
    // For backward compatibility, still handle single recipient
    else if (recipientData) {
      if (recipientData.email) {
        updateData.recipient = {
          name: recipientData.name,
          email: recipientData.email.toLowerCase()
        };
        
        // Update self-message flag
        updateData.isSelfMessage = recipientData.email.toLowerCase() === req.user.email.toLowerCase();
        hasRecipients = true;
        
        console.log(`Note will be updated with single recipient: ${updateData.recipient.email}`);
      } else {
        // Remove recipient if empty
        updateData.recipient = undefined;
        updateData.isSelfMessage = false;
      }
    } else {
      // Remove recipient if not provided
      updateData.recipient = undefined;
      updateData.recipients = [];
      updateData.isSelfMessage = false;
    }
    
    // If no recipients are defined, make sure the note is public
    if (!hasRecipients && !updateData.isPublic) {
      updateData.isPublic = true;
      console.log(`Note updated without recipients - automatically marked as public`);
    }

    // Add validation logging
    console.log('Updating note with data:', {
      id: req.params.id,
      title: updateData.title,
      hasRecipients,
      recipientCount: updateData.recipients ? updateData.recipients.length : 0,
      isPublic: updateData.isPublic
    });

    // Process uploaded files if any
    if (req.files && req.files.length > 0) {
      const newMediaFiles = req.files.map(file => ({
        fileName: file.originalname,
        filePath: file.path || (file.secure_url ? file.secure_url : ''),
        fileType: file.mimetype,
        fileSize: file.size || file.bytes || 0
      }));
      
      // Append new files to existing ones
      if (note.mediaFiles && note.mediaFiles.length > 0) {
        updateData.mediaFiles = [...note.mediaFiles, ...newMediaFiles];
      } else {
        updateData.mediaFiles = newMediaFiles;
      }
    }

    // Update the note with new values
    note = await Note.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: note,
    });
  } catch (err) {
    console.error('Error in updateNote:', err);
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: messages.join(', ')
      });
    }
    
    // Handle cast errors (invalid ID)
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid note ID',
        details: 'The note ID provided is not in a valid format'
      });
    }
    
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
      // console.log(`Generated new shareable link for note ${note._id}`);
    } else {
      // Use existing link
      shareableLink = note.shareableLink;
      // console.log(`Using existing shareable link for note ${note._id}`);
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

    // Check if the current user is the owner of the note
    const isOwner = req.user && note.user && req.user.id === note.user.toString();

    // Check if time condition is met (bypass for note owner)
    const currentDate = new Date();
    if (!isOwner && currentDate < note.deliveryDate && !note.isDelivered) {
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

    // Add a flag to indicate this is the owner viewing their own note
    if (isOwner) {
      note.isOwner = true;
    }
    
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