const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Doctor = require('../models/Doctor');
const Service = require('../models/Service');
const Clinic = require('../models/Clinic');
const User = require('../models/User');

dotenv.config();

// Connect to database
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

// Sample data
const doctors = [
  {
    name: "Dr. Sarah Mitchell",
    specialty: "Cardiologist",
    department: "Cardiology",
    designation: "Senior Consultant & Head of Cardiology",
    institute: "Johns Hopkins University",
    qualifications: "MBBS, MD, DM Cardiology, FACC",
    experience: "15 years",
    detailedExperience: "15 years of specialized experience in interventional cardiology. Expert in angioplasty, pacemaker implantation, and heart failure management. Former Chief Resident at Massachusetts General Hospital.",
    image: "👩‍⚕️",
    available: "Mon, Wed, Fri",
    time: "9 AM - 2 PM",
    contact: "+1 (555) 123-4567",
    email: "sarah.mitchell@medicare.com",
    consultationFee: "$200",
    languages: ["English", "Spanish"],
    featured: true,
    rating: 4.9
  },
  {
    name: "Dr. James Chen",
    specialty: "Radiologist",
    department: "Radiology",
    designation: "Head of Radiology Department",
    institute: "Harvard Medical School",
    qualifications: "MBBS, MD Radiology, FRCR",
    experience: "12 years",
    detailedExperience: "12 years in advanced diagnostic imaging. Specialized in MRI, CT scans, and interventional radiology. Published 25+ research papers in medical journals.",
    image: "👨‍⚕️",
    available: "Tue, Thu, Sat",
    time: "10 AM - 3 PM",
    contact: "+1 (555) 123-4568",
    email: "james.chen@medicare.com",
    consultationFee: "$180",
    languages: ["English", "Mandarin"],
    featured: true,
    rating: 4.8
  },
  {
    name: "Dr. Emily Rodriguez",
    specialty: "Pathologist",
    department: "Pathology",
    designation: "Chief Pathologist & Lab Director",
    institute: "Stanford University",
    qualifications: "MBBS, MD Pathology, FCAP",
    experience: "18 years",
    detailedExperience: "18 years in clinical pathology and laboratory medicine. Expert in histopathology, cytology, and molecular diagnostics. Board certified in anatomical and clinical pathology.",
    image: "👩‍⚕️",
    available: "Mon - Fri",
    time: "8 AM - 4 PM",
    contact: "+1 (555) 123-4569",
    email: "emily.rodriguez@medicare.com",
    consultationFee: "$150",
    languages: ["English", "Spanish"],
    featured: true,
    rating: 4.9
  },
  {
    name: "Dr. Michael Kumar",
    specialty: "Neurologist",
    department: "Neurology",
    designation: "Consultant Neurologist",
    institute: "Mayo Clinic",
    qualifications: "MBBS, MD, DM Neurology",
    experience: "10 years",
    detailedExperience: "10 years specializing in stroke, epilepsy, and movement disorders. Expert in EEG interpretation and neurological diagnostics.",
    image: "👨‍⚕️",
    available: "Mon, Thu",
    time: "2 PM - 6 PM",
    contact: "+1 (555) 123-4570",
    email: "michael.kumar@medicare.com",
    consultationFee: "$170",
    languages: ["English", "Hindi"],
    featured: true,
    rating: 4.7
  },
  {
    name: "Dr. Lisa Anderson",
    specialty: "Orthopedic Surgeon",
    department: "Orthopedics",
    designation: "Senior Orthopedic Consultant",
    institute: "Cleveland Clinic",
    qualifications: "MBBS, MS Orthopedics, FRCS",
    experience: "14 years",
    detailedExperience: "14 years in orthopedic surgery with expertise in joint replacement, sports injuries, and trauma care.",
    image: "👩‍⚕️",
    available: "Tue, Fri",
    time: "9 AM - 1 PM",
    contact: "+1 (555) 123-4571",
    email: "lisa.anderson@medicare.com",
    consultationFee: "$220",
    languages: ["English"],
    featured: true,
    rating: 4.8
  },
  {
    name: "Dr. David Park",
    specialty: "Ophthalmologist",
    department: "Ophthalmology",
    designation: "Consultant Ophthalmologist",
    institute: "UCLA Medical Center",
    qualifications: "MBBS, MS Ophthalmology",
    experience: "8 years",
    detailedExperience: "8 years specializing in cataract surgery, LASIK, and retinal diseases. Expert in advanced eye care procedures.",
    image: "👨‍⚕️",
    available: "Mon, Wed, Sat",
    time: "10 AM - 4 PM",
    contact: "+1 (555) 123-4572",
    email: "david.park@medicare.com",
    consultationFee: "$160",
    languages: ["English", "Korean"],
    featured: false,
    rating: 4.6
  }
];

