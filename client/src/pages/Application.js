import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
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
  const { id } = useParams(); // Get application ID from URL if viewing existing application
  
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
    requestedMonths: '',
    additionalGuests: []
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [errors, setErrors] = useState({});
  const [existingApplication, setExistingApplication] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);

  // Load application data when component mounts
  useEffect(() => {
    if (!user) return;
    
    const loadApplicationData = async () => {
      try {
        if (id) {
          // Loading specific application by ID
          const response = await fetch(`/api/application/${id}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            const app = data.application;
            setExistingApplication(app);
            setIsViewMode(true);
            
            // Pre-fill form with existing data
            setFormData({
              firstName: app.firstName || '',
              lastName: app.lastName || '',
              address: {
                street: app.address?.street || '',
                city: app.address?.city || '',
                state: app.address?.state || '',
                zipCode: app.address?.zipCode || '',
              },
              phone: app.phone || '',
              requestedMonths: app.requestedMonths || '',
              additionalGuests: (app.additionalGuests || []).map(guest => ({
                ...guest,
                id: guest.id || Date.now() + Math.random()
              }))
            });
          } else {
            toast.error('Application not found');
            navigate('/dashboard');
          }
        } else {
          // Loading most recent application (for editing)
          const response = await fetch('/api/application', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            if (data.applications && data.applications.length > 0) {
              const mostRecentApp = data.applications[0];
              setExistingApplication(mostRecentApp);
              
              setFormData({
                firstName: mostRecentApp.firstName || '',
                lastName: mostRecentApp.lastName || '',
                address: {
                  street: mostRecentApp.address?.street || '',
                  city: mostRecentApp.address?.city || '',
                  state: mostRecentApp.address?.state || '',
                  zipCode: mostRecentApp.address?.zipCode || '',
                },
                phone: mostRecentApp.phone || '',
                requestedMonths: mostRecentApp.requestedMonths || '',
                additionalGuests: (mostRecentApp.additionalGuests || []).map(guest => ({
                  ...guest,
                  id: guest.id || Date.now() + Math.random()
                }))
              });
            }
          }
        }
      } catch (error) {
        console.error('Error loading application:', error);
        if (id) {
          toast.error('Failed to load application');
          navigate('/dashboard');
        }
      } finally {
        setIsLoadingData(false);
      }
    };

    loadApplicationData();
  }, [user, id, navigate]);

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
    if (!formData.requestedMonths.trim()) newErrors.requestedMonths = 'Please select when you would like to start your lease';
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
      const url = isUpdate ? `/api/application/${existingApplication._id}` : '/api/application';
      const successMessage = isUpdate ? 'Application updated successfully!' : 'Application created successfully!';

      // Send the data to the backend
      const response = await fetch(url, {
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
       // Force a page reload to ensure dashboard shows updated data
       window.location.href = '/dashboard';
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

  const handleSubmitApplication = async () => {
    if (!existingApplication) {
      toast.error('Please save your application first before submitting');
      return;
    }

    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/application/${existingApplication._id}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit application');
      }

      const result = await response.json();
      
      // Update the existing application state
      setExistingApplication(result.application);
      
                    toast.success('Application submitted successfully! It is now under review by our team.');
       // Force a page reload to ensure dashboard shows updated data
       window.location.href = '/dashboard';
    } catch (error) {
      toast.error(error.message || 'Failed to submit application. Please try again.');
      console.error('Application submission error:', error);
    } finally {
      setIsLoading(false);
    }
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
          <div className="text-left mb-4">
            <Link
              to="/dashboard"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              ← Back to Dashboard
            </Link>
          </div>
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            {existingApplication ? (
              <Edit className="h-8 w-8 text-white" />
            ) : (
              <FileText className="h-8 w-8 text-white" />
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isViewMode ? 'View Application' : existingApplication ? 'Edit Application' : 'Rental Application'}
          </h1>
          <p className="text-lg text-gray-600">
            {isViewMode 
              ? 'Review your submitted rental application details' 
              : existingApplication 
                ? 'Update your rental application information' 
                : 'Complete your application for the Gulf Shores beachfront condo'
            }
          </p>
          {!existingApplication && (
            <p className="text-sm text-gray-500 mt-2">
              You can save your application as a draft and submit it when ready, or submit it immediately.
            </p>
          )}
                     {existingApplication && (
             <div className="mt-2">
               <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                 existingApplication.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                 existingApplication.status === 'pending' ? 'bg-blue-100 text-blue-800' :
                 existingApplication.status === 'approved' ? 'bg-green-100 text-green-800' :
                 existingApplication.status === 'rejected' ? 'bg-red-100 text-red-800' :
                 'bg-blue-100 text-blue-800'
               }`}>
                 Application Status: {
                   existingApplication.status === 'draft' ? 'Draft' :
                   existingApplication.status === 'pending' ? 'Submitted' :
                   existingApplication.status === 'approved' ? 'Approved' :
                   existingApplication.status === 'rejected' ? 'Declined' :
                   'Unknown'
                 }
               </span>
             </div>
           )}
                     {existingApplication && !isViewMode && (
             <div className="mt-3">
               <button
                 onClick={() => {
                   setExistingApplication(null);
                   setFormData({
                     firstName: '',
                     lastName: '',
                     address: { street: '', city: '', state: '', zipCode: '' },
                     phone: '',
                     requestedMonths: '',
                     additionalGuests: []
                   });
                 }}
                 className="inline-flex items-center px-4 py-2 border border-blue-300 rounded-md text-sm font-medium text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
               >
                 <Plus className="h-4 w-4 mr-2" />
                 Create New Application
               </button>
             </div>
           )}
           {/* Application Workflow Explanation */}
           {existingApplication && !isViewMode && (
             <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
               <h4 className="text-sm font-medium text-blue-900 mb-2">Application Workflow:</h4>
               <div className="text-xs text-blue-800 space-y-1">
                 <p>• <strong>Draft:</strong> Save your application and edit later</p>
                 <p>• <strong>Submit:</strong> Click "Submit Application" to send for review</p>
                 <p>• <strong>Under Review:</strong> Our team will review your application</p>
                 <p>• <strong>Approved:</strong> We'll contact you to proceed with lease</p>
                 <p>• <strong>Declined:</strong> Contact us for more information</p>
               </div>
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
                    disabled={isViewMode}
                    className={`input-field ${getFieldError('firstName') ? 'border-red-300 focus:ring-red-500' : ''} ${isViewMode ? 'bg-gray-100 cursor-not-allowed' : ''}`}
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
                    disabled={isViewMode}
                    className={`input-field ${getFieldError('lastName') ? 'border-red-300 focus:ring-red-500' : ''} ${isViewMode ? 'bg-gray-100 cursor-not-allowed' : ''}`}
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
                    disabled={isViewMode}
                    className={`input-field pl-10 ${getFieldError('phone') ? 'border-red-300 focus:ring-red-500' : ''} ${isViewMode ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    placeholder="Enter your phone number"
                  />
                </div>
                {getFieldError('phone') && (
                  <p className="form-error">{getFieldError('phone')}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="requestedMonths" className="form-label">
                  When would you like to start your lease? *
                </label>
                <select
                  id="requestedMonths"
                  name="requestedMonths"
                  required
                  value={formData.requestedMonths}
                  onChange={handleChange}
                  disabled={isViewMode}
                  className={`input-field ${getFieldError('requestedMonths') ? 'border-red-300 focus:ring-red-500' : ''} ${isViewMode ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                >
                  <option value="">Select a month</option>
                  <option value="January 2025">January 2025</option>
                  <option value="February 2025">February 2025</option>
                  <option value="March 2025">March 2025</option>
                  <option value="April 2025">April 2025</option>
                  <option value="May 2025">May 2025</option>
                  <option value="June 2025">June 2025</option>
                  <option value="July 2025">July 2025</option>
                  <option value="August 2025">August 2025</option>
                  <option value="September 2025">September 2025</option>
                  <option value="October 2025">October 2025</option>
                  <option value="November 2025">November 2025</option>
                  <option value="December 2025">December 2025</option>
                  <option value="January 2026">January 2026</option>
                  <option value="February 2026">February 2026</option>
                  <option value="March 2026">March 2026</option>
                  <option value="April 2026">April 2026</option>
                  <option value="May 2026">May 2026</option>
                  <option value="June 2026">June 2026</option>
                  <option value="July 2026">July 2026</option>
                  <option value="August 2026">August 2026</option>
                  <option value="September 2026">September 2026</option>
                  <option value="October 2026">October 2026</option>
                  <option value="November 2026">November 2026</option>
                  <option value="December 2026">December 2026</option>
                </select>
                {getFieldError('requestedMonths') && (
                  <p className="form-error">{getFieldError('requestedMonths')}</p>
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
                  disabled={isViewMode}
                  className={`input-field ${getFieldError('address.street') ? 'border-red-300 focus:ring-red-500' : ''} ${isViewMode ? 'bg-gray-100 cursor-not-allowed' : ''}`}
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
                    disabled={isViewMode}
                    className={`input-field ${getFieldError('address.city') ? 'border-red-300 focus:ring-red-500' : ''} ${isViewMode ? 'bg-gray-100 cursor-not-allowed' : ''}`}
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
                    disabled={isViewMode}
                    className={`input-field ${getFieldError('address.state') ? 'border-red-300 focus:ring-red-500' : ''} ${isViewMode ? 'bg-gray-100 cursor-not-allowed' : ''}`}
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
                    disabled={isViewMode}
                    className={`input-field ${getFieldError('address.zipCode') ? 'border-red-300 focus:ring-red-500' : ''} ${isViewMode ? 'bg-gray-100 cursor-not-allowed' : ''}`}
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
                {!isViewMode && (
                  <button
                    type="button"
                    onClick={addGuest}
                    className="btn-secondary flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Guest
                  </button>
                )}
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
                    {!isViewMode && (
                      <button
                        type="button"
                        onClick={() => removeGuest(guest.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="form-group">
                      <label className="form-label">First Name</label>
                      <input
                        type="text"
                        value={guest.firstName}
                        onChange={(e) => updateGuest(guest.id, 'firstName', e.target.value)}
                        disabled={isViewMode}
                        className={`input-field ${getFieldError(`guest${index}FirstName`) ? 'border-red-300 focus:ring-red-500' : ''} ${isViewMode ? 'bg-gray-100 cursor-not-allowed' : ''}`}
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
                        disabled={isViewMode}
                        className={`input-field ${getFieldError(`guest${index}LastName`) ? 'border-red-300 focus:ring-red-500' : ''} ${isViewMode ? 'bg-gray-100 cursor-not-allowed' : ''}`}
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
                    disabled={isViewMode}
                    className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${isViewMode ? 'opacity-50 cursor-not-allowed' : ''}`}
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
              {isViewMode ? (
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="btn-primary"
                >
                  Back to Dashboard
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard')}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  
                  {existingApplication && existingApplication.status === 'draft' && (
                    <div className="flex flex-col space-y-2">
                      <button
                        type="button"
                        onClick={handleSubmitApplication}
                        disabled={isLoading}
                        className="btn-primary flex items-center bg-green-600 hover:bg-green-700"
                      >
                        {isLoading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : (
                          <FileText className="h-4 w-4 mr-2" />
                        )}
                        Submit for Review
                      </button>
                      <p className="text-xs text-gray-500 text-center">
                        After submission, your application will be reviewed by our team
                      </p>
                    </div>
                  )}
                  
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
                    {existingApplication ? 'Save Changes' : 'Create Application'}
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Application;
