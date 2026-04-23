const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Doctor name is required'],
    trim: true
  },
  specialty: {
    type: String,
    required: [true, 'Specialty is required']
  },
  department: {
    type: String,
    required: [true, 'Department is required']
  },
  designation: {
    type: String,
    required: true
  },
  institute: {
    type: String,
    required: true
  },
  qualifications: {
    type: String,
    required: true
  },
  experience: {
    type: String,
    required: true
  },
  detailedExperience: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: '👨‍⚕️'
  },
  imageUrl: {
    type: String,
    default: null
  },
  available: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  contact: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  consultationFee: {
    type: String,
    default: '$150'
  },
  languages: {
    type: [String],
    default: ['English']
  },
  rating: {
    type: Number,
    default: 4.5,
    min: 0,
    max: 5
  },
  featured: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  achievements: [String],
  specializations: [String],
  education: [{
    degree: String,
    institution: String,
    year: String
  }]
}, {
  timestamps: true
});

// Index for search
doctorSchema.index({ name: 'text', specialty: 'text', department: 'text' });

module.exports = mongoose.model('Doctor', doctorSchema);