const services = [
  { 
    icon: "fa-microscope", 
    name: "Pathology", 
    desc: "Complete blood tests, urine analysis, and laboratory diagnostics", 
    color: "from-blue-500 to-cyan-500",
    order: 1
  },
  { 
    icon: "fa-heart-pulse", 
    name: "Radiology", 
    desc: "X-Ray, CT Scan, MRI, and Ultrasound imaging services", 
    color: "from-purple-500 to-pink-500",
    order: 2
  },
  { 
    icon: "fa-heart", 
    name: "Cardiology", 
    desc: "ECG, Echo, stress tests, and heart health monitoring", 
    color: "from-red-500 to-orange-500",
    order: 3
  },
  { 
    icon: "fa-brain", 
    name: "Neurology", 
    desc: "EEG, nerve conduction studies, and brain imaging", 
    color: "from-indigo-500 to-purple-500",
    order: 4
  },
  { 
    icon: "fa-bone", 
    name: "Orthopedics", 
    desc: "Bone density scans, joint assessments, and imaging", 
    color: "from-green-500 to-emerald-500",
    order: 5
  },
  { 
    icon: "fa-eye", 
    name: "Ophthalmology", 
    desc: "Eye exams, vision tests, and retinal imaging", 
    color: "from-amber-500 to-yellow-500",
    order: 6
  }
];

const clinicData = {
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
};

const adminUser = {
  name: 'Admin User',
  email: 'admin@medicare.com',
  password: 'admin123',
  role: 'admin',
  department: 'Administration'
};

const inchargeUser = {
  name: 'John Doe',
  email: 'incharge@medicare.com',
  password: 'incharge123',
  role: 'incharge',
  department: 'Radiology',
  permissions: {
    canManageReports: true,
    canViewAppointments: true,
    canManageAppointments: true,
    canViewStats: true
  }
};

// Import data
const importData = async () => {
  try {
    // Clear existing data
    await Doctor.deleteMany();
    await Service.deleteMany();
    await Clinic.deleteMany();
    await User.deleteMany();
    
    // Insert sample data
    await Doctor.insertMany(doctors);
    console.log('✅ Doctors imported');
    
    await Service.insertMany(services);
    console.log('✅ Services imported');
    
    await Clinic.create(clinicData);
    console.log('✅ Clinic info imported');
    
    await User.create(adminUser);
    console.log('✅ Admin user created (email: admin@medicare.com, password: admin123)');
    
    await User.create(inchargeUser);
    console.log('✅ In-charge user created (email: incharge@medicare.com, password: incharge123)');
    
    console.log('\n🎉 Data import completed successfully!');
    console.log('\n📌 Login credentials:');
    console.log('   Admin: admin@medicare.com / admin123');
    console.log('   In-charge: incharge@medicare.com / incharge123');
    
    process.exit();
  } catch (error) {
    console.error('Error importing data:', error);
    process.exit(1);
  }
};

// Delete data
const deleteData = async () => {
  try {
    await Doctor.deleteMany();
    await Service.deleteMany();
    await Clinic.deleteMany();
    await User.deleteMany();
    
    console.log('✅ Data deleted');
    process.exit();
  } catch (error) {
    console.error('Error deleting data:', error);
    process.exit(1);
  }
};

// Check command line args
if (process.argv[2] === '-d') {
  deleteData();
} else {
  importData();
}
