const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: [true, 'Patient ID is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  patientName: {
    type: String,
    required: [true, 'Patient name is required'],
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: false
  },
  reportType: {
    type: String,
    required: [true, 'Report type is required']
  },
  testDate: {
    type: Date,
    required: [true, 'Test date is required'],
    default: Date.now
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor'
  },
  findings: {
    type: String
  },
  notes: {
    type: String
  },
  pdfUrl: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'ready', 'delivered'],
    default: 'pending'
  },
  pdfUrl: {
    type: String,
    default: null
  },
  fileUrl: {
    type: String
  },
  testResults: [{
    parameter: String,
    value: String,
    unit: String,
    normalRange: String,
    status: {
      type: String,
      enum: ['normal', 'low', 'high']
    }
  }],
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for patient ID search
reportSchema.index({ patientId: 1 });
reportSchema.index({ patientName: 'text' });

module.exports = mongoose.model('Report', reportSchema);
