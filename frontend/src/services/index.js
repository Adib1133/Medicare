// This file contains all API service functions
// Import api instance
import api from './api';

// ==================== AUTH SERVICES ====================
export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data));
    }
    return response.data;
  },
  
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

// ==================== CLINIC SERVICES ====================
export const clinicService = {
  getClinicInfo: async () => {
    const response = await api.get('/clinic');
    return response.data;
  },
  
  updateClinicInfo: async (data) => {
    const response = await api.put('/clinic', data);
    return response.data;
  },
  
  uploadLogo: async (logoFile) => {
    const formData = new FormData();
    formData.append('logo', logoFile);
    const response = await api.post('/clinic/upload-logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  
  getLogoUrl: (logoUrl) => {
    if (!logoUrl) return null;
    if (logoUrl.startsWith('http')) return logoUrl;
    return `${process.env.REACT_APP_API_URL?.replace('/api', '')}${logoUrl}`;
  }
};

// ==================== DOCTOR SERVICES ====================
export const doctorService = {
  getAllDoctors: async (params = {}) => {
    const response = await api.get('/doctors', { params });
    return response.data;
  },
  
  getDoctorById: async (id) => {
    const response = await api.get(`/doctors/${id}`);
    return response.data;
  },
  
  createDoctor: async (data) => {
    const response = await api.post('/doctors', data);
    return response.data;
  },
  
  updateDoctor: async (id, data) => {
    const response = await api.put(`/doctors/${id}`, data);
    return response.data;
  },
  
  deleteDoctor: async (id) => {
    const response = await api.delete(`/doctors/${id}`);
    return response.data;
  },
  
  getDepartments: async () => {
    const response = await api.get('/doctors/meta/departments');
    return response.data;
  },
  
  getSpecialties: async () => {
    const response = await api.get('/doctors/meta/specialties');
    return response.data;
  },
  
  uploadDoctorImage: async (doctorId, imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    const response = await api.post(`/doctors/upload-image/${doctorId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  deleteDoctorImage: async (doctorId) => {
    const response = await api.delete(`/doctors/${doctorId}/image`);
    return response.data;
  }
};

// ==================== SERVICE SERVICES ====================
export const serviceService = {
  getAllServices: async () => {
    const response = await api.get('/services');
    return response.data;
  },
  
  getServiceById: async (id) => {
    const response = await api.get(`/services/${id}`);
    return response.data;
  },
  
  createService: async (data) => {
    const response = await api.post('/services', data);
    return response.data;
  },
  
  updateService: async (id, data) => {
    const response = await api.put(`/services/${id}`, data);
    return response.data;
  },
  
  deleteService: async (id) => {
    const response = await api.delete(`/services/${id}`);
    return response.data;
  }
};

// ==================== APPOINTMENT SERVICES ====================
export const appointmentService = {
  getAllAppointments: async (params = {}) => {
    const response = await api.get('/appointments', { params });
    return response.data;
  },
  
  getAppointmentById: async (id) => {
    const response = await api.get(`/appointments/${id}`);
    return response.data;
  },
  
  createAppointment: async (data) => {
    const response = await api.post('/appointments', data);
    return response.data;
  },
  
  updateAppointment: async (id, data) => {
    const response = await api.put(`/appointments/${id}`, data);
    return response.data;
  },
  
  updateAppointmentStatus: async (id, status) => {
    const response = await api.patch(`/appointments/${id}/status`, { status });
    return response.data;
  },
  
  deleteAppointment: async (id) => {
    const response = await api.delete(`/appointments/${id}`);
    return response.data;
  },
  
  getAppointmentStats: async () => {
    const response = await api.get('/appointments/stats/overview');
    return response.data;
  }
};

// ==================== REPORT SERVICES ====================
export const reportService = {
  searchReport: async (patientId, dob = null) => {
    const params = dob ? { dob } : {};
    const response = await api.get(`/reports/search/${patientId}`, { params });
    return response.data;
  },
  
  getAllReports: async (params = {}) => {
    const response = await api.get('/reports', { params });
    return response.data;
  },
  
  getReportById: async (id) => {
    const response = await api.get(`/reports/${id}`);
    return response.data;
  },
  
  createReport: async (data) => {
    const response = await api.post('/reports', data);
    return response.data;
  },
  
  updateReport: async (id, data) => {
    const response = await api.put(`/reports/${id}`, data);
    return response.data;
  },
  
  updateReportStatus: async (id, status) => {
    const response = await api.patch(`/reports/${id}/status`, { status });
    return response.data;
  },
  
  deleteReport: async (id) => {
    const response = await api.delete(`/reports/${id}`);
    return response.data;
  },
  
  getReportStats: async () => {
    const response = await api.get('/reports/stats/overview');
    return response.data;
  },
  
  uploadReportPdf: async (reportId, pdfFile) => {
    const formData = new FormData();
    formData.append('pdf', pdfFile);
    const response = await api.post(`/reports/upload-pdf/${reportId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  
  downloadReportPdf: (pdfUrl) => {
    return `${process.env.REACT_APP_API_URL?.replace('/api', '')}${pdfUrl}`;
  }
};

// ==================== SUBSCRIBER SERVICES ====================
export const subscriberService = {
  subscribe: async (email) => {
    const response = await api.post('/subscribers', { email });
    return response.data;
  },
  
  getAllSubscribers: async (params = {}) => {
    const response = await api.get('/subscribers', { params });
    return response.data;
  },
  
  unsubscribe: async (id) => {
    const response = await api.delete(`/subscribers/${id}`);
    return response.data;
  },
  
  getSubscriberStats: async () => {
    const response = await api.get('/subscribers/stats/overview');
    return response.data;
  }
};

// ==================== IN-CHARGE SERVICES ====================
export const inchargeService = {
  getDashboard: async () => {
    const response = await api.get('/incharge/dashboard');
    return response.data;
  },
  
  getActivity: async () => {
    const response = await api.get('/incharge/activity');
    return response.data;
  }
};

// ==================== USER SERVICES ====================
export const userService = {
  getAllUsers: async () => {
    const response = await api.get('/auth/users');
    return response.data;
  },
  
  createUser: async (userData) => {
    const response = await api.post('/auth/create-user', userData);
    return response.data;
  },
  
  updateUser: async (id, data) => {
    const response = await api.put(`/auth/update-user/${id}`, data);
    return response.data;
  },
  
  deleteUser: async (id) => {
    const response = await api.delete(`/auth/delete-user/${id}`);
    return response.data;
  },
  
  updatePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/auth/password', { currentPassword, newPassword });
    return response.data;
  }
};

// Export all services
export default {
  auth: authService,
  clinic: clinicService,
  doctor: doctorService,
  service: serviceService,
  appointment: appointmentService,
  report: reportService,
  subscriber: subscriberService,
  incharge: inchargeService,
  user: userService
};
