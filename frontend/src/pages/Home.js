import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { clinicService, doctorService, serviceService, appointmentService, reportService, subscriberService } from '../services';

const Home = () => {
  const [clinic, setClinic] = useState({});
  const [services, setServices] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [appointmentForm, setAppointmentForm] = useState({ patientName: '', email: '', phone: '', date: '', time: '', service: '', doctorName: '', message: '' });
  const [reportSearchId, setReportSearchId] = useState('');
  const [reportResult, setReportResult] = useState(null);
  const [showReportResult, setShowReportResult] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [activeService, setActiveService] = useState(0);

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

  useEffect(() => {
    fetchData();
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [clinicData, servicesData, doctorsData] = await Promise.all([
        clinicService.getClinicInfo(),
        serviceService.getAllServices(),
        doctorService.getAllDoctors({ featured: true, limit: 6 })
      ]);
      setClinic(clinicData.data || {});
      setServices(servicesData.data || []);
      setDoctors(doctorsData.data || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAppointmentSubmit = async (e) => {
    e.preventDefault();
    try {
      await appointmentService.createAppointment(appointmentForm);
      toast.success('Appointment booked successfully!');
      setAppointmentForm({ patientName: '', email: '', phone: '', date: '', time: '', service: '', doctorName: '', message: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to book appointment');
    }
  };

  const handleReportSearch = async (e) => {
    e.preventDefault();
    if (!reportSearchId) { toast.error('Please enter Patient ID'); return; }
    try {
      const response = await reportService.searchReport(reportSearchId);
      setReportResult(response.data);
      setShowReportResult(true);
      toast.success('Report found!');
    } catch (error) {
      setReportResult(null);
      setShowReportResult(true);
      toast.error('Report not found');
    }
  };

  const handleNewsletterSubscribe = async (e) => {
    e.preventDefault();
    if (!newsletterEmail) { toast.error('Please enter email'); return; }
    try {
      await subscriberService.subscribe(newsletterEmail);
      toast.success('Subscribed successfully!');
      setNewsletterEmail('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Subscription failed');
    }
  };

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="relative">
        <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-600"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );

  const stats = clinic.stats || [
    { icon: 'fa-user-md', number: '50+', label: 'Expert Doctors' },
    { icon: 'fa-heartbeat', number: '10k+', label: 'Happy Patients' },
    { icon: 'fa-award', number: '25+', label: 'Years Experience' },
    { icon: 'fa-clinic-medical', number: '15+', label: 'Departments' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-500 ${scrolled ? 'bg-white/95 backdrop-blur-lg shadow-xl py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => scrollTo('home')}>
              <div className="relative">
                {clinic.logoUrl ? (
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-lg overflow-hidden bg-white">
                    <img 
                      src={clinicService.getLogoUrl(clinic.logoUrl)}
                      alt="Logo"
                      className="w-full h-full object-contain p-1"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const fallback = document.createElement('div');
                        fallback.className = 'w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center';
                        fallback.innerHTML = '<i class="fas fa-heartbeat text-white text-xl"></i>';
                        e.target.parentElement.appendChild(fallback);
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300 shadow-lg">
                    <i className="fas fa-heartbeat text-white text-xl"></i>
                  </div>
                )}
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent">
                  {clinic.clinicName || 'MediCare Plus'}
                </h1>
                <p className="text-xs text-gray-600 font-medium">{clinic.tagline || 'Excellence in Healthcare'}</p>
              </div>
            </div>

            <div className="hidden lg:flex items-center space-x-8">
              {['Home', 'Services', 'Doctors', 'Appointment', 'Reports'].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollTo(item.toLowerCase())}
                  className="relative text-gray-700 hover:text-blue-600 font-medium text-sm uppercase tracking-wider group"
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-cyan-500 group-hover:w-full transition-all duration-300"></span>
                </button>
              ))}
            </div>

            <button 
              onClick={() => scrollTo('appointment')}
              className="relative px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 group overflow-hidden"
            >
              <span className="relative z-10">Book Appointment</span>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute top-0 left-0 w-full h-1 bg-white/30 group-hover:animate-pulse"></div>
            </button>
          </div>
        </div>
      </nav>

      {/* Floating Admin Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Link 
          to="/login" 
          className="flex items-center space-x-2 px-5 py-3 bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 hover:rotate-3 transition-all duration-300 group"
        >
          <i className="fas fa-cog text-lg group-hover:rotate-180 transition-transform duration-500"></i>
          <span className="font-semibold">Admin Panel</span>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
        </Link>
      </div>

      {/* Hero Section */}
      <section id="home" className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-200/20 to-cyan-200/20 rounded-full -translate-y-48 translate-x-48"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-emerald-200/10 to-teal-200/10 rounded-full -translate-x-32 translate-y-32"></div>
        
        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full border border-blue-200">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                <span className="text-blue-700 font-semibold text-sm">
                  {clinic.heroText?.tagline || '🏥 Trusted Healthcare Since 1998'}
                </span>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                <span className="text-gray-900 block">{clinic.heroText?.title1 || 'Your Health, Our'}</span>
                <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-600 bg-clip-text text-transparent animate-gradient-x">
                  {clinic.heroText?.title2 || 'Highest Priority'}
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                {clinic.heroText?.description || 'Experience world-class diagnostic services with cutting-edge technology and compassionate care.'}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button 
                  onClick={() => scrollTo('appointment')}
                  className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center space-x-2">
                    <i className="far fa-calendar-check"></i>
                    <span>Book Appointment</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
                
                <button 
                  onClick={() => scrollTo('services')}
                  className="group px-8 py-4 border-2 border-blue-600 text-blue-600 rounded-2xl font-semibold hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 transition-all duration-300"
                >
                  <span className="flex items-center justify-center space-x-2">
                    <i className="fas fa-stethoscope"></i>
                    <span>View Services</span>
                  </span>
                </button>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative z-10 bg-gradient-to-br from-white to-blue-50 rounded-3xl p-8 shadow-2xl border border-blue-100">
                <div className="text-9xl text-center animate-float">🏥</div>
              </div>
              <div className="absolute -top-4 -right-4 w-32 h-32 bg-gradient-to-br from-blue-400/30 to-cyan-400/30 rounded-3xl blur-xl"></div>
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-tr from-emerald-400/20 to-teal-400/20 rounded-2xl blur-xl"></div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-24">
            {stats.map((stat, i) => (
              <div 
                key={i} 
                className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500 border border-white/50"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className={`w-14 h-14 bg-gradient-to-br ${i === 0 ? 'from-blue-500 to-cyan-400' : i === 1 ? 'from-emerald-500 to-teal-400' : i === 2 ? 'from-purple-500 to-pink-400' : 'from-amber-500 to-orange-400'} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                    <i className={`fas ${stat.icon} text-2xl text-white`}></i>
                  </div>
                  <div className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    {stat.number}
                  </div>
                  <div className="text-gray-600 font-medium mt-2">{stat.label}</div>
                </div>
                <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-blue-600 to-cyan-600 group-hover:w-full transition-all duration-500"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-72 bg-gradient-to-b from-blue-50/50 to-transparent"></div>
        
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-1 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full mb-4">
              <span className="text-blue-700 font-semibold text-sm">OUR SERVICES</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-gray-900">Comprehensive </span>
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Healthcare Services</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We offer a wide range of diagnostic and medical services using state-of-the-art technology
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div 
                key={service._id} 
                className={`group relative bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 shadow-xl hover:shadow-2xl transform hover:-translate-y-3 transition-all duration-500 border border-white/50 ${activeService === index ? 'ring-2 ring-blue-500/20' : ''}`}
                onMouseEnter={() => setActiveService(index)}
              >
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-t-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative mb-6">
                  <div className={`w-20 h-20 bg-gradient-to-br ${service.color || 'from-blue-500 to-cyan-400'} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                    <i className={`fas ${service.icon || 'fa-stethoscope'} text-3xl text-white`}></i>
                  </div>
                  <div className="absolute -top-2 -right-2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center">
                      <i className="fas fa-plus text-white text-xs"></i>
                    </div>
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 group-hover:text-blue-700 transition-colors duration-300">
                  {service.name}
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  {service.desc || 'Professional healthcare service with advanced diagnostic equipment.'}
                </p>
                <div className="flex items-center text-blue-600 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Doctors Section */}
      <section id="doctors" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-blue-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-200/20 to-cyan-200/20 rounded-full -translate-y-32 translate-x-32"></div>
        
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-1 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full mb-4">
              <span className="text-blue-700 font-semibold text-sm">OUR TEAM</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-gray-900">Meet Our Expert </span>
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Medical Professionals</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Board-certified doctors dedicated to providing exceptional healthcare
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {doctors.map((doctor) => (
              <div key={doctor._id} className="group relative bg-white rounded-3xl p-6 shadow-xl hover:shadow-2xl transform hover:-translate-y-3 transition-all duration-500">
                <div className="absolute top-4 right-4 w-12 h-12 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full backdrop-blur-sm"></div>
                
                <div className="flex items-start space-x-4 mb-6">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-2xl flex items-center justify-center text-4xl shadow-lg overflow-hidden">
                      {getDoctorImageUrl(doctor).includes('/') ? (
                        <img 
                          src={getDoctorImageUrl(doctor)} 
                          alt={doctor.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            const emoji = document.createElement('div');
                            emoji.className = 'w-full h-full flex items-center justify-center text-4xl';
                            emoji.textContent = doctor.image || '👨‍⚕️';
                            e.target.parentElement.appendChild(emoji);
                          }}
                        />
                      ) : (
                        getDoctorImageUrl(doctor)
                      )}
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white">
                      <i className="fas fa-check text-white text-xs"></i>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors duration-300">
                      {doctor.name}
                    </h3>
                    <p className="text-blue-600 font-semibold">{doctor.specialty}</p>
                    <div className="flex items-center mt-2">
                      {[...Array(5)].map((_, i) => (
                        <i 
                          key={i} 
                          className={`fas fa-star ${i < Math.floor(doctor.rating || 4.5) ? 'text-yellow-500' : 'text-gray-300'} text-sm`}
                        ></i>
                      ))}
                      <span className="text-sm text-gray-600 ml-2">{doctor.rating || 4.5}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center space-x-3 p-3 bg-blue-50/50 rounded-xl group-hover:bg-blue-50 transition-colors duration-300">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                      <i className="fas fa-award text-white"></i>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Experience</p>
                      <p className="text-sm font-semibold text-gray-900">{doctor.experience || '15+ Years'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-emerald-50/50 rounded-xl group-hover:bg-emerald-50 transition-colors duration-300">
                    <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                      <i className="fas fa-calendar-check text-white"></i>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Available</p>
                      <p className="text-sm font-semibold text-gray-900">{doctor.available || 'Mon-Fri, 9AM-6PM'}</p>
                    </div>
                  </div>
                </div>

                <Link 
                  to={`/doctors/${doctor._id}`}
                  className="block w-full py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold text-center hover:shadow-lg transform hover:scale-105 transition-all duration-300 group/btn"
                >
                  <span className="flex items-center justify-center space-x-2">
                    <span>View Profile</span>
                    <i className="fas fa-arrow-right group-hover/btn:translate-x-1 transition-transform duration-300"></i>
                  </span>
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link 
              to="/doctors"
              className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl font-semibold hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              <span>View All Doctors</span>
              <i className="fas fa-arrow-right group-hover:translate-x-1 transition-transform duration-300"></i>
            </Link>
          </div>
        </div>
      </section>

      {/* Appointment Section */}
      <section id="appointment" className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-white to-cyan-50/30"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-96 bg-gradient-to-r from-blue-600/5 to-cyan-600/5 blur-3xl"></div>
        
        <div className="max-w-4xl mx-auto relative">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-1 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full mb-4">
              <span className="text-blue-700 font-semibold text-sm">BOOK APPOINTMENT</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-gray-900">Schedule Your </span>
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Medical Visit</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Fill out the form below and our team will get back to you within 24 hours
            </p>
          </div>

          <div className="bg-gradient-to-br from-white to-blue-50/50 rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
            <div className="p-1 bg-gradient-to-r from-blue-600 to-cyan-600"></div>
            <form onSubmit={handleAppointmentSubmit} className="p-8 lg:p-10">
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { type: 'text', name: 'patientName', placeholder: 'Full Name', icon: 'fa-user' },
                  { type: 'email', name: 'email', placeholder: 'Email Address', icon: 'fa-envelope' },
                  { type: 'tel', name: 'phone', placeholder: 'Phone Number', icon: 'fa-phone' },
                  { type: 'date', name: 'date', placeholder: 'Select Date', icon: 'fa-calendar' }
                ].map((field) => (
                  <div key={field.name} className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <i className={`fas ${field.icon}`}></i>
                    </div>
                    <input
                      type={field.type}
                      required
                      value={appointmentForm[field.name]}
                      onChange={(e) => setAppointmentForm({...appointmentForm, [field.name]: e.target.value})}
                      className="w-full pl-12 pr-4 py-3.5 bg-white/80 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                      placeholder={field.placeholder}
                    />
                  </div>
                ))}
                
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <i className="fas fa-clock"></i>
                  </div>
                  <select
                    required
                    value={appointmentForm.time}
                    onChange={(e) => setAppointmentForm({...appointmentForm, time: e.target.value})}
                    className="w-full pl-12 pr-4 py-3.5 bg-white/80 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                  >
                    <option value="">Select Time Slot</option>
                    {['9:00 AM', '10:30 AM', '12:00 PM', '2:30 PM', '4:00 PM', '5:30 PM'].map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <i className="fas fa-stethoscope"></i>
                  </div>
                  <select
                    required
                    value={appointmentForm.service}
                    onChange={(e) => setAppointmentForm({...appointmentForm, service: e.target.value})}
                    className="w-full pl-12 pr-4 py-3.5 bg-white/80 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                  >
                    <option value="">Select Service</option>
                    {services.map((s) => (
                      <option key={s._id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute left-4 top-4 text-gray-400">
                    <i className="fas fa-comment-dots"></i>
                  </div>
                  <textarea
                    value={appointmentForm.message}
                    onChange={(e) => setAppointmentForm({...appointmentForm, message: e.target.value})}
                    rows="4"
                    className="w-full pl-12 pr-4 py-3.5 bg-white/80 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-300 resize-none"
                    placeholder="Additional information or special requests..."
                  ></textarea>
                </div>
              </div>

              <button
                type="submit"
                className="group relative w-full mt-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center space-x-3">
                  <i className="far fa-calendar-check"></i>
                  <span>Confirm Appointment</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-white/30 animate-pulse"></div>
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Reports Section */}
      <section id="reports" className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 via-white to-blue-50/50"></div>
        
        <div className="max-w-4xl mx-auto relative">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-1 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full mb-4">
              <span className="text-blue-700 font-semibold text-sm">MEDICAL REPORTS</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-gray-900">Access Your </span>
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Medical Reports</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Securely access your diagnostic reports anytime, anywhere
            </p>
          </div>

          <div className="bg-gradient-to-br from-white to-blue-50/50 rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
            <div className="p-1 bg-gradient-to-r from-emerald-600 to-teal-600"></div>
            <div className="p-8 lg:p-10">
              <form onSubmit={handleReportSearch} className="space-y-8">
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <i className="fas fa-id-card"></i>
                  </div>
                  <input
                    type="text"
                    required
                    value={reportSearchId}
                    onChange={(e) => setReportSearchId(e.target.value.toUpperCase())}
                    className="w-full pl-12 pr-4 py-3.5 bg-white/80 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all duration-300"
                    placeholder="Enter Patient ID (e.g., PID-2024-001)"
                  />
                </div>

                <button
                  type="submit"
                  className="group relative w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center space-x-3">
                    <i className="fas fa-search"></i>
                    <span>Search Report</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </form>

              {showReportResult && (
                <div className="mt-8 animate-fade-in">
                  {reportResult ? (
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 border border-emerald-200">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h4 className="text-2xl font-bold text-emerald-900 flex items-center">
                            <i className="fas fa-check-circle mr-3 text-emerald-600"></i>
                            Report Found!
                          </h4>
                          <p className="text-emerald-700 mt-2">Your report is ready for download</p>
                        </div>
                        <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                          <i className="fas fa-file-medical-alt text-emerald-600 text-3xl"></i>
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-6 mb-8">
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                              <i className="fas fa-user text-emerald-600"></i>
                            </div>
                            <div>
                              <p className="text-sm text-emerald-800 font-medium">Patient Name</p>
                              <p className="font-semibold">{reportResult.patientName}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <i className="fas fa-file-medical text-blue-600"></i>
                            </div>
                            <div>
                              <p className="text-sm text-blue-800 font-medium">Report Type</p>
                              <p className="font-semibold">{reportResult.reportType}</p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                              <i className="fas fa-calendar-alt text-purple-600"></i>
                            </div>
                            <div>
                              <p className="text-sm text-purple-800 font-medium">Test Date</p>
                              <p className="font-semibold">
                                {new Date(reportResult.testDate).toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                              <i className="fas fa-shield-alt text-amber-600"></i>
                            </div>
                            <div>
                              <p className="text-sm text-amber-800 font-medium">Status</p>
                              <p className="font-semibold text-emerald-600">Ready for Download</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* PDF Download Button */}
                      {reportResult.pdfUrl ? (
                        <a
                          href={reportService.downloadReportPdf(reportResult.pdfUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group block w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                        >
                          <span className="flex items-center justify-center space-x-3">
                            <i className="fas fa-file-pdf text-xl"></i>
                            <span className="text-lg">Download PDF Report</span>
                            <i className="fas fa-external-link-alt group-hover:translate-x-1 transition-transform"></i>
                          </span>
                        </a>
                      ) : (
                        <div className="w-full py-4 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-xl text-center">
                          <i className="fas fa-hourglass-half mr-2"></i>
                          PDF report is being prepared. Please check back later.
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-8 border border-red-200">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h4 className="text-2xl font-bold text-red-900 flex items-center">
                            <i className="fas fa-exclamation-triangle mr-3 text-red-600"></i>
                            Report Not Found
                          </h4>
                          <p className="text-red-700 mt-2">No report found for the provided ID</p>
                        </div>
                        <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center">
                          <i className="fas fa-search-minus text-red-600 text-3xl"></i>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <p className="text-gray-700">
                          We couldn't find a report for ID: <span className="font-bold text-red-700">{reportSearchId}</span>
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <i className="fas fa-info-circle mr-2"></i>
                            <span>Check the ID and try again</span>
                          </div>
                          <div className="flex items-center">
                            <i className="fas fa-phone mr-2"></i>
                            <span>Contact support if needed</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900/90"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500"></div>
        
        <div className="relative py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-4 gap-8 mb-12">
              {/* Clinic Info */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <i className="fas fa-heartbeat text-white text-xl"></i>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">{clinic.clinicName || 'MediCare Plus'}</h3>
                    <p className="text-cyan-200/80 text-sm font-medium">{clinic.tagline || 'Excellence in Healthcare'}</p>
                  </div>
                </div>
                <p className="text-gray-400 leading-relaxed">
                  Providing exceptional healthcare services with compassion and cutting-edge technology since 1998.
                </p>
                <div className="flex space-x-4">
                  {['fa-facebook', 'fa-twitter', 'fa-instagram', 'fa-linkedin'].map((icon) => (
                    <a
                      key={icon}
                      href="#"
                      className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center text-gray-300 hover:text-white transition-all duration-300 group"
                    >
                      <i className={`fab ${icon} group-hover:scale-110 transition-transform duration-300`}></i>
                    </a>
                  ))}
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="text-lg font-bold text-white mb-6 pb-2 border-b border-gray-700/50">Quick Links</h4>
                <ul className="space-y-3">
                  {['Home', 'Services', 'Doctors', 'Appointment', 'Reports', 'Contact'].map((link) => (
                    <li key={link}>
                      <button
                        onClick={() => scrollTo(link.toLowerCase())}
                        className="text-gray-400 hover:text-white transition-colors duration-300 hover:translate-x-2 flex items-center"
                      >
                        <i className="fas fa-chevron-right text-xs mr-2 opacity-0 group-hover:opacity-100"></i>
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Contact Info */}
              <div>
                <h4 className="text-lg font-bold text-white mb-6 pb-2 border-b border-gray-700/50">Contact Info</h4>
                <ul className="space-y-4">
                  <li className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-blue-900/50 rounded-lg flex items-center justify-center mt-1">
                      <i className="fas fa-map-marker-alt text-blue-400"></i>
                    </div>
                    <div>
                      <p className="text-gray-400">123 Medical Street</p>
                      <p className="text-gray-400">Healthcare City, HC 12345</p>
                    </div>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-emerald-900/50 rounded-lg flex items-center justify-center">
                      <i className="fas fa-phone text-emerald-400"></i>
                    </div>
                    <div>
                      <p className="text-white font-semibold">{clinic.contact?.phone || '+1 (234) 567-8900'}</p>
                      <p className="text-gray-400 text-sm">Mon-Fri, 9AM-6PM</p>
                    </div>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-cyan-900/50 rounded-lg flex items-center justify-center">
                      <i className="fas fa-envelope text-cyan-400"></i>
                    </div>
                    <div>
                      <p className="text-white font-semibold">{clinic.contact?.email || 'info@medicare.com'}</p>
                      <p className="text-gray-400 text-sm">24/7 Support</p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Newsletter */}
              <div>
                <h4 className="text-lg font-bold text-white mb-6 pb-2 border-b border-gray-700/50">Stay Updated</h4>
                <p className="text-gray-400 mb-6">Subscribe to our newsletter for health tips and updates</p>
                <form onSubmit={handleNewsletterSubscribe} className="space-y-4">
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <i className="fas fa-envelope"></i>
                    </div>
                    <input
                      type="email"
                      required
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 text-white transition-all duration-300"
                      placeholder="Your email address"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                  >
                    <span className="flex items-center justify-center space-x-2">
                      <i className="fas fa-paper-plane"></i>
                      <span>Subscribe</span>
                    </span>
                  </button>
                </form>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-8">
              <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <p className="text-gray-500 text-sm">
                  &copy; {new Date().getFullYear()} {clinic.clinicName || 'MediCare Plus'}. All rights reserved.
                </p>
                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <a href="#" className="hover:text-cyan-400 transition-colors duration-300">Privacy Policy</a>
                  <a href="#" className="hover:text-cyan-400 transition-colors duration-300">Terms of Service</a>
                  <a href="#" className="hover:text-cyan-400 transition-colors duration-300">Cookie Policy</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
export default Home;