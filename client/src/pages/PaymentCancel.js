import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';

const PaymentCancel = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleTryAgain = () => {
    navigate('/payment');
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Cancel Header */}
          <div className="bg-red-50 px-6 py-8 text-center">
            <XCircle className="mx-auto h-16 w-16 text-red-600 mb-4" />
            <h1 className="text-3xl font-bold text-red-900 mb-2">
              Payment Cancelled
            </h1>
            <p className="text-lg text-red-700">
              Your payment was not completed. No charges were made to your account.
            </p>
          </div>

          {/* Information */}
          <div className="px-6 py-8">
            <div className="bg-yellow-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-yellow-900 mb-3">What happened?</h3>
              <ul className="space-y-2 text-yellow-800">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-yellow-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  You cancelled the payment process
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-yellow-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  No money was withdrawn from your account
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-yellow-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  You can try again at any time
                </li>
              </ul>
            </div>

            {/* Common Reasons */}
            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Common reasons for cancellation:</h3>
              <ul className="space-y-2 text-blue-800">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Changed your mind about the payment
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Technical issues during checkout
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Wanted to review payment details first
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleTryAgain}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <RefreshCw className="h-5 w-5 mr-2" />
                Try Again
              </button>
              <button
                onClick={handleBackToDashboard}
                className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Dashboard
              </button>
            </div>

            {/* Contact Information */}
            <div className="mt-8 text-center">
              <p className="text-gray-600 mb-2">
                Need help? Contact our support team
              </p>
              <p className="text-gray-800 font-medium">
                support@palmrunllc.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel;
