import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { appointmentService, reportService, inchargeService } from '../services';

const InchargePanel = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [reports, setReports] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [dashboardData, setDashboardData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'incharge') {
      navigate('/login');
      return;
    }
    loadData();
  }, [user, navigate, activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'dashboard') {
        const data = await inchargeService.getDashboard();
        setDashboardData(data.data || {});
      } else if (activeTab === 'reports' && user.permissions?.canManageReports) {
        const data = await reportService.getAllReports();
        setReports(data.data || []);
      } else if (activeTab === 'appointments' && user.permissions?.canViewAppointments) {
        const data = await appointmentService.getAllAppointments();
        setAppointments(data.data || []);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const updateReportStatus = async (id, status) => {
    if (!user.permissions?.canManageReports) {
      toast.error('You do not have permission to update reports');
      return;
    }
    try {
      await reportService.updateReportStatus(id, status);
      toast.success('Report status updated!');
      loadData();
    } catch (error) {
      toast.error('Failed to update report');
    }
  };

  const updateAppointmentStatus = async (id, status) => {
    if (!user.permissions?.canManageAppointments) {
      toast.error('You do not have permission to update appointments');
      return;
    }
    try {
      await appointmentService.updateAppointmentStatus(id, status);
      toast.success('Appointment status updated!');
      loadData();
    } catch (error) {
      toast.error('Failed to update appointment');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-gray-800 to-gray-900 text-white min-h-screen p-6 fixed overflow-y-auto">
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-2 flex items-center space-x-2">
            <i className="fas fa-user-tie"></i>
            <span>In-Charge Panel</span>
          </h2>
          <p className="text-gray-400 text-sm">{user?.department || 'Department'} In-Charge</p>
          <div className="text-xs bg-gray-700 rounded-lg p-3 mt-3">
            <i className="fas fa-shield-alt mr-1"></i>Limited Access
          </div>
        </div>

        <nav className="space-y-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center space-x-3 ${
              activeTab === 'dashboard' ? 'bg-gray-700' : 'hover:bg-gray-700'
            }`}
          >
            <i className="fas fa-tachometer-alt"></i>
            <span>Dashboard</span>
          </button>

          {user?.permissions?.canManageReports && (
            <button
              onClick={() => setActiveTab('reports')}
              className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center space-x-3 ${
                activeTab === 'reports' ? 'bg-gray-700' : 'hover:bg-gray-700'
              }`}
            >
              <i className="fas fa-file-medical"></i>
              <span>Reports</span>
            </button>
          )}

          {user?.permissions?.canViewAppointments && (
            <button
              onClick={() => setActiveTab('appointments')}
              className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center space-x-3 ${
                activeTab === 'appointments' ? 'bg-gray-700' : 'hover:bg-gray-700'
              }`}
            >
              <i className="fas fa-calendar-check"></i>
              <span>Appointments</span>
            </button>
          )}
        </nav>

        <div className="mt-8 pt-8 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 transition flex items-center space-x-3"
          >
            <i className="fas fa-sign-out-alt"></i>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64 p-8 overflow-y-auto">
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome, {user?.name}</h1>
              <p className="text-gray-600">{user?.department} Department In-Charge</p>
            </div>
            <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
              <i className="fas fa-user-tie mr-1"></i>
              In-Charge Access
            </span>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {user?.permissions?.canManageReports && dashboardData.reports && (
                    <>
                      <div className="bg-white rounded-xl p-6 shadow-lg">
                        <h3 className="text-gray-600 text-sm mb-2">Total Reports</h3>
                        <p className="text-3xl font-bold text-blue-600">{dashboardData.reports.total || 0}</p>
                      </div>
                      <div className="bg-white rounded-xl p-6 shadow-lg">
                        <h3 className="text-gray-600 text-sm mb-2">Pending Reports</h3>
                        <p className="text-3xl font-bold text-yellow-600">{dashboardData.reports.pending || 0}</p>
                      </div>
                      <div className="bg-white rounded-xl p-6 shadow-lg">
                        <h3 className="text-gray-600 text-sm mb-2">Ready Reports</h3>
                        <p className="text-3xl font-bold text-green-600">{dashboardData.reports.ready || 0}</p>
                      </div>
                    </>
                  )}
                  {user?.permissions?.canViewAppointments && dashboardData.appointments && (
                    <div className="bg-white rounded-xl p-6 shadow-lg">
                      <h3 className="text-gray-600 text-sm mb-2">Total Appointments</h3>
                      <p className="text-3xl font-bold text-purple-600">{dashboardData.appointments.total || 0}</p>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
                  <h3 className="text-xl font-bold mb-4">Your Permissions</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <i className={`fas ${user?.permissions?.canManageReports ? 'fa-check-circle text-green-600' : 'fa-times-circle text-red-600'}`}></i>
                      <span>Manage Reports</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <i className={`fas ${user?.permissions?.canViewAppointments ? 'fa-check-circle text-green-600' : 'fa-times-circle text-red-600'}`}></i>
                      <span>View Appointments</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <i className={`fas ${user?.permissions?.canManageAppointments ? 'fa-check-circle text-green-600' : 'fa-times-circle text-red-600'}`}></i>
                      <span>Manage Appointments</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <i className={`fas ${user?.permissions?.canViewStats ? 'fa-check-circle text-green-600' : 'fa-times-circle text-red-600'}`}></i>
                      <span>View Statistics</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {user?.permissions?.canManageReports && (
                      <button
                        onClick={() => setActiveTab('reports')}
                        className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl hover:shadow-lg transition text-left"
                      >
                        <i className="fas fa-file-medical text-blue-600 text-xl mb-2"></i>
                        <h4 className="font-semibold">Manage Reports</h4>
                        <p className="text-sm text-gray-600 mt-1">Update report status</p>
                      </button>
                    )}
                    {user?.permissions?.canViewAppointments && (
                      <button
                        onClick={() => setActiveTab('appointments')}
                        className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl hover:shadow-lg transition text-left"
                      >
                        <i className="fas fa-calendar-check text-green-600 text-xl mb-2"></i>
                        <h4 className="font-semibold">View Appointments</h4>
                        <p className="text-sm text-gray-600 mt-1">Check patient bookings</p>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h2 className="text-2xl font-bold mb-6">Medical Reports Management</h2>
                {user?.permissions?.canManageReports ? (
                  <div className="space-y-4">
                    {reports.map((report) => (
                      <div key={report._id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <p className="font-semibold">{report.patientName} ({report.patientId})</p>
                            <p className="text-sm text-gray-600">{report.reportType}</p>
                            <p className="text-sm text-gray-500">Test Date: {new Date(report.testDate).toLocaleDateString()}</p>
                            {report.notes && <p className="text-sm text-gray-600 mt-2">Notes: {report.notes}</p>}
                            {report.pdfUrl && (
                              <p className="text-sm text-green-600 mt-2 flex items-center">
                                <i className="fas fa-file-pdf mr-1"></i>PDF Report Available
                              </p>
                            )}
                          </div>
                          <select
                            value={report.status}
                            onChange={(e) => updateReportStatus(report._id, e.target.value)}
                            className="px-3 py-1 rounded border text-sm"
                          >
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
                                    loadData();
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
                    {reports.length === 0 && (
                      <p className="text-center text-gray-500 py-8">No reports found</p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <i className="fas fa-lock text-gray-300 text-5xl mb-4"></i>
                    <p className="text-gray-600">You don't have permission to manage reports</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'appointments' && (
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h2 className="text-2xl font-bold mb-6">Appointments</h2>
                {user?.permissions?.canViewAppointments ? (
                  <div className="space-y-4">
                    {appointments.map((appt) => (
                      <div key={appt._id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold">{appt.patientName}</p>
                            <p className="text-sm text-gray-600">{appt.service}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(appt.date).toLocaleDateString()} at {appt.time}
                            </p>
                            <p className="text-sm text-gray-500">{appt.email} | {appt.phone}</p>
                          </div>
                          {user?.permissions?.canManageAppointments ? (
                            <select
                              value={appt.status}
                              onChange={(e) => updateAppointmentStatus(appt._id, e.target.value)}
                              className="px-3 py-1 rounded border text-sm"
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          ) : (
                            <span
                              className={`px-3 py-1 rounded-full text-xs ${
                                appt.status === 'confirmed'
                                  ? 'bg-green-100 text-green-700'
                                  : appt.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {appt.status}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    {appointments.length === 0 && (
                      <p className="text-center text-gray-500 py-8">No appointments found</p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <i className="fas fa-lock text-gray-300 text-5xl mb-4"></i>
                    <p className="text-gray-600">You don't have permission to view appointments</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default InchargePanel;
