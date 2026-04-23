const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

// Get all doctors
router.get('/', async (req, res) => {
  try {
    const { 
      department, 
      specialty, 
      featured, 
      search,
      sort = '-rating',
      limit,
      page = 1
    } = req.query;
    
    // Build query
    const query = { isActive: true };
    
    if (department) {
      query.department = { $regex: department, $options: 'i' };
    }
    
    if (specialty) {
      query.specialty = { $regex: specialty, $options: 'i' };
    }
    
    if (featured === 'true') {
      query.featured = true;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { specialty: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Execute query with pagination
    const pageSize = limit ? parseInt(limit) : 100;
    const skip = (parseInt(page) - 1) * pageSize;
    
    const doctors = await Doctor.find(query)
      .sort(sort)
      .limit(pageSize)
      .skip(skip);
    
    const total = await Doctor.countDocuments(query);
    
    res.json({
      success: true,
      count: doctors.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / pageSize),
      data: doctors
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single doctor
router.get('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    
    if (!doctor) {
      return res.status(404).json({ 
        success: false, 
        message: 'Doctor not found' 
      });
    }
    
    res.json({ success: true, data: doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create doctor (Admin only)
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const doctor = await Doctor.create(req.body);
    res.status(201).json({ success: true, data: doctor });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update doctor (Admin only)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!doctor) {
      return res.status(404).json({ 
        success: false, 
        message: 'Doctor not found' 
      });
    }
    
    res.json({ success: true, data: doctor });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete doctor (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!doctor) {
      return res.status(404).json({ 
        success: false, 
        message: 'Doctor not found' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Doctor deactivated successfully' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get departments
router.get('/meta/departments', async (req, res) => {
  try {
    const departments = await Doctor.distinct('department', { isActive: true });
    res.json({ success: true, data: departments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get specialties
router.get('/meta/specialties', async (req, res) => {
  try {
    const specialties = await Doctor.distinct('specialty', { isActive: true });
    res.json({ success: true, data: specialties });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

// Image upload route
router.post('/upload-image/:id', protect, authorize('admin'), upload.single('image'), async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    
    if (!doctor) {
      // Delete uploaded file if doctor not found
      if (req.file) {
        const fs = require('fs');
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    // Delete old image if exists
    if (doctor.imageUrl && doctor.imageUrl !== '👨‍⚕️') {
      const oldImagePath = path.join(__dirname, '..', doctor.imageUrl);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Save new image URL
    doctor.imageUrl = `/uploads/doctors/${req.file.filename}`;
    await doctor.save();

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: doctor
    });
  } catch (error) {
    // Delete uploaded file on error
    if (req.file) {
      const fs = require('fs');
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete doctor image
router.delete('/:id/image', protect, authorize('admin'), async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    // Delete image file
    if (doctor.imageUrl && doctor.imageUrl !== '👨‍⚕️') {
      const imagePath = path.join(__dirname, '..', doctor.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Reset to default emoji
    doctor.imageUrl = '👨‍⚕️';
    await doctor.save();

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully',
      data: doctor
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
