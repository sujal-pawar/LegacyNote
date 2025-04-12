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
  this.shareableLink = `${process.env.FRONTEND_URL}/shared-note/${this._id}/${accessKey}`;
  return this.shareableLink;
};

module.exports = mongoose.model('Note', NoteSchema); 