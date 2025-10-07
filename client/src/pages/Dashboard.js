import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  FileText, 
  Plus,
  ArrowRight,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Settings
} from 'lucide-react';
import axios from 'axios';
import CompletionStatus from '../components/CompletionStatus';
import TenantSettings from '../components/TenantSettings';

const Dashboard = () => {
  const { user } = useAuth();
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  const fetchDashboardData = async () => {
    try {
      console.log('Fetching dashboard data...');
      const applicationRes = await axios.get('/api/application/status');
      setApplicationStatus(applicationRes.data);
      
      // Clear the payment success flag after successful data fetch
      sessionStorage.removeItem('paymentSuccessReturn');
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      }
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    // Check if we're returning from a payment success page
    const isReturningFromPayment = sessionStorage.getItem('paymentSuccessReturn');
    
    fetchDashboardData();
    
    // If returning from payment, do an immediate additional refresh to ensure we have the latest data
    if (isReturningFromPayment) {
      setTimeout(() => {
        fetchDashboardData();
      }, 500); // Small delay to ensure the first request completes
    }
    
    // Set up periodic refresh every 10 seconds for real-time updates
    const interval = setInterval(fetchDashboardData, 10000);
    
    return () => clearInterval(interval);
  }, []);

  // Refresh data when component becomes visible (e.g., returning from payment success)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Component became visible, refresh data to catch any updates
        fetchDashboardData();
      }
    };

    const handleFocus = () => {
      // Page regained focus, refresh data
      fetchDashboardData();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
      case 'succeeded':
        return 'text-green-600 bg-green-100';
      case 'completed':
        return 'text-blue-600 bg-blue-100';
      case 'pending':
        return 'text-green-600 bg-green-100';
      case 'processing':
        return 'text-yellow-600 bg-yellow-100';
      case 'rejected':
      case 'failed':
        return 'text-red-600 bg-red-100';
      case 'not_started':
        return 'text-gray-600 bg-gray-100';
      case 'no_application':
        return 'text-gray-600 bg-gray-100';
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
      case 'not_started':
        return 'Start';
      default:
        return 'Start';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* Hero header */}
      <section className="relative pt-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <video className="w-full h-32 sm:h-40 md:h-48 object-cover object-center" poster="/images/image1.jpg" autoPlay muted loop playsInline>
            <source src="/videos/beach-video.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/40" />
        </div>
        <div className="relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1">
                <div className="p-4 sm:p-6">
                  <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white leading-tight drop-shadow-2xl">
                    Welcome back, {user?.firstName || user?.email || 'Guest'}!
                  </h1>
                  <p className="text-sm sm:text-base text-gray-100 mt-1 md:mt-2 drop-shadow-lg">
                    Manage your rental applications and bookings
                  </p>
                </div>
              </div>
              <div className="flex-shrink-0">
                <button
                  onClick={() => setShowSettings(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors border border-white/20"
                  title="Account Settings"
                >
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Settings</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="min-h-screen py-6 md:py-8 bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Applications Section */}
          {applicationStatus?.hasApplications ? (
            <>
              {/* Quick Actions - Only show when user has applications */}
              <div className="mb-6 md:mb-8">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <Link
                    to="/application"
                    className="flex items-center justify-center px-5 py-3 sm:px-6 sm:py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 font-medium"
                  >
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    <span>New Application</span>
                  </Link>
                </div>
              </div>
              
              <div className="mb-6 md:mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Your Applications</h2>
              <div className="space-y-3 sm:space-y-4">
                {applicationStatus.applications && applicationStatus.applications.length > 0 ? (
                  applicationStatus.applications.map((application) => (
                    <div key={application._id || application.id} className="bg-white/95 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200/50 hover:shadow-md hover:border-primary-200/50 transition-all duration-200">
                      {/* Ultra-Compact Application Card */}
                      <div className="p-3 sm:p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                          {/* Left Section - Date and Status */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                              <Calendar className="w-4 h-4 text-primary-600 flex-shrink-0" />
                              <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                                {application.requestedStartDate && application.requestedEndDate 
                                  ? `${new Date(application.requestedStartDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(application.requestedEndDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                                  : 'Rental Period'
                                }
                              </h3>
                            </div>
                            <div className="flex flex-col xs:flex-row xs:items-center gap-1.5 xs:gap-3">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium w-fit ${getStatusColor(application.status === 'completed' ? 'completed' : application.status)}`}>
                                {application.status === 'completed' ? <CheckCircle className="w-3 h-3 mr-1" /> : 
                                 application.status === 'rejected' ? <AlertCircle className="w-3 h-3 mr-1" /> :
                                 <Clock className="w-3 h-3 mr-1" />}
                                {getStatusText(application.status === 'completed' ? 'completed' : application.status)}
                              </span>
                              {application.submittedAt && (
                                <span className="text-xs text-gray-500">
                                  Submitted {formatDate(application.submittedAt)}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Right Section - Progress and Action */}
                          <div className="flex flex-col xs:flex-row items-start xs:items-center gap-2 xs:gap-3 sm:gap-4">
                            {/* Progress Bar - Ultra Compact */}
                            <div className="w-full xs:w-auto sm:w-40 lg:w-48">
                              <CompletionStatus 
                                application={application} 
                                leaseStatus={null}
                                recentPayments={[]}
                                onApplicationUpdate={(updatedApplication) => {
                                  setApplicationStatus(prev => ({
                                    ...prev,
                                    applications: prev.applications.map(app => 
                                      app._id === updatedApplication._id ? updatedApplication : app
                                    )
                                  }));
                                }}
                                compact={true}
                              />
                            </div>
                            
                            {/* View Details Button */}
                            <Link
                              to={`/application/${application._id || application.id}`}
                              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-md transition-colors whitespace-nowrap w-full xs:w-auto justify-center xs:justify-start"
                            >
                              View Details
                              <ArrowRight className="w-3 h-3 ml-1" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 sm:py-12">
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200/50 p-6 sm:p-8">
                      <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
                      <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No applications found</h3>
                      <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6">Use the "New Application" button above to create your first rental application</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            </>
          ) : (
            /* No Applications State */
            <div className="text-center py-12 sm:py-16">
              <div className="max-w-md mx-auto">
                <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200/50 p-6 sm:p-8">
                  <FileText className="w-16 h-16 sm:w-20 sm:h-20 text-gray-400 mx-auto mb-4 sm:mb-6" />
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Ready to Get Started?</h2>
                  <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
                    Create your first rental application to begin the booking process for your perfect beach getaway.
                  </p>
                  <Link
                    to="/application"
                    className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-200 text-base sm:text-lg font-medium shadow-md hover:shadow-lg"
                  >
                    <Plus className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                    Create Application
                  </Link>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <TenantSettings onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
};

export default Dashboard;