import React from 'react';
import { CheckCircle, Circle, Clock, AlertCircle } from 'lucide-react';

const CompletionStatus = ({ application, leaseStatus, recentPayments = [] }) => {
  // Define the booking process steps
  const steps = [
    {
      id: 'account',
      title: 'Account Created',
      description: 'User account established',
      completed: true, // Always true if they're logged in
      icon: CheckCircle
    },
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
      completed: leaseStatus?.isComplete || false,
      icon: leaseStatus?.isComplete ? CheckCircle : Circle
    },
    {
      id: 'signed',
      title: 'Lease Signed',
      description: 'Lease agreement signed and returned',
      completed: leaseStatus?.leaseSigned || false,
      icon: leaseStatus?.leaseSigned ? CheckCircle : Circle
    },
    {
      id: 'payment',
      title: 'Payment Made',
      description: 'Deposit and first payment completed',
      completed: recentPayments.some(payment => payment.status === 'succeeded'),
      icon: recentPayments.some(payment => payment.status === 'succeeded') ? CheckCircle : Circle
    }
  ];

  const completedSteps = steps.filter(step => step.completed).length;
  const totalSteps = steps.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-sm border border-white/30 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Booking Progress</h3>
        <div className="text-sm text-gray-600">
          {completedSteps} of {totalSteps} completed
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {Math.round(progressPercentage)}% complete
        </div>
      </div>

      {/* Steps List */}
      <div className="space-y-4">
        {steps.map((step, index) => {
          const IconComponent = step.icon;
          const isCompleted = step.completed;
          const isCurrent = !isCompleted && (index === 0 || steps[index - 1]?.completed);
          
          return (
            <div 
              key={step.id}
              className={`flex items-start space-x-3 p-3 rounded-lg transition-all duration-200 ${
                isCompleted 
                  ? 'bg-green-50 border border-green-200' 
                  : isCurrent 
                    ? 'bg-blue-50 border border-blue-200' 
                    : 'bg-gray-50 border border-gray-200'
              }`}
            >
              <div className="flex-shrink-0 mt-0.5">
                <IconComponent 
                  className={`h-5 w-5 ${
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
                  <h4 className={`text-sm font-medium ${
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
                      ✓ Complete
                    </span>
                  )}
                  {isCurrent && !isCompleted && (
                    <span className="text-xs text-blue-600 font-medium">
                      Next Step
                    </span>
                  )}
                </div>
                <p className={`text-xs mt-1 ${
                  isCompleted 
                    ? 'text-green-700' 
                    : isCurrent 
                      ? 'text-blue-700' 
                      : 'text-gray-500'
                }`}>
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Next Action CTA */}
      {completedSteps < totalSteps && (
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-blue-900">
                {completedSteps === 0 
                  ? "Let's get started!" 
                  : `Next: ${steps.find(step => !step.completed)?.title}`
                }
              </h4>
              <p className="text-xs text-blue-700 mt-1">
                {completedSteps === 0 
                  ? "Complete your rental application to begin the booking process."
                  : "Continue with the next step to complete your booking."
                }
              </p>
            </div>
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {completedSteps + 1}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Completion Celebration */}
      {completedSteps === totalSteps && (
        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-green-900">
                🎉 Booking Complete!
              </h4>
              <p className="text-xs text-green-700 mt-1">
                Congratulations! Your rental booking is fully confirmed.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompletionStatus;
