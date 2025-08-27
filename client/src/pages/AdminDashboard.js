import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { sendLeaseNotification } from '../utils/emailjs';
import axios from 'axios';
import {
  Users, FileText, Search, Eye, Download, Calendar, 
  Phone, Mail, MapPin, UserCheck, Clock, CheckCircle,
  XCircle, AlertCircle, LogOut, Shield, DollarSign
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showLeaseModal, setShowLeaseModal] = useState(false);
  const [leaseFormData, setLeaseFormData] = useState({
    leaseStartDate: '',
    leaseEndDate: '',
    rentalAmount: 2500,
    depositAmount: 500
  });
  const [selectedApplicationForLease, setSelectedApplicationForLease] = useState(null);
  const [leaseContent, setLeaseContent] = useState('');
  const [leaseGenerated, setLeaseGenerated] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/admin/login');
      return;
    }
    loadApplications();
  }, [user, navigate]);

  const loadApplications = async () => {
    try {
      const response = await fetch('/api/application/admin/all', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications || []);
      } else {
        toast.error('Failed to load applications');
      }
    } catch (error) {
      console.error('Error loading applications:', error);
      toast.error('Error loading applications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
    toast.success('Logged out successfully');
  };

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

  const generateLease = async (application) => {
    setSelectedApplicationForLease(application);
    setShowLeaseModal(true);
  };

  const refreshSelectedApplication = async (applicationId) => {
    try {
      const response = await fetch(`/api/application/admin/${applicationId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSelectedApplication(data.application);
      }
    } catch (error) {
      console.error('Error refreshing application:', error);
    }
  };

  const handleViewApplication = async (application) => {
    await refreshSelectedApplication(application._id);
    setSelectedApplication(application);
  };

  const handleLeaseSubmit = async (e) => {
    e.preventDefault();
    
    if (!leaseFormData.leaseStartDate || !leaseFormData.leaseEndDate || !leaseFormData.rentalAmount) {
      toast.error('Please fill in all lease details');
      return;
    }

    try {
      const response = await fetch('/api/lease/admin/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          applicationId: selectedApplicationForLease._id,
          leaseStartDate: leaseFormData.leaseStartDate,
          leaseEndDate: leaseFormData.leaseEndDate,
          rentalAmount: parseInt(leaseFormData.rentalAmount),
          depositAmount: parseInt(leaseFormData.depositAmount)
        })
      });

      if (response.ok) {
        const data = await response.json();
        setLeaseContent(data.leaseAgreement);
        setLeaseGenerated(true);
        toast.success('Lease agreement generated successfully!');
        
        await loadApplications();
        
        if (selectedApplication && selectedApplication._id === selectedApplicationForLease._id) {
          const updatedApp = {
            ...selectedApplication,
            leaseStartDate: leaseFormData.leaseStartDate,
            leaseEndDate: leaseFormData.leaseEndDate,
            rentalAmount: parseInt(leaseFormData.rentalAmount),
            depositAmount: parseInt(leaseFormData.depositAmount)
          };
          setSelectedApplication(updatedApp);
          
          setApplications(prevApps => 
            prevApps.map(app => 
              app._id === selectedApplicationForLease._id 
                ? updatedApp 
                : app
            )
          );
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to generate lease');
      }
    } catch (error) {
      console.error('Error generating lease:', error);
      toast.error('Error generating lease');
    }
  };

  const viewLease = () => {
    if (!leaseContent) {
      toast.error('No lease content available. Please generate the lease first.');
      return;
    }
    
    const newWindow = window.open('', '_blank');
    newWindow.document.write(`
      <html>
        <head>
          <title>Lease Agreement - ${selectedApplicationForLease.firstName} ${selectedApplicationForLease.lastName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
            pre { white-space: pre-wrap; font-family: inherit; }
          </style>
        </head>
        <body>
          <h1>Lease Agreement</h1>
          <pre>${leaseContent}</pre>
        </body>
      </html>
    `);
    newWindow.document.close();
  };

  const downloadLease = () => {
    const blob = new Blob([leaseContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `lease-agreement-${selectedApplicationForLease.firstName}-${selectedApplicationForLease.lastName}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    toast.success('Lease downloaded successfully!');
  };

  const sendLeaseEmail = async (sendToManager = false) => {
    try {
      const leaseData = {
        firstName: selectedApplicationForLease.firstName,
        lastName: selectedApplicationForLease.lastName,
        leaseStartDate: leaseFormData.leaseStartDate,
        leaseEndDate: leaseFormData.leaseEndDate,
        rentalAmount: leaseFormData.rentalAmount,
        depositAmount: leaseFormData.depositAmount,
        tenantEmail: sendToManager ? 'palmrunbeachcondo@gmail.com' : selectedApplicationForLease.userId?.email,
        leaseContent: leaseContent
      };

      const result = await sendLeaseNotification(leaseData);
      
      if (result.success) {
        const recipient = sendToManager ? 'manager' : 'tenant';
        toast.success(`Lease notification email sent successfully to ${recipient}!`);
      } else {
        toast.error(`Failed to send email: ${result.error}`);
      }
    } catch (error) {
      console.error('Error sending lease email:', error);
      toast.error('Error sending lease email');
    }
  };

  const viewSignedLease = async (applicationId) => {
    try {
      const response = await axios.get(`/api/lease/view-signed/${applicationId}`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error('Error viewing signed lease:', error);
      toast.error('Error viewing signed lease');
    }
  };

  const resetLeaseModal = () => {
    setShowLeaseModal(false);
    setSelectedApplicationForLease(null);
    setLeaseFormData({
      leaseStartDate: '',
      leaseEndDate: '',
      rentalAmount: 2500,
      depositAmount: 500
    });
    setLeaseContent('');
    setLeaseGenerated(false);
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.phone.includes(searchTerm) ||
      (app.userId?.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || app.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'completed': return <UserCheck className="h-4 w-4 text-blue-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (status) {
      case 'pending': return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'approved': return `${baseClasses} bg-green-100 text-green-800`;
      case 'rejected': return `${baseClasses} bg-red-100 text-red-800`;
      case 'completed': return `${baseClasses} bg-blue-100 text-blue-800`;
      default: return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    
    try {
      let dateObj;
      if (typeof dateString === 'string') {
        if (dateString.includes('-')) {
          const [year, month, day] = dateString.split('-').map(Number);
          dateObj = new Date(year, month - 1, day);
        } else {
          dateObj = new Date(dateString);
        }
      } else {
        dateObj = new Date(dateString);
      }
      
      if (isNaN(dateObj.getTime())) {
        return 'Invalid Date';
      }
      
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-red-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">Palm Run LLC Property Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Welcome, {user?.email}</span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-600 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-gray-400" />
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

          <div className="bg-white overflow-hidden shadow rounded-lg">
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

          <div className="bg-white overflow-hidden shadow rounded-lg">
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

          <div className="bg-white overflow-hidden shadow rounded-lg">
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
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-red-500 focus:border-red-500"
                    placeholder="Search by name, email, or phone..."
                  />
                </div>
              </div>
              <div className="sm:w-48">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
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

        {/* Applications List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredApplications.length === 0 ? (
              <li className="px-6 py-12 text-center text-gray-500">
                No applications found matching your criteria.
              </li>
            ) : (
              filteredApplications.map((application) => (
                <li key={application._id}>
                  <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {application.firstName[0]}{application.lastName[0]}
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {application.firstName} {application.lastName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {application.userId?.email || 'No email'}
                          </p>
                          {application.rentalAmount && (
                            <p className="text-sm text-gray-500">
                              Monthly Rent: ${application.rentalAmount.toLocaleString()}
                            </p>
                          )}
                          <div className="flex items-center mt-1">
                            {getStatusIcon(application.status)}
                            <span className={getStatusBadge(application.status)}>
                              {application.status}
                            </span>
                            {application.signedLeaseFile && (
                              <div className="ml-2 flex items-center">
                                <svg className="h-4 w-4 text-green-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span className="text-xs text-green-600 font-medium">Signed</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewApplication(application)}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </button>
                        {application.status === 'approved' && (
                          <button
                            onClick={() => generateLease(application)}
                            className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Generate Lease
                          </button>
                        )}
                        {application.signedLeaseFile && (
                          <button
                            onClick={() => viewSignedLease(application._id)}
                            className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Signed Lease
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      {/* Application Detail Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Application Details
                </h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => refreshSelectedApplication(selectedApplication._id)}
                    className="text-gray-400 hover:text-gray-600 p-1"
                    title="Refresh data"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setSelectedApplication(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-900 border-b pb-2">
                    Personal Information
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <UserCheck className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm">
                        <strong>Name:</strong> {selectedApplication.firstName} {selectedApplication.lastName}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm">
                        <strong>Email:</strong> {selectedApplication.userId?.email || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm">
                        <strong>Phone:</strong> {selectedApplication.phone}
                      </span>
                    </div>
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                      <span className="text-sm">
                        <strong>Address:</strong><br />
                        {selectedApplication.fullAddress}
                      </span>
                    </div>
                    {selectedApplication.rentalAmount && (
                      <div className="flex items-center">
                        <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm">
                          <strong>Monthly Rent:</strong> ${selectedApplication.rentalAmount.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Application Status */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-900 border-b pb-2">
                    Application Status
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm">
                        <strong>Submitted:</strong> {formatDate(selectedApplication.submittedAt)}
                      </span>
                    </div>
                    <div className="flex items-center">
                      {getStatusIcon(selectedApplication.status)}
                      <span className="text-sm ml-2">
                        <strong>Status:</strong> 
                        <span className={`ml-2 ${getStatusBadge(selectedApplication.status)}`}>
                          {selectedApplication.status}
                        </span>
                      </span>
                    </div>
                    {selectedApplication.signedLeaseFile && (
                      <div className="flex items-center">
                        <svg className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm">
                          <strong>Lease Signed:</strong> 
                          <span className="text-green-600 ml-2">{formatDate(selectedApplication.signedLeaseFile.uploadedAt)}</span>
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Update Status:
                    </label>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => updateApplicationStatus(selectedApplication._id, 'approved')}
                        className="px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => updateApplicationStatus(selectedApplication._id, 'rejected')}
                        className="px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => updateApplicationStatus(selectedApplication._id, 'completed')}
                        className="px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Complete
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lease Information */}
              {(selectedApplication.leaseStartDate || selectedApplication.leaseEndDate || selectedApplication.rentalAmount) && (
                <div className="mt-6">
                  <h4 className="text-md font-medium text-gray-900 border-b pb-2 mb-4">
                    Lease Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedApplication.leaseStartDate && (
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm">
                          <strong>Start Date:</strong> {formatDate(selectedApplication.leaseStartDate)}
                        </span>
                      </div>
                    )}
                    {selectedApplication.leaseEndDate && (
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm">
                          <strong>End Date:</strong> {formatDate(selectedApplication.leaseEndDate)}
                        </span>
                      </div>
                    )}
                    {selectedApplication.rentalAmount && (
                      <div className="flex items-center">
                        <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm">
                          <strong>Monthly Rent:</strong> ${selectedApplication.rentalAmount.toLocaleString()}
                        </span>
                      </div>
                    )}
                    {selectedApplication.signedLeaseFile && (
                      <div className="flex items-center">
                        <svg className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm">
                          <strong>Signed Lease:</strong> 
                          <span className="text-green-600 ml-1">Uploaded</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Signed Lease Notification */}
              {selectedApplication.signedLeaseFile && (
                <div className="mt-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-green-800">
                          Signed Lease Uploaded!
                        </h4>
                        <div className="mt-2 text-sm text-green-700">
                          <p>The tenant has uploaded their signed lease agreement.</p>
                          <div className="mt-2 flex items-center space-x-2">
                            <span className="text-xs text-green-600">
                              File: {selectedApplication.signedLeaseFile.originalName}
                            </span>
                            <span className="text-xs text-green-600">
                              Uploaded: {formatDate(selectedApplication.signedLeaseFile.uploadedAt)}
                            </span>
                          </div>
                        </div>
                        <div className="mt-3">
                          <button
                            onClick={() => viewSignedLease(selectedApplication._id)}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Signed Lease
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Additional Guests */}
              {selectedApplication.additionalGuests && selectedApplication.additionalGuests.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-md font-medium text-gray-900 border-b pb-2 mb-4">
                    Additional Guests ({selectedApplication.additionalGuests.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedApplication.additionalGuests.map((guest, index) => (
                      <div key={index} className="border border-gray-200 rounded p-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">
                            {guest.firstName} {guest.lastName}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs ${guest.isAdult ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                            {guest.isAdult ? 'Adult' : 'Child'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
                {selectedApplication.status === 'approved' && (
                  <button
                    onClick={() => generateLease(selectedApplication)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Generate Lease Agreement
                  </button>
                )}
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lease Generation Modal */}
      {showLeaseModal && selectedApplicationForLease && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  {leaseGenerated ? 'Lease Generated Successfully' : 'Generate Lease Agreement'}
                </h3>
                <button
                  onClick={resetLeaseModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  {leaseGenerated ? 'Lease for:' : 'Generating lease for:'} <strong>{selectedApplicationForLease.firstName} {selectedApplicationForLease.lastName}</strong>
                </p>
              </div>

              {!leaseGenerated ? (
                <form onSubmit={handleLeaseSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lease Start Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={leaseFormData.leaseStartDate}
                      onChange={(e) => setLeaseFormData(prev => ({ ...prev, leaseStartDate: e.target.value }))}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lease End Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={leaseFormData.leaseEndDate}
                      onChange={(e) => setLeaseFormData(prev => ({ ...prev, leaseEndDate: e.target.value }))}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Monthly Rental Amount ($) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="100"
                      value={leaseFormData.rentalAmount}
                      onChange={(e) => setLeaseFormData(prev => ({ ...prev, rentalAmount: parseInt(e.target.value) || 0 }))}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Security Deposit Amount ($) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="100"
                      value={leaseFormData.depositAmount}
                      onChange={(e) => setLeaseFormData(prev => ({ ...prev, depositAmount: parseInt(e.target.value) || 0 }))}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={resetLeaseModal}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Generate Lease
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-md p-4">
                    <p className="text-sm text-green-800">
                      Lease agreement has been generated successfully! You can now view, download, or send it via email.
                    </p>
                  </div>
                  
                  <div className="flex flex-col space-y-3">
                    <button
                      onClick={viewLease}
                      className="flex items-center justify-center space-x-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View Lease</span>
                    </button>
                    
                    <button
                      onClick={downloadLease}
                      className="flex items-center justify-center space-x-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download Lease</span>
                    </button>
                    
                    <button
                      onClick={sendLeaseEmail}
                      className="flex items-center justify-center space-x-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                      <Mail className="h-4 w-4" />
                      <span>Send to Tenant</span>
                    </button>
                    
                    <button
                      onClick={() => sendLeaseEmail(true)}
                      className="flex items-center justify-center space-x-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                    >
                      <Mail className="h-4 w-4" />
                      <span>Send to Manager</span>
                    </button>
                  </div>
                  
                  <div className="flex justify-end pt-4">
                    <button
                      onClick={resetLeaseModal}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
