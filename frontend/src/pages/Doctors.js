import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { doctorService, clinicService } from '../services';

const Doctors = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [clinic, setClinic] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [sortBy, setSortBy] = useState('name');
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

  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterAndSortDoctors();
  }, [doctors, searchTerm, selectedDepartment, sortBy]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [doctorsData, clinicData] = await Promise.all([
        doctorService.getAllDoctors(),
        clinicService.getClinicInfo()
      ]);
      setDoctors(doctorsData.data || []);
      setFilteredDoctors(doctorsData.data || []);
      setClinic(clinicData.data || {});
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortDoctors = () => {
    let filtered = [...doctors];
    
    if (searchTerm) {
      filtered = filtered.filter(doctor => 
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.department?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(doctor => 
        doctor.department?.toLowerCase() === selectedDepartment.toLowerCase()
      );
    }
    
    filtered.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'experience') return parseInt(b.experience) - parseInt(a.experience);
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'specialty') return a.specialty?.localeCompare(b.specialty);
      return 0;
    });
    
    setFilteredDoctors(filtered);
  };

  const getDepartmentInfo = (dept) => {
    const departments = {
      cardiology: { icon: 'fa-heart', color: 'from-red-500 to-pink-500', bg: 'bg-gradient-to-br from-red-500 to-pink-500', text: 'text-red-600' },
      radiology: { icon: 'fa-x-ray', color: 'from-purple-500 to-indigo-500', bg: 'bg-gradient-to-br from-purple-500 to-indigo-500', text: 'text-purple-600' },
      pathology: { icon: 'fa-microscope', color: 'from-blue-500 to-cyan-500', bg: 'bg-gradient-to-br from-blue-500 to-cyan-500', text: 'text-blue-600' },
      neurology: { icon: 'fa-brain', color: 'from-indigo-500 to-blue-500', bg: 'bg-gradient-to-br from-indigo-500 to-blue-500', text: 'text-indigo-600' },
      orthopedics: { icon: 'fa-bone', color: 'from-green-500 to-emerald-500', bg: 'bg-gradient-to-br from-green-500 to-emerald-500', text: 'text-green-600' },
      ophthalmology: { icon: 'fa-eye', color: 'from-amber-500 to-orange-500', bg: 'bg-gradient-to-br from-amber-500 to-orange-500', text: 'text-amber-600' }
    };
    return departments[dept?.toLowerCase()] || { 
      icon: 'fa-user-md', 
      color: 'from-gray-500 to-gray-600', 
      bg: 'bg-gradient-to-br from-gray-500 to-gray-600',
      text: 'text-gray-600'
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <div className="text-center space-y-6">
          <div className="relative mx-auto w-20 h-20">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full animate-ping opacity-20"></div>
            <div className="relative w-full h-full bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center">
              <i className="fas fa-user-md text-white text-2xl"></i>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-gray-700 font-medium">Loading medical team...</p>
            <p className="text-sm text-gray-500">Please wait while we fetch the best specialists</p>
          </div>
        </div>
      </div>
    );
  }

  const departments = [
    { id: 'all', name: 'All Specialties', icon: 'fa-user-md' },
    { id: 'cardiology', name: 'Cardiology', icon: 'fa-heart' },
    { id: 'radiology', name: 'Radiology', icon: 'fa-x-ray' },
    { id: 'pathology', name: 'Pathology', icon: 'fa-microscope' },
    { id: 'neurology', name: 'Neurology', icon: 'fa-brain' },
    { id: 'orthopedics', name: 'Orthopedics', icon: 'fa-bone' },
    { id: 'ophthalmology', name: 'Ophthalmology', icon: 'fa-eye' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200/50 shadow-lg">
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
              <a href="/#services" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300 group">
                Services
                <span className="block h-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 w-0 group-hover:w-full transition-all duration-300"></span>
              </a>
              <span className="text-blue-600 font-medium group relative">
                All Doctors
                <span className="block h-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 w-full"></span>
              </span>
              <a href="/#appointment" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300 group">
                Appointment
                <span className="block h-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 w-0 group-hover:w-full transition-all duration-300"></span>
              </a>
            </div>
            <Link
              to="/#appointment"
              className="relative px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 group overflow-hidden"
            >
              <span className="relative z-10 flex items-center space-x-2">
                <i className="far fa-calendar-check"></i>
                <span>Book Appointment</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
          </div>
        </div>
      </nav>

      {/* Header Section */}
      <header className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-blue-500/5 to-transparent"></div>
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-2 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full mb-6">
              <span className="text-blue-700 font-semibold text-sm uppercase tracking-wider">OUR MEDICAL TEAM</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="text-gray-900">Meet Our Expert </span>
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Medical Professionals</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
              Board-certified specialists dedicated to providing exceptional healthcare with compassion and expertise
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                  <i className="fas fa-search"></i>
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 bg-white rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-300 shadow-xl"
                  placeholder="Search doctors by name, specialty, or department..."
                />
                <div className="absolute right-5 top-1/2 -translate-y-1/2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Department Filter Tabs */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {departments.map((dept) => {
                const deptInfo = getDepartmentInfo(dept.id);
                return (
                  <button
                    key={dept.id}
                    onClick={() => setSelectedDepartment(dept.id)}
                    className={`group relative px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                      selectedDepartment === dept.id
                        ? `${deptInfo.bg} text-white shadow-lg`
                        : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md hover:shadow-lg'
                    }`}
                  >
                    <span className="relative z-10 flex items-center space-x-2">
                      <i className={`fas ${dept.icon} ${selectedDepartment === dept.id ? 'text-white' : deptInfo.text}`}></i>
                      <span>{dept.name}</span>
                    </span>
                    {selectedDepartment === dept.id && (
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Results Header */}
          <div className="mb-8 bg-gradient-to-r from-white to-blue-50/50 rounded-2xl p-6 shadow-lg border border-blue-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">
                  {filteredDoctors.length} Medical Professional{filteredDoctors.length !== 1 ? 's' : ''} Found
                </h2>
                <p className="text-gray-600 text-sm">
                  Showing {selectedDepartment === 'all' ? 'all specialties' : selectedDepartment}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                {/* View Toggle */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
                  >
                    <i className="fas fa-th-large"></i>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
                  >
                    <i className="fas fa-list"></i>
                  </button>
                </div>
                <div className="h-6 w-px bg-gray-300"></div>
                {/* Sort */}
                <div className="flex items-center space-x-3">
                  <label className="text-gray-600 font-medium">Sort by:</label>
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="pl-4 pr-10 py-2 bg-white rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-300 appearance-none"
                    >
                      <option value="name">Name (A-Z)</option>
                      <option value="experience">Experience (High to Low)</option>
                      <option value="rating">Rating (High to Low)</option>
                      <option value="specialty">Specialty</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <i className="fas fa-chevron-down"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Doctors Grid/List */}
          {filteredDoctors.length === 0 ? (
            <div className="text-center py-16 bg-gradient-to-br from-white to-blue-50/50 rounded-3xl shadow-lg border border-blue-100">
              <div className="relative w-32 h-32 mx-auto mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-full blur-xl opacity-50"></div>
                <div className="relative w-full h-full bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-user-md text-blue-500 text-5xl"></i>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No Doctors Found</h3>
              <p className="text-gray-600 max-w-md mx-auto mb-8">
                Try adjusting your search or filter criteria. We might have specialists in other departments.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedDepartment('all');
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  <i className="fas fa-redo mr-2"></i>
                  Reset Filters
                </button>
                <button
                  onClick={() => navigate('/#appointment')}
                  className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  <i className="fas fa-phone mr-2"></i>
                  Contact Support
                </button>
              </div>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredDoctors.map((doctor, index) => (
                <div
                  key={doctor._id}
                  className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500 overflow-hidden animate-fade-in-up border border-white/50"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Doctor Image & Status */}
                  <div className="relative">
                    <div className="h-48 bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-7xl overflow-hidden">
                      {getDoctorImageUrl(doctor).includes('/') ? (
                        <img 
                          src={getDoctorImageUrl(doctor)} 
                          alt={doctor.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            const emoji = document.createElement('div');
                            emoji.className = 'w-full h-full flex items-center justify-center text-7xl';
                            emoji.textContent = doctor.image || '👨‍⚕️';
                            e.target.parentElement.appendChild(emoji);
                          }}
                        />
                      ) : (
                        getDoctorImageUrl(doctor)
                      )}
                    </div>
                    <div className="absolute top-4 right-4">
                      <div className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
                        <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
                  </div>

                  {/* Doctor Info */}
                  <div className="p-6 relative">
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors duration-300 mb-1">
                        {doctor.name}
                      </h3>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-blue-600 font-semibold">{doctor.specialty}</span>
                        <div className="flex items-center">
                          <i className="fas fa-star text-yellow-500 text-sm mr-1"></i>
                          <span className="text-sm font-medium">{doctor.rating || 4.5}</span>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {doctor.designation || 'Consultant'} • {doctor.department || 'General Medicine'}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="bg-blue-50 rounded-xl p-3">
                        <div className="text-xs text-blue-600 font-medium mb-1">Experience</div>
                        <div className="text-lg font-bold text-gray-900">{doctor.experience || 'N/A'}</div>
                      </div>
                      <div className="bg-emerald-50 rounded-xl p-3">
                        <div className="text-xs text-emerald-600 font-medium mb-1">Availability</div>
                        <div className="text-lg font-bold text-gray-900 truncate">{doctor.available?.split(' ')[0] || 'N/A'}</div>
                      </div>
                    </div>

                    {/* Languages */}
                    <div className="mb-6">
                      <div className="text-xs text-gray-500 font-medium mb-2">Languages</div>
                      <div className="flex flex-wrap gap-1">
                        {(Array.isArray(doctor.languages) ? doctor.languages.slice(0, 2) : ['English']).map((lang, i) => (
                          <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {lang}
                          </span>
                        ))}
                        {Array.isArray(doctor.languages) && doctor.languages.length > 2 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            +{doctor.languages.length - 2}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-3">
                      <Link
                        to={`/doctors/${doctor._id}`}
                        className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold text-center hover:shadow-lg transform hover:scale-105 transition-all duration-300 group/btn"
                      >
                        <span className="flex items-center justify-center space-x-2">
                          <i className="fas fa-user-md"></i>
                          <span>View Profile</span>
                        </span>
                      </Link>
                      <button
                        onClick={() => navigate(`/doctors/${doctor._id}#appointment`)}
                        className="px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                      >
                        <i className="fas fa-calendar-check"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDoctors.map((doctor, index) => (
                <div
                  key={doctor._id}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 overflow-hidden animate-fade-in-up border border-white/50"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Doctor Image */}
                    <div className="md:w-48 bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-6xl p-8">
                      {doctor.image || '👨‍⚕️'}
                    </div>
                    
                    {/* Doctor Info */}
                    <div className="flex-1 p-6">
                      <div className="flex flex-col md:flex-row md:items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors duration-300 mb-1">
                                {doctor.name}
                              </h3>
                              <div className="flex items-center space-x-4 mb-3">
                                <span className="text-blue-600 font-semibold">{doctor.specialty}</span>
                                <div className="flex items-center">
                                  <i className="fas fa-star text-yellow-500 text-sm mr-1"></i>
                                  <span className="text-sm font-medium">{doctor.rating || 4.5}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                              <span className="text-xs text-emerald-600 font-medium">Available</span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="space-y-1">
                              <div className="text-xs text-gray-500">Experience</div>
                              <div className="font-semibold">{doctor.experience || 'N/A'}</div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-xs text-gray-500">Timing</div>
                              <div className="font-semibold truncate">{doctor.time || 'N/A'}</div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-xs text-gray-500">Days</div>
                              <div className="font-semibold">{doctor.available?.split(',')[0] || 'N/A'}</div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-xs text-gray-500">Consultation</div>
                              <div className="font-semibold">{doctor.consultationFee || '$150'}</div>
                            </div>
                          </div>
                          
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                            {doctor.bio || `Experienced ${doctor.specialty} specialist with ${doctor.experience} of practice.`}
                          </p>
                        </div>
                        
                        <div className="flex space-x-3">
                          <Link
                            to={`/doctors/${doctor._id}`}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                          >
                            <span className="flex items-center space-x-2">
                              <i className="fas fa-user-md"></i>
                              <span className="hidden md:inline">Profile</span>
                            </span>
                          </Link>
                          <button
                            onClick={() => navigate(`/doctors/${doctor._id}#appointment`)}
                            className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                          >
                            <i className="fas fa-calendar-check"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900/90 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                <i className="fas fa-heartbeat text-white text-xl"></i>
              </div>
              <div>
                <h3 className="text-2xl font-bold">{clinic.clinicName || 'MediCare Plus'}</h3>
                <p className="text-cyan-200/80 text-sm">{clinic.tagline || 'Excellence in Healthcare'}</p>
              </div>
            </div>
            <p className="text-gray-400 max-w-2xl mx-auto mb-8">
              Providing world-class healthcare services with state-of-the-art facilities and compassionate care.
            </p>
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

export default Doctors;