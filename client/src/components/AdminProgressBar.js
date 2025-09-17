import React, { useState } from 'react';
import { CheckCircle, Circle, Clock, AlertCircle, Edit3, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminProgressBar = ({ application, onProgressUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedSteps, setEditedSteps] = useState(null);

  // Define the booking process steps with admin controls
  const getInitialSteps = () => [
    {
      id: 'application',
      title: 'Application Submitted',
      description: 'Rental application completed',
      completed: application?.status === 'pending' || application?.status === 'approved' || application?.status === 'completed',
      icon: application?.status === 'pending' || application?.status === 'approved' || application?.status === 'completed' ? CheckCircle : Circle,
      adminControllable: false // This is controlled by user action
    },
    {
      id: 'approval',
      title: 'Application Approved',
      description: 'Application reviewed and approved',
      completed: application?.status === 'approved' || application?.status === 'completed',
      icon: application?.status === 'approved' || application?.status === 'completed' ? CheckCircle : 
            application?.status === 'rejected' ? AlertCircle : Clock,
      adminControllable: true
    },
    {
      id: 'lease',
      title: 'Lease Generated',
      description: 'Lease agreement prepared',
      completed: application?.leaseGenerated || false,
      icon: application?.leaseGenerated ? CheckCircle : Circle,
      adminControllable: true
    },
    {
      id: 'signed',
      title: 'Lease Signed',
      description: 'Lease agreement signed and returned',
      completed: application?.leaseSigned || false,
      icon: application?.leaseSigned ? CheckCircle : Circle,
      adminControllable: true
    },
    {
      id: 'payment',
      title: 'Payment Made',
      description: 'Deposit and first payment completed',
      completed: application?.paymentReceived || false,
      icon: application?.paymentReceived ? CheckCircle : Circle,
      adminControllable: true
    },
    {
      id: 'admin_verification',
      title: 'Admin Verification',
      description: 'All payments verified and booking confirmed by admin',
      completed: application?.status === 'completed',
      icon: application?.status === 'completed' ? CheckCircle : 
            application?.paymentReceived ? Clock : Circle,
      adminControllable: true
    }
  ];

  const [steps, setSteps] = useState(getInitialSteps());

  const completedSteps = steps.filter(step => step.completed).length;
  const totalSteps = steps.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  const handleEdit = () => {
    setEditedSteps(steps.map(step => ({ ...step })));
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditedSteps(null);
    setIsEditing(false);
  };

  const handleStepToggle = (stepId) => {
    if (!editedSteps) return;
    
    setEditedSteps(prev => 
      prev.map(step => 
        step.id === stepId 
          ? { ...step, completed: !step.completed }
          : step
      )
    );
  };

  const handleSave = async () => {
    try {
      // Update the application with new progress data
      const updates = {};
      
      // Map step IDs to application fields
      const stepFieldMap = {
        'approval': 'status',
        'lease': 'leaseGenerated',
        'signed': 'leaseSigned',
        'payment': 'paymentReceived',
        'admin_verification': 'status'
      };

      editedSteps.forEach(step => {
        if (step.adminControllable) {
          const field = stepFieldMap[step.id];
          if (field) {
            if (step.id === 'approval') {
              updates[field] = step.completed ? 'approved' : 'pending';
            } else if (step.id === 'admin_verification') {
              updates[field] = step.completed ? 'completed' : 'approved';
            } else {
              updates[field] = step.completed;
            }
          }
        }
      });

      // Call the update function
      if (onProgressUpdate) {
        await onProgressUpdate(application._id, updates);
      }

      // Update local state
      setSteps(editedSteps);
      setIsEditing(false);
      setEditedSteps(null);
      
      toast.success('Progress updated successfully');
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('Failed to update progress');
    }
  };

  const currentSteps = isEditing ? editedSteps : steps;

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-lg shadow-sm border border-white/30 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Booking Progress</h3>
        <div className="flex items-center space-x-2">
          <div className="text-xs text-gray-600">
            {completedSteps} of {totalSteps} completed
          </div>
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="Edit progress"
            >
              <Edit3 className="h-4 w-4" />
            </button>
          ) : (
            <div className="flex space-x-1">
              <button
                onClick={handleSave}
                className="p-1 text-green-600 hover:text-green-700 transition-colors"
                title="Save changes"
              >
                <Save className="h-4 w-4" />
              </button>
              <button
                onClick={handleCancel}
                className="p-1 text-red-600 hover:text-red-700 transition-colors"
                title="Cancel editing"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
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
      <div className="space-y-2">
        {currentSteps.map((step, index) => {
          const IconComponent = step.icon;
          const isCompleted = step.completed;
          const isCurrent = !isCompleted && (index === 0 || currentSteps[index - 1]?.completed);
          
          return (
            <div 
              key={step.id}
              className={`flex items-center space-x-3 p-2 rounded-md transition-all duration-200 ${
                isCompleted 
                  ? 'bg-green-50 border border-green-200' 
                  : isCurrent 
                    ? 'bg-blue-50 border border-blue-200' 
                    : 'bg-gray-50 border border-gray-200'
              }`}
            >
              <div className="flex-shrink-0">
                {isEditing && step.adminControllable ? (
                  <button
                    onClick={() => handleStepToggle(step.id)}
                    className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      isCompleted
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 hover:border-green-400'
                    }`}
                  >
                    {isCompleted && <CheckCircle className="h-3 w-3" />}
                  </button>
                ) : (
                  <IconComponent 
                    className={`h-5 w-5 ${
                      isCompleted 
                        ? 'text-green-600' 
                        : isCurrent 
                          ? 'text-blue-600' 
                          : 'text-gray-400'
                    }`} 
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className={`text-xs font-medium ${
                      isCompleted 
                        ? 'text-green-900' 
                        : isCurrent 
                          ? 'text-blue-900' 
                          : 'text-gray-500'
                    }`}>
                      {step.title}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {step.description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
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
                    {isEditing && step.adminControllable && (
                      <span className="text-xs text-gray-400">
                        Admin
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Status Summary */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600">Current Status:</span>
          <span className={`font-medium ${
            application?.status === 'completed' ? 'text-green-600' :
            application?.status === 'approved' ? 'text-blue-600' :
            application?.status === 'pending' ? 'text-yellow-600' :
            'text-red-600'
          }`}>
            {application?.status?.charAt(0).toUpperCase() + application?.status?.slice(1) || 'Unknown'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AdminProgressBar;
