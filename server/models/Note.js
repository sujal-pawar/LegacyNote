const mongoose = require('mongoose');
const CryptoJS = require('crypto-js');

const NoteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      trim: true,
    },
    encryptedContent: {
      type: String,
      select: false,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipient: {
      name: {
        type: String,
        required: false,
      },
      email: {
        type: String,
        required: false,
        match: [
          /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
          'Please add a valid email',
        ],
      },
    },
    deliveryDate: {
      type: Date,
      required: [true, 'Delivery date is required'],
    },
    // Store the timezone offset for accurate time delivery
    timezone: {
      type: String,
      default: 'UTC'
    },
    isDelivered: {
      type: Boolean,
      default: false,
    },
    deliveredAt: {
      type: Date,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    shareableLink: {
      type: String,
    },
    accessKey: {
      type: String,
      select: false,
    },
    // Add a flag to indicate messages scheduled to self
    isSelfMessage: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
  }
);

// Encrypt content before saving
NoteSchema.pre('save', function (next) {
  if (!this.isModified('content')) {
    return next();
  }

  // Encrypt content
  const encryptedContent = CryptoJS.AES.encrypt(
    this.content,
    process.env.ENCRYPTION_KEY
  ).toString();

  this.encryptedContent = encryptedContent;
  
  // For security, remove the plaintext content when storing
  // It will only be decrypted when needed
  if (!this.isNew) {
    this.content = undefined;
  }

  // Set timezone if not provided
  if (!this.timezone) {
    this.timezone = 'UTC';
  }

  // If the recipient email matches the user's email, mark as self-message
  if (this.recipient && this.recipient.email) {
    // We'll need to populate the user later to compare emails
    // This is handled in the controllers
  }

  next();
});

// Method to decrypt content
NoteSchema.methods.decryptContent = function () {
  const bytes = CryptoJS.AES.decrypt(
    this.encryptedContent,
    process.env.ENCRYPTION_KEY
  );
  return bytes.toString(CryptoJS.enc.Utf8);
};

// Generate shareable link
NoteSchema.methods.generateShareableLink = function () {
  const accessKey = Math.random().toString(36).slice(2) + 
                   Math.random().toString(36).slice(2);
  this.accessKey = accessKey;
  
  // Get the frontend URL with a fallback
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  
  // Generate the full shareable link
  this.shareableLink = `${frontendUrl}/shared-note/${this._id}/${accessKey}`;
  
  console.log(`Generated link: ${this.shareableLink}`);
  return this.shareableLink;
};

// Helper method to check if a note is scheduled to self
NoteSchema.methods.isScheduledToSelf = async function() {
  // First ensure we have the user populated
  if (!this.populated('user')) {
    await this.populate('user', 'email');
  }
  
  return this.recipient && 
         this.recipient.email && 
         this.user && 
         this.user.email === this.recipient.email;
};

module.exports = mongoose.model('Note', NoteSchema); 