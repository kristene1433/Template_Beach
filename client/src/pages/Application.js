import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  User, 
  MapPin, 
  Phone, 
  Users, 
  Plus, 
  Trash2,
  FileText,
  Save,
  Edit
} from 'lucide-react';
import toast from 'react-hot-toast';

const Application = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    phone: '',
    additionalGuests: []
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [errors, setErrors] = useState({});
  const [existingApplication, setExistingApplication] = useState(null);

  // Load existing application data when component mounts
  useEffect(() => {
    if (!user) return; // Early return if no user, but hook still gets called
    
    const loadApplicationData = async () => {
      try {
        const response = await fetch('/api/application', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.application) {
            setExistingApplication(data.application);
            // Pre-fill form with existing data
            setFormData({
              firstName: data.application.firstName || '',
              lastName: data.application.lastName || '',
              address: {
                street: data.application.address?.street || '',
                city: data.application.address?.city || '',
                state: data.application.address?.state || '',
                zipCode: data.application.address?.zipCode || ''
              },
              phone: data.application.phone || '',
              additionalGuests: (data.application.additionalGuests || []).map(guest => ({
                ...guest,
                id: guest.id || Date.now() + Math.random() // Add id for frontend tracking
              }))
            });
          }
        }
      } catch (error) {
        console.error('Error loading application:', error);
        // Don't show error toast for this, just continue with empty form
      } finally {
        setIsLoadingData(false);
      }
    };

    loadApplicationData();
  }, [user]);

  // Check if user is authenticated
  if (!user) {
    navigate('/login');
    return null;
  }

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

  const addGuest = () => {
    setFormData(prev => ({
      ...prev,
      additionalGuests: [
        ...prev.additionalGuests,
        {
          id: Date.now(),
          firstName: '',
          lastName: '',
          isAdult: true
        }
      ]
    }));
  };

  const removeGuest = (guestId) => {
    setFormData(prev => ({
      ...prev,
      additionalGuests: prev.additionalGuests.filter(guest => guest.id !== guestId)
    }));
  };

  const updateGuest = (guestId, field, value) => {
    setFormData(prev => ({
      ...prev,
      additionalGuests: prev.additionalGuests.map(guest =>
        guest.id === guestId ? { ...guest, [field]: value } : guest
      )
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.address.street.trim()) newErrors['address.street'] = 'Street address is required';
    if (!formData.address.city.trim()) newErrors['address.city'] = 'City is required';
    if (!formData.address.state.trim()) newErrors['address.state'] = 'State is required';
    if (!formData.address.zipCode.trim()) newErrors['address.zipCode'] = 'ZIP code is required';

    // Phone validation
    if (formData.phone && !/^[+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/[\s\-()]/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // ZIP code validation
    if (formData.address.zipCode && !/^\d{5}(-\d{4})?$/.test(formData.address.zipCode)) {
      newErrors['address.zipCode'] = 'Please enter a valid ZIP code';
    }

    // Validate additional guests
    formData.additionalGuests.forEach((guest, index) => {
      if (guest.firstName.trim() && !guest.lastName.trim()) {
        newErrors[`guest${index}LastName`] = 'Last name is required for additional guest';
      }
      if (!guest.firstName.trim() && guest.lastName.trim()) {
        newErrors[`guest${index}FirstName`] = 'First name is required for additional guest';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    setIsLoading(true);
    
    try {
      // Filter out empty guest entries and remove frontend-only 'id' field
      const filteredGuests = formData.additionalGuests
        .filter(guest => guest.firstName.trim() && guest.lastName.trim())
        .map(guest => ({
          firstName: guest.firstName,
          lastName: guest.lastName,
          isAdult: guest.isAdult
        }));

      const applicationData = {
        ...formData,
        additionalGuests: filteredGuests
      };

      // Determine if this is a create or update operation
      const isUpdate = existingApplication !== null;
      const method = isUpdate ? 'PUT' : 'POST';
      const successMessage = isUpdate ? 'Application updated successfully!' : 'Application submitted successfully!';

      // Send the data to the backend
      const response = await fetch('/api/application', {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(applicationData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${isUpdate ? 'update' : 'submit'} application`);
      }

      const result = await response.json();
      
      // Update the existing application state
      setExistingApplication(result.application);
      
      toast.success(successMessage);
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message || `Failed to ${existingApplication ? 'update' : 'submit'} application. Please try again.`);
      console.error('Application submission error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getFieldError = (fieldName) => {
    return errors[fieldName] || '';
  };

  // Show loading spinner while loading data
  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading application...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            {existingApplication ? (
              <Edit className="h-8 w-8 text-white" />
            ) : (
              <FileText className="h-8 w-8 text-white" />
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {existingApplication ? 'Edit Application' : 'Rental Application'}
          </h1>
          <p className="text-lg text-gray-600">
            {existingApplication 
              ? 'Update your rental application information' 
              : 'Complete your application for the Gulf Shores beachfront condo'
            }
          </p>
          {existingApplication && (
            <div className="mt-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                Application Status: {existingApplication.status || 'Submitted'}
              </span>
            </div>
          )}
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information Section */}
            <div className="form-section">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <User className="h-5 w-5 mr-2 text-blue-600" />
                Personal Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-group">
                  <label htmlFor="firstName" className="form-label">
                    First Name *
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`input-field ${getFieldError('firstName') ? 'border-red-300 focus:ring-red-500' : ''}`}
                    placeholder="Enter your first name"
                  />
                  {getFieldError('firstName') && (
                    <p className="form-error">{getFieldError('firstName')}</p>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="lastName" className="form-label">
                    Last Name *
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`input-field ${getFieldError('lastName') ? 'border-red-300 focus:ring-red-500' : ''}`}
                    placeholder="Enter your last name"
                  />
                  {getFieldError('lastName') && (
                    <p className="form-error">{getFieldError('lastName')}</p>
                  )}
                </div>
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
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                Address
              </h3>
              
              <div className="form-group">
                <label htmlFor="address.street" className="form-label">
                  Street Address *
                </label>
                <input
                  id="address.street"
                  name="address.street"
                  type="text"
                  autoComplete="street-address"
                  required
                  value={formData.address.street}
                  onChange={handleChange}
                  className={`input-field ${getFieldError('address.street') ? 'border-red-300 focus:ring-red-500' : ''}`}
                  placeholder="Enter street address"
                />
                {getFieldError('address.street') && (
                  <p className="form-error">{getFieldError('address.street')}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

            {/* Additional Guests Section */}
            <div className="form-section">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Users className="h-5 w-5 mr-2 text-blue-600" />
                  Additional Guests
                </h3>
                <button
                  type="button"
                  onClick={addGuest}
                  className="btn-secondary flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Guest
                </button>
              </div>

              {formData.additionalGuests.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  No additional guests added yet. Click "Add Guest" to include family members or roommates.
                </p>
              )}

              {formData.additionalGuests.map((guest, index) => (
                <div key={guest.id} className="border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">Guest {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeGuest(guest.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="form-group">
                      <label className="form-label">First Name</label>
                      <input
                        type="text"
                        value={guest.firstName}
                        onChange={(e) => updateGuest(guest.id, 'firstName', e.target.value)}
                        className={`input-field ${getFieldError(`guest${index}FirstName`) ? 'border-red-300 focus:ring-red-500' : ''}`}
                        placeholder="First name"
                      />
                      {getFieldError(`guest${index}FirstName`) && (
                        <p className="form-error">{getFieldError(`guest${index}FirstName`)}</p>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Last Name</label>
                      <input
                        type="text"
                        value={guest.lastName}
                        onChange={(e) => updateGuest(guest.id, 'lastName', e.target.value)}
                        className={`input-field ${getFieldError(`guest${index}LastName`) ? 'border-red-300 focus:ring-red-500' : ''}`}
                        placeholder="Last name"
                      />
                      {getFieldError(`guest${index}LastName`) && (
                        <p className="form-error">{getFieldError(`guest${index}LastName`)}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      id={`adult-${guest.id}`}
                      type="checkbox"
                      checked={guest.isAdult}
                      onChange={(e) => updateGuest(guest.id, 'isAdult', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`adult-${guest.id}`} className="ml-2 text-sm text-gray-700">
                      Adult (18+ years old)
                    </label>
                  </div>
                </div>
              ))}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary flex items-center"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {existingApplication ? 'Update Application' : 'Submit Application'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Application;
