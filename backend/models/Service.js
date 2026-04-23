const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  icon: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true
  },
  desc: {
    type: String,
    required: [true, 'Service description is required']
  },
  color: {
    type: String,
    default: 'from-blue-500 to-cyan-500'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Service', serviceSchema);
