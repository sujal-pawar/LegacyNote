const Note = require('../models/Note');
const User = require('../models/User');
const { sendNoteEmail, sendNoteCreationConfirmation } = require('../utils/email');
const { StatusCodes } = require('http-status-codes');
const { NotFoundError, BadRequestError, UnauthenticatedError } = require('../errors');
const { cloudinary, getOptimizedUrl, getThumbnailUrl } = require('../config/cloudinary');

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
    const { title, content, deliveryDate, exactTimeDelivery } = req.body;
    let { recipients, isPublic } = req.body;
    
    // console.log('Received note data:', { 
    //   title, 
    //   deliveryDate, 
    //   isPublic,
    //   isPublicType: typeof isPublic,
    //   recipientsProvided: !!recipients
    // });
    
    // Parse recipients if it's a JSON string
    if (recipients && typeof recipients === 'string') {
      try {
        recipients = JSON.parse(recipients);
      } catch (err) {
        throw new BadRequestError('Invalid recipients format: must be a valid JSON string or array');
      }
    }
    
    // Validate recipients format if provided
    if (recipients && !Array.isArray(recipients)) {
      throw new BadRequestError('Recipients must be an array');
    }

    // Process recipients if any
    let recipientsList = [];
    if (recipients && recipients.length > 0) {
      recipientsList = recipients.map(recipient => {
        if (!recipient.name || !recipient.email) {
          throw new BadRequestError('Each recipient must have a name and email');
        }
        return {
          name: recipient.name,
          email: recipient.email
        };
      });
    }

    // Required fields check
    if (!title) {
      throw new BadRequestError('Title is required');
    }

    if (!content) {
      throw new BadRequestError('Content is required');
    }

    // Handle isPublic value properly - formData sends strings, direct JSON might send booleans
    // This ensures consistent handling of 'true', true, 'false', false
    let isPublicFlag = isPublic === true || isPublic === 'true';
    
    // IMPORTANT: If there are recipients, automatically make the note public
    // so recipients can access the note via email links
    if (recipientsList.length > 0 && !isPublicFlag) {
      console.log('Auto-setting isPublic=true because recipients are present');
      isPublicFlag = true;
    }
    
    console.log('Final isPublic value:', isPublicFlag);
    
    // Process uploaded files (if any)
    const mediaFiles = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const mediaFile = {
          fileName: file.originalname,
          filePath: file.path,
          fileType: file.mimetype,
          fileSize: file.size
        };

        // Add optimized URLs as additional properties but not as required fields
        if (file.mimetype.startsWith('image/')) {
          mediaFile.optimizedUrl = getOptimizedUrl(file.path);
          mediaFile.thumbnailUrl = getThumbnailUrl(file.path);
        }

        mediaFiles.push(mediaFile);
      }
    }

    // Create a new note
    const note = await Note.create({
      title,
      content,
      deliveryDate: deliveryDate || null,
      isPublic: isPublicFlag,
      recipients: recipientsList,
      user: req.user.id,
      mediaFiles
    });

    // Get the complete note with populated fields
    const completeNote = await Note.findById(note._id)
      .populate({
        path: 'user',
        select: 'name email'
      });

    // Generate shareable link if the note is public
    if (note.isPublic) {
      console.log('Generating shareable link for public note');
      completeNote.generateShareableLink();
      await completeNote.save();
    }

    // Send confirmation email to the user
    try {
      await sendNoteCreationConfirmation({
        email: req.user.email,
        note: completeNote,
        user: req.user
      });
    } catch (emailError) {
      console.error('Failed to send note creation confirmation email:', emailError);
    }

    // console.log('Note created successfully:', { 
    //   id: completeNote._id,
    //   isPublic: completeNote.isPublic,
    //   hasShareableLink: !!completeNote.shareableLink
    // });

    res.status(StatusCodes.CREATED).json({ note: completeNote });
  } catch (error) {
    console.error('Error creating note:', error);
    throw error;
  }
};

