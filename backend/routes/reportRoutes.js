const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const { protect, authorize, protectIncharge } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const upload = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

// Search report by patient ID (Public)
router.get('/search/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    const { dob } = req.query;
    
    const query = { patientId: patientId.toUpperCase() };
    
    // Optionally verify date of birth for security
    if (dob) {
      query.dateOfBirth = new Date(dob);
    }
    
    const report = await Report.findOne(query)
      .populate('doctor', 'name specialty department');
    
    if (!report) {
      return res.status(404).json({ 
        success: false, 
        message: 'Report not found' 
      });
    }
    
    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all reports (Protected - Admin and Incharge)
router.get('/', protectIncharge, async (req, res) => {
  try {
    const { 
      status,
      reportType,
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
    
    if (reportType) {
      query.reportType = reportType;
    }
    
    if (search) {
      query.$or = [
        { patientId: { $regex: search, $options: 'i' } },
        { patientName: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Pagination
    const pageSize = parseInt(limit);
    const skip = (parseInt(page) - 1) * pageSize;
    
    const reports = await Report.find(query)
      .populate('doctor', 'name specialty department')
      .populate('uploadedBy', 'name email')
      .sort(sort)
      .limit(pageSize)
      .skip(skip);
    
    const total = await Report.countDocuments(query);
    
    res.json({
      success: true,
      count: reports.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / pageSize),
      data: reports
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single report (Protected)
router.get('/:id', protectIncharge, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('doctor', 'name specialty department contact')
      .populate('uploadedBy', 'name email');
    
    if (!report) {
      return res.status(404).json({ 
        success: false, 
        message: 'Report not found' 
      });
    }
    
    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create report (Protected - Admin and Incharge with permission)
router.post('/', protectIncharge, [
  body('patientId').trim().notEmpty().withMessage('Patient ID is required'),
  body('patientName').trim().notEmpty().withMessage('Patient name is required'),
  body('reportType').notEmpty().withMessage('Report type is required'),
  body('testDate').isISO8601().withMessage('Valid test date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }
    
    // Check if user has permission
    if (req.user.role === 'incharge' && !req.user.permissions.canManageReports) {
      return res.status(403).json({ 
        success: false, 
        message: 'You do not have permission to create reports' 
      });
    }
    
    const reportData = {
      ...req.body,
      patientId: req.body.patientId.toUpperCase(),
      uploadedBy: req.user._id
    };
    
    const report = await Report.create(reportData);
    
    await report.populate('doctor', 'name specialty department');
    
    res.status(201).json({ 
      success: true, 
      data: report,
      message: 'Report created successfully!' 
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: 'A report with this Patient ID already exists' 
      });
    }
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update report (Protected - Admin and Incharge with permission)
router.put('/:id', protectIncharge, async (req, res) => {
  try {
    // Check if user has permission
    if (req.user.role === 'incharge' && !req.user.permissions.canManageReports) {
      return res.status(403).json({ 
        success: false, 
        message: 'You do not have permission to update reports' 
      });
    }
    
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { ...req.body, uploadedBy: req.user._id },
      { new: true, runValidators: true }
    ).populate('doctor', 'name specialty department');
    
    if (!report) {
      return res.status(404).json({ 
        success: false, 
        message: 'Report not found' 
      });
    }
    
    res.json({ success: true, data: report });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update report status (Protected)
router.patch('/:id/status', protectIncharge, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'ready', 'delivered'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status value' 
      });
    }
    
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('doctor', 'name specialty department');
    
    if (!report) {
      return res.status(404).json({ 
        success: false, 
        message: 'Report not found' 
      });
    }
    
    res.json({ success: true, data: report });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete report (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);
    
    if (!report) {
      return res.status(404).json({ 
        success: false, 
        message: 'Report not found' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Report deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get report statistics (Protected)
router.get('/stats/overview', protectIncharge, async (req, res) => {
  try {
    const stats = {
      total: await Report.countDocuments(),
      pending: await Report.countDocuments({ status: 'pending' }),
      ready: await Report.countDocuments({ status: 'ready' }),
      delivered: await Report.countDocuments({ status: 'delivered' })
    };
    
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

// PDF upload route
router.post('/upload-pdf/:id', protect, upload.single('pdf'), async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    
    if (!report) {
      if (req.file) {
        const fs = require('fs');
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    // Delete old PDF if exists
    if (report.pdfUrl) {
      const oldPdfPath = path.join(__dirname, '..', report.pdfUrl);
      if (fs.existsSync(oldPdfPath)) {
        fs.unlinkSync(oldPdfPath);
      }
    }

    // Save new PDF URL
    report.pdfUrl = `/uploads/reports/${req.file.filename}`;
    await report.save();

    res.status(200).json({
      success: true,
      message: 'PDF uploaded successfully',
      data: report
    });
  } catch (error) {
    if (req.file) {
      const fs = require('fs');
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ success: false, message: error.message });
  }
});
