import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, Circle, Clock, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';

const CompletionStatus = ({ application, leaseStatus, recentPayments = [], onApplicationUpdate, compact = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [applicationPayments, setApplicationPayments] = useState([]);
  const [currentApplication, setCurrentApplication] = useState(application);

  // Update current application when prop changes
  useEffect(() => {
    setCurrentApplication(application);
  }, [application]);

  // Fetch latest application data
  const fetchLatestApplication = useCallback(async () => {
    if (application?._id) {
      try {
        const response = await axios.get(`/api/application/${application._id}`);
        const updatedApplication = response.data.application;
        setCurrentApplication(updatedApplication);
        // Notify parent component of the update
        if (onApplicationUpdate) {
          onApplicationUpdate(updatedApplication);
        }
      } catch (error) {
        console.error('Error fetching latest application:', error);
      }
    }
  }, [application?._id, onApplicationUpdate]);

  // Fetch payments for this specific application
  const fetchApplicationPayments = useCallback(async () => {
    if (application?._id) {
      try {
        const response = await axios.get(`/api/payment/history?applicationId=${application._id}`);
        setApplicationPayments(response.data.payments || []);
      } catch (error) {
        console.error('Error fetching application payments:', error);
        setApplicationPayments([]);
      }
    }
  }, [application?._id]);

  // Fetch both application data and payments
  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        fetchLatestApplication(),
        fetchApplicationPayments()
      ]);
    };

    fetchData();
    
    // Set up periodic refresh every 15 seconds to catch updates
    const interval = setInterval(fetchData, 15000);
    
    return () => clearInterval(interval);
  }, [application?._id, fetchLatestApplication, fetchApplicationPayments]);
  
  // Define the booking process steps based on actual application data
  const steps = [
    {
      id: 'application',
      title: 'Application Submitted',
      description: 'Rental application completed',
      instruction: 'Fill out and submit your rental application with all required information including personal details, rental dates, and guest information.',
      completed: currentApplication?.status === 'pending' || currentApplication?.status === 'approved' || currentApplication?.status === 'completed',
      icon: currentApplication?.status === 'pending' || currentApplication?.status === 'approved' || currentApplication?.status === 'completed' ? CheckCircle : Circle
    },
    {
      id: 'approval',
      title: 'Application Approved',
      description: 'Application reviewed and approved',
      instruction: 'We will review your application and approve it if all requirements are met. This typically takes 1-2 business days.',
      completed: currentApplication?.status === 'approved' || currentApplication?.status === 'completed',
      icon: currentApplication?.status === 'approved' || currentApplication?.status === 'completed' ? CheckCircle : 
            currentApplication?.status === 'rejected' ? AlertCircle : Clock
    },
    {
      id: 'lease',
      title: 'Lease Generated',
      description: 'Lease agreement prepared',
      instruction: 'Once approved, we will generate your lease agreement with all terms, dates, and payment details. You will receive a notification via email when ready to view.',
      completed: currentApplication?.leaseGenerated || false,
      icon: currentApplication?.leaseGenerated ? CheckCircle : Circle
    },
    {
      id: 'signed',
      title: 'Lease Uploaded',
      description: 'Signed lease agreement uploaded',
      instruction: 'Review the lease agreement carefully, print, sign, and upload a scanned copy.',
      completed: currentApplication?.leaseSigned || false,
      icon: currentApplication?.leaseSigned ? CheckCircle : Circle
    },
    {
      id: 'payment',
      title: 'Payment Made',
      description: 'Deposit and first payment completed',
      instruction: 'Make your security deposit and rent payment using our secure payment system. You will receive a confirmation via email.',
      completed: currentApplication?.paymentReceived || applicationPayments.some(payment => payment.status === 'succeeded'),
      icon: (currentApplication?.paymentReceived || applicationPayments.some(payment => payment.status === 'succeeded')) ? CheckCircle : Circle
    },
    {
      id: 'admin_verification',
      title: 'Admin Verification',
      description: 'All payments verified and booking confirmed by admin',
      instruction: 'We will verify all payments and documents, then send you a final signed copy of the lease agreement.',
      completed: currentApplication?.status === 'completed',
      icon: currentApplication?.status === 'completed' ? CheckCircle : 
            (currentApplication?.paymentReceived || applicationPayments.some(payment => payment.status === 'succeeded')) ? Clock : Circle
    }
  ];

  const completedSteps = steps.filter(step => step.completed).length;
  const totalSteps = steps.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  // Compact mode for dashboard cards
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-600 font-medium">
          {completedSteps}/{totalSteps}
        </span>
        <div className="flex-1 bg-gray-200 rounded-full h-1.5 min-w-16">
          <div 
            className="bg-gradient-to-r from-blue-500 to-green-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <span className="text-xs text-gray-500 font-medium">
          {Math.round(progressPercentage)}%
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-lg shadow-sm border border-white/30 max-w-md overflow-hidden">
      {/* Dropdown Header */}
      <div 
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3 flex-1 min-w-0">
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
        <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
          <div className={`text-xs font-medium ${
            application?.status === 'completed' ? 'text-green-600' :
            application?.status === 'approved' ? 'text-blue-600' :
            application?.status === 'pending' ? 'text-yellow-600' :
            'text-red-600'
          }`}>
            {application?.status?.charAt(0).toUpperCase() + application?.status?.slice(1) || 'Unknown'}
          </div>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-gray-400 flex-shrink-0" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
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
                    {/* Step Description */}
                    <p className={`text-xs mt-0.5 ${
                      isCompleted 
                        ? 'text-green-700' 
                        : isCurrent 
                          ? 'text-blue-700' 
                          : 'text-gray-500'
                    }`}>
                      {step.description}
                    </p>
                    {/* Step Instruction - Only show for current step */}
                    {isCurrent && step.instruction && (
                      <p className="text-xs mt-1 text-blue-600 font-medium">
                        {step.instruction}
                      </p>
                    )}
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
           currentApplication?.status !== 'completed' && 
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
