import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AdminProgressBar from '../components/AdminProgressBar';
import ApplicationDetailModal from '../components/admin/ApplicationDetailModal';
import {
  Users, FileText, Search, Eye, Calendar, 
  Clock, CheckCircle, LogOut, DollarSign, Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getStatusIcon, getStatusBadge, formatDate } from '../utils/adminHelpers';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/admin/login');
      return;
    }
    loadApplications();
  }, [user, navigate]);

  const loadApplications = async () => {
    try {
      const response = await fetch('/api/application/admin', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications);
      }
    } catch (error) {
      console.error('Error loading applications:', error);
      toast.error('Error loading applications');
    } finally {
      setIsLoading(false);
    }
  };

  // Application management functions
  const updateApplicationStatus = async (applicationId, newStatus) => {
    try {
      const response = await fetch(`/api/application/admin/${applicationId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        toast.success('Application status updated');
        loadApplications();
        if (selectedApplication && selectedApplication._id === applicationId) {
          setSelectedApplication(prev => ({ ...prev, status: newStatus }));
        }
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Error updating status');
    }
  };

  const updateApplicationProgress = async (applicationId, updates) => {
    try {
      const response = await fetch(`/api/application/admin/${applicationId}/progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        toast.success('Progress updated successfully');
        loadApplications();
        if (selectedApplication && selectedApplication._id === applicationId) {
          setSelectedApplication(prev => ({ ...prev, ...updates }));
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to update progress');
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('Error updating progress');
    }
  };

  const handleViewApplication = async (application) => {
    try {
      const response = await fetch(`/api/application/admin/${application._id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSelectedApplication(data.application);
      } else {
        setSelectedApplication(application);
      }
    } catch (error) {
      console.error('Error fetching application details:', error);
      setSelectedApplication(application);
    }
  };

  const deleteApplication = async (applicationId) => {
    if (!window.confirm('Are you sure you want to delete this application? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/application/admin/${applicationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        toast.success('Application deleted successfully');
        setApplications(prevApps => prevApps.filter(app => app._id !== applicationId));
        if (selectedApplication && selectedApplication._id === applicationId) {
          setSelectedApplication(null);
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to delete application');
      }
    } catch (error) {
      console.error('Error deleting application:', error);
      toast.error('Error deleting application');
    }
  };

  // Placeholder functions for modal actions
  const generateLease = (application) => {
    toast.info('Lease generation feature coming soon');
  };

  const reviewDocuments = (application) => {
    toast.info('Document review feature coming soon');
  };

  const handleTransferAmount = (application) => {
    toast.info('Transfer amount feature coming soon');
  };

  // Placeholder functions for editing
  const handleEditApplication = () => {
    toast.info('Application editing feature coming soon');
  };

  const handleCancelEditApplication = () => {
    toast.info('Application editing feature coming soon');
  };

  const handleApplicationInputChange = (field, value) => {
    toast.info('Application editing feature coming soon');
  };

  const handleSaveApplicationEdit = async () => {
    toast.info('Application editing feature coming soon');
  };

  // Utility functions
  const handleLogout = () => {
    logout();
    navigate('/admin/login');
    toast.success('Logged out successfully');
  };

  const filteredApplications = applications.filter(application => {
    const matchesSearch = application.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         application.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         application.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || application.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* Hero header to match site */}
      <section className="relative pt-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <video className="w-full h-64 md:h-60 object-cover object-center" poster="/images/image1.jpg" autoPlay muted loop playsInline>
            <source src="/videos/beach-video.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="relative z-10">
          <div className="w-full px-4 sm:px-6 lg:px-10 py-4 md:py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex items-center">
                <div className="mr-3">
                  <svg className="h-6 w-6 md:h-8 md:w-8" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-label="Palm Run logo">
                    <path d="M34 28 C33 40 32 50 32 60 L28 60 C28 50 29 40 30 28 Z" fill="#8B5A2B"/>
                    <path d="M29 34 H33 M28.8 38 H32.6 M28.6 42 H32.4 M28.4 46 H32.2 M28.2 50 H32" stroke="#A87444" strokeWidth="1.6" strokeLinecap="round"/>
                    <circle cx="31" cy="28" r="2.2" fill="#6B4423"/>
                    <circle cx="35" cy="27" r="2" fill="#6B4423"/>
                    <path d="M32 20 C22 12, 13 15, 8 20 C16 20, 24 22, 32 24 Z" fill="#1E9E57"/>
                    <path d="M32 20 C26 10, 20 10, 14 12 C20 14, 26 18, 32 22 Z" fill="#26B36A"/>
                    <path d="M32 20 C42 12, 51 15, 56 20 C48 20, 40 22, 32 24 Z" fill="#1E9E57"/>
                    <path d="M32 20 C38 10, 44 10, 50 12 C44 14, 38 18, 32 22 Z" fill="#26B36A"/>
                    <path d="M32 20 C30 12, 32 8, 36 6 C34 10, 34 16, 32 20 Z" fill="#1E9E57"/>
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white">Admin Dashboard</h1>
                  <p className="text-sm md:text-base text-gray-200">Property Management</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <span className="text-xs md:text-sm text-gray-200 truncate">Welcome, {user?.email}</span>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center px-3 py-2 rounded-md text-xs md:text-sm font-medium text-white bg-white/20 hover:bg-white/30 border border-white/30 backdrop-blur-md w-full sm:w-auto"
                >
                  <LogOut className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="w-full px-4 sm:px-6 lg:px-10 py-4 md:py-8 -mt-2 md:mt-0">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/90 backdrop-blur-md border border-white/30 overflow-hidden shadow-medium rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Applications
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {applications.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-md border border-white/30 overflow-hidden shadow-medium rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Pending Review
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {applications.filter(app => app.status === 'pending').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-md border border-white/30 overflow-hidden shadow-medium rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Approved
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {applications.filter(app => app.status === 'approved').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-md border border-white/30 overflow-hidden shadow-medium rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FileText className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Completed
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {applications.filter(app => app.status === 'completed').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white/90 backdrop-blur-md border border-white/30 shadow-medium rounded-lg mb-6">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex-1 max-w-lg">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search applications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/90 backdrop-blur-md border border-white/30 shadow-medium rounded-lg mb-6">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => toast.info('Rates management feature coming soon')}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Manage Rates
              </button>
              <button
                onClick={() => toast.info('Availability management feature coming soon')}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Manage Availability
              </button>
            </div>
          </div>
        </div>

        {/* Applications List */}
        <div className="bg-white/90 backdrop-blur-md border border-white/30 shadow-medium overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Applications ({filteredApplications.length})
            </h3>
            {filteredApplications.length === 0 ? (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No applications</h3>
                <p className="mt-1 text-sm text-gray-500">No applications match your current filters.</p>
              </div>
            ) : (
              <ul className="space-y-4">
                {filteredApplications.map((application) => (
                  <li key={application._id} className="bg-white border border-gray-200 rounded-lg shadow-sm">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              {getStatusIcon(application.status)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {application.firstName} {application.lastName}
                                {application.applicationNumber && (
                                  <span className="ml-2 text-blue-600 font-semibold">
                                    ({application.applicationNumber})
                                  </span>
                                )}
                              </p>
                              <p className="text-sm text-gray-500 truncate">
                                {application.userId?.email || application.email}
                              </p>
                              <div className="mt-1 flex items-center space-x-2">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(application.status)}`}>
                                  {application.status}
                                </span>
                                <span className="text-xs text-gray-500">
                                  Submitted {formatDate(application.submittedAt || application.createdAt)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => handleViewApplication(application)}
                            className="inline-flex items-center px-2 py-1 md:px-3 md:py-2 border border-gray-300 shadow-sm text-xs md:text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            <Eye className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                            <span className="hidden sm:inline">View</span>
                          </button>
                          {application.documents && application.documents.length > 0 && (
                            <button
                              onClick={() => reviewDocuments(application)}
                              className="inline-flex items-center px-2 py-1 md:px-3 md:py-2 border border-transparent shadow-sm text-xs md:text-sm leading-4 font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                            >
                              <FileText className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                              <span className="hidden sm:inline">Review Documents ({application.documents.length})</span>
                            </button>
                          )}
                          <button
                            onClick={() => deleteApplication(application._id)}
                            className="inline-flex items-center px-2 py-1 md:px-3 md:py-2 border border-transparent shadow-sm text-xs md:text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-offset-2 focus:ring-red-500"
                          >
                            <Trash2 className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                            <span className="hidden sm:inline">Delete</span>
                          </button>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="mt-4">
                        <AdminProgressBar 
                          application={application} 
                          onProgressUpdate={updateApplicationProgress}
                        />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Application Detail Modal */}
      <ApplicationDetailModal
        selectedApplication={selectedApplication}
        setSelectedApplication={setSelectedApplication}
        isEditingApplication={false}
        setIsEditingApplication={() => {}}
        editApplicationData={{}}
        setEditApplicationData={() => {}}
        savingApplication={false}
        setSavingApplication={() => {}}
        handleEditApplication={handleEditApplication}
        handleCancelEditApplication={handleCancelEditApplication}
        handleApplicationInputChange={handleApplicationInputChange}
        handleSaveApplicationEdit={handleSaveApplicationEdit}
        updateApplicationStatus={updateApplicationStatus}
        reviewDocuments={reviewDocuments}
        generateLease={generateLease}
        handleTransferAmount={handleTransferAmount}
        deleteApplication={deleteApplication}
      />

      {/* TODO: Add other modals here */}
    </div>
  );
};

export default AdminDashboard;
