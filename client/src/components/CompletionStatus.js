import React, { useState, useEffect } from 'react';
import { CheckCircle, Circle, Clock, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';

const CompletionStatus = ({ application, leaseStatus, recentPayments = [] }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [applicationPayments, setApplicationPayments] = useState([]);

  // Fetch payments for this specific application
  useEffect(() => {
    const fetchApplicationPayments = async () => {
      if (application?._id) {
        try {
          const response = await axios.get(`/api/payment/history?applicationId=${application._id}`);
          setApplicationPayments(response.data.payments || []);
        } catch (error) {
          console.error('Error fetching application payments:', error);
          setApplicationPayments([]);
        }
      }
    };

    fetchApplicationPayments();
  }, [application?._id]);
  
  // Define the booking process steps based on actual application data
  const steps = [
    {
      id: 'application',
      title: 'Application Submitted',
      description: 'Rental application completed',
      completed: application?.status === 'pending' || application?.status === 'approved' || application?.status === 'completed',
      icon: application?.status === 'pending' || application?.status === 'approved' || application?.status === 'completed' ? CheckCircle : Circle
    },
    {
      id: 'approval',
      title: 'Application Approved',
      description: 'Application reviewed and approved',
      completed: application?.status === 'approved' || application?.status === 'completed',
      icon: application?.status === 'approved' || application?.status === 'completed' ? CheckCircle : 
            application?.status === 'rejected' ? AlertCircle : Clock
    },
    {
      id: 'lease',
      title: 'Lease Generated',
      description: 'Lease agreement prepared',
      completed: application?.leaseGenerated || false,
      icon: application?.leaseGenerated ? CheckCircle : Circle
    },
    {
      id: 'signed',
      title: 'Lease Signed',
      description: 'Lease agreement signed and returned',
      completed: application?.leaseSigned || false,
      icon: application?.leaseSigned ? CheckCircle : Circle
    },
    {
      id: 'payment',
      title: 'Payment Made',
      description: 'Deposit and first payment completed',
      completed: application?.paymentReceived || applicationPayments.some(payment => payment.status === 'succeeded'),
      icon: (application?.paymentReceived || applicationPayments.some(payment => payment.status === 'succeeded')) ? CheckCircle : Circle
    },
    {
      id: 'admin_verification',
      title: 'Admin Verification',
      description: 'All payments verified and booking confirmed by admin',
      completed: application?.status === 'completed',
      icon: application?.status === 'completed' ? CheckCircle : 
            (application?.paymentReceived || applicationPayments.some(payment => payment.status === 'succeeded')) ? Clock : Circle
    }
  ];

  const completedSteps = steps.filter(step => step.completed).length;
  const totalSteps = steps.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-lg shadow-sm border border-white/30 max-w-md">
      {/* Dropdown Header */}
      <div 
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <h3 className="text-sm font-semibold text-gray-900">Booking Progress</h3>
          <div className="flex items-center space-x-2">
            <div className="text-xs text-gray-600">
              {completedSteps}/{totalSteps}
            </div>
            <div className="w-16 bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-gradient-to-r from-blue-500 to-green-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <span className="text-xs text-gray-500">
              {Math.round(progressPercentage)}%
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`text-xs font-medium ${
            application?.status === 'completed' ? 'text-green-600' :
            application?.status === 'approved' ? 'text-blue-600' :
            application?.status === 'pending' ? 'text-yellow-600' :
            'text-red-600'
          }`}>
            {application?.status?.charAt(0).toUpperCase() + application?.status?.slice(1) || 'Unknown'}
          </div>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </div>

      {/* Dropdown Content */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-3 space-y-3">
          {/* Detailed Progress Bar */}
          <div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-gradient-to-r from-blue-500 to-green-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {Math.round(progressPercentage)}% complete
            </div>
          </div>

          {/* Steps List */}
          <div className="space-y-1.5">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              const isCompleted = step.completed;
              const isCurrent = !isCompleted && (index === 0 || steps[index - 1]?.completed);
              
              return (
                <div 
                  key={step.id}
                  className={`flex items-center space-x-2 p-1.5 rounded transition-all duration-200 ${
                    isCompleted 
                      ? 'bg-green-50 border border-green-200' 
                      : isCurrent 
                        ? 'bg-blue-50 border border-blue-200' 
                        : 'bg-gray-50 border border-gray-200'
                  }`}
                >
                  <div className="flex-shrink-0">
                    <IconComponent 
                      className={`h-3.5 w-3.5 ${
                        isCompleted 
                          ? 'text-green-600' 
                          : isCurrent 
                            ? 'text-blue-600' 
                            : 'text-gray-400'
                      }`} 
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className={`text-xs font-medium ${
                        isCompleted 
                          ? 'text-green-900' 
                          : isCurrent 
                            ? 'text-blue-900' 
                            : 'text-gray-500'
                      }`}>
                        {step.title}
                      </h4>
                      {isCompleted && (
                        <span className="text-xs text-green-600 font-medium">
                          ✓
                        </span>
                      )}
                      {isCurrent && !isCompleted && (
                        <span className="text-xs text-blue-600 font-medium">
                          Next
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Next Action CTA - Only show for incomplete user steps */}
          {completedSteps < totalSteps && 
           application?.status !== 'completed' && 
           steps.find(step => !step.completed)?.id !== 'admin_verification' && (
            <div className="p-2 bg-gradient-to-r from-blue-50 to-cyan-50 rounded border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-medium text-blue-900">
                    {completedSteps === 0 
                      ? "Let's get started!" 
                      : "Next: " + (steps.find(step => !step.completed)?.title || "")
                    }
                  </h4>
                  <p className="text-xs text-blue-700 mt-0.5">
                    {completedSteps === 0 
                      ? "Complete your rental application to begin the booking process."
                      : "Continue with the next step to complete your booking."
                    }
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {completedSteps + 1}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Completion Celebration - Only when admin verification is complete */}
          {application?.status === 'completed' && (
            <div className="p-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded border border-green-200">
              <div className="flex items-center space-x-2">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <h4 className="text-xs font-medium text-green-900">
                    Booking Complete!
                  </h4>
                  <p className="text-xs text-green-700 mt-0.5">
                    Congratulations! Your rental booking is fully confirmed and verified by our team.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Pending Admin Verification Message */}
          {applicationPayments.some(payment => payment.status === 'succeeded') && 
           application?.status !== 'completed' && 
           leaseStatus?.leaseSigned && (
            <div className="p-2 bg-gradient-to-r from-yellow-50 to-amber-50 rounded border border-yellow-200">
              <div className="flex items-center space-x-2">
                <div className="flex-shrink-0">
                  <Clock className="h-4 w-4 text-yellow-600" />
                </div>
                <div>
                  <h4 className="text-xs font-medium text-yellow-900">
                    Pending Admin Verification
                  </h4>
                  <p className="text-xs text-yellow-700 mt-0.5">
                    Your payment has been received! Our team is verifying all details and will confirm your booking shortly.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CompletionStatus;
