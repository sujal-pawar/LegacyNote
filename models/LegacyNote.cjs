const mongoose = require('mongoose');

const LegacyNoteSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  deliveryDate: { type: Date, required: true },
  mediaUrl: { type: String, required: false }
});

const LegacyNote = mongoose.model('LegacyNote', LegacyNoteSchema);
module.exports = LegacyNote;
