import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle, ArrowLeft, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { sendPaymentReceiptEmail } from '../utils/emailjs';

const PaymentSuccess = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  const sessionId = searchParams.get('session_id');
  
  // Debug: Log when component loads
  console.log('🚀 PaymentSuccess component loaded', {
    sessionId: sessionId ? 'Present' : 'Missing',
    user: user?.email,
    authLoading
  });
  
  useEffect(() => {
    const load = async () => {
      if (authLoading) return; // wait for auth to resolve
      if (!user) {
        navigate('/login');
        return;
      }
      if (!sessionId) {
        setLoading(false);
        return;
      }
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get(`/api/payment/by-session/${sessionId}`,{ headers: token ? { Authorization: `Bearer ${token}` } : {} });
        const p = data.payment;
        const details = {
          amount: (p.amount / 100).toFixed(2),
          paymentType: p.paymentType === 'deposit' ? 'Security Deposit' : p.paymentType,
          date: new Date(p.paidAt || p.createdAt).toLocaleDateString(),
          transactionId: p.stripePaymentIntentId,
          receiptUrl: data.receiptUrl,
          cardBrand: p.cardBrand,
          cardLast4: p.cardLast4
        };
        setPaymentDetails(details);

        // Send confirmation email once per session
        try {
          const sentKey = `pr:receipt-sent:${sessionId}`;
          
          if (!sessionStorage.getItem(sentKey) && details.amount) {
            const amountStr = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(details.amount));
            
            const emailResult = await sendPaymentReceiptEmail({
              toEmail: user?.email,
              amount: amountStr,
              paymentType: details.paymentType,
              date: details.date,
              transactionId: details.transactionId,
              cardBrand: details.cardBrand,
              cardLast4: details.cardLast4
            });
            
            if (emailResult.success) {
              toast.success('Payment receipt sent to your email!');
            } else {
              console.error('❌ Email failed:', emailResult.error);
              toast.error('Failed to send email receipt. Please contact support.');
            }
            
            sessionStorage.setItem(sentKey, '1');
          } else {
            console.log('📧 Email skipped:', sessionStorage.getItem(sentKey) ? 'Already sent' : 'No amount');
          }
        } catch (mailErr) {
          console.error('❌ Payment receipt email error:', mailErr);
        }
      } catch (error) {
        console.error('Error fetching payment details:', error);
        toast.error(error.response?.data?.error || 'Error loading payment details');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [authLoading, user, sessionId, navigate]);


  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Success Header */}
          <div className="bg-green-50 px-6 py-8 text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-green-600 mb-4" />
            <h1 className="text-3xl font-bold text-green-900 mb-2">
              Payment Successful!
            </h1>
            <p className="text-lg text-green-700">
              Thank you for your payment. Your transaction has been completed successfully.
            </p>
          </div>

          {/* Payment Details */}
          <div className="px-6 py-8">
            {paymentDetails && (
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-gray-600" />
                  Payment Details
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-semibold text-gray-900">${paymentDetails.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Type:</span>
                    <span className="font-semibold text-gray-900">{paymentDetails.paymentType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-semibold text-gray-900">{paymentDetails.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction ID:</span>
                    <span className="font-mono text-sm text-gray-600">{paymentDetails.transactionId}</span>
                  </div>
                  {(paymentDetails.cardBrand || paymentDetails.cardLast4) && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Card:</span>
                      <span className="font-semibold text-gray-900">{paymentDetails.cardBrand} •••• {paymentDetails.cardLast4}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Next Steps */}
            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">What happens next?</h3>
              <ul className="space-y-2 text-blue-800">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  You'll receive a confirmation email with your receipt
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  If you have any questions, please contact our support team
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleBackToDashboard}
                className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
