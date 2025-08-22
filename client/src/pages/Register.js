import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  MapPin, 
  Building2, 
  Eye, 
  EyeOff,
  DollarSign
} from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    rentalAmount: '',
    depositAmount: '500'
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.address.street.trim()) newErrors['address.street'] = 'Street address is required';
    if (!formData.address.city.trim()) newErrors['address.city'] = 'City is required';
    if (!formData.address.state.trim()) newErrors['address.state'] = 'State is required';
    if (!formData.address.zipCode.trim()) newErrors['address.zipCode'] = 'ZIP code is required';
    if (!formData.rentalAmount) newErrors.rentalAmount = 'Rental amount is required';

    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Password confirmation
    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Phone validation
    if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // ZIP code validation
    if (formData.address.zipCode && !/^\d{5}(-\d{4})?$/.test(formData.address.zipCode)) {
      newErrors['address.zipCode'] = 'Please enter a valid ZIP code';
    }

    // Rental amount validation
    if (formData.rentalAmount && (isNaN(formData.rentalAmount) || parseFloat(formData.rentalAmount) <= 0)) {
      newErrors.rentalAmount = 'Please enter a valid rental amount';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const result = await register(formData);
      if (result.success) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFieldError = (fieldName) => {
    return errors[fieldName] || '';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
            <Building2 className="w-7 h-7 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Create Your Account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Join Palm Run LLC and start your rental application today
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information Section */}
            <div className="form-section">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label htmlFor="firstName" className="form-label">
                    First Name *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      autoComplete="given-name"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      className={`input-field pl-10 ${getFieldError('firstName') ? 'border-red-300 focus:ring-red-500' : ''}`}
                      placeholder="Enter your first name"
                    />
                  </div>
                  {getFieldError('firstName') && (
                    <p className="form-error">{getFieldError('firstName')}</p>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="lastName" className="form-label">
                    Last Name *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      autoComplete="family-name"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      className={`input-field pl-10 ${getFieldError('lastName') ? 'border-red-300 focus:ring-red-500' : ''}`}
                      placeholder="Enter your last name"
                    />
                  </div>
                  {getFieldError('lastName') && (
                    <p className="form-error">{getFieldError('lastName')}</p>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className={`input-field pl-10 ${getFieldError('email') ? 'border-red-300 focus:ring-red-500' : ''}`}
                    placeholder="Enter your email address"
                  />
                </div>
                {getFieldError('email') && (
                  <p className="form-error">{getFieldError('email')}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="phone" className="form-label">
                  Phone Number *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className={`input-field pl-10 ${getFieldError('phone') ? 'border-red-300 focus:ring-red-500' : ''}`}
                    placeholder="Enter your phone number"
                  />
                </div>
                {getFieldError('phone') && (
                  <p className="form-error">{getFieldError('phone')}</p>
                )}
              </div>
            </div>

            {/* Address Section */}
            <div className="form-section">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Address</h3>
              
              <div className="form-group">
                <label htmlFor="address.street" className="form-label">
                  Street Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="address.street"
                    name="address.street"
                    type="text"
                    autoComplete="street-address"
                    required
                    value={formData.address.street}
                    onChange={handleChange}
                    className={`input-field pl-10 ${getFieldError('address.street') ? 'border-red-300 focus:ring-red-500' : ''}`}
                    placeholder="Enter street address"
                  />
                </div>
                {getFieldError('address.street') && (
                  <p className="form-error">{getFieldError('address.street')}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="form-group">
                  <label htmlFor="address.city" className="form-label">
                    City *
                  </label>
                  <input
                    id="address.city"
                    name="address.city"
                    type="text"
                    autoComplete="address-level2"
                    required
                    value={formData.address.city}
                    onChange={handleChange}
                    className={`input-field ${getFieldError('address.city') ? 'border-red-300 focus:ring-red-500' : ''}`}
                    placeholder="City"
                  />
                  {getFieldError('address.city') && (
                    <p className="form-error">{getFieldError('address.city')}</p>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="address.state" className="form-label">
                    State *
                  </label>
                  <input
                    id="address.state"
                    name="address.state"
                    type="text"
                    autoComplete="address-level1"
                    required
                    value={formData.address.state}
                    onChange={handleChange}
                    className={`input-field ${getFieldError('address.state') ? 'border-red-300 focus:ring-red-500' : ''}`}
                    placeholder="State"
                  />
                  {getFieldError('address.state') && (
                    <p className="form-error">{getFieldError('address.state')}</p>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="address.zipCode" className="form-label">
                    ZIP Code *
                  </label>
                  <input
                    id="address.zipCode"
                    name="address.zipCode"
                    type="text"
                    autoComplete="postal-code"
                    required
                    value={formData.address.zipCode}
                    onChange={handleChange}
                    className={`input-field ${getFieldError('address.zipCode') ? 'border-red-300 focus:ring-red-500' : ''}`}
                    placeholder="ZIP Code"
                  />
                  {getFieldError('address.zipCode') && (
                    <p className="form-error">{getFieldError('address.zipCode')}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Financial Information Section */}
            <div className="form-section">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label htmlFor="rentalAmount" className="form-label">
                    Monthly Rent Amount *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="rentalAmount"
                      name="rentalAmount"
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={formData.rentalAmount}
                      onChange={handleChange}
                      className={`input-field pl-10 ${getFieldError('rentalAmount') ? 'border-red-300 focus:ring-red-500' : ''}`}
                      placeholder="0.00"
                    />
                  </div>
                  {getFieldError('rentalAmount') && (
                    <p className="form-error">{getFieldError('rentalAmount')}</p>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="depositAmount" className="form-label">
                    Security Deposit
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="depositAmount"
                      name="depositAmount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.depositAmount}
                      onChange={handleChange}
                      className="input-field pl-10"
                      placeholder="500.00"
                    />
                  </div>
                  <p className="form-help">Default is $500, can be adjusted based on agreement</p>
                </div>
              </div>
            </div>

            {/* Account Security Section */}
            <div className="form-section">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Security</h3>
              
              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className={`input-field pl-10 pr-10 ${getFieldError('password') ? 'border-red-300 focus:ring-red-500' : ''}`}
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {getFieldError('password') && (
                  <p className="form-error">{getFieldError('password')}</p>
                )}
                <p className="form-help">Password must be at least 6 characters long</p>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`input-field pl-10 pr-10 ${getFieldError('confirmPassword') ? 'border-red-300 focus:ring-red-500' : ''}`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {getFieldError('confirmPassword') && (
                  <p className="form-error">{getFieldError('confirmPassword')}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex justify-center items-center py-3 text-lg"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                ) : (
                  'Create Account & Continue'
                )}
              </button>
            </div>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-primary-600 hover:text-primary-500 font-medium"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            By creating an account, you agree to our{' '}
            <a href="#terms" className="text-primary-600 hover:text-primary-500">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#privacy" className="text-primary-600 hover:text-primary-500">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
