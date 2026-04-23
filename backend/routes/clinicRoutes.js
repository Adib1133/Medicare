const express = require('express');
const router = express.Router();
const Clinic = require('../models/Clinic');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

// Get clinic information
router.get('/', async (req, res) => {
  try {
    let clinic = await Clinic.findOne({ isActive: true });
    
    if (!clinic) {
      // Create default clinic if none exists
      clinic = await Clinic.create({
        clinicName: 'MediCare Plus',
        tagline: 'Diagnostic Excellence',
        contact: {
          address: '123 Healthcare Avenue, Medical District, City 12345',
          phone: '+1 (555) 123-4567',
          email: 'info@medicareplus.com',
          hours: {
            weekdays: 'Mon - Sat: 8:00 AM - 8:00 PM',
            sunday: 'Sunday: 9:00 AM - 2:00 PM'
          }
        },
        heroText: {
          tagline: '🏥 Trusted Healthcare Partner',
          title1: 'Your Health, Our',
          title2: 'Priority',
          description: 'Advanced diagnostic services with cutting-edge technology and expert care. Get accurate results you can trust.'
        },
        stats: [
          { number: '50K+', label: 'Patients Served', icon: 'fa-users' },
          { number: '25+', label: 'Expert Doctors', icon: 'fa-stethoscope' },
          { number: '100+', label: 'Diagnostic Tests', icon: 'fa-heart-pulse' },
          { number: '20+', label: 'Years Experience', icon: 'fa-award' }
        ]
      });
    }
    
    res.json({ success: true, data: clinic });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update clinic information (Admin only)
router.put('/', protect, authorize('admin'), async (req, res) => {
  try {
    const clinic = await Clinic.findOneAndUpdate(
      { isActive: true },
      req.body,
      { new: true, upsert: true, runValidators: true }
    );
    
    res.json({ success: true, data: clinic });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Logo upload route
router.post('/upload-logo', protect, authorize('admin'), upload.single('logo'), async (req, res) => {
  try {
    let clinic = await Clinic.findOne();
    
    if (!clinic) {
      // Create clinic if doesn't exist
      clinic = await Clinic.create({
        clinicName: 'MediCare Plus',
        tagline: 'Diagnostic Excellence'
      });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Delete old logo if exists
    if (clinic.logoUrl) {
      const oldLogoPath = path.join(__dirname, '..', clinic.logoUrl);
      if (fs.existsSync(oldLogoPath)) {
        try {
          fs.unlinkSync(oldLogoPath);
        } catch (err) {
          console.error('Error deleting old logo:', err);
        }
      }
    }

    // Save new logo URL
    clinic.logoUrl = `/uploads/icons/${req.file.filename}`;
    await clinic.save();

    res.status(200).json({
      success: true,
      message: 'Logo uploaded successfully',
      data: clinic
    });
  } catch (error) {
    // Delete uploaded file on error
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error('Error deleting file:', err);
      }
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete logo
router.delete('/logo', protect, authorize('admin'), async (req, res) => {
  try {
    let clinic = await Clinic.findOne();
    
    if (!clinic) {
      return res.status(404).json({ success: false, message: 'Clinic not found' });
    }

    // Delete logo file
    if (clinic.logoUrl) {
      const logoPath = path.join(__dirname, '..', clinic.logoUrl);
      if (fs.existsSync(logoPath)) {
        try {
          fs.unlinkSync(logoPath);
        } catch (err) {
          console.error('Error deleting logo:', err);
        }
      }
    }

    // Reset to null
    clinic.logoUrl = null;
    await clinic.save();

    res.status(200).json({
      success: true,
      message: 'Logo deleted successfully',
      data: clinic
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
