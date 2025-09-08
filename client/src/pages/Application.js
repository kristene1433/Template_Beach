import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  User, 
  MapPin, 
  Phone, 
  Users, 
  Plus, 
  Trash2,
  FileText
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
    requestedStartDate: '',
    requestedEndDate: '',
    additionalGuests: []
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

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
    
    // If start date changes, reset end date if it's before the new start date
    if (name === 'requestedStartDate' && value && formData.requestedEndDate) {
      const startDate = new Date(value);
      const endDate = new Date(formData.requestedEndDate);
      if (endDate <= startDate) {
        setFormData(prev => ({
          ...prev,
          requestedEndDate: ''
        }));
      }
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
    if (!formData.requestedStartDate.trim()) newErrors.requestedStartDate = 'Please select your desired lease start date';
    if (!formData.requestedEndDate.trim()) newErrors.requestedEndDate = 'Please select your desired lease end date';
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

    // Date validation
    if (formData.requestedStartDate && formData.requestedEndDate) {
      const startDate = new Date(formData.requestedStartDate);
      const endDate = new Date(formData.requestedEndDate);
      if (endDate <= startDate) {
        newErrors.requestedEndDate = 'End date must be after start date';
      }
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

      // Create the application
      const response = await fetch('/api/application', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(applicationData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create application');
      }

      const result = await response.json();
      
      // Submit the application immediately
      const submitResponse = await fetch(`/api/application/${result.application._id}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!submitResponse.ok) {
        const submitErrorData = await submitResponse.json();
        throw new Error(submitErrorData.error || 'Failed to submit application');
      }

      toast.success('Application submitted successfully!');
      
      // Navigate back to dashboard
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message || 'Failed to submit application. Please try again.');
      console.error('Application submission error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getFieldError = (fieldName) => {
    return errors[fieldName] || '';
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero header to match Home/Login/Dashboard */}
      <section className="relative pt-16">
        <div className="absolute inset-0 z-0">
          <video className="w-full h-44 md:h-60 object-cover" poster="/images/image1.jpg" autoPlay muted loop playsInline>
            <source src="/videos/beach-video.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">Rental Application</h1>
                <p className="text-gray-200 mt-2">Complete your rental application to get started</p>
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card bg-white/90 backdrop-blur-md border-white/30">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-group">
                  <label htmlFor="requestedStartDate" className="form-label">
                    Desired Lease Start Date *
                  </label>
                  <input
                    id="requestedStartDate"
                    name="requestedStartDate"
                    type="date"
                    required
                    value={formData.requestedStartDate}
                    onChange={handleChange}
                    className={`input-field ${getFieldError('requestedStartDate') ? 'border-red-300 focus:ring-red-500' : ''}`}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  {getFieldError('requestedStartDate') && (
                    <p className="form-error">{getFieldError('requestedStartDate')}</p>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="requestedEndDate" className="form-label">
                    Desired Lease End Date *
                  </label>
                  <input
                    id="requestedEndDate"
                    name="requestedEndDate"
                    type="date"
                    required
                    value={formData.requestedEndDate}
                    onChange={handleChange}
                    className={`input-field ${getFieldError('requestedEndDate') ? 'border-red-300 focus:ring-red-500' : ''}`}
                    min={formData.requestedStartDate || new Date().toISOString().split('T')[0]}
                  />
                  {getFieldError('requestedEndDate') && (
                    <p className="form-error">{getFieldError('requestedEndDate')}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Current Address Section */}
            <div className="form-section">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                Current Address
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
                  placeholder="Enter your street address"
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
                    placeholder="Enter your city"
                  />
                  {getFieldError('address.city') && (
                    <p className="form-error">{getFieldError('address.city')}</p>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="address.state" className="form-label">
                    State *
                  </label>
                  <select
                    id="address.state"
                    name="address.state"
                    required
                    value={formData.address.state}
                    onChange={handleChange}
                    className={`input-field ${getFieldError('address.state') ? 'border-red-300 focus:ring-red-500' : ''}`}
                  >
                    <option value="">Select state</option>
                    <option value="AL">Alabama</option>
                    <option value="AK">Alaska</option>
                    <option value="AZ">Arizona</option>
                    <option value="AR">Arkansas</option>
                    <option value="CA">California</option>
                    <option value="CO">Colorado</option>
                    <option value="CT">Connecticut</option>
                    <option value="DE">Delaware</option>
                    <option value="DC">District Of Columbia</option>
                    <option value="FL">Florida</option>
                    <option value="GA">Georgia</option>
                    <option value="HI">Hawaii</option>
                    <option value="ID">Idaho</option>
                    <option value="IL">Illinois</option>
                    <option value="IN">Indiana</option>
                    <option value="IA">Iowa</option>
                    <option value="KS">Kansas</option>
                    <option value="KY">Kentucky</option>
                    <option value="LA">Louisiana</option>
                    <option value="ME">Maine</option>
                    <option value="MD">Maryland</option>
                    <option value="MA">Massachusetts</option>
                    <option value="MI">Michigan</option>
                    <option value="MN">Minnesota</option>
                    <option value="MS">Mississippi</option>
                    <option value="MO">Missouri</option>
                    <option value="MT">Montana</option>
                    <option value="NE">Nebraska</option>
                    <option value="NV">Nevada</option>
                    <option value="NH">New Hampshire</option>
                    <option value="NJ">New Jersey</option>
                    <option value="NM">New Mexico</option>
                    <option value="NY">New York</option>
                    <option value="NC">North Carolina</option>
                    <option value="ND">North Dakota</option>
                    <option value="OH">Ohio</option>
                    <option value="OK">Oklahoma</option>
                    <option value="OR">Oregon</option>
                    <option value="PA">Pennsylvania</option>
                    <option value="RI">Rhode Island</option>
                    <option value="SC">South Carolina</option>
                    <option value="SD">South Dakota</option>
                    <option value="TN">Tennessee</option>
                    <option value="TX">Texas</option>
                    <option value="UT">Utah</option>
                    <option value="VT">Vermont</option>
                    <option value="VA">Virginia</option>
                    <option value="WA">Washington</option>
                    <option value="WV">West Virginia</option>
                    <option value="WI">Wisconsin</option>
                    <option value="WY">Wyoming</option>
                  </select>
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
                    placeholder="Enter your ZIP code"
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
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Guest
                </button>
              </div>

              {formData.additionalGuests.length === 0 && (
                <p className="text-gray-500 text-sm">No additional guests added yet.</p>
              )}

              {formData.additionalGuests.map((guest, index) => (
                <div key={guest.id} className="border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-medium text-gray-900">Guest {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeGuest(guest.id)}
                      className="text-red-600 hover:text-red-800"
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

            {/* Form Buttons */}
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
                  <FileText className="h-4 w-4 mr-2" />
                )}
                Submit Application
              </button>
            </div>
          </form>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Application;
