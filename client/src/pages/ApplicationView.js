import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  User, 
  MapPin, 
  Phone, 
  Users, 
  FileText,
  ArrowLeft
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
      default:
        return 'Unknown';
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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

        {/* Application Status */}
        <div className="card mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Application Status</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
              {getStatusText(application.status)}
            </span>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Created:</span>
              <span className="ml-2 text-gray-600">{formatDate(application.createdAt)}</span>
            </div>
            {application.submittedAt && (
              <div>
                <span className="font-medium text-gray-700">Submitted:</span>
                <span className="ml-2 text-gray-600">{formatDate(application.submittedAt)}</span>
              </div>
            )}
            {application.reviewedAt && (
              <div>
                <span className="font-medium text-gray-700">Reviewed:</span>
                <span className="ml-2 text-gray-600">{formatDate(application.reviewedAt)}</span>
              </div>
            )}
          </div>
          {application.notes && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Admin Notes:</h4>
              <p className="text-sm text-blue-800">{application.notes}</p>
            </div>
          )}
        </div>

        <div className="card">
          {/* Personal Information Section */}
          <div className="form-section">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <User className="h-5 w-5 mr-2 text-blue-600" />
              Personal Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label className="form-label">First Name</label>
                <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md border">
                  {application.firstName}
                </p>
              </div>

              <div className="form-group">
                <label className="form-label">Last Name</label>
                <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md border">
                  {application.lastName}
                </p>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md border">
                {application.phone}
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">Requested Start Month</label>
              <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md border">
                {application.requestedMonths || 'Not specified'}
              </p>
            </div>
          </div>

          {/* Current Address Section */}
          <div className="form-section">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-blue-600" />
              Current Address
            </h3>
            
            <div className="form-group">
              <label className="form-label">Street Address</label>
              <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md border">
                {application.address?.street}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="form-group">
                <label className="form-label">City</label>
                <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md border">
                  {application.address?.city}
                </p>
              </div>

              <div className="form-group">
                <label className="form-label">State</label>
                <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md border">
                  {application.address?.state}
                </p>
              </div>

              <div className="form-group">
                <label className="form-label">ZIP Code</label>
                <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md border">
                  {application.address?.zipCode}
                </p>
              </div>
            </div>
          </div>

          {/* Additional Guests Section */}
          {application.additionalGuests && application.additionalGuests.length > 0 && (
            <div className="form-section">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-600" />
                Additional Guests
              </h3>

              <div className="space-y-4">
                {application.additionalGuests.map((guest, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Guest {index + 1}</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="form-group">
                        <label className="form-label">First Name</label>
                        <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md border">
                          {guest.firstName}
                        </p>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Last Name</label>
                        <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md border">
                          {guest.lastName}
                        </p>
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

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-secondary"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => navigate('/application')}
              className="btn-primary flex items-center"
            >
              <FileText className="h-4 w-4 mr-2" />
              New Application
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationView;
