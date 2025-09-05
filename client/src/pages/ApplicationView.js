import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import { 
  User, 
  MapPin, 
  Phone, 
  Users, 
  FileText,
  ArrowLeft,
  Mail,
  Calendar,
  DollarSign,
  CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const ApplicationView = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const fetchApplication = async () => {
      try {
        const response = await fetch(`/api/application/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setApplication(data.application);
        } else {
          toast.error('Application not found');
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Error loading application:', error);
        toast.error('Failed to load application');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [user, id, navigate]);

  // Check if user is authenticated
  if (!user) {
    navigate('/login');
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Application not found</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-blue-600 bg-blue-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      case 'completed':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Submitted';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Declined';
      case 'completed':
        return 'Complete';
      default:
        return 'Unknown';
    }
  };

  const formatDate = (value) => {
    if (!value) return 'Not set';

    // If it's already a Date instance
    if (value instanceof Date) {
      if (isNaN(value.getTime())) return 'Invalid Date';
      return value.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }

    // If it's a number (timestamp) or string (ISO) – let Date handle it
    const d = new Date(value);
    if (isNaN(d.getTime())) return 'Invalid Date';

    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="pt-16 bg-gray-50 min-h-screen py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Application Details</h1>
              <p className="text-gray-600 mt-2">
                View your rental application information
              </p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-secondary flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Application Information */}
          <div className="lg:col-span-2">
            <div className="card">
              {/* Personal Information Section */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-600" />
                  Personal Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Name</p>
                      <p className="text-gray-600">{application.firstName} {application.lastName}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Email</p>
                      <p className="text-gray-600">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Phone</p>
                      <p className="text-gray-600">{application.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Address</p>
                      <p className="text-gray-600">
                        {application.address?.street}, {application.address?.city}, {application.address?.state} {application.address?.zipCode}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                                              <p className="text-sm font-medium text-gray-900">Requested Dates</p>
                      <p className="text-gray-600">
                                  {application.requestedStartDate && application.requestedEndDate 
              ? `${new Date(application.requestedStartDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} - ${new Date(application.requestedEndDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
              : 'Not specified'
            }
                    </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Guests Section */}
              {application.additionalGuests && application.additionalGuests.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <Users className="h-5 w-5 mr-2 text-blue-600" />
                    Additional Guests
                  </h3>

                  <div className="space-y-4">
                    {application.additionalGuests.map((guest, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-4">Guest {index + 1}</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center space-x-3">
                            <User className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">First Name</p>
                              <p className="text-gray-600">{guest.firstName}</p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <User className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">Last Name</p>
                              <p className="text-gray-600">{guest.lastName}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            guest.isAdult ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {guest.isAdult ? 'Adult (18+)' : 'Minor'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lease Information Section - Will populate when admin creates lease */}
              {application.leaseDetails && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-blue-600" />
                    Lease Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Start Date</p>
                        <p className="text-gray-600">{application.leaseDetails?.startDate || 'Not set'}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">End Date</p>
                        <p className="text-gray-600">{application.leaseDetails?.endDate || 'Not set'}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <DollarSign className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Monthly Rent</p>
                        <p className="text-gray-600">{application.leaseDetails?.monthlyRent || 'Not set'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Application Status */}
          <div className="lg:col-span-1">
            <div className="card">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-blue-600" />
                Application Status
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Status:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                    {getStatusText(application.status)}
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Submitted</p>
                    <p className="text-gray-600">{formatDate(application.submittedAt)}</p>
                  </div>
                </div>



                {application.notes && (
                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Admin Notes:</h4>
                    <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
                      {application.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="card mt-6">
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full btn-secondary"
                >
                  Back to Dashboard
                </button>
                <button
                  onClick={() => navigate('/application')}
                  className="w-full btn-primary flex items-center justify-center"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  New Application
                </button>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationView;
