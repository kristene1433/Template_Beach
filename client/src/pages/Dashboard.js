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
  Clock
} from 'lucide-react';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useAuth();
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [leaseStatus, setLeaseStatus] = useState(null);
  const [recentPayments, setRecentPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        console.log('Fetching dashboard data...');
        const [applicationRes, leaseRes, paymentsRes] = await Promise.all([
          axios.get('/api/application/status'),
          axios.get('/api/lease/status'),
          axios.get('/api/payment/history')
        ]);

        console.log('Application response:', applicationRes.data);
        console.log('Application response status:', applicationRes.status);
        console.log('Application response headers:', applicationRes.headers);
        console.log('Lease response:', leaseRes.data);
        
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
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
      case 'completed':
      case 'succeeded':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-blue-600 bg-blue-100';
      case 'processing':
        return 'text-yellow-600 bg-yellow-100';
      case 'rejected':
      case 'failed':
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
      case 'completed':
        return 'Completed';
      case 'not_started':
        return 'Not Started';
      default:
        return 'Unknown';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100); // Convert from cents
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    
    try {
      // Handle both date strings and Date objects
      let dateObj;
      if (typeof dateString === 'string') {
        // If it's a date string like "2025-01-01", parse it directly
        if (dateString.includes('-')) {
          const [year, month, day] = dateString.split('-').map(Number);
          dateObj = new Date(year, month - 1, day);
        } else {
          dateObj = new Date(dateString);
        }
      } else {
        dateObj = new Date(dateString);
      }
      
      // Check if the date is valid
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

  const refreshDashboard = async () => {
    setLoading(true);
    try {
      console.log('Manually refreshing dashboard...');
      const [applicationRes, leaseRes, paymentsRes] = await Promise.all([
        axios.get('/api/application/status'),
        axios.get('/api/lease/status'),
        axios.get('/api/payment/history')
      ]);

              console.log('Refresh - Application response:', applicationRes.data);
        console.log('Refresh - Application response status:', applicationRes.status);
        console.log('Refresh - Application response headers:', applicationRes.headers);
        console.log('Refresh - Lease response:', leaseRes.data);
      
      setApplicationStatus(applicationRes.data);
      setLeaseStatus(leaseRes.data);
      setRecentPayments(paymentsRes.data.payments?.slice(0, 3) || []);
    } catch (error) {
      console.error('Error refreshing dashboard data:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.firstName || user?.email || 'Guest'}!
              </h1>
              <p className="text-gray-600 mt-2">
                Here's an overview of your rental application and account status
              </p>
            </div>
            <button
              onClick={refreshDashboard}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              ) : (
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
              Refresh
            </button>
          </div>
        </div>

        {/* Status Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Application Status */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary-600" />
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(applicationStatus?.latestStatus || 'not_started')}`}>
                {applicationStatus?.hasApplications ? 
                  getStatusText(applicationStatus.latestStatus) : 'Not Started'}
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
               className="inline-flex items-center text-primary-600 hover:text-primary-700 text-sm font-medium"
             >
               Start Application
               <ArrowRight className="w-4 h-4 ml-1" />
             </Link>
          </div>

          {/* Lease Status */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-accent-600" />
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(leaseStatus?.leaseSigned ? 'completed' : 'pending')}`}>
                {leaseStatus?.leaseSigned ? 'Signed' : 'Available'}
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Lease Agreement
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              {leaseStatus?.leaseSigned ? 
                'Your lease agreement has been signed and is active' : 
                'Review your lease agreement'}
            </p>
            <Link
              to="/lease"
              className="inline-flex items-center text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              {leaseStatus?.leaseSigned ? 'View Lease' : 'Review Lease'}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          {/* Payment Status */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-green-600" />
              </div>
              <div className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-600">
                Active
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



        {/* Property Information */}
        <div className="card mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Property Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <p className="text-sm font-medium text-gray-900">Monthly Rent</p>
                <p className="text-sm text-gray-600">
                  {leaseStatus?.rentalAmount ? `$${leaseStatus.rentalAmount.toLocaleString()}` : 
                   leaseStatus?.hasApplication ? 'Pending lease generation' : 'Not specified'}
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

        

        {/* Applications List */}
        {applicationStatus?.hasApplications && (
          <div className="card mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Your Applications</h2>
              <Link
                to="/application"
                className="inline-flex items-center text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                New Application
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            
                         <div className="space-y-4">
               {applicationStatus.applications && applicationStatus.applications.length > 0 ? (
                 applicationStatus.applications.map((app) => (
                   <div key={app.id} className="border border-gray-200 rounded-lg p-4">
                                           <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                            {getStatusText(app.status)}
                          </span>
                          <span className="text-sm text-gray-500">
                            {formatDate(app.createdAt)}
                          </span>
                        </div>
                        <Link
                          to={`/application/${app.id}`}
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                        >
                          View Details
                          <ArrowRight className="w-4 h-4 ml-1 inline" />
                        </Link>
                      </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div>
                         <p className="text-sm font-medium text-gray-900">Requested Start</p>
                         <p className="text-sm text-gray-600">{app.requestedMonths || 'Not specified'}</p>
                       </div>
                       {app.submittedAt && (
                         <div>
                           <p className="text-sm font-medium text-gray-900">Submitted</p>
                           <p className="text-sm text-gray-600">{formatDate(app.submittedAt)}</p>
                         </div>
                       )}
                       {app.reviewedAt && (
                         <div>
                           <p className="text-sm font-medium text-gray-900">Reviewed</p>
                           <p className="text-sm text-gray-600">{formatDate(app.reviewedAt)}</p>
                         </div>
                       )}
                     </div>
                     {/* Status Description */}
                     <div className="mt-3 pt-3 border-t border-gray-200">
                       <p className="text-sm text-gray-600">
                         {app.status === 'pending' && 'Your application has been submitted and is currently under review by our team.'}
                         {app.status === 'approved' && 'Congratulations! Your application has been approved. We will contact you to proceed with the lease agreement.'}
                         {app.status === 'rejected' && 'Your application was not approved at this time. Please contact us for more information.'}
                       </p>
                     </div>
                     {app.notes && (
                       <div className="mt-3 pt-3 border-t border-gray-200">
                         <p className="text-sm font-medium text-gray-900">Admin Notes</p>
                         <p className="text-sm text-gray-600">{app.notes}</p>
                       </div>
                     )}
                   </div>
                 ))
               ) : (
                 <div className="text-center py-8 text-gray-500">
                   <p>No applications found in the array.</p>
                   <p className="text-sm">This might indicate a data issue.</p>
                 </div>
               )}
             </div>
          </div>
        )}

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
                to="/payment"
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
  );
};

export default Dashboard;
