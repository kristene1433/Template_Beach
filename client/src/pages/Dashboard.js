import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  FileText, 
  Plus,
  ArrowRight,
  RefreshCw,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';
import CompletionStatus from '../components/CompletionStatus';

const Dashboard = () => {
  const { user } = useAuth();
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [recentPayments, setRecentPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      console.log('Fetching dashboard data...');
      const [applicationRes, paymentsRes] = await Promise.all([
        axios.get('/api/application/status'),
        axios.get('/api/payment/history')
      ]);

      setApplicationStatus(applicationRes.data);
      setRecentPayments(paymentsRes.data.payments?.slice(0, 5) || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Set up periodic refresh every 10 seconds for real-time updates
    const interval = setInterval(fetchDashboardData, 10000);
    
    return () => clearInterval(interval);
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100); // Convert from cents
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
          <video className="w-full h-40 md:h-56 object-cover object-center" poster="/images/image1.jpg" autoPlay muted loop playsInline>
            <source src="/videos/beach-video.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl md:text-3xl font-bold text-white">
                  Welcome back, {user?.firstName || user?.email || 'Guest'}!
                </h1>
                <p className="text-xs md:text-base text-gray-200 mt-1 md:mt-2">
                  Manage your rental applications and bookings
                </p>
              </div>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center space-x-2 px-3 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors disabled:opacity-50"
                title="Refresh data"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline text-sm">Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="min-h-screen py-4 md:py-8 bg-gradient-to-br from-blue-50 to-cyan-50 -mt-2 md:mt-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Quick Actions */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/application"
                className="flex items-center justify-center px-6 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg shadow-md transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                <span className="font-medium">New Application</span>
              </Link>
              {recentPayments.length > 0 && (
                <Link
                  to="/payment/history"
                  className="flex items-center justify-center px-6 py-4 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg shadow-md transition-colors"
                >
                  <FileText className="w-5 h-5 mr-2" />
                  <span className="font-medium">Payment History</span>
                </Link>
              )}
            </div>
          </div>

          {/* Applications Section */}
          {applicationStatus?.hasApplications ? (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Applications</h2>
              <div className="space-y-6">
                {applicationStatus.applications && applicationStatus.applications.length > 0 ? (
                  applicationStatus.applications.map((application) => (
                    <div key={application._id || application.id} className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-white/30 overflow-hidden">
                      {/* Application Header */}
                      <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <Calendar className="w-5 h-5 text-primary-600" />
                              <h3 className="text-xl font-semibold text-gray-900">
                                {application.requestedStartDate && application.requestedEndDate 
                                  ? `${new Date(application.requestedStartDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} - ${new Date(application.requestedEndDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
                                  : 'Rental Period'
                                }
                              </h3>
                            </div>
                            <div className="flex items-center space-x-4">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status === 'completed' ? 'completed' : application.status)}`}>
                                {application.status === 'completed' ? <CheckCircle className="w-4 h-4 mr-1" /> : 
                                 application.status === 'rejected' ? <AlertCircle className="w-4 h-4 mr-1" /> :
                                 <Clock className="w-4 h-4 mr-1" />}
                                {getStatusText(application.status === 'completed' ? 'completed' : application.status)}
                              </span>
                              {application.submittedAt && (
                                <span className="text-sm text-gray-500">
                                  Submitted {formatDate(application.submittedAt)}
                                </span>
                              )}
                            </div>
                          </div>
                          <Link
                            to={`/application/${application._id || application.id}`}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors"
                          >
                            View Details
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Link>
                        </div>
                      </div>
                      
                      {/* Progress Bar for this Application */}
                      <div className="p-6">
                        <CompletionStatus 
                          application={application} 
                          leaseStatus={null}
                          recentPayments={recentPayments}
                          onApplicationUpdate={(updatedApplication) => {
                            setApplicationStatus(prev => ({
                              ...prev,
                              applications: prev.applications.map(app => 
                                app._id === updatedApplication._id ? updatedApplication : app
                              )
                            }));
                          }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
                    <p className="text-gray-500 mb-6">Start by creating your first rental application</p>
                    <Link
                      to="/application"
                      className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Create New Application
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* No Applications State */
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <FileText className="w-20 h-20 text-gray-400 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
                <p className="text-gray-600 mb-8">
                  Create your first rental application to begin the booking process for your perfect beach getaway.
                </p>
                <Link
                  to="/application"
                  className="inline-flex items-center px-8 py-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-lg font-medium"
                >
                  <Plus className="w-6 h-6 mr-3" />
                  Create Application
                </Link>
              </div>
            </div>
          )}

          {/* Payment Summary - Only show if there are payments */}
          {recentPayments.length > 0 && (
            <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-white/30 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Summary</h2>
              
              {/* Running Total */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900">Total Paid</h3>
                    <p className="text-sm text-blue-700">All successful payments</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-900">
                      {formatCurrency(recentPayments
                        .filter(payment => payment.status === 'succeeded')
                        .reduce((total, payment) => total + payment.amount, 0)
                      )}
                    </p>
                    <p className="text-sm text-blue-600">
                      {recentPayments.filter(payment => payment.status === 'succeeded').length} payment(s)
                    </p>
                  </div>
                </div>
              </div>

              {/* Recent Payments */}
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-gray-900">Recent Payments</h3>
                {recentPayments.slice(0, 3).map((payment) => (
                  <div key={payment._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${payment.status === 'succeeded' ? 'bg-green-500' : payment.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{payment.description}</p>
                        <p className="text-xs text-gray-500">{formatDate(payment.createdAt)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{formatCurrency(payment.amount)}</p>
                      <p className={`text-xs px-2 py-1 rounded-full ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <Link
                  to="/payment/history"
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  View All Payments
                  <ArrowRight className="w-4 h-4 ml-1 inline" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;