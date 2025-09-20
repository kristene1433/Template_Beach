import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, Circle, Clock, AlertCircle, Edit3, Save, X, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminProgressBar = ({ application, onProgressUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedSteps, setEditedSteps] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [manuallyCompletedSteps, setManuallyCompletedSteps] = useState(new Set());

  // Define the booking process steps with admin controls
  const getInitialSteps = useCallback(() => [
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
      title: 'Lease Uploaded',
      description: 'Signed lease agreement uploaded',
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
  ], [application]);

  // Get steps with preserved manual completions
  const getStepsWithPreservedCompletions = useCallback(() => {
    const baseSteps = getInitialSteps();
    return baseSteps.map(step => {
      // If this step was manually completed by admin, keep it completed
      if (manuallyCompletedSteps.has(step.id)) {
        return {
          ...step,
          completed: true,
          icon: CheckCircle
        };
      }
      return step;
    });
  }, [manuallyCompletedSteps, getInitialSteps]);

  const [steps, setSteps] = useState(() => getStepsWithPreservedCompletions());

  // Update steps when application prop changes, but preserve manually completed steps
  useEffect(() => {
    setSteps(getStepsWithPreservedCompletions());
  }, [application?.status, application?.leaseGenerated, application?.leaseSigned, application?.paymentReceived, manuallyCompletedSteps, getStepsWithPreservedCompletions]);

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

      // Track manually completed steps
      const newManuallyCompleted = new Set(manuallyCompletedSteps);
      editedSteps.forEach(step => {
        if (step.adminControllable) {
          if (step.completed) {
            newManuallyCompleted.add(step.id);
          } else {
            newManuallyCompleted.delete(step.id);
          }
        }
      });
      setManuallyCompletedSteps(newManuallyCompleted);

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
    <div className="bg-white/90 backdrop-blur-md rounded-lg shadow-sm border border-white/30">
      {/* Dropdown Header */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <h3 className="text-sm font-semibold text-gray-900">Booking Progress</h3>
          <div className="flex items-center space-x-2">
            <div className="text-xs text-gray-600">
              {completedSteps} of {totalSteps} completed
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
        <div className="border-t border-gray-200 p-4 space-y-4">
          {/* Detailed Progress Bar */}
          <div>
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

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              Click steps to edit progress
            </div>
            <div className="flex items-center space-x-2">
              {!isEditing ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit();
                  }}
                  className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Edit3 className="h-3 w-3 mr-1" />
                  Edit Progress
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSave();
                    }}
                    className="inline-flex items-center px-2 py-1 text-xs font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <Save className="h-3 w-3 mr-1" />
                    Save
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCancel();
                    }}
                    className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProgressBar;
