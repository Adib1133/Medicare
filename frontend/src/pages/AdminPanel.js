import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import {
  doctorService, appointmentService, reportService, serviceService,
  userService, subscriberService, clinicService
} from '../services';

const AdminPanel = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);

  // All data states
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [reports, setReports] = useState([]);
  const [services, setServices] = useState([]);
  const [users, setUsers] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [clinic, setClinic] = useState({});
  const [stats, setStats] = useState({});

  // Form states
  const [doctorForm, setDoctorForm] = useState({
    name: '', specialty: '', department: '', designation: '', institute: '',
    qualifications: '', experience: '', detailedExperience: '', image: '👨‍⚕️',
    available: '', time: '', contact: '', email: '', consultationFee: '$150',
    languages: 'English', rating: 4.5, featured: false
  });

  const [serviceForm, setServiceForm] = useState({
    icon: 'fa-heart-pulse', name: '', desc: '', color: 'from-blue-500 to-cyan-500'
  });

  const [reportForm, setReportForm] = useState({
    patientId: '', patientName: '', reportType: '', testDate: '', notes: '', status: 'pending'
  });

  const [clinicForm, setClinicForm] = useState({
    clinicName: '', tagline: '',
    contact: { address: '', phone: '', email: '', hours: { weekdays: '', sunday: '' } },
    heroText: { tagline: '', title1: '', title2: '', description: '' },
    stats: []
  });

  const [editingDoctor, setEditingDoctor] = useState(null);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  
  // Image upload states
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // User management states
  const [userForm, setUserForm] = useState({
    name: '', email: '', password: '', role: 'incharge', department: '',
    permissions: {
      canManageReports: false,
      canViewAppointments: false,
      canManageAppointments: false,
      canViewStats: false
    }
  });
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    loadTabData();
  }, [user, navigate, activeTab]);

  const loadTabData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'dashboard') {
        const [doctorsData, apptStats, reportStats] = await Promise.all([
          doctorService.getAllDoctors(),
          appointmentService.getAppointmentStats().catch(() => ({ data: {} })),
          reportService.getReportStats().catch(() => ({ data: {} }))
        ]);
        setDoctors(doctorsData.data || []);
        setStats({ ...apptStats.data, ...reportStats.data });
      } else if (activeTab === 'doctors') {
        const data = await doctorService.getAllDoctors();
        setDoctors(data.data || []);
      } else if (activeTab === 'appointments') {
        const data = await appointmentService.getAllAppointments();
        setAppointments(data.data || []);
      } else if (activeTab === 'reports') {
        const data = await reportService.getAllReports();
        setReports(data.data || []);
      } else if (activeTab === 'services') {
        const data = await serviceService.getAllServices();
        setServices(data.data || []);
      } else if (activeTab === 'incharge') {
        const data = await userService.getAllUsers();
        setUsers(data.data || []);
      } else if (activeTab === 'subscribers') {
        const data = await subscriberService.getAllSubscribers();
        setSubscribers(data.data || []);
      } else if (['clinicInfo', 'contact', 'hero', 'stats'].includes(activeTab)) {
        const data = await clinicService.getClinicInfo();
        setClinic(data.data || {});
        setClinicForm({
          clinicName: data.data?.clinicName || '',
          tagline: data.data?.tagline || '',
          contact: data.data?.contact || { address: '', phone: '', email: '', hours: { weekdays: '', sunday: '' } },
          heroText: data.data?.heroText || { tagline: '', title1: '', title2: '', description: '' },
          stats: data.data?.stats || []
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Image upload handlers
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please select a valid image file (JPEG, PNG, GIF, WEBP)');
        return;
      }
      
      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadDoctorImage = async (doctorId) => {
    if (!selectedImage) return;
    
    try {
      const formData = new FormData();
      formData.append('image', selectedImage);
      
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/doctors/upload-image/${doctorId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) throw new Error('Image upload failed');
      
      toast.success('Image uploaded successfully!');
    } catch (error) {
      toast.error('Failed to upload image');
      throw error;
    }
  };

  const getDoctorImageUrl = (doctor) => {
    if (!doctor) return '👨‍⚕️';
    if (doctor.imageUrl) {
      if (doctor.imageUrl.startsWith('http')) {
        return doctor.imageUrl;
      }
      return `${process.env.REACT_APP_API_URL?.replace('/api', '')}${doctor.imageUrl}`;
    }
    return doctor.image || '👨‍⚕️';
  };

  // Doctor CRUD
  const handleSaveDoctor = async (e) => {
    e.preventDefault();
    try {
      const doctorData = { ...doctorForm, languages: doctorForm.languages.split(',').map(l => l.trim()) };
      let savedDoctor;
      
      if (editingDoctor) {
        savedDoctor = await doctorService.updateDoctor(editingDoctor._id, doctorData);
        // Upload image if selected
        if (selectedImage) {
          await uploadDoctorImage(editingDoctor._id);
        }
        toast.success('Doctor updated!');
      } else {
        savedDoctor = await doctorService.createDoctor(doctorData);
        // Upload image if selected
        if (selectedImage) {
          await uploadDoctorImage(savedDoctor.data._id);
        }
        toast.success('Doctor added!');
      }
      
      setShowDoctorModal(false);
      resetDoctorForm();
      loadTabData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed');
    }
  };

  const resetDoctorForm = () => {
    setEditingDoctor(null);
    setSelectedImage(null);
    setImagePreview(null);
    setDoctorForm({
      name: '', specialty: '', department: '', designation: '', institute: '',
      qualifications: '', experience: '', detailedExperience: '', image: '👨‍⚕️',
      available: '', time: '', contact: '', email: '', consultationFee: '$150',
      languages: 'English', rating: 4.5, featured: false
    });
  };

  const editDoctor = (doctor) => {
    setEditingDoctor(doctor);
    setSelectedImage(null);
    setImagePreview(null);
    setDoctorForm({
      name: doctor.name || '', specialty: doctor.specialty || '', department: doctor.department || '',
      designation: doctor.designation || '', institute: doctor.institute || '', qualifications: doctor.qualifications || '',
      experience: doctor.experience || '', detailedExperience: doctor.detailedExperience || '', image: doctor.image || '👨‍⚕️',
      available: doctor.available || '', time: doctor.time || '', contact: doctor.contact || '', email: doctor.email || '',
      consultationFee: doctor.consultationFee || '$150', languages: Array.isArray(doctor.languages) ? doctor.languages.join(', ') : 'English',
      rating: doctor.rating || 4.5, featured: doctor.featured || false
    });
    setShowDoctorModal(true);
  };

  const deleteDoctor = async (id) => {
    if (!window.confirm('Delete this doctor?')) return;
    try {
      await doctorService.deleteDoctor(id);
      toast.success('Doctor deleted!');
      loadTabData();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  // Service CRUD
  const saveService = async (e) => {
    e.preventDefault();
    try {
      await serviceService.createService(serviceForm);
      toast.success('Service added!');
      setServiceForm({ icon: 'fa-heart-pulse', name: '', desc: '', color: 'from-blue-500 to-cyan-500' });
      loadTabData();
    } catch (error) {
      toast.error('Failed');
    }
  };

  const deleteService = async (id) => {
    if (!window.confirm('Delete service?')) return;
    try {
      await serviceService.deleteService(id);
      toast.success('Service deleted!');
      loadTabData();
    } catch (error) {
      toast.error('Failed');
    }
  };

  // Report CRUD
  const saveReport = async (e) => {
    e.preventDefault();
    try {
      await reportService.createReport(reportForm);
      toast.success('Report created!');
      setReportForm({ patientId: '', patientName: '', reportType: '', testDate: '', notes: '', status: 'pending' });
      loadTabData();
    } catch (error) {
      toast.error('Failed');
    }
  };

  const updateReportStatus = async (id, status) => {
    try {
      await reportService.updateReportStatus(id, status);
      toast.success('Status updated!');
      loadTabData();
    } catch (error) {
      toast.error('Failed');
    }
  };

  // Appointment management
  const updateAppointmentStatus = async (id, status) => {
    try {
      await appointmentService.updateAppointmentStatus(id, status);
      toast.success('Status updated!');
      loadTabData();
    } catch (error) {
      toast.error('Failed');
    }
  };

  // Clinic management
  const saveClinicInfo = async () => {
    try {
      await clinicService.updateClinicInfo(clinicForm);
      toast.success('Clinic info updated!');
      loadTabData();
    } catch (error) {
      toast.error('Failed');
    }
  };

  // User management functions
  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      const userData = {
        ...userForm,
        permissions: userForm.role === 'admin' ? null : userForm.permissions
      };

      if (editingUser) {
        await userService.updateUser(editingUser._id, userData);
        toast.success('User updated successfully!');
      } else {
        await userService.createUser(userData);
        toast.success('User created successfully!');
      }

      setShowUserModal(false);
      resetUserForm();
      loadTabData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save user');
    }
  };

  const resetUserForm = () => {
    setUserForm({
      name: '', email: '', password: '', role: 'incharge', department: '',
      permissions: {
        canManageReports: false,
        canViewAppointments: false,
        canManageAppointments: false,
        canViewStats: false
      }
    });
    setEditingUser(null);
  };

  const editUser = (user) => {
    setEditingUser(user);
    setUserForm({
      name: user.name || '',
      email: user.email || '',
      password: '', // Don't populate password
      role: user.role || 'incharge',
      department: user.department || '',
      permissions: user.permissions || {
        canManageReports: false,
        canViewAppointments: false,
        canManageAppointments: false,
        canViewStats: false
      }
    });
    setShowUserModal(true);
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await userService.deleteUser(id);
      toast.success('User deleted!');
      loadTabData();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const toggleUserPermission = (permission) => {
    setUserForm({
      ...userForm,
      permissions: {
        ...userForm.permissions,
        [permission]: !userForm.permissions[permission]
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white min-h-screen p-6 overflow-y-auto fixed">
        <div className="mb-8">
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <i className="fas fa-crown"></i>
            <span>Admin Panel</span>
          </h2>
          <p className="text-gray-400 text-sm mt-2">Full system control</p>
          <div className="mt-2 text-xs text-blue-300">
            <i className="fas fa-user-shield mr-1"></i>Super Admin Access
          </div>
        </div>

        <nav className="space-y-2">
          {[
            { id: 'dashboard', icon: 'fa-tachometer-alt', label: 'Dashboard' },
            { id: 'clinicInfo', icon: 'fa-hospital', label: 'Clinic Information' },
            { id: 'services', icon: 'fa-heart-pulse', label: 'Services' },
            { id: 'doctors', icon: 'fa-user-md', label: 'Doctors Management' },
            { id: 'reports', icon: 'fa-file-medical', label: 'Reports' },
            { id: 'stats', icon: 'fa-chart-line', label: 'Statistics' },
            { id: 'contact', icon: 'fa-address-book', label: 'Contact Info' },
            { id: 'hero', icon: 'fa-home', label: 'Hero Section' },
            { id: 'appointments', icon: 'fa-calendar-check', label: 'Appointments' },
            { id: 'subscribers', icon: 'fa-envelope', label: 'Subscribers' },
            { id: 'incharge', icon: 'fa-user-tie', label: 'In-Charge Users' },
            { id: 'preview', icon: 'fa-eye', label: 'Live Preview' , badge: 'New' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center space-x-3 ${
                activeTab === item.id ? 'bg-gray-800' : 'hover:bg-gray-800'
              }`}
            >
              <i className={`fas ${item.icon}`}></i>
              <span>{item.label}</span>
              {item.badge && <span className="bg-blue-500 text-xs px-2 py-1 rounded-full">{item.badge}</span>}
            </button>
          ))}
        </nav>

        <div className="mt-8 pt-8 border-t border-gray-800 space-y-2">
          <button onClick={() => window.open('/', '_blank')} className="w-full px-4 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 transition flex items-center space-x-3">
            <i className="fas fa-external-link-alt"></i>
            <span>View Live Site</span>
          </button>
          <button onClick={logout} className="w-full px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 transition flex items-center space-x-3">
            <i className="fas fa-sign-out-alt"></i>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64 p-8 overflow-y-auto">
        {/* Title */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">
              {activeTab === 'dashboard' && 'Admin Dashboard'}
              {activeTab === 'clinicInfo' && 'Clinic Information'}
              {activeTab === 'services' && 'Services Management'}
              {activeTab === 'doctors' && 'Doctors Management'}
              {activeTab === 'reports' && 'Medical Reports'}
              {activeTab === 'stats' && 'Statistics'}
              {activeTab === 'contact' && 'Contact Information'}
              {activeTab === 'hero' && 'Hero Section'}
              {activeTab === 'appointments' && 'Appointments'}
              {activeTab === 'subscribers' && 'Subscribers'}
              {activeTab === 'incharge' && 'In-Charge Users'}
              {activeTab === 'preview' && 'Live Preview'}
            </h1>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              <i className="fas fa-crown mr-1"></i>Super Admin
            </span>
          </div>
          <p className="text-gray-600 mt-2">Welcome, {user?.name}</p>
        </div>

        {loading && <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div></div>}

        {!loading && (
          <>
            {/* DASHBOARD */}
            {activeTab === 'dashboard' && (
              <div>
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white rounded-xl shadow p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-gray-600 text-sm">Total Doctors</p>
                        <h3 className="text-3xl font-bold mt-2">{doctors.length}</h3>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <i className="fas fa-user-md text-blue-600 text-xl"></i>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-gray-600 text-sm">Featured</p>
                        <h3 className="text-3xl font-bold mt-2">{doctors.filter(d => d.featured).length}</h3>
                      </div>
                      <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                        <i className="fas fa-star text-amber-600 text-xl"></i>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-gray-600 text-sm">Appointments</p>
                        <h3 className="text-3xl font-bold mt-2">{stats.pending || 0}</h3>
                      </div>
                      <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                        <i className="fas fa-clock text-yellow-600 text-xl"></i>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-gray-600 text-sm">Reports</p>
                        <h3 className="text-3xl font-bold mt-2">{stats.total || 0}</h3>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <i className="fas fa-file-medical text-green-600 text-xl"></i>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl shadow p-6">
                    <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <button onClick={() => setActiveTab('doctors')} className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl hover:shadow text-left">
                        <i className="fas fa-user-plus text-blue-600 text-xl mb-2"></i>
                        <h4 className="font-semibold">Add Doctor</h4>
                        <p className="text-sm text-gray-600 mt-1">Create profile</p>
                      </button>
                      <button onClick={() => setActiveTab('services')} className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl hover:shadow text-left">
                        <i className="fas fa-heart-pulse text-purple-600 text-xl mb-2"></i>
                        <h4 className="font-semibold">Services</h4>
                        <p className="text-sm text-gray-600 mt-1">Edit services</p>
                      </button>
                      <button onClick={() => setActiveTab('reports')} className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl hover:shadow text-left">
                        <i className="fas fa-file-medical text-green-600 text-xl mb-2"></i>
                        <h4 className="font-semibold">Add Report</h4>
                        <p className="text-sm text-gray-600 mt-1">Upload report</p>
                      </button>
                      <button onClick={() => setActiveTab('appointments')} className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl hover:shadow text-left">
                        <i className="fas fa-calendar text-amber-600 text-xl mb-2"></i>
                        <h4 className="font-semibold">Appointments</h4>
                        <p className="text-sm text-gray-600 mt-1">View bookings</p>
                      </button>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow p-6">
                    <h3 className="text-xl font-semibold mb-4">Recent Doctors</h3>
                    <div className="space-y-3">
                      {doctors.slice(0, 5).map(d => (
                        <div key={d._id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded">
                          <div className="text-3xl">{d.image}</div>
                          <div className="flex-1">
                            <p className="font-semibold">{d.name}</p>
                            <p className="text-sm text-gray-600">{d.specialty}</p>
                          </div>
                          {d.featured && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">Featured</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* DOCTORS MANAGEMENT - Full CRUD */}
            {activeTab === 'doctors' && (
              <div>
                <div className="mb-6 flex justify-between items-center">
                  <div>
                    <p className="text-gray-600">{doctors.length} doctors in the system</p>
                  </div>
                  <button onClick={() => { resetDoctorForm(); setShowDoctorModal(true); }} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center space-x-2">
                    <i className="fas fa-plus"></i>
                    <span>Add New Doctor</span>
                  </button>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {doctors.map(doctor => (
                    <div key={doctor._id} className="bg-white rounded-xl shadow p-6 border-l-4 border-blue-500 relative">
                      {doctor.featured && <div className="absolute top-2 right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs px-2 py-1 rounded-full">Featured</div>}
                      <div className="flex items-start space-x-4 mb-4">
                        {getDoctorImageUrl(doctor).includes('/') ? (
                          <img 
                            src={getDoctorImageUrl(doctor)} 
                            alt={doctor.name}
                            className="w-16 h-16 object-cover rounded-xl border-2 border-gray-200"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              const emoji = document.createElement('div');
                              emoji.className = 'text-5xl';
                              emoji.textContent = doctor.image || '👨‍⚕️';
                              e.target.parentElement.appendChild(emoji);
                            }}
                          />
                        ) : (
                          <div className="text-5xl">{getDoctorImageUrl(doctor)}</div>
                        )}
                        <div className="flex-1">
                          <h3 className="font-bold text-lg">{doctor.name}</h3>
                          <p className="text-blue-600 font-semibold">{doctor.specialty}</p>
                          <p className="text-sm text-gray-600">{doctor.department}</p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm mb-4">
                        <p><i className="fas fa-graduation-cap mr-2 text-gray-400"></i>{doctor.qualifications}</p>
                        <p><i className="fas fa-award mr-2 text-gray-400"></i>{doctor.experience}</p>
                        <p><i className="fas fa-phone mr-2 text-gray-400"></i>{doctor.contact}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button onClick={() => editDoctor(doctor)} className="flex-1 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition">
                          <i className="fas fa-edit mr-1"></i>Edit
                        </button>
                        <button onClick={() => deleteDoctor(doctor._id)} className="flex-1 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition">
                          <i className="fas fa-trash mr-1"></i>Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Doctor Modal */}
                {showDoctorModal && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-bold">{editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}</h3>
                        <button onClick={() => setShowDoctorModal(false)} className="text-gray-500 hover:text-gray-700">
                          <i className="fas fa-times text-2xl"></i>
                        </button>
                      </div>
                      <form onSubmit={handleSaveDoctor} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-semibold mb-2">Full Name *</label>
                            <input type="text" required value={doctorForm.name} onChange={e => setDoctorForm({...doctorForm, name: e.target.value})} className="w-full px-4 py-3 rounded-lg border-2 focus:border-blue-500 focus:outline-none" />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold mb-2">Specialty *</label>
                            <input type="text" required value={doctorForm.specialty} onChange={e => setDoctorForm({...doctorForm, specialty: e.target.value})} className="w-full px-4 py-3 rounded-lg border-2 focus:border-blue-500 focus:outline-none" />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold mb-2">Department *</label>
                            <select required value={doctorForm.department} onChange={e => setDoctorForm({...doctorForm, department: e.target.value})} className="w-full px-4 py-3 rounded-lg border-2 focus:border-blue-500 focus:outline-none">
                              <option value="">Select Department</option>
                              <option value="Cardiology">Cardiology</option>
                              <option value="Radiology">Radiology</option>
                              <option value="Pathology">Pathology</option>
                              <option value="Neurology">Neurology</option>
                              <option value="Orthopedics">Orthopedics</option>
                              <option value="Ophthalmology">Ophthalmology</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold mb-2">Designation</label>
                            <input type="text" value={doctorForm.designation} onChange={e => setDoctorForm({...doctorForm, designation: e.target.value})} className="w-full px-4 py-3 rounded-lg border-2 focus:border-blue-500 focus:outline-none" placeholder="Senior Consultant" />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold mb-2">Institute</label>
                            <input type="text" value={doctorForm.institute} onChange={e => setDoctorForm({...doctorForm, institute: e.target.value})} className="w-full px-4 py-3 rounded-lg border-2 focus:border-blue-500 focus:outline-none" placeholder="Harvard Medical School" />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold mb-2">Qualifications *</label>
                            <input type="text" required value={doctorForm.qualifications} onChange={e => setDoctorForm({...doctorForm, qualifications: e.target.value})} className="w-full px-4 py-3 rounded-lg border-2 focus:border-blue-500 focus:outline-none" placeholder="MBBS, MD" />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold mb-2">Experience *</label>
                            <input type="text" required value={doctorForm.experience} onChange={e => setDoctorForm({...doctorForm, experience: e.target.value})} className="w-full px-4 py-3 rounded-lg border-2 focus:border-blue-500 focus:outline-none" placeholder="10 years" />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold mb-2">Available Days *</label>
                            <input type="text" required value={doctorForm.available} onChange={e => setDoctorForm({...doctorForm, available: e.target.value})} className="w-full px-4 py-3 rounded-lg border-2 focus:border-blue-500 focus:outline-none" placeholder="Mon, Wed, Fri" />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold mb-2">Timing *</label>
                            <input type="text" required value={doctorForm.time} onChange={e => setDoctorForm({...doctorForm, time: e.target.value})} className="w-full px-4 py-3 rounded-lg border-2 focus:border-blue-500 focus:outline-none" placeholder="9 AM - 2 PM" />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold mb-2">Contact *</label>
                            <input type="text" required value={doctorForm.contact} onChange={e => setDoctorForm({...doctorForm, contact: e.target.value})} className="w-full px-4 py-3 rounded-lg border-2 focus:border-blue-500 focus:outline-none" placeholder="+1 234 567 8900" />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold mb-2">Email *</label>
                            <input type="email" required value={doctorForm.email} onChange={e => setDoctorForm({...doctorForm, email: e.target.value})} className="w-full px-4 py-3 rounded-lg border-2 focus:border-blue-500 focus:outline-none" />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold mb-2">Consultation Fee</label>
                            <input type="text" value={doctorForm.consultationFee} onChange={e => setDoctorForm({...doctorForm, consultationFee: e.target.value})} className="w-full px-4 py-3 rounded-lg border-2 focus:border-blue-500 focus:outline-none" placeholder="$150" />
                          </div>
                        </div>

                        {/* Image Upload Section */}
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 bg-gray-50">
                          <label className="block text-sm font-semibold mb-4">
                            <i className="fas fa-camera mr-2"></i>Doctor Profile Image
                          </label>
                          <div className="flex items-start space-x-6">
                            <div className="flex-shrink-0">
                              {imagePreview ? (
                                <img
                                  src={imagePreview}
                                  alt="Preview"
                                  className="w-32 h-32 object-cover rounded-xl border-4 border-blue-500 shadow-lg"
                                />
                              ) : editingDoctor?.imageUrl ? (
                                <img
                                  src={getDoctorImageUrl(editingDoctor)}
                                  alt="Current"
                                  className="w-32 h-32 object-cover rounded-xl border-4 border-gray-300 shadow-lg"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    const emoji = document.createElement('div');
                                    emoji.className = 'w-32 h-32 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center text-6xl shadow-lg';
                                    emoji.textContent = editingDoctor.image || '👨‍⚕️';
                                    e.target.parentElement.appendChild(emoji);
                                  }}
                                />
                              ) : (
                                <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center text-6xl shadow-lg border-4 border-gray-300">
                                  {doctorForm.image}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 space-y-4">
                              <div>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleImageSelect}
                                  className="block w-full text-sm text-gray-500
                                    file:mr-4 file:py-3 file:px-6
                                    file:rounded-lg file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-blue-600 file:text-white
                                    hover:file:bg-blue-700
                                    file:cursor-pointer file:transition-all
                                    cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-2"
                                />
                                <p className="text-xs text-gray-500 mt-2 flex items-center">
                                  <i className="fas fa-info-circle mr-1"></i>
                                  Supported formats: JPEG, PNG, GIF, WEBP (Max 5MB)
                                </p>
                              </div>
                              {(imagePreview || editingDoctor?.imageUrl) && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedImage(null);
                                    setImagePreview(null);
                                  }}
                                  className="text-sm text-red-600 hover:text-red-800 font-semibold flex items-center"
                                >
                                  <i className="fas fa-times-circle mr-1"></i>Remove selected image
                                </button>
                              )}
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <p className="text-xs text-blue-800">
                                  <i className="fas fa-lightbulb mr-1"></i>
                                  <strong>Or use emoji:</strong> Keep the default emoji if you prefer not to upload an image
                                </p>
                                <input 
                                  type="text" 
                                  value={doctorForm.image} 
                                  onChange={e => setDoctorForm({...doctorForm, image: e.target.value})} 
                                  className="mt-2 w-24 px-3 py-2 rounded-lg border-2 focus:border-blue-500 focus:outline-none text-2xl text-center"
                                  placeholder="👨‍⚕️"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-semibold mb-2">Languages (comma-separated)</label>
                            <input type="text" value={doctorForm.languages} onChange={e => setDoctorForm({...doctorForm, languages: e.target.value})} className="w-full px-4 py-3 rounded-lg border-2 focus:border-blue-500 focus:outline-none" placeholder="English, Spanish" />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold mb-2">Rating</label>
                            <input type="number" step="0.1" min="1" max="5" value={doctorForm.rating} onChange={e => setDoctorForm({...doctorForm, rating: parseFloat(e.target.value)})} className="w-full px-4 py-3 rounded-lg border-2 focus:border-blue-500 focus:outline-none" />
                          </div>
                          <div className="flex items-center space-x-3 pt-4">
                            <input type="checkbox" id="featured" checked={doctorForm.featured} onChange={e => setDoctorForm({...doctorForm, featured: e.target.checked})} className="w-5 h-5" />
                            <label htmlFor="featured" className="font-semibold">Featured Doctor (Show on homepage)</label>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-2">Detailed Experience</label>
                          <textarea value={doctorForm.detailedExperience} onChange={e => setDoctorForm({...doctorForm, detailedExperience: e.target.value})} rows="4" className="w-full px-4 py-3 rounded-lg border-2 focus:border-blue-500 focus:outline-none" placeholder="Detailed work experience..."></textarea>
                        </div>
                        <div className="flex space-x-4">
                          <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold">
                            <i className="fas fa-save mr-2"></i>{editingDoctor ? 'Update Doctor' : 'Add Doctor'}
                          </button>
                          <button type="button" onClick={() => setShowDoctorModal(false)} className="px-6 py-3 bg-gray-300 rounded-lg hover:bg-gray-400 transition">Cancel</button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Continue in next message due to size... */}

            {/* SERVICES */}
            {activeTab === 'services' && (
              <div>
                <div className="bg-white rounded-xl shadow p-6 mb-6">
                  <h3 className="text-xl font-semibold mb-4">Add New Service</h3>
                  <form onSubmit={saveService} className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2">Name *</label>
                        <input type="text" required value={serviceForm.name} onChange={e => setServiceForm({...serviceForm, name: e.target.value})} className="w-full px-4 py-3 rounded-lg border-2 focus:border-blue-500 focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">Icon Class *</label>
                        <input type="text" required value={serviceForm.icon} onChange={e => setServiceForm({...serviceForm, icon: e.target.value})} className="w-full px-4 py-3 rounded-lg border-2 focus:border-blue-500 focus:outline-none" placeholder="fa-heart-pulse" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">Color Classes</label>
                        <input type="text" value={serviceForm.color} onChange={e => setServiceForm({...serviceForm, color: e.target.value})} className="w-full px-4 py-3 rounded-lg border-2 focus:border-blue-500 focus:outline-none" placeholder="from-blue-500 to-cyan-500" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Description *</label>
                      <textarea required value={serviceForm.desc} onChange={e => setServiceForm({...serviceForm, desc: e.target.value})} rows="3" className="w-full px-4 py-3 rounded-lg border-2 focus:border-blue-500 focus:outline-none"></textarea>
                    </div>
                    <button type="submit" className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"><i className="fas fa-plus mr-2"></i>Add Service</button>
                  </form>
                </div>

                <div className="bg-white rounded-xl shadow p-6">
                  <h3 className="text-xl font-semibold mb-4">Existing Services ({services.length})</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {services.map(service => (
                      <div key={service._id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center space-x-3">
                            <div className={`w-12 h-12 bg-gradient-to-r ${service.color} rounded-lg flex items-center justify-center`}>
                              <i className={`fas ${service.icon} text-white`}></i>
                            </div>
                            <div>
                              <h4 className="font-semibold">{service.name}</h4>
                              <p className="text-sm text-gray-600">{service.desc}</p>
                            </div>
                          </div>
                          <button onClick={() => deleteService(service._id)} className="text-red-600 hover:text-red-800">
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* REPORTS */}
            {activeTab === 'reports' && (
              <div>
                <div className="bg-white rounded-xl shadow p-6 mb-6">
                  <h3 className="text-xl font-semibold mb-4">Add New Report</h3>
                  <form onSubmit={saveReport} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2">Patient ID *</label>
                        <input type="text" required value={reportForm.patientId} onChange={e => setReportForm({...reportForm, patientId: e.target.value})} className="w-full px-4 py-3 rounded-lg border-2 focus:border-blue-500 focus:outline-none" placeholder="P12345" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">Patient Name *</label>
                        <input type="text" required value={reportForm.patientName} onChange={e => setReportForm({...reportForm, patientName: e.target.value})} className="w-full px-4 py-3 rounded-lg border-2 focus:border-blue-500 focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">Report Type *</label>
                        <input type="text" required value={reportForm.reportType} onChange={e => setReportForm({...reportForm, reportType: e.target.value})} className="w-full px-4 py-3 rounded-lg border-2 focus:border-blue-500 focus:outline-none" placeholder="Blood Test" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">Test Date *</label>
                        <input type="date" required value={reportForm.testDate} onChange={e => setReportForm({...reportForm, testDate: e.target.value})} className="w-full px-4 py-3 rounded-lg border-2 focus:border-blue-500 focus:outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Notes/Findings</label>
                      <textarea value={reportForm.notes} onChange={e => setReportForm({...reportForm, notes: e.target.value})} rows="3" className="w-full px-4 py-3 rounded-lg border-2 focus:border-blue-500 focus:outline-none"></textarea>
                    </div>
                    <button type="submit" className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"><i className="fas fa-plus mr-2"></i>Add Report</button>
                  </form>
                </div>

                <div className="bg-white rounded-xl shadow p-6">
                  <h3 className="text-xl font-semibold mb-4">All Reports ({reports.length})</h3>
                  <div className="space-y-3">
                    {reports.map(report => (
                      <div key={report._id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <p className="font-semibold">{report.patientName} ({report.patientId})</p>
                            <p className="text-sm text-gray-600">{report.reportType} - {new Date(report.testDate).toLocaleDateString()}</p>
                            {report.notes && <p className="text-sm text-gray-500 mt-1">{report.notes}</p>}
                            {report.pdfUrl && (
                              <p className="text-sm text-green-600 mt-2 flex items-center">
                                <i className="fas fa-file-pdf mr-1"></i>PDF Report Available
                              </p>
                            )}
                          </div>
                          <select value={report.status} onChange={e => updateReportStatus(report._id, e.target.value)} className="px-3 py-1 rounded border text-sm">
                            <option value="pending">Pending</option>
                            <option value="ready">Ready</option>
                            <option value="delivered">Delivered</option>
                          </select>
                        </div>
                        <div className="flex space-x-2 pt-3 border-t">
                          <button
                            onClick={async () => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = 'application/pdf';
                              input.onchange = async (e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  if (file.size > 10 * 1024 * 1024) {
                                    toast.error('File too large. Max 10MB');
                                    return;
                                  }
                                  try {
                                    setLoading(true);
                                    await reportService.uploadReportPdf(report._id, file);
                                    toast.success('PDF uploaded successfully!');
                                    loadTabData();
                                  } catch (error) {
                                    toast.error('Upload failed: ' + (error.response?.data?.message || error.message));
                                  } finally {
                                    setLoading(false);
                                  }
                                }
                              };
                              input.click();
                            }}
                            className="flex-1 px-3 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg text-sm hover:from-green-700 hover:to-emerald-700 transition font-semibold"
                          >
                            <i className="fas fa-upload mr-1"></i>
                            {report.pdfUrl ? 'Update PDF' : 'Upload PDF'}
                          </button>
                          {report.pdfUrl && (
                            <a
                              href={reportService.downloadReportPdf(report.pdfUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg text-sm hover:from-blue-700 hover:to-cyan-700 transition text-center font-semibold"
                            >
                              <i className="fas fa-download mr-1"></i>View PDF
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* APPOINTMENTS */}
            {activeTab === 'appointments' && (
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-xl font-semibold mb-4">All Appointments ({appointments.length})</h3>
                <div className="space-y-3">
                  {appointments.map(appt => (
                    <div key={appt._id} className="border rounded-lg p-4 flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{appt.patientName}</p>
                        <p className="text-sm text-gray-600">{appt.service} - {new Date(appt.date).toLocaleDateString()} at {appt.time}</p>
                        <p className="text-sm text-gray-500">{appt.email} | {appt.phone}</p>
                        {appt.doctorName && <p className="text-sm text-blue-600 mt-1">Dr. {appt.doctorName}</p>}
                      </div>
                      <select value={appt.status} onChange={e => updateAppointmentStatus(appt._id, e.target.value)} className="px-3 py-1 rounded border text-sm">
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CLINIC INFO */}
            {activeTab === 'clinicInfo' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow p-6">
                  <h3 className="text-xl font-semibold mb-4">Basic Information</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Clinic Name</label>
                      <input type="text" value={clinicForm.clinicName} onChange={e => setClinicForm({...clinicForm, clinicName: e.target.value})} className="w-full px-4 py-3 rounded-lg border-2 focus:border-blue-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Tagline</label>
                      <input type="text" value={clinicForm.tagline} onChange={e => setClinicForm({...clinicForm, tagline: e.target.value})} className="w-full px-4 py-3 rounded-lg border-2 focus:border-blue-500 focus:outline-none" />
                    </div>
                  </div>
                  <button onClick={saveClinicInfo} className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"><i className="fas fa-save mr-2"></i>Save Changes</button>
                </div>

                {/* Logo Upload Section */}
                <div className="bg-white rounded-xl shadow p-6">
                  <h3 className="text-xl font-semibold mb-4">
                    <i className="fas fa-image mr-2 text-blue-600"></i>Clinic Logo
                  </h3>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 bg-gradient-to-br from-gray-50 to-blue-50">
                    <div className="flex items-start space-x-6">
                      <div className="flex-shrink-0">
                        {clinic.logoUrl ? (
                          <img
                            src={clinicService.getLogoUrl(clinic.logoUrl)}
                            alt="Logo"
                            className="w-32 h-32 object-contain rounded-xl border-4 border-blue-500 shadow-lg bg-white p-2"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              const placeholder = document.createElement('div');
                              placeholder.className = 'w-32 h-32 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center shadow-lg';
                              placeholder.innerHTML = '<i class="fas fa-heart-pulse text-blue-600 text-5xl"></i>';
                              e.target.parentElement.appendChild(placeholder);
                            }}
                          />
                        ) : (
                          <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center shadow-lg">
                            <i className="fas fa-heart-pulse text-blue-600 text-5xl"></i>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-semibold mb-3 text-gray-700">
                          Upload New Logo
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files[0];
                            if (file) {
                              try {
                                setLoading(true);
                                await clinicService.uploadLogo(file);
                                toast.success('Logo uploaded successfully!');
                                loadTabData();
                              } catch (error) {
                                toast.error('Upload failed: ' + (error.response?.data?.message || error.message));
                              } finally {
                                setLoading(false);
                              }
                            }
                          }}
                          className="block w-full text-sm text-gray-500
                            file:mr-4 file:py-3 file:px-6
                            file:rounded-lg file:border-0
                            file:text-sm file:font-semibold
                            file:bg-gradient-to-r file:from-blue-600 file:to-cyan-600 file:text-white
                            hover:file:from-blue-700 hover:file:to-cyan-700
                            file:cursor-pointer file:transition-all
                            cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-3
                            hover:border-blue-400 transition-all"
                        />
                        <p className="text-xs text-gray-500 mt-3 flex items-center">
                          <i className="fas fa-info-circle mr-1 text-blue-500"></i>
                          Supported: PNG, JPG, SVG, GIF, WEBP (Max 5MB) - Logo will appear in navigation
                        </p>
                        {clinic.logoUrl && (
                          <button
                            onClick={async () => {
                              if (window.confirm('Remove current logo and revert to default icon?')) {
                                try {
                                  setLoading(true);
                                  await clinicService.updateClinicInfo({ ...clinic, logoUrl: null });
                                  toast.success('Logo removed');
                                  loadTabData();
                                } catch (error) {
                                  toast.error('Failed to remove logo');
                                } finally {
                                  setLoading(false);
                                }
                              }
                            }}
                            className="mt-3 text-sm text-red-600 hover:text-red-800 font-semibold flex items-center"
                          >
                            <i className="fas fa-times-circle mr-1"></i>Remove Logo
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CONTACT INFO */}
            {activeTab === 'contact' && (
              <div className="bg-white rounded-xl shadow p-6">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Address</label>
                    <textarea value={clinicForm.contact?.address || ''} onChange={e => setClinicForm({...clinicForm, contact: {...clinicForm.contact, address: e.target.value}})} rows="3" className="w-full px-4 py-3 rounded-lg border-2 focus:border-blue-500 focus:outline-none"></textarea>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Phone</label>
                      <input type="text" value={clinicForm.contact?.phone || ''} onChange={e => setClinicForm({...clinicForm, contact: {...clinicForm.contact, phone: e.target.value}})} className="w-full px-4 py-3 rounded-lg border-2 focus:border-blue-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Email</label>
                      <input type="email" value={clinicForm.contact?.email || ''} onChange={e => setClinicForm({...clinicForm, contact: {...clinicForm.contact, email: e.target.value}})} className="w-full px-4 py-3 rounded-lg border-2 focus:border-blue-500 focus:outline-none" />
                    </div>
                  </div>
                </div>
                <button onClick={saveClinicInfo} className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"><i className="fas fa-save mr-2"></i>Save Changes</button>
              </div>
            )}

            {/* HERO SECTION */}
            {activeTab === 'hero' && (
              <div className="bg-white rounded-xl shadow p-6">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Hero Tagline</label>
                    <input type="text" value={clinicForm.heroText?.tagline || ''} onChange={e => setClinicForm({...clinicForm, heroText: {...clinicForm.heroText, tagline: e.target.value}})} className="w-full px-4 py-3 rounded-lg border-2 focus:border-blue-500 focus:outline-none" placeholder="🏥 Trusted Healthcare Partner" />
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Title Part 1</label>
                      <input type="text" value={clinicForm.heroText?.title1 || ''} onChange={e => setClinicForm({...clinicForm, heroText: {...clinicForm.heroText, title1: e.target.value}})} className="w-full px-4 py-3 rounded-lg border-2 focus:border-blue-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Title Part 2</label>
                      <input type="text" value={clinicForm.heroText?.title2 || ''} onChange={e => setClinicForm({...clinicForm, heroText: {...clinicForm.heroText, title2: e.target.value}})} className="w-full px-4 py-3 rounded-lg border-2 focus:border-blue-500 focus:outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Description</label>
                    <textarea value={clinicForm.heroText?.description || ''} onChange={e => setClinicForm({...clinicForm, heroText: {...clinicForm.heroText, description: e.target.value}})} rows="3" className="w-full px-4 py-3 rounded-lg border-2 focus:border-blue-500 focus:outline-none"></textarea>
                  </div>
                </div>
                <button onClick={saveClinicInfo} className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"><i className="fas fa-save mr-2"></i>Save Changes</button>
              </div>
            )}

            {/* STATISTICS */}
            {activeTab === 'stats' && (
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-xl font-semibold mb-6">Homepage Statistics</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {clinicForm.stats?.map((stat, idx) => (
                    <div key={idx} className="border rounded-lg p-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-semibold mb-2">Icon</label>
                          <input type="text" value={stat.icon} onChange={e => {
                            const newStats = [...clinicForm.stats];
                            newStats[idx].icon = e.target.value;
                            setClinicForm({...clinicForm, stats: newStats});
                          }} className="w-full px-3 py-2 rounded border" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-2">Number</label>
                          <input type="text" value={stat.number} onChange={e => {
                            const newStats = [...clinicForm.stats];
                            newStats[idx].number = e.target.value;
                            setClinicForm({...clinicForm, stats: newStats});
                          }} className="w-full px-3 py-2 rounded border" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-2">Label</label>
                          <input type="text" value={stat.label} onChange={e => {
                            const newStats = [...clinicForm.stats];
                            newStats[idx].label = e.target.value;
                            setClinicForm({...clinicForm, stats: newStats});
                          }} className="w-full px-3 py-2 rounded border" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={saveClinicInfo} className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"><i className="fas fa-save mr-2"></i>Save Changes</button>
              </div>
            )}

            {/* SUBSCRIBERS */}
            {activeTab === 'subscribers' && (
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-xl font-semibold mb-4">Newsletter Subscribers ({subscribers.length})</h3>
                <div className="space-y-2">
                  {subscribers.map(sub => (
                    <div key={sub._id} className="border rounded-lg p-3 flex justify-between items-center">
                      <p>{sub.email}</p>
                      <span className="text-sm text-gray-500">{new Date(sub.createdAt).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* IN-CHARGE USERS */}
            {activeTab === 'incharge' && (
              <div>
                <div className="bg-white rounded-xl shadow p-6 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">System Users Management</h3>
                    <button
                      onClick={() => {
                        resetUserForm();
                        setShowUserModal(true);
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition font-semibold"
                    >
                      <i className="fas fa-user-plus mr-2"></i>Create New User
                    </button>
                  </div>
                  <p className="text-gray-600 text-sm">Manage admin and in-charge users. Assign roles and permissions.</p>
                </div>

                <div className="bg-white rounded-xl shadow p-6">
                  <h3 className="text-xl font-semibold mb-4">All Users ({users.length})</h3>
                  <div className="space-y-3">
                    {users.map(u => (
                      <div key={u._id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <p className="font-semibold text-lg">{u.name}</p>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 
                                u.role === 'incharge' ? 'bg-blue-100 text-blue-700' : 
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {u.role === 'admin' ? '👑 Admin' : u.role === 'incharge' ? '👨‍💼 In-charge' : u.role}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-xs ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {u.isActive ? '✓ Active' : '✗ Inactive'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">
                              <i className="fas fa-envelope mr-2"></i>{u.email}
                            </p>
                            {u.department && (
                              <p className="text-sm text-gray-600 mb-2">
                                <i className="fas fa-building mr-2"></i>Department: {u.department}
                              </p>
                            )}
                            {u.role === 'incharge' && u.permissions && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {u.permissions.canManageReports && (
                                  <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                                    <i className="fas fa-file-medical mr-1"></i>Manage Reports
                                  </span>
                                )}
                                {u.permissions.canViewAppointments && (
                                  <span className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs">
                                    <i className="fas fa-calendar-check mr-1"></i>View Appointments
                                  </span>
                                )}
                                {u.permissions.canManageAppointments && (
                                  <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs">
                                    <i className="fas fa-calendar-alt mr-1"></i>Manage Appointments
                                  </span>
                                )}
                                {u.permissions.canViewStats && (
                                  <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded text-xs">
                                    <i className="fas fa-chart-line mr-1"></i>View Stats
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => editUser(u)}
                              className="px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition text-sm font-semibold"
                            >
                              <i className="fas fa-edit mr-1"></i>Edit
                            </button>
                            <button
                              onClick={() => deleteUser(u._id)}
                              className="px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition text-sm font-semibold"
                            >
                              <i className="fas fa-trash mr-1"></i>Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {users.length === 0 && (
                      <p className="text-center text-gray-500 py-8">No users found</p>
                    )}
                  </div>
                </div>

                {/* User Creation/Edit Modal */}
                {showUserModal && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-bold">
                          {editingUser ? 'Edit User' : 'Create New User'}
                        </h3>
                        <button
                          onClick={() => {
                            setShowUserModal(false);
                            resetUserForm();
                          }}
                          className="text-gray-500 hover:text-gray-700 text-2xl"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>

                      <form onSubmit={handleSaveUser} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-semibold mb-2">Full Name *</label>
                            <input
                              type="text"
                              required
                              value={userForm.name}
                              onChange={e => setUserForm({...userForm, name: e.target.value})}
                              className="w-full px-4 py-3 rounded-lg border-2 focus:border-blue-500 focus:outline-none"
                              placeholder="John Doe"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold mb-2">Email *</label>
                            <input
                              type="email"
                              required
                              value={userForm.email}
                              onChange={e => setUserForm({...userForm, email: e.target.value})}
                              className="w-full px-4 py-3 rounded-lg border-2 focus:border-blue-500 focus:outline-none"
                              placeholder="john@example.com"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold mb-2">
                              Password {editingUser ? '(leave blank to keep current)' : '*'}
                            </label>
                            <input
                              type="password"
                              required={!editingUser}
                              value={userForm.password}
                              onChange={e => setUserForm({...userForm, password: e.target.value})}
                              className="w-full px-4 py-3 rounded-lg border-2 focus:border-blue-500 focus:outline-none"
                              placeholder="Min 6 characters"
                              minLength={6}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold mb-2">Role *</label>
                            <select
                              value={userForm.role}
                              onChange={e => setUserForm({...userForm, role: e.target.value})}
                              className="w-full px-4 py-3 rounded-lg border-2 focus:border-blue-500 focus:outline-none"
                            >
                              <option value="admin">👑 Admin (Full Access)</option>
                              <option value="incharge">👨‍💼 In-charge (Limited Access)</option>
                            </select>
                          </div>
                          {userForm.role === 'incharge' && (
                            <div className="md:col-span-2">
                              <label className="block text-sm font-semibold mb-2">Department</label>
                              <input
                                type="text"
                                value={userForm.department}
                                onChange={e => setUserForm({...userForm, department: e.target.value})}
                                className="w-full px-4 py-3 rounded-lg border-2 focus:border-blue-500 focus:outline-none"
                                placeholder="e.g., Radiology, Pathology"
                              />
                            </div>
                          )}
                        </div>

                        {userForm.role === 'incharge' && (
                          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 bg-gray-50">
                            <h4 className="text-lg font-semibold mb-4">
                              <i className="fas fa-key mr-2 text-blue-600"></i>Permissions
                            </h4>
                            <p className="text-sm text-gray-600 mb-4">Select what this in-charge user can access:</p>
                            <div className="space-y-3">
                              <label className="flex items-center space-x-3 p-3 bg-white rounded-lg hover:bg-blue-50 cursor-pointer transition">
                                <input
                                  type="checkbox"
                                  checked={userForm.permissions.canManageReports}
                                  onChange={() => toggleUserPermission('canManageReports')}
                                  className="w-5 h-5"
                                />
                                <div>
                                  <p className="font-semibold">Manage Reports</p>
                                  <p className="text-xs text-gray-600">Create, edit, and update report status</p>
                                </div>
                              </label>
                              <label className="flex items-center space-x-3 p-3 bg-white rounded-lg hover:bg-blue-50 cursor-pointer transition">
                                <input
                                  type="checkbox"
                                  checked={userForm.permissions.canViewAppointments}
                                  onChange={() => toggleUserPermission('canViewAppointments')}
                                  className="w-5 h-5"
                                />
                                <div>
                                  <p className="font-semibold">View Appointments</p>
                                  <p className="text-xs text-gray-600">See all patient appointments</p>
                                </div>
                              </label>
                              <label className="flex items-center space-x-3 p-3 bg-white rounded-lg hover:bg-blue-50 cursor-pointer transition">
                                <input
                                  type="checkbox"
                                  checked={userForm.permissions.canManageAppointments}
                                  onChange={() => toggleUserPermission('canManageAppointments')}
                                  className="w-5 h-5"
                                />
                                <div>
                                  <p className="font-semibold">Manage Appointments</p>
                                  <p className="text-xs text-gray-600">Update appointment status and details</p>
                                </div>
                              </label>
                              <label className="flex items-center space-x-3 p-3 bg-white rounded-lg hover:bg-blue-50 cursor-pointer transition">
                                <input
                                  type="checkbox"
                                  checked={userForm.permissions.canViewStats}
                                  onChange={() => toggleUserPermission('canViewStats')}
                                  className="w-5 h-5"
                                />
                                <div>
                                  <p className="font-semibold">View Statistics</p>
                                  <p className="text-xs text-gray-600">Access dashboard statistics and reports</p>
                                </div>
                              </label>
                            </div>
                          </div>
                        )}

                        <div className="flex space-x-4">
                          <button
                            type="submit"
                            className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition"
                          >
                            <i className="fas fa-save mr-2"></i>
                            {editingUser ? 'Update User' : 'Create User'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowUserModal(false);
                              resetUserForm();
                            }}
                            className="px-6 py-3 bg-gray-300 rounded-lg hover:bg-gray-400 transition"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* LIVE PREVIEW */}
            {activeTab === 'preview' && (
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-xl font-semibold mb-4">Live Preview</h3>
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <i className="fas fa-eye text-gray-400 text-5xl mb-4"></i>
                    <p className="text-gray-600 mb-4">Preview your live website</p>
                    <button onClick={() => window.open('/', '_blank')} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                      <i className="fas fa-external-link-alt mr-2"></i>Open Live Site
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
