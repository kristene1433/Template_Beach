import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  FileText, 
  CreditCard, 
  Building2, 
  ArrowRight,
  DollarSign,
  MapPin,
  Phone,
  Mail,
  RefreshCw
} from 'lucide-react';
import axios from 'axios';
import CompletionStatus from '../components/CompletionStatus';

const Dashboard = () => {
  const { user } = useAuth();
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [leaseStatus, setLeaseStatus] = useState(null);
  const [recentPayments, setRecentPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      console.log('Fetching dashboard data...');
      const [applicationRes, leaseRes, paymentsRes] = await Promise.all([
        axios.get('/api/application/status'),
        axios.get('/api/lease/status'),
        axios.get('/api/payment/history')
      ]);

      // Debug logging removed for security
      
      setApplicationStatus(applicationRes.data);
      setLeaseStatus(leaseRes.data);
      setRecentPayments(paymentsRes.data.payments?.slice(0, 3) || []);
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
    
    // Set up periodic refresh every 30 seconds to catch admin updates
    const interval = setInterval(fetchDashboardData, 30000);
    
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
      {/* Hero header to match Home */}
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
                  Here's an overview of your rental application and account status
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

        {/* Status Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                {/* Application Status */}
                         <div className="card">
               <div className="flex items-center justify-between mb-4">
                 <div className={`w-12 h-12 ${applicationStatus?.hasApplications ? 'bg-green-100' : 'bg-gray-100'} rounded-lg flex items-center justify-center`}>
                   <FileText className={`w-6 h-6 ${applicationStatus?.hasApplications ? 'text-green-600' : 'text-gray-600'}`} />
                 </div>
               </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Rental Applications
              </h3>
                           <p className="text-gray-600 text-sm mb-4">
                 Complete your rental application to get started
               </p>
               
               <Link
                 to="/application"
                 className="inline-flex items-center text-gray-600 hover:text-gray-700 text-sm font-medium"
               >
                 Get Started
                 <ArrowRight className="w-4 h-4 ml-1" />
               </Link>
            </div>

                     {/* Lease Status */}
           <div className="card">
             <div className="flex items-center justify-between mb-4">
               <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center">
                 <Building2 className="w-6 h-6 text-accent-600" />
               </div>
             </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Lease Agreement
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              {leaseStatus?.leaseSigned ? 
                'Your lease agreement has been signed and is active' : 
                leaseStatus?.isComplete ? 
                'Review your lease agreement' : 
                leaseStatus?.hasApplication ? 
                'Waiting for lease to be generated by administrator' : 
                'Complete your application to get started'}
            </p>
            <Link
              to={leaseStatus?.hasApplication ? "/lease" : "/application"}
              className="inline-flex items-center text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              {leaseStatus?.leaseSigned ? 'View Lease' : leaseStatus?.isComplete ? 'Review Lease' : leaseStatus?.hasApplication ? 'View Lease' : 'Start Application'}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

                     {/* Payment Status */}
           <div className="card">
             <div className="flex items-center justify-between mb-4">
               <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                 <CreditCard className="w-6 h-6 text-green-600" />
               </div>
             </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Payment Portal
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Make secure payments for deposits, rent, and other fees
            </p>
            <Link
              to="/payment"
              className="inline-flex items-center text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              Make Payment
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>

        {/* Applications with Progress Bars */}
        {applicationStatus?.hasApplications && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Applications</h2>
            <div className="space-y-6">
              {applicationStatus.applications && applicationStatus.applications.length > 0 ? (
                applicationStatus.applications.map((application) => (
                  <div key={application._id || application.id} className="bg-white/90 backdrop-blur-md rounded-lg shadow-sm border border-white/30 p-4">
                    {/* Application Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Application for {application.requestedStartDate && application.requestedEndDate 
                            ? `${new Date(application.requestedStartDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${new Date(application.requestedEndDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                            : 'Rental Period'
                          }
                        </h3>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status === 'completed' ? 'completed' : application.status)}`}>
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
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 border border-primary-200 rounded-md hover:bg-primary-50 transition-colors"
                      >
                        View Details
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Link>
                    </div>
                    
                    {/* Progress Bar for this Application */}
                    <CompletionStatus 
                      application={application} 
                      leaseStatus={leaseStatus}
                      recentPayments={recentPayments}
                    />
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No applications found</p>
                  <Link
                    to="/application"
                    className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                  >
                    Create New Application
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Property Information */}
        <div className="card mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Property Information</h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Property Address</p>
                <p className="text-sm text-gray-600">
                  18650 Gulf Blvd Unit 207, Indian Shores, FL 33785
                </p>
              </div>
            </div>
            
            
            
            <div className="flex items-center space-x-3">
              <DollarSign className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Security Deposit</p>
                <p className="text-sm text-gray-600">
                  {leaseStatus?.depositAmount ? `$${leaseStatus.depositAmount.toLocaleString()}` : 
                   leaseStatus?.hasApplication ? 'Pending lease generation' : '$500'}
                </p>
              </div>
            </div>
          </div>
        </div>

        


        {/* Recent Payments */}
        {recentPayments.length > 0 && (
          <div className="card mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Payments</h2>
            <div className="space-y-3">
              {recentPayments.map((payment) => (
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

        {/* Contact Information */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Need Help?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-primary-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Phone Support</p>
                <p className="text-sm text-gray-600">(407) 687-1270</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-primary-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Email Support</p>
                <p className="text-sm text-gray-600">palmrunbeachcondo@gmail.com</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-primary-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Property Address</p>
                <p className="text-sm text-gray-600">18650 Gulf Blvd Unit 207<br />Indian Shores, FL 33785</p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200 text-center">
            <Link
              to="/contact"
              className="inline-flex items-center text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              Send us a Message
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Dashboard;
