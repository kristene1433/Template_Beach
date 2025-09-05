import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navigation from '../components/Navigation';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import {
  CreditCard,
  AlertCircle,
  Receipt,
  Download,
  Clock,
  Home,
  Shield
} from 'lucide-react';

const Payment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [selectedAmount, setSelectedAmount] = useState('500');
  const [customAmount, setCustomAmount] = useState('');
  const [paymentType, setPaymentType] = useState('deposit');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (user) {
      loadPaymentHistory();
    }
  }, [user]);

  const loadPaymentHistory = async () => {
    try {
      const response = await axios.get('/api/payments/history');
      setPaymentHistory(response.data.payments || []);
    } catch (error) {
      console.error('Error loading payment history:', error);
    }
  };

  const handleAmountSelect = (amount) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e) => {
    const value = e.target.value;
    setCustomAmount(value);
    if (value) {
      setSelectedAmount('custom');
    }
  };

  const handlePaymentTypeChange = (type) => {
    setPaymentType(type);
    if (type === 'deposit') {
      setSelectedAmount('500');
      setCustomAmount('');
    } else {
      setSelectedAmount('custom');
    }
  };

  const getPaymentAmount = () => {
    if (selectedAmount === 'custom' && customAmount) {
      return parseFloat(customAmount);
    }
    return parseFloat(selectedAmount);
  };

  const handlePayment = async () => {
    const amount = getPaymentAmount();
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      // Create Stripe Checkout session
      const response = await axios.post('/api/payment/create-checkout-session', {
        amount: amount,
        paymentType,
        description: description || `${paymentType === 'deposit' ? 'Security Deposit' : 'Rent Payment'} - $${amount.toFixed(2)}`,
        successUrl: `${window.location.origin}/payment/success`,
        cancelUrl: `${window.location.origin}/payment/cancel`
      });

      const { url } = response.data;
      
      // Redirect to Stripe Checkout
      if (url) {
        window.location.href = url;
      } else {
        toast.error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.response?.data?.error || 'Payment failed');
    } finally {
      setLoading(false);
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

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'succeeded':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">Please log in to access payments</h2>
          <button
            onClick={() => navigate('/login')}
            className="mt-4 bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <div className="pt-16 bg-gray-50 min-h-screen py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Form */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-primary px-6 py-4">
              <h1 className="text-2xl font-bold text-white flex items-center">
                <CreditCard className="mr-3 h-6 w-6" />
                Make a Payment
              </h1>
            </div>

            <div className="p-6 space-y-6">
              {/* Payment Type Selection */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Payment Type</h2>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handlePaymentTypeChange('deposit')}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                      paymentType === 'deposit'
                        ? 'border-primary-600 bg-primary-600 text-white shadow-lg scale-105'
                        : 'border-gray-300 hover:border-primary-600 hover:bg-primary-50 hover:scale-102'
                    }`}
                  >
                    <Shield className="mx-auto h-8 w-8 mb-2" />
                    <span className="font-medium">Security Deposit</span>
                    <p className="text-xs mt-1 opacity-90">$500 Required</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePaymentTypeChange('rent')}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                      paymentType === 'rent'
                        ? 'border-primary-600 bg-primary-600 text-white shadow-lg scale-105'
                        : 'border-gray-300 hover:border-primary-600 hover:bg-primary-50 hover:scale-102'
                    }`}
                  >
                    <Home className="mx-auto h-8 w-8 mb-2" />
                    <span className="font-medium">Rent Payment</span>
                    <p className="text-xs mt-1 opacity-90">Custom Amount</p>
                  </button>
                </div>
              </div>

              {/* Amount Selection */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Payment Amount</h2>
                
                {paymentType === 'deposit' ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-800 font-medium">Security Deposit</p>
                        <p className="text-green-600 text-sm">Required for all tenants</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-800">$500.00</p>
                        <p className="text-green-600 text-sm">Fixed amount</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Quick Amount Buttons */}
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Quick Select:</p>
                      <div className="grid grid-cols-3 gap-2">
                        {['1000', '1500', '2000', '2500', '3000', '3500'].map((amount) => (
                          <button
                            key={amount}
                            type="button"
                            onClick={() => handleAmountSelect(amount)}
                            className={`py-2 px-3 rounded-md border transition-colors ${
                              selectedAmount === amount
                                ? 'border-primary-600 bg-primary-600 text-white'
                                : 'border-gray-300 hover:border-primary-600 hover:bg-primary-50'
                            }`}
                          >
                            ${amount}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom Amount Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Custom Amount
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          $
                        </span>
                        <input
                          type="number"
                          value={customAmount}
                          onChange={handleCustomAmountChange}
                          placeholder="0.00"
                          min="1"
                          step="0.01"
                          className="block w-full pl-8 pr-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-600 focus:border-primary-600"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Description (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a note about this payment..."
                  rows={3}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-600 focus:border-primary-600"
                />
              </div>

              {/* Payment Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Payment Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Type:</span>
                    <span className="font-medium">
                      {paymentType === 'deposit' ? 'Security Deposit' : 'Rent Payment'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-bold text-lg">
                      ${getPaymentAmount().toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Processing Fee:</span>
                    <span className="text-gray-600">$0.00</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-900">Total:</span>
                      <span className="font-bold text-xl text-primary">
                        ${getPaymentAmount().toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Debug Info - Remove this after fixing */}
              <div className="text-xs text-gray-400 mt-2 p-2 bg-gray-100 rounded">
                Debug: selectedAmount={selectedAmount}, customAmount={customAmount}, getPaymentAmount()={getPaymentAmount()}
              </div>

              {/* Submit Button */}
              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center border-2 border-red-500 font-bold text-lg relative z-10"
                style={{minHeight: '60px', display: 'flex', visibility: 'visible', opacity: 1}}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-5 w-5" />
                    Proceed to Payment
                  </>
                )}
              </button>

              {/* Security Notice */}
              <div className="text-center text-sm text-gray-500">
                <Shield className="inline h-4 w-4 mr-1" />
                Your payment is secured by Stripe. We never store your card information.
              </div>
            </div>
          </div>

          {/* Payment History */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-secondary px-6 py-4">
              <h2 className="text-xl font-bold text-white flex items-center">
                <Receipt className="mr-3 h-5 w-5" />
                Payment History
              </h2>
            </div>

            <div className="p-6">
              {paymentHistory.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No payments yet</h3>
                  <p className="text-gray-500">Your payment history will appear here once you make your first payment.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {paymentHistory.map((payment) => (
                    <div key={payment._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                            {payment.status}
                          </span>
                          <span className="text-sm text-gray-500">
                            {formatDate(payment.createdAt)}
                          </span>
                        </div>
                        <span className="text-lg font-bold text-gray-900">
                          {formatAmount(payment.amount)}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-2">
                        {payment.description || `${payment.paymentType} payment`}
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Payment ID: {payment.stripePaymentIntentId}</span>
                        {payment.receiptUrl && (
                          <a
                            href={payment.receiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary-dark flex items-center"
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Receipt
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
