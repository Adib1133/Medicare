import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { doctorService, appointmentService, clinicService } from '../services';

const DoctorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [clinic, setClinic] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Helper function to get doctor image URL
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

  const [appointmentForm, setAppointmentForm] = useState({
    patientName: '', email: '', phone: '', date: '', time: '', service: '', message: ''
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [doctorData, clinicData] = await Promise.all([
        doctorService.getDoctorById(id),
        clinicService.getClinicInfo()
      ]);
      setDoctor(doctorData.data);
      setClinic(clinicData.data || {});
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load doctor details');
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    try {
      await appointmentService.createAppointment({
        ...appointmentForm,
        doctorName: doctor.name,
        service: doctor.specialty
      });
      toast.success('Appointment booked successfully! We will contact you shortly.');
      setShowModal(false);
      setAppointmentForm({ patientName: '', email: '', phone: '', date: '', time: '', service: '', message: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to book appointment');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="text-gray-600 font-medium">Loading doctor details...</p>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto">
              <div className="text-6xl">🩺</div>
              <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full animate-pulse-ring"></div>
            </div>
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Doctor Not Found</h2>
            <p className="text-gray-600 max-w-md mx-auto">The doctor you're looking for doesn't exist or has been removed</p>
          </div>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              <i className="fas fa-arrow-left mr-2"></i>Go Back
            </button>
            <Link
              to="/doctors"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              <i className="fas fa-user-md mr-2"></i>View All Doctors
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const languages = Array.isArray(doctor.languages) ? doctor.languages : ['English'];
  const specialties = doctor.specialty?.split(',').map(s => s.trim()) || [doctor.specialty];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-300">
                  <i className="fas fa-heartbeat text-white text-xl"></i>
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent">
                  {clinic.clinicName || 'MediCare Plus'}
                </h1>
                <p className="text-xs text-gray-600 font-medium">{clinic.tagline || 'Excellence in Healthcare'}</p>
              </div>
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300 group">
                Home
                <span className="block h-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 w-0 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link to="/doctors" className="text-blue-600 font-medium group">
                All Doctors
                <span className="block h-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 w-full"></span>
              </Link>
              <a href="/#appointment" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300 group">
                Appointment
                <span className="block h-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 w-0 group-hover:w-full transition-all duration-300"></span>
              </a>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="relative px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 group overflow-hidden"
            >
              <span className="relative z-10 flex items-center space-x-2">
                <i className="far fa-calendar-check"></i>
                <span>Book Now</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb and Back */}
          <div className="mb-8">
            <nav className="flex items-center space-x-2 text-sm">
              <Link to="/" className="text-gray-500 hover:text-blue-600 transition-colors duration-300">
                Home
              </Link>
              <i className="fas fa-chevron-right text-gray-400 text-xs"></i>
              <Link to="/doctors" className="text-gray-500 hover:text-blue-600 transition-colors duration-300">
                Doctors
              </Link>
              <i className="fas fa-chevron-right text-gray-400 text-xs"></i>
              <span className="text-blue-600 font-medium">{doctor.name.split(' ')[0]}</span>
            </nav>
          </div>

          {/* Doctor Profile Card */}
          <div className="bg-gradient-to-br from-white to-blue-50/50 rounded-3xl shadow-2xl border border-white/50 overflow-hidden mb-8 animate-fade-in-up">
            {/* Header Gradient */}
            <div className="relative h-48 bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500">
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent"></div>
            </div>

            {/* Profile Content */}
            <div className="relative px-8 pb-8 -mt-16">
              {/* Profile Header */}
              <div className="flex flex-col lg:flex-row items-center lg:items-end gap-6 mb-8">
                <div className="relative group">
                  <div className="w-40 h-40 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full flex items-center justify-center text-6xl shadow-2xl border-4 border-white overflow-hidden">
                    {getDoctorImageUrl(doctor).includes('/') ? (
                      <img 
                        src={getDoctorImageUrl(doctor)} 
                        alt={doctor.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const emoji = document.createElement('div');
                          emoji.className = 'w-full h-full flex items-center justify-center text-6xl';
                          emoji.textContent = doctor.image || '👨‍⚕️';
                          e.target.parentElement.appendChild(emoji);
                        }}
                      />
                    ) : (
                      getDoctorImageUrl(doctor)
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                    <i className="fas fa-check text-white"></i>
                  </div>
                  <div className="absolute -top-2 -left-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center border-2 border-white">
                    <i className="fas fa-star text-white text-xs"></i>
                  </div>
                </div>

                <div className="text-center lg:text-left flex-1">
                  <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-full mb-4">
                    <i className="fas fa-star text-yellow-300 mr-2"></i>
                    <span className="font-bold">{doctor.rating || 4.5}/5.0 Rating</span>
                  </div>
                  <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-2">{doctor.name}</h1>
                  <p className="text-xl text-blue-600 font-semibold mb-1">{doctor.designation || 'Consultant'}</p>
                  <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                    {specialties.map((spec, index) => (
                      <span key={index} className="px-3 py-1 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 rounded-full text-sm font-medium">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-4 text-center border border-blue-100 shadow-sm">
                  <div className="text-2xl font-bold text-blue-700 mb-1">{doctor.experience || '15+'}</div>
                  <div className="text-sm text-gray-600 font-medium">Years Experience</div>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-white rounded-xl p-4 text-center border border-emerald-100 shadow-sm">
                  <div className="text-2xl font-bold text-emerald-700 mb-1">{doctor.patients || '5k+'}</div>
                  <div className="text-sm text-gray-600 font-medium">Happy Patients</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl p-4 text-center border border-purple-100 shadow-sm">
                  <div className="text-2xl font-bold text-purple-700 mb-1">{languages.length}</div>
                  <div className="text-sm text-gray-600 font-medium">Languages</div>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-white rounded-xl p-4 text-center border border-amber-100 shadow-sm">
                  <div className="text-2xl font-bold text-amber-700 mb-1">{doctor.consultationFee || '$150'}</div>
                  <div className="text-sm text-gray-600 font-medium">Consultation Fee</div>
                </div>
              </div>

              {/* Tabs Navigation */}
              <div className="flex space-x-1 mb-8 border-b border-gray-200">
                {['overview', 'qualifications', 'experience', 'schedule'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-3 font-medium text-sm uppercase tracking-wider transition-all duration-300 ${
                      activeTab === tab
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-500 hover:text-blue-500'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="animate-fade-in-up">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                        <i className="fas fa-user-md text-blue-600 mr-3"></i>
                        About Dr. {doctor.name.split(' ')[0]}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {doctor.bio || `Dr. ${doctor.name.split(' ')[0]} is a highly experienced ${doctor.specialty} specialist with over ${doctor.experience || '15'} years of experience. Known for compassionate care and excellent diagnostic skills.`}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold mb-3 flex items-center">
                        <i className="fas fa-language text-blue-600 mr-2"></i>
                        Languages Spoken
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {languages.map((lang, i) => (
                          <span key={i} className="px-4 py-2 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 rounded-lg font-medium">
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'qualifications' && (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <i className="fas fa-graduation-cap text-blue-600 mr-3"></i>
                        Qualifications
                      </h3>
                      <p className="text-gray-700 mb-3">{doctor.qualifications || 'MD, Board Certified Specialist'}</p>
                      <p className="text-sm text-gray-600">
                        <i className="fas fa-university mr-2"></i>
                        {doctor.institute || 'Harvard Medical School'}
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'experience' && (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <i className="fas fa-briefcase text-green-600 mr-3"></i>
                        Professional Experience
                      </h3>
                      <p className="text-gray-700 mb-2">{doctor.detailedExperience || `${doctor.experience} years of specialized practice in ${doctor.specialty}`}</p>
                    </div>
                  </div>
                )}

                {activeTab === 'schedule' && (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <i className="fas fa-calendar-alt text-purple-600 mr-3"></i>
                        Availability Schedule
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                          <div className="flex items-center">
                            <i className="fas fa-calendar-day text-purple-500 mr-3"></i>
                            <span className="font-medium">Days</span>
                          </div>
                          <span className="font-semibold">{doctor.available || 'Monday - Friday'}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                          <div className="flex items-center">
                            <i className="fas fa-clock text-purple-500 mr-3"></i>
                            <span className="font-medium">Timing</span>
                          </div>
                          <span className="font-semibold">{doctor.time || '9:00 AM - 6:00 PM'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* CTA Button */}
              <div className="mt-10 text-center">
                <button
                  onClick={() => setShowModal(true)}
                  className="relative px-10 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl font-bold text-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 group overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center space-x-3">
                    <i className="far fa-calendar-check text-xl"></i>
                    <span>Book Appointment with Dr. {doctor.name.split(' ')[0]}</span>
                    <i className="fas fa-arrow-right group-hover:translate-x-2 transition-transform duration-300"></i>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute top-0 left-0 w-full h-1 bg-white/30 animate-pulse"></div>
                </button>
                <p className="text-gray-500 text-sm mt-3">
                  <i className="fas fa-info-circle mr-2"></i>
                  Confirmation will be sent via email & SMS
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Appointment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setShowModal(false)}
          />
          
          {/* Modal */}
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-slide-in-right">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-cyan-600 p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white">Book Appointment</h3>
                  <p className="text-white/90 mt-1">with Dr. {doctor.name}</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors duration-300"
                >
                  <i className="fas fa-times text-white"></i>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <form onSubmit={handleBookAppointment} className="space-y-6">
                {[
                  { 
                    type: 'text', 
                    name: 'patientName', 
                    placeholder: 'John Doe', 
                    label: 'Full Name *',
                    icon: 'fa-user'
                  },
                  { 
                    type: 'email', 
                    name: 'email', 
                    placeholder: 'john@example.com', 
                    label: 'Email Address *',
                    icon: 'fa-envelope'
                  },
                  { 
                    type: 'tel', 
                    name: 'phone', 
                    placeholder: '+1 234 567 8900', 
                    label: 'Phone Number *',
                    icon: 'fa-phone'
                  },
                  { 
                    type: 'date', 
                    name: 'date', 
                    placeholder: '', 
                    label: 'Preferred Date *',
                    icon: 'fa-calendar'
                  }
                ].map((field) => (
                  <div key={field.name} className="relative">
                    <label className="block text-sm font-semibold mb-2 text-gray-700">
                      <i className={`fas ${field.icon} mr-2 text-blue-600`}></i>
                      {field.label}
                    </label>
                    <div className="relative">
                      <input
                        type={field.type}
                        required
                        value={appointmentForm[field.name]}
                        onChange={(e) => setAppointmentForm({ ...appointmentForm, [field.name]: e.target.value })}
                        className="w-full pl-12 pr-4 py-3.5 bg-white rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                        placeholder={field.placeholder}
                      />
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <i className={`fas ${field.icon}`}></i>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="relative">
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    <i className="fas fa-clock mr-2 text-blue-600"></i>
                    Preferred Time *
                  </label>
                  <div className="relative">
                    <select
                      required
                      value={appointmentForm.time}
                      onChange={(e) => setAppointmentForm({ ...appointmentForm, time: e.target.value })}
                      className="w-full pl-12 pr-4 py-3.5 bg-white rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-300 appearance-none"
                    >
                      <option value="">Select Time Slot</option>
                      {['9:00 AM', '10:30 AM', '12:00 PM', '2:30 PM', '4:00 PM', '5:30 PM'].map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <i className="fas fa-clock"></i>
                    </div>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <i className="fas fa-chevron-down"></i>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    <i className="fas fa-comment-dots mr-2 text-blue-600"></i>
                    Additional Message
                  </label>
                  <div className="relative">
                    <textarea
                      value={appointmentForm.message}
                      onChange={(e) => setAppointmentForm({ ...appointmentForm, message: e.target.value })}
                      rows="4"
                      className="w-full pl-12 pr-4 py-3.5 bg-white rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-300 resize-none"
                      placeholder="Please describe your symptoms or any special requests..."
                    ></textarea>
                    <div className="absolute left-4 top-4 text-gray-400">
                      <i className="fas fa-comment-dots"></i>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="relative w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 group overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center space-x-3">
                    <i className="far fa-calendar-check"></i>
                    <span>Confirm Appointment</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900/90 text-white py-12 px-4 sm:px-6 lg:px-8 mt-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                <i className="fas fa-heartbeat text-white text-xl"></i>
              </div>
              <h3 className="text-2xl font-bold">{clinic.clinicName || 'MediCare Plus'}</h3>
            </div>
            <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
              {clinic.tagline || 'Your trusted healthcare partner delivering excellence in medical care'}
            </p>
            <div className="border-t border-gray-800 pt-6">
              <p className="text-gray-500">
                &copy; {new Date().getFullYear()} {clinic.clinicName || 'MediCare Plus'}. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DoctorDetail;