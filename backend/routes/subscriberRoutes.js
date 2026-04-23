const express = require('express');
const router = express.Router();
const Subscriber = require('../models/Subscriber');
const { protect, authorize } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Subscribe to newsletter (Public)
router.post('/', [
  body('email').isEmail().withMessage('Valid email is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }
    
    const { email } = req.body;
    
    // Check if already subscribed
    const existing = await Subscriber.findOne({ email });
    if (existing) {
      return res.status(400).json({ 
        success: false, 
        message: 'This email is already subscribed' 
      });
    }
    
    const subscriber = await Subscriber.create({ email });
    
    res.status(201).json({
      success: true,
      data: subscriber,
      message: 'Successfully subscribed to newsletter!'
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Get all subscribers (Admin only)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { 
      isActive,
      sort = '-createdAt',
      page = 1,
      limit = 50
    } = req.query;
    
    const query = {};
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    const pageSize = parseInt(limit);
    const skip = (parseInt(page) - 1) * pageSize;
    
    const subscribers = await Subscriber.find(query)
      .sort(sort)
      .limit(pageSize)
      .skip(skip);
    
    const total = await Subscriber.countDocuments(query);
    
    res.json({
      success: true,
      count: subscribers.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / pageSize),
      data: subscribers
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Unsubscribe (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const subscriber = await Subscriber.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!subscriber) {
      return res.status(404).json({ 
        success: false, 
        message: 'Subscriber not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Subscriber unsubscribed successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get subscriber statistics (Admin only)
router.get('/stats/overview', protect, authorize('admin'), async (req, res) => {
  try {
    const stats = {
      total: await Subscriber.countDocuments(),
      active: await Subscriber.countDocuments({ isActive: true }),
      inactive: await Subscriber.countDocuments({ isActive: false })
    };
    
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
