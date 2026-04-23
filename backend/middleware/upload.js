const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const doctorsDir = path.join(__dirname, '../uploads/doctors');
const reportsDir = path.join(__dirname, '../uploads/reports');
const iconsDir = path.join(__dirname, '../uploads/icons');

[doctorsDir, reportsDir, iconsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = doctorsDir; // default
    
    if (req.path.includes('/upload-pdf')) {
      uploadPath = reportsDir;
    } else if (req.path.includes('/upload-icon') || req.path.includes('/upload-logo')) {
      uploadPath = iconsDir;
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const prefix = req.path.includes('/upload-pdf') ? 'report-' : 
                   req.path.includes('/upload-icon') || req.path.includes('/upload-logo') ? 'icon-' : 
                   'doctor-';
    cb(null, prefix + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // For PDFs
  if (req.path.includes('/upload-pdf')) {
    if (file.mimetype === 'application/pdf') {
      return cb(null, true);
    } else {
      return cb(new Error('Only PDF files are allowed'));
    }
  }
  
  // For images (doctors, icons, logos)
  const allowedTypes = /jpeg|jpg|png|gif|webp|svg/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype) || file.mimetype === 'image/svg+xml';

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp, svg)'));
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max file size
  },
  fileFilter: fileFilter
});

module.exports = upload;
