const mongoose = require('mongoose');

const LegacyNoteSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  deliveryDate: { type: Date, required: true },
  media: { 
    type: [String], 
    required: false, 
    default: [], 
    validate: {
      validator: function(arr) {
        return arr.every(item => typeof item === 'string');
      },
      message: 'Media should be an array of strings'
    }
  } 
});

const LegacyNote = mongoose.model('LegacyNote', LegacyNoteSchema);
module.exports = LegacyNote;
