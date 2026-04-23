const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  hours: {
    weekdays: String,
    sunday: String
  }
});

const heroTextSchema = new mongoose.Schema({
  tagline: String,
  title1: String,
  title2: String,
  description: String
});

const statSchema = new mongoose.Schema({
  number: String,
  label: String,
  icon: String
});

const clinicSchema = new mongoose.Schema({
  clinicName: {
    type: String,
    required: true,
    default: 'MediCare Plus'
  },
  tagline: {
    type: String,
    default: 'Diagnostic Excellence'
  },
  logoUrl: {
    type: String,
    default: null
  },
  logo: {
    type: String,
    default: 'fa-heart-pulse' // FontAwesome icon class
  },
  logoUrl: {
    type: String,
    default: null // Uploaded logo image URL
  },
  favicon: {
    type: String,
    default: 'fa-heart-pulse'
  },
  faviconUrl: {
    type: String,
    default: null
  },
  contact: contactSchema,
  heroText: heroTextSchema,
  stats: [statSchema],
  aboutText: String,
  whyChooseUs: [String],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Clinic', clinicSchema);
