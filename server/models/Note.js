const mongoose = require('mongoose');
const CryptoJS = require('crypto-js');
const crypto = require('crypto');

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
    mediaFiles: [
      {
        fileName: {
          type: String,
          required: true
        },
        filePath: {
          type: String,
          required: true
        },
        fileType: {
          type: String,
          required: true
        },
        fileSize: {
          type: Number,
          required: true
        }
      }
    ],
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
    recipients: [
      {
        name: {
          type: String,
          required: true,
        },
        email: {
          type: String,
          required: true,
          match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email',
          ],
        },
      }
    ],
    deliveryDate: {
      type: Date,
      required: [true, 'Delivery date is required'],
    },
    exactTimeDelivery: {
      type: Boolean,
      default: false,
      description: 'If true, the note will be delivered at the exact time specified, not just the date'
    },
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
  // Generate a cryptographically secure random access key (40 hex chars = 160 bits)
  const accessKey = crypto.randomBytes(20).toString('hex');
  this.accessKey = accessKey;

  // Get the frontend URL with a fallback
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  // Generate the full shareable link
  this.shareableLink = `${frontendUrl}/shared-note/${this._id}/${accessKey}`;

  // console.log(`Generated link: ${this.shareableLink}`);
  return this.shareableLink;
};

// Helper method to check if a note is scheduled to self
NoteSchema.methods.isScheduledToSelf = async function() {
  // First ensure we have the user populated
  if (!this.populated('user')) {
    await this.populate('user', 'email');
  }
  
  // Legacy single recipient check
  if (this.recipient && this.recipient.email && this.user && this.user.email === this.recipient.email) {
    return true;
  }
  
  // Check in recipients array
  if (this.recipients && this.recipients.length > 0) {
    return this.recipients.some(recipient => 
      recipient.email && this.user && this.user.email === recipient.email
    );
  }
  
  return false;
};

module.exports = mongoose.model('Note', NoteSchema); 