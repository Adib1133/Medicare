const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const { protect, authorize } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Get all appointments (Protected)
router.get('/', protect, async (req, res) => {
  try {
    const { 
      status, 
      date, 
      doctor,
      search,
      sort = '-createdAt',
      page = 1,
      limit = 20
    } = req.query;
    
    // Build query
    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.date = { $gte: startDate, $lt: endDate };
    }
    
    if (doctor) {
      query.doctor = doctor;
    }
    
    if (search) {
      query.$or = [
        { patientName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Pagination
    const pageSize = parseInt(limit);
    const skip = (parseInt(page) - 1) * pageSize;
    
    const appointments = await Appointment.find(query)
      .populate('doctor', 'name specialty department')
      .sort(sort)
      .limit(pageSize)
      .skip(skip);
    
    const total = await Appointment.countDocuments(query);
    
    res.json({
      success: true,
      count: appointments.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / pageSize),
      data: appointments
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single appointment
router.get('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('doctor', 'name specialty department contact');
    
    if (!appointment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Appointment not found' 
      });
    }
    
    res.json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create appointment (Public)
router.post('/', [
  body('patientName').trim().notEmpty().withMessage('Patient name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('time').notEmpty().withMessage('Time is required'),
  body('service').notEmpty().withMessage('Service is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }
    
    const appointment = await Appointment.create(req.body);
    
    // Populate doctor info
    await appointment.populate('doctor', 'name specialty department');
    
    res.status(201).json({ 
      success: true, 
      data: appointment,
      message: 'Appointment booked successfully!' 
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update appointment (Protected)
router.put('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('doctor', 'name specialty department');
    
    if (!appointment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Appointment not found' 
      });
    }
    
    res.json({ success: true, data: appointment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update appointment status (Protected)
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status value' 
      });
    }
    
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('doctor', 'name specialty department');
    
    if (!appointment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Appointment not found' 
      });
    }
    
    res.json({ success: true, data: appointment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete appointment (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Appointment not found' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Appointment deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get appointment statistics (Protected)
router.get('/stats/overview', protect, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const stats = {
      total: await Appointment.countDocuments(),
      pending: await Appointment.countDocuments({ status: 'pending' }),
      confirmed: await Appointment.countDocuments({ status: 'confirmed' }),
      completed: await Appointment.countDocuments({ status: 'completed' }),
      cancelled: await Appointment.countDocuments({ status: 'cancelled' }),
      today: await Appointment.countDocuments({ 
        date: { $gte: today, $lt: tomorrow } 
      })
    };
    
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
