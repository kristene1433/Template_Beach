import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  FileText, 
  CreditCard, 
  Building2, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  ArrowRight,
  DollarSign,
  Calendar,
  MapPin,
  Phone,
  Mail
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
        const [applicationRes, leaseRes, paymentsRes] = await Promise.all([
          axios.get('/api/application/status'),
          axios.get('/api/lease/status'),
          axios.get('/api/payment/history')
        ]);

        setApplicationStatus(applicationRes.data);
        setLeaseStatus(leaseRes.data);
        setRecentPayments(paymentsRes.data.payments?.slice(0, 3) || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
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
      case 'processing':
        return 'text-yellow-600 bg-yellow-100';
      case 'rejected':
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
      case 'completed':
      case 'succeeded':
        return <CheckCircle className="w-5 h-5" />;
      case 'pending':
      case 'processing':
        return <Clock className="w-5 h-5" />;
      case 'rejected':
      case 'failed':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100); // Convert from cents
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-gray-600 mt-2">
            Here's an overview of your rental application and account status
          </p>
        </div>

        {/* Status Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Application Status */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary-600" />
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(applicationStatus?.status || 'not_started')}`}>
                {applicationStatus?.status === 'not_started' ? 'Not Started' : 
                 applicationStatus?.status === 'pending' ? 'Under Review' :
                 applicationStatus?.status === 'approved' ? 'Approved' :
                 applicationStatus?.status === 'rejected' ? 'Rejected' :
                 applicationStatus?.status === 'completed' ? 'Completed' : 'Unknown'}
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Rental Application
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              {applicationStatus?.status === 'not_started' ? 'Complete your rental application to get started' :
               applicationStatus?.status === 'pending' ? 'Your application is currently under review' :
               applicationStatus?.status === 'approved' ? 'Congratulations! Your application has been approved' :
               applicationStatus?.status === 'rejected' ? 'Your application was not approved' :
               applicationStatus?.status === 'completed' ? 'Your application is complete and ready for lease signing' : 'Status unknown'}
            </p>
            <Link
              to="/application"
              className="inline-flex items-center text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              View Details
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
                {leaseStatus?.leaseSigned ? 'Signed' : 'Pending'}
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Lease Agreement
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              {leaseStatus?.leaseSigned ? 
                'Your lease agreement has been signed and is active' : 
                'Complete your application to proceed with lease signing'}
            </p>
            <Link
              to="/lease"
              className="inline-flex items-center text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              View Details
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

        {/* Quick Actions */}
        <div className="card mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/application"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors duration-200"
            >
              <FileText className="w-5 h-5 text-primary-600 mr-3" />
              <span className="font-medium text-gray-900">Complete Application</span>
            </Link>
            
            <Link
              to="/payment"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors duration-200"
            >
              <CreditCard className="w-5 h-5 text-primary-600 mr-3" />
              <span className="font-medium text-gray-900">Make Payment</span>
            </Link>
            
            <Link
              to="/lease"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors duration-200"
            >
              <Building2 className="w-5 h-5 text-primary-600 mr-3" />
              <span className="font-medium text-gray-900">View Lease</span>
            </Link>
            
            <Link
              to="/profile"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors duration-200"
            >
              <div className="w-5 h-5 bg-primary-600 rounded-full mr-3 flex items-center justify-center">
                <span className="text-white text-xs font-bold">{user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}</span>
              </div>
              <span className="font-medium text-gray-900">Update Profile</span>
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
                  {user?.address?.street ? 
                    `${user.address.street}, ${user.address.city}, ${user.address.state} ${user.address.zipCode}` : 
                    'Not specified'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <DollarSign className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Monthly Rent</p>
                <p className="text-sm text-gray-600">
                  {user?.rentalAmount ? `$${user.rentalAmount}` : 'Not specified'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <DollarSign className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Security Deposit</p>
                <p className="text-sm text-gray-600">
                  {user?.depositAmount ? `$${user.depositAmount}` : '$500'}
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
                <p className="text-sm text-gray-600">(555) 123-4567</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-primary-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Email Support</p>
                <p className="text-sm text-gray-600">support@palmrunllc.com</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-primary-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Business Hours</p>
                <p className="text-sm text-gray-600">Mon-Fri: 9AM-6PM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
