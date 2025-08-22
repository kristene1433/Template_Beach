import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useStripe } from '../contexts/StripeContext';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import {
  CreditCard,
  DollarSign,
  Calendar,
  CheckCircle,
  AlertCircle,
  Receipt,
  Download,
  Clock,
  User,
  Home,
  Shield
} from 'lucide-react';

const Payment = () => {
  const { user } = useAuth();
  const { stripe } = useStripe();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [selectedAmount, setSelectedAmount] = useState('500');
  const [customAmount, setCustomAmount] = useState('');
  const [paymentType, setPaymentType] = useState('deposit');
  const [description, setDescription] = useState('');
  const [showCustomAmount, setShowCustomAmount] = useState(false);

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
    setShowCustomAmount(false);
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
      setShowCustomAmount(false);
      setCustomAmount('');
    } else {
      setSelectedAmount('custom');
      setShowCustomAmount(true);
    }
  };

  const getPaymentAmount = () => {
    if (selectedAmount === 'custom' && customAmount) {
      return parseFloat(customAmount);
    }
    return parseFloat(selectedAmount);
  };

  const handlePayment = async () => {
    if (!stripe) {
      toast.error('Stripe is not loaded. Please try again.');
      return;
    }

    const amount = getPaymentAmount();
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      // Create payment intent
      const response = await axios.post('/api/payments/create-payment-intent', {
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
        paymentType,
        description: description || `${paymentType === 'deposit' ? 'Security Deposit' : 'Rent Payment'} - $${amount.toFixed(2)}`
      });

      const { clientSecret } = response.data;

      // For now, we'll simulate a successful payment since we don't have Stripe Elements set up
      // In a real implementation, you would use stripe.confirmCardPayment with a card element
      toast.success('Payment successful! (Demo mode)');
      await loadPaymentHistory();
      // Reset form
      setSelectedAmount('500');
      setCustomAmount('');
      setPaymentType('deposit');
      setDescription('');
      setShowCustomAmount(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

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
    <div className="min-h-screen bg-gray-50 py-8">
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
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      paymentType === 'deposit'
                        ? 'border-primary bg-primary text-white'
                        : 'border-gray-300 hover:border-primary hover:bg-primary-light'
                    }`}
                  >
                    <Shield className="mx-auto h-6 w-6 mb-2" />
                    <span className="font-medium">Security Deposit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePaymentTypeChange('rent')}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      paymentType === 'rent'
                        ? 'border-primary bg-primary text-white'
                        : 'border-gray-300 hover:border-primary hover:bg-primary-light'
                    }`}
                  >
                    <Home className="mx-auto h-6 w-6 mb-2" />
                    <span className="font-medium">Rent Payment</span>
                  </button>
                </div>
              </div>

              {/* Amount Selection */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Payment Amount</h2>
                {paymentType === 'deposit' ? (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleAmountSelect('500')}
                      className={`p-4 rounded-lg border-2 transition-colors ${
                        selectedAmount === '500'
                          ? 'border-primary bg-primary text-white'
                          : 'border-gray-300 hover:border-primary hover:bg-primary-light'
                      }`}
                    >
                      <DollarSign className="mx-auto h-8 w-8 mb-2" />
                      <span className="text-xl font-bold">$500</span>
                      <span className="block text-sm opacity-90">Standard Deposit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAmountSelect('custom')}
                      className={`p-4 rounded-lg border-2 transition-colors ${
                        selectedAmount === 'custom'
                          ? 'border-primary bg-primary text-white'
                          : 'border-gray-300 hover:border-primary hover:bg-primary-light'
                      }`}
                    >
                      <DollarSign className="mx-auto h-8 w-8 mb-2" />
                      <span className="text-xl font-bold">Custom</span>
                      <span className="block text-sm opacity-90">Agreed Amount</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => handleAmountSelect('1000')}
                        className={`p-3 rounded-lg border-2 transition-colors ${
                          selectedAmount === '1000'
                            ? 'border-primary bg-primary text-white'
                            : 'border-gray-300 hover:border-primary hover:bg-primary-light'
                        }`}
                      >
                        <span className="font-bold">$1,000</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAmountSelect('1500')}
                        className={`p-3 rounded-lg border-2 transition-colors ${
                          selectedAmount === '1500'
                            ? 'border-primary bg-primary text-white'
                            : 'border-gray-300 hover:border-primary hover:bg-primary-light'
                        }`}
                      >
                        <span className="font-bold">$1,500</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAmountSelect('2000')}
                        className={`p-3 rounded-lg border-2 transition-colors ${
                          selectedAmount === '2000'
                            ? 'border-primary bg-primary text-white'
                            : 'border-gray-300 hover:border-primary hover:bg-primary-light'
                        }`}
                      >
                        <span className="font-bold">$2,000</span>
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAmountSelect('custom')}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        selectedAmount === 'custom'
                          ? 'border-primary bg-primary text-white'
                          : 'border-gray-300 hover:border-primary hover:bg-primary-light'
                      }`}
                    >
                      <span className="font-bold">Custom Amount</span>
                    </button>
                  </div>
                )}

                {/* Custom Amount Input */}
                {(selectedAmount === 'custom' || paymentType === 'rent') && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enter Amount (USD)
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
                        step="0.01"
                        min="0"
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>
                )}

                {/* Display Selected Amount */}
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Total Amount:</span>
                    <span className="text-2xl font-bold text-primary">
                      ${getPaymentAmount().toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Description (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Add any additional notes about this payment..."
                />
              </div>

              {/* Payment Button */}
              <button
                onClick={handlePayment}
                disabled={loading || !getPaymentAmount()}
                className="w-full bg-primary text-white py-3 px-6 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-5 w-5" />
                    Pay ${getPaymentAmount().toFixed(2)}
                  </>
                )}
              </button>

              {/* Security Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Shield className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Secure Payment Processing</p>
                    <p className="mt-1">
                      Your payment information is encrypted and secure. We use Stripe, a trusted payment processor, 
                      to handle all transactions.
                    </p>
                  </div>
                </div>
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
  );
};

export default Payment;
