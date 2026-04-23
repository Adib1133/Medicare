const express = require('express');
const router = express.Router();
const Icon = require('../models/Icon');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

// Get all icons
router.get('/', async (req, res) => {
  try {
    const icons = await Icon.find();
    res.status(200).json({
      success: true,
      data: icons
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get active icon by type
router.get('/active/:type', async (req, res) => {
  try {
    const icon = await Icon.findOne({ type: req.params.type, isActive: true });
    res.status(200).json({
      success: true,
      data: icon
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create/Update icon with Font Awesome
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { type, name, iconType, fontAwesomeClass } = req.body;
    
    // Deactivate existing icons of this type
    await Icon.updateMany({ type }, { isActive: false });
    
    const icon = await Icon.create({
      type,
      name,
      iconType,
      fontAwesomeClass,
      isActive: true
    });
    
    res.status(201).json({
      success: true,
      data: icon
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Upload icon image
router.post('/upload/:type', protect, authorize('admin'), upload.single('icon'), async (req, res) => {
  try {
    const { type } = req.params;
    const { name } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    // Deactivate existing icons of this type
    const oldIcons = await Icon.find({ type, isActive: true });
    for (let oldIcon of oldIcons) {
      if (oldIcon.imageUrl) {
        const oldPath = path.join(__dirname, '..', oldIcon.imageUrl);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      oldIcon.isActive = false;
      await oldIcon.save();
    }
    
    const icon = await Icon.create({
      type,
      name: name || 'Custom Icon',
      iconType: 'upload',
      imageUrl: `/uploads/doctors/${req.file.filename}`,
      isActive: true
    });
    
    res.status(201).json({
      success: true,
      data: icon
    });
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete icon
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const icon = await Icon.findById(req.params.id);
    
    if (!icon) {
      return res.status(404).json({ success: false, message: 'Icon not found' });
    }
    
    // Delete image file if exists
    if (icon.imageUrl) {
      const imagePath = path.join(__dirname, '..', icon.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await icon.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Icon deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
