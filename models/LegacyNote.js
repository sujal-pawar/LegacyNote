const mongoose = require('mongoose');

const legacyNoteSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  deliveryDate: Date,
  media: [String], // Array of media URLs
});

module.exports = mongoose.model('LegacyNote', legacyNoteSchema);
