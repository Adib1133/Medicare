const mongoose = require('mongoose');

const iconSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['favicon', 'logo', 'custom'],
    required: true
  },
  name: {
    type: String,
    required: true
  },
  iconType: {
    type: String,
    enum: ['fontawesome', 'upload'],
    required: true
  },
  fontAwesomeClass: {
    type: String,
    default: null
  },
  imageUrl: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Icon', iconSchema);