// @desc    Update note
// @route   PUT /api/notes/:id
// @access  Private
exports.updateNote = async (req, res, next) => {
  try {
    const { id: noteId } = req.params;
    const { title, content, deliveryDate, isPublic, deleteMediaFiles } = req.body;
    let { recipients } = req.body;
    
    // Find the note
    const note = await Note.findById(noteId);
    if (!note) {
      throw new NotFoundError(`No note found with id ${noteId}`);
    }

    // Check if user is authorized to update this note
    if (note.user.toString() !== req.user.id) {
      throw new UnauthenticatedError('You are not authorized to update this note');
    }

    // Parse recipients if it's a JSON string
    if (recipients && typeof recipients === 'string') {
      try {
        recipients = JSON.parse(recipients);
      } catch (err) {
        throw new BadRequestError('Invalid recipients format: must be a valid JSON string or array');
      }
    }
    
    // Process recipients if any
    let recipientsList = note.recipients;
    if (recipients) {
      if (!Array.isArray(recipients)) {
        throw new BadRequestError('Recipients must be an array');
      }

      recipientsList = recipients.map(recipient => {
        if (!recipient.name || !recipient.email) {
          throw new BadRequestError('Each recipient must have a name and email');
        }
        return {
          name: recipient.name,
          email: recipient.email
        };
      });
    }

    // Handle isPublic value
    let isPublicValue = isPublic !== undefined ? (isPublic === 'true' || isPublic === true) : note.isPublic;
    
    // IMPORTANT: If there are recipients, automatically make the note public
    // so recipients can access the note via email links
    if (recipientsList.length > 0 && !isPublicValue) {
      console.log('Auto-setting isPublic=true because recipients are present');
      isPublicValue = true;
    }

    // Delete media files if requested
    if (deleteMediaFiles && deleteMediaFiles.length > 0) {
      // Parse deleteMediaFiles if it's a string
      let filesToDelete = deleteMediaFiles;
      if (typeof deleteMediaFiles === 'string') {
        try {
          filesToDelete = JSON.parse(deleteMediaFiles);
        } catch (err) {
          throw new BadRequestError('Invalid deleteMediaFiles format');
        }
      }
      
      // Remove files from Cloudinary
      for (const fileId of filesToDelete) {
        const fileToDelete = note.mediaFiles.find(file => file._id.toString() === fileId);
        if (fileToDelete && fileToDelete.filePath) {
          try {
            // Extract public ID from Cloudinary URL
            const urlParts = fileToDelete.filePath.split('/');
            const filename = urlParts[urlParts.length - 1];
            const publicId = filename.split('.')[0];
            
            await cloudinary.uploader.destroy(publicId);
          } catch (cloudinaryError) {
            console.error('Error deleting file from Cloudinary:', cloudinaryError);
          }
        }
      }
      
      // Filter out the deleted files from mediaFiles array
      const updatedMediaFiles = note.mediaFiles.filter(
        file => !filesToDelete.includes(file._id.toString())
      );
      note.mediaFiles = updatedMediaFiles;
    }

    // Process uploaded files (if any)
    if (req.files && req.files.length > 0) {
      // Add new files to the note's mediaFiles array
      for (const file of req.files) {
        const mediaFile = {
          fileName: file.originalname,
          filePath: file.path,
          fileType: file.mimetype,
          fileSize: file.size
        };

        // Add optimized URLs as additional properties but not as required fields
        if (file.mimetype.startsWith('image/')) {
          mediaFile.optimizedUrl = getOptimizedUrl(file.path);
          mediaFile.thumbnailUrl = getThumbnailUrl(file.path);
        }

        note.mediaFiles.push(mediaFile);
      }
    }

    // Update the note properties
    note.title = title || note.title;
    note.content = content || note.content;
    note.deliveryDate = deliveryDate !== undefined ? deliveryDate : note.deliveryDate;
    note.isPublic = isPublicValue;
    note.recipients = recipientsList;

    // Generate a shareable link if needed
    if (isPublicValue && !note.shareableLink) {
      note.generateShareableLink();
    }

    // Save the updated note
    const updatedNote = await note.save();

    // Get the complete note with populated fields
    const populatedNote = await Note.findById(updatedNote._id)
      .populate({
        path: 'user',
        select: 'name email'
      });

    res.status(StatusCodes.OK).json({ note: populatedNote });
  } catch (error) {
    console.error('Error updating note:', error);
    throw error;
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

    // Check if the note is already delivered
    if (note.isDelivered || (note.deliveryDate && new Date() > new Date(note.deliveryDate))) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete a delivered note',
        details: 'Notes cannot be deleted after they have been delivered'
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
    // console.log(`User ${req.user.id} attempting to share note ${req.params.id}`);
    
    // Try to find the note with proper data
    const note = await Note.findById(req.params.id)
      .select('+accessKey +encryptedContent');

    if (!note) {
      console.error(`Note not found: ${req.params.id}`);
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
      // Generate shareable link - this will also ensure isPublic is set to true
      shareableLink = note.generateShareableLink();
      console.log(`Generated new shareable link for note ${note._id}`);
    } else {
      // Use existing link
      shareableLink = note.shareableLink;
      console.log(`Using existing shareable link for note ${note._id}`);
      
      // Double-check to make sure the note is public
      if (!note.isPublic) {
        note.isPublic = true;
        console.log(`Fixed public status for note ${note._id}`);
      }
    }
    
    try {
      // Ensure content is set to prevent validation errors
      if (!note.content && note.encryptedContent) {
        note.content = note.decryptContent();
        console.log(`Retrieved content for note ${note._id} before saving`);
      }
      
      // Save the note to persist any changes
      await note.save();
    } catch (saveError) {
      console.error(`Error saving note when sharing ${note._id}:`, saveError);
      return res.status(500).json({
        success: false,
        error: 'Failed to save share settings',
        details: 'There was an error making your note shareable'
      });
    }

    // console.log(`Successfully shared note ${note._id}`);
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
    
    console.log(`Attempting to access shared note ${id} with access key ${accessKey.substring(0, 5)}...`);
    
    if (!id || !accessKey) {
      return res.status(400).json({
        success: false,
        error: 'Invalid link parameters',
        details: 'The shared link is malformed or incomplete'
      });
    }

    // Try to find the note with the provided ID and access key
    const note = await Note.findById(id)
      .select('+accessKey +encryptedContent')
      .populate('user', 'name email'); // Populate user for checking recipients

    // Check if note exists
    if (!note) {
      console.error(`Shared note access failed: Note with ID ${id} not found`);
      return res.status(404).json({
        success: false,
        error: 'Note not found',
        details: 'The note may have been deleted or the link is invalid'
      });
    }

    // Check if access key is valid
    if (note.accessKey !== accessKey) {
      console.error(`Shared note access failed: Invalid access key for note ${id}`);
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        details: 'The access key provided is not valid'
      });
    }

    // Check if the current user is the owner of the note
    const isOwner = req.user && note.user && req.user.id === note.user._id.toString();
    
    // Check if access is through an email link for recipients
    // Email links contain the correct accessKey, so if we're here with a valid key, 
    // we should check if the user is a valid recipient
    let isRecipient = false;
    let recipientEmail = '';
    
    // Extract user email from the request if authenticated
    const userEmail = req.user ? req.user.email : '';
    
    // Check if user email matches any recipient email 
    if (userEmail && note.recipients && note.recipients.length > 0) {
      isRecipient = note.recipients.some(recipient => recipient.email === userEmail);
      if (isRecipient) {
        recipientEmail = userEmail;
      }
    } 
    // Check legacy single recipient
    else if (userEmail && note.recipient && note.recipient.email === userEmail) {
      isRecipient = true;
      recipientEmail = userEmail;
    }
    
    // For debugging
    if (isRecipient) {
      console.log(`Recipient ${recipientEmail} is accessing note ${id}`);
    }

    // IMPORTANT: Allow access in these cases:
    // 1. The note has a valid accessKey and is meant to be shared (for anyone with the link)
    // 2. The current user is the owner of the note (regardless of public status)
    // 3. The current user is a recipient of the note (regardless of public status)
    
    // If we have a valid accessKey, assume the note is meant to be accessible
    // This is critical for email links to work!
    const hasValidAccessKey = note.accessKey === accessKey;
    const hasAccess = hasValidAccessKey || isOwner || isRecipient || note.isPublic;
    
    if (!hasAccess) {
      console.log(`Access denied to note ${id}: public=${note.isPublic}, owner=${isOwner}, recipient=${isRecipient}, validKey=${hasValidAccessKey}`);
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        details: 'You do not have permission to view this note'
      });
    }

    // Check if time condition is met (bypass for note owner or recipients with valid accessKey)
    const currentDate = new Date();
    if (!isOwner && !isRecipient && currentDate < note.deliveryDate && !note.isDelivered) {
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

    // Add flags to indicate access type
    if (isOwner) {
      note.isOwner = true;
    }
    if (isRecipient) {
      note.isRecipient = true;
    }
    
    // If the note is being accessed by a recipient or owner and it's past the delivery date
    // but not marked as delivered yet, update the delivery status
    if ((isOwner || isRecipient) && currentDate >= note.deliveryDate && !note.isDelivered) {
      try {
        await Note.findByIdAndUpdate(id, { 
          isDelivered: true,
          deliveredAt: new Date()
        });
        note.isDelivered = true;
        note.deliveredAt = new Date();
      } catch (updateError) {
        console.error(`Failed to update delivery status for note ${id}:`, updateError);
        // Continue serving the note even if status update fails
      }
    }
    
    console.log(`Successfully serving note ${id} to user`);
    
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