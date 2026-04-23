const express = require('express');
const router = express.Router();
const { protectIncharge } = require('../middleware/auth');
const Report = require('../models/Report');
const Appointment = require('../models/Appointment');

// Get dashboard statistics for in-charge users
router.get('/dashboard', protectIncharge, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const stats = {};
    
    // Reports stats (if has permission)
    if (req.user.permissions.canManageReports || req.user.role === 'admin') {
      stats.reports = {
        total: await Report.countDocuments(),
        pending: await Report.countDocuments({ status: 'pending' }),
        ready: await Report.countDocuments({ status: 'ready' }),
        delivered: await Report.countDocuments({ status: 'delivered' })
      };
    }
    
    // Appointments stats (if has permission)
    if (req.user.permissions.canViewAppointments || req.user.role === 'admin') {
      stats.appointments = {
        total: await Appointment.countDocuments(),
        today: await Appointment.countDocuments({ 
          date: { $gte: today, $lt: tomorrow } 
        }),
        pending: await Appointment.countDocuments({ status: 'pending' }),
        confirmed: await Appointment.countDocuments({ status: 'confirmed' })
      };
    }
    
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get recent activity for in-charge users
router.get('/activity', protectIncharge, async (req, res) => {
  try {
    const activity = [];
    
    // Recent reports (if has permission)
    if (req.user.permissions.canManageReports || req.user.role === 'admin') {
      const recentReports = await Report.find()
        .sort('-createdAt')
        .limit(5)
        .select('patientId patientName reportType status createdAt');
      
      activity.push(...recentReports.map(r => ({
        type: 'report',
        data: r,
        timestamp: r.createdAt
      })));
    }
    
    // Recent appointments (if has permission)
    if (req.user.permissions.canViewAppointments || req.user.role === 'admin') {
      const recentAppts = await Appointment.find()
        .sort('-createdAt')
        .limit(5)
        .select('patientName service status date createdAt')
        .populate('doctor', 'name');
      
      activity.push(...recentAppts.map(a => ({
        type: 'appointment',
        data: a,
        timestamp: a.createdAt
      })));
    }
    
    // Sort by timestamp
    activity.sort((a, b) => b.timestamp - a.timestamp);
    
    res.json({ 
      success: true, 
      count: activity.length,
      data: activity.slice(0, 10) 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
