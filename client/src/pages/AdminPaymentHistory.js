import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Calendar, CreditCard, CheckCircle, XCircle, Clock, User, DollarSign } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const AdminPaymentHistory = () => {
  const { userId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tenantInfo, setTenantInfo] = useState(null);

  const tenantName = location.state?.tenantName || 'Unknown Tenant';
  const tenantId = location.state?.tenantId || userId;

  useEffect(() => {
    const fetchData = async () => {
      if (authLoading) return;
      if (!user || user.role !== 'admin') {
        navigate('/admin/login');
        return;
      }

      try {
        // Fetch tenant information
        const tenantResponse = await axios.get(`/api/user/${tenantId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setTenantInfo(tenantResponse.data.user);

        // Fetch payment history for this tenant
        const paymentsResponse = await axios.get(`/api/payment/admin/history/${tenantId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setPayments(paymentsResponse.data.payments || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load payment history');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authLoading, user, navigate, tenantId]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'succeeded':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'succeeded':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      case 'pending':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const getPaymentTypeDisplay = (paymentType) => {
    switch (paymentType) {
      case 'deposit':
        return 'Security Deposit';
      case 'rent':
        return 'Rent Payment';
      default:
        return paymentType;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Admin Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Payment History</h1>
          <p className="text-gray-600 mt-2">Payment history for {tenantName}</p>
        </div>

        {/* Tenant Information Card */}
        {tenantInfo && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {tenantInfo.firstName} {tenantInfo.lastName}
                </h2>
                <p className="text-gray-600">{tenantInfo.email}</p>
                {tenantInfo.phone && (
                  <p className="text-gray-600">{tenantInfo.phone}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Payment List */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {payments.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
              <p className="text-gray-600">This tenant hasn't made any payments yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Card Info
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <CreditCard className="h-5 w-5 text-blue-500 mr-3" />
                          <span className="text-sm font-medium text-gray-900">
                            {getPaymentTypeDisplay(payment.paymentType)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {formatDate(payment.paidAt || payment.createdAt)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">
                          {formatAmount(payment.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(payment.status)}
                          <span className={`ml-2 text-sm font-medium ${getStatusColor(payment.status)}`}>
                            {payment.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500 font-mono">
                          {payment.stripePaymentIntentId?.slice(-8) || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">
                          {payment.cardBrand && payment.cardLast4 
                            ? `${payment.cardBrand} •••• ${payment.cardLast4}`
                            : 'N/A'
                          }
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary */}
        {payments.length > 0 && (
          <div className="mt-8 bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Payment Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {payments.length}
                </div>
                <div className="text-sm text-blue-800">Total Payments</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatAmount(payments.reduce((sum, payment) => sum + payment.amount, 0))}
                </div>
                <div className="text-sm text-green-800">Total Amount</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {payments.filter(p => p.status === 'succeeded').length}
                </div>
                <div className="text-sm text-blue-800">Successful</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {formatAmount(payments.filter(p => p.status === 'succeeded').reduce((sum, payment) => sum + payment.amount, 0))}
                </div>
                <div className="text-sm text-gray-800">Amount Received</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPaymentHistory;
