import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import {
  User,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Shield,
  Edit,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
    reset,
    watch
  } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      rentalAmount: '',
      depositAmount: ''
    }
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
    watch: watchPassword
  } = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });

  useEffect(() => {
    if (user) {
      // Pre-fill form with user data
      setValue('firstName', user.firstName || '');
      setValue('lastName', user.lastName || '');
      setValue('email', user.email || '');
      setValue('phone', user.phone || '');
      setValue('address', user.address || '');
      setValue('city', user.city || '');
      setValue('state', user.state || '');
      setValue('zipCode', user.zipCode || '');
      setValue('rentalAmount', user.rentalAmount || '');
      setValue('depositAmount', user.depositAmount || '');
      reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        zipCode: user.zipCode || '',
        rentalAmount: user.rentalAmount || '',
        depositAmount: user.depositAmount || ''
      });
    }
  }, [user, setValue, reset]);

  const onSubmit = async (data) => {
    try {
      await updateProfile(data);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating profile');
    }
  };

  const onSubmitPassword = async (data) => {
    try {
      await changePassword(data.currentPassword, data.newPassword);
      setIsChangingPassword(false);
      resetPassword();
      toast.success('Password changed successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error changing password');
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    reset();
  };

  const handleCancelPasswordChange = () => {
    setIsChangingPassword(false);
    resetPassword();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">Please log in to access your profile</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-primary px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white flex items-center">
                <User className="mr-3 h-6 w-6" />
                Profile
              </h1>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-white text-primary px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          <div className="p-6 space-y-8">
            {/* Profile Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="mr-2 h-5 w-5 text-primary" />
                Personal Information
              </h2>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      {...register('firstName', { required: 'First name is required' })}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      {...register('lastName', { required: 'Last name is required' })}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      {...register('email', { required: 'Email is required' })}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      {...register('phone', { required: 'Phone is required' })}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                    )}
                  </div>
                </div>

                {/* Address Information */}
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                    <MapPin className="mr-2 h-4 w-4 text-primary" />
                    Address Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        {...register('address', { required: 'Street address is required' })}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                      {errors.address && (
                        <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        {...register('city', { required: 'City is required' })}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                      {errors.city && (
                        <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State *
                      </label>
                      <input
                        type="text"
                        {...register('state', { required: 'State is required' })}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                      {errors.state && (
                        <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ZIP Code *
                      </label>
                      <input
                        type="text"
                        {...register('zipCode', { required: 'ZIP code is required' })}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                      {errors.zipCode && (
                        <p className="text-red-500 text-sm mt-1">{errors.zipCode.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Rental Information */}
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                    <DollarSign className="mr-2 h-4 w-4 text-primary" />
                    Rental Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Monthly Rent *
                      </label>
                      <input
                        type="number"
                        {...register('rentalAmount', { required: 'Monthly rent is required' })}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                        placeholder="$0.00"
                      />
                      {errors.rentalAmount && (
                        <p className="text-red-500 text-sm mt-1">{errors.rentalAmount.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Security Deposit *
                      </label>
                      <input
                        type="number"
                        {...register('depositAmount', { required: 'Security deposit is required' })}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                        placeholder="$0.00"
                      />
                      {errors.depositAmount && (
                        <p className="text-red-500 text-sm mt-1">{errors.depositAmount.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button
                      type="submit"
                      disabled={!isDirty}
                      className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </button>
                  </div>
                )}
              </form>
            </div>

            {/* Change Password Section */}
            <div className="border-t border-gray-200 pt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Shield className="mr-2 h-5 w-5 text-primary" />
                  Change Password
                </h2>
                {!isChangingPassword && (
                  <button
                    onClick={() => setIsChangingPassword(true)}
                    className="bg-secondary text-white px-4 py-2 rounded-lg hover:bg-secondary-dark transition-colors flex items-center"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Change Password
                  </button>
                )}
              </div>

              {isChangingPassword && (
                <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Current Password *
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          {...registerPassword('currentPassword', { required: 'Current password is required' })}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {passwordErrors.currentPassword && (
                        <p className="text-red-500 text-sm mt-1">{passwordErrors.currentPassword.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        New Password *
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          {...registerPassword('newPassword', { 
                            required: 'New password is required',
                            minLength: { value: 8, message: 'Password must be at least 8 characters' }
                          })}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {passwordErrors.newPassword && (
                        <p className="text-red-500 text-sm mt-1">{passwordErrors.newPassword.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        {...registerPassword('confirmPassword', { 
                          required: 'Please confirm your new password',
                          validate: value => value === watchPassword('newPassword') || 'Passwords do not match'
                        })}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {passwordErrors.confirmPassword && (
                      <p className="text-red-500 text-sm mt-1">{passwordErrors.confirmPassword.message}</p>
                    )}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors flex items-center"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Update Password
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelPasswordChange}
                      className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Account Status */}
            <div className="border-t border-gray-200 pt-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Account Created</span>
                    <span className="text-sm text-gray-900">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Last Login</span>
                    <span className="text-sm text-gray-900">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                    </span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Application Status</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.applicationCompleted 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.applicationCompleted ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Lease Status</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.leaseSigned 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.leaseSigned ? 'Signed' : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
