import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  Building,
  Car,
  FileText,
  Upload,
  CheckCircle,
  AlertCircle,
  Save,
  Send,
  Home
} from 'lucide-react';

const Application = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [application, setApplication] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
    watch,
    reset
  } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      ssn: '',
      currentAddress: {
        street: '',
        city: '',
        state: '',
        zipCode: ''
      },
      employment: {
        employer: '',
        position: '',
        phone: '',
        income: ''
      },
      rentalProperty: {
        address: '',
        rentAmount: '',
        depositAmount: '',
        moveInDate: ''
      },
      emergencyContact: {
        name: '',
        relationship: '',
        phone: ''
      },
      references: [{
        name: '',
        relationship: '',
        phone: '',
        email: ''
      }],
      pets: {
        hasPets: false,
        details: ''
      },
      vehicles: {
        hasVehicles: false,
        details: ''
      }
    }
  });

  useEffect(() => {
    if (user) {
      // Pre-fill form with user data
      setValue('firstName', user.firstName || '');
      setValue('lastName', user.lastName || '');
      setValue('email', user.email || '');
      setValue('phone', user.phone || '');
      setValue('rentalProperty.address', user.address || '');
      setValue('rentalProperty.rentAmount', user.rentalAmount || '');
      setValue('rentalProperty.depositAmount', user.depositAmount || '');
      
      loadApplication();
    }
  }, [user, setValue]);

  const loadApplication = async () => {
    try {
      const response = await axios.get('/api/applications/');
      if (response.data.application) {
        setApplication(response.data.application);
        // Pre-fill form with existing application data
        const app = response.data.application;
        Object.keys(app).forEach(key => {
          if (app[key] && typeof app[key] === 'object') {
            Object.keys(app[key]).forEach(subKey => {
              setValue(`${key}.${subKey}`, app[key][subKey]);
            });
          } else if (app[key]) {
            setValue(key, app[key]);
          }
        });
        reset(response.data.application);
      }
    } catch (error) {
      console.error('Error loading application:', error);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (application) {
        await axios.put('/api/applications/', data);
        toast.success('Application updated successfully!');
      } else {
        await axios.post('/api/applications/', data);
        toast.success('Application created successfully!');
      }
      await loadApplication();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving application');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitApplication = async () => {
    setSubmitting(true);
    try {
      await axios.post('/api/applications/submit');
      toast.success('Application submitted successfully!');
      await loadApplication();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error submitting application');
    } finally {
      setSubmitting(false);
    }
  };

  const addReference = () => {
    setValue('references', [
      ...watch('references'),
      { name: '', relationship: '', phone: '', email: '' }
    ]);
  };

  const removeReference = (index) => {
    const currentReferences = watch('references');
    setValue('references', currentReferences.filter((_, i) => i !== index));
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    setUploading(true);
    
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('documents', file);
      });

      const response = await axios.post('/api/applications/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setDocuments([...documents, ...response.data.documents]);
      toast.success('Documents uploaded successfully!');
    } catch (error) {
      toast.error('Error uploading documents');
    } finally {
      setUploading(false);
    }
  };

  const removeDocument = async (documentId) => {
    try {
      await axios.delete(`/api/applications/documents/${documentId}`);
      setDocuments(documents.filter(doc => doc._id !== documentId));
      toast.success('Document removed successfully!');
    } catch (error) {
      toast.error('Error removing document');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">Please log in to access your application</h2>
          <button
            onClick={() => navigate('/login')}
            className="mt-4 bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors"
          >
            Go to Login
          </button>
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
            <h1 className="text-2xl font-bold text-white flex items-center">
              <FileText className="mr-3 h-6 w-6" />
              Rental Application
            </h1>
            {application && (
              <div className="mt-2 text-primary-light">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white text-primary">
                  {application.status === 'submitted' ? 'Submitted' : 'Draft'}
                </span>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">
            {/* Personal Information */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <User className="mr-2 h-5 w-5 text-primary" />
                Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    {...register('firstName', { required: 'First name is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    {...register('dateOfBirth', { required: 'Date of birth is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  {errors.dateOfBirth && (
                    <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SSN (Last 4 digits) *
                  </label>
                  <input
                    type="text"
                    maxLength="4"
                    {...register('ssn', { 
                      required: 'SSN is required',
                      pattern: { value: /^\d{4}$/, message: 'Please enter last 4 digits only' }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  {errors.ssn && (
                    <p className="text-red-500 text-sm mt-1">{errors.ssn.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Current Address */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="mr-2 h-5 w-5 text-primary" />
                Current Address
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    {...register('currentAddress.street', { required: 'Street address is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  {errors.currentAddress?.street && (
                    <p className="text-red-500 text-sm mt-1">{errors.currentAddress.street.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    {...register('currentAddress.city', { required: 'City is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  {errors.currentAddress?.city && (
                    <p className="text-red-500 text-sm mt-1">{errors.currentAddress.city.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    {...register('currentAddress.state', { required: 'State is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  {errors.currentAddress?.state && (
                    <p className="text-red-500 text-sm mt-1">{errors.currentAddress.state.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ZIP Code *
                  </label>
                  <input
                    type="text"
                    {...register('currentAddress.zipCode', { required: 'ZIP code is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  {errors.currentAddress?.zipCode && (
                    <p className="text-red-500 text-sm mt-1">{errors.currentAddress.zipCode.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Employment Information */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Building className="mr-2 h-5 w-5 text-primary" />
                Employment Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employer *
                  </label>
                  <input
                    type="text"
                    {...register('employment.employer', { required: 'Employer is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  {errors.employment?.employer && (
                    <p className="text-red-500 text-sm mt-1">{errors.employment.employer.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Position *
                  </label>
                  <input
                    type="text"
                    {...register('employment.position', { required: 'Position is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  {errors.employment?.position && (
                    <p className="text-red-500 text-sm mt-1">{errors.employment.position.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Work Phone *
                  </label>
                  <input
                    type="tel"
                    {...register('employment.phone', { required: 'Work phone is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  {errors.employment?.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.employment.phone.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monthly Income *
                  </label>
                  <input
                    type="number"
                    {...register('employment.income', { required: 'Monthly income is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="$0.00"
                  />
                  {errors.employment?.income && (
                    <p className="text-red-500 text-sm mt-1">{errors.employment.income.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Rental Property */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Home className="mr-2 h-5 w-5 text-primary" />
                Rental Property
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Property Address *
                  </label>
                  <input
                    type="text"
                    {...register('rentalProperty.address', { required: 'Property address is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  {errors.rentalProperty?.address && (
                    <p className="text-red-500 text-sm mt-1">{errors.rentalProperty.address.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monthly Rent *
                  </label>
                  <input
                    type="number"
                    {...register('rentalProperty.rentAmount', { required: 'Monthly rent is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="$0.00"
                  />
                  {errors.rentalProperty?.rentAmount && (
                    <p className="text-red-500 text-sm mt-1">{errors.rentalProperty.rentAmount.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Security Deposit *
                  </label>
                  <input
                    type="number"
                    {...register('rentalProperty.depositAmount', { required: 'Security deposit is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="$0.00"
                  />
                  {errors.rentalProperty?.depositAmount && (
                    <p className="text-red-500 text-sm mt-1">{errors.rentalProperty.depositAmount.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Move-in Date *
                  </label>
                  <input
                    type="date"
                    {...register('rentalProperty.moveInDate', { required: 'Move-in date is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  {errors.rentalProperty?.moveInDate && (
                    <p className="text-red-500 text-sm mt-1">{errors.rentalProperty.moveInDate.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Phone className="mr-2 h-5 w-5 text-primary" />
                Emergency Contact
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    {...register('emergencyContact.name', { required: 'Emergency contact name is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  {errors.emergencyContact?.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.emergencyContact.name.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Relationship *
                  </label>
                  <input
                    type="text"
                    {...register('emergencyContact.relationship', { required: 'Relationship is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  {errors.emergencyContact?.relationship && (
                    <p className="text-red-500 text-sm mt-1">{errors.emergencyContact.relationship.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    {...register('emergencyContact.phone', { required: 'Emergency contact phone is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  {errors.emergencyContact?.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.emergencyContact.phone.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* References */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <User className="mr-2 h-5 w-5 text-primary" />
                  References
                </h2>
                <button
                  type="button"
                  onClick={addReference}
                  className="bg-secondary text-white px-3 py-1 rounded-md text-sm hover:bg-secondary-dark transition-colors"
                >
                  Add Reference
                </button>
              </div>
              {watch('references')?.map((reference, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">Reference {index + 1}</h3>
                    {watch('references').length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeReference(index)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name *
                      </label>
                      <input
                        type="text"
                        {...register(`references.${index}.name`, { required: 'Reference name is required' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Relationship *
                      </label>
                      <input
                        type="text"
                        {...register(`references.${index}.relationship`, { required: 'Relationship is required' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        {...register(`references.${index}.phone`, { required: 'Phone is required' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        {...register(`references.${index}.email`)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Additional Information */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="mr-2 h-5 w-5 text-primary" />
                Additional Information
              </h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    {...register('pets.hasPets')}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Do you have pets?
                  </label>
                </div>
                {watch('pets.hasPets') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pet Details
                    </label>
                    <textarea
                      {...register('pets.details')}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Please describe your pets (type, breed, size, etc.)"
                    />
                  </div>
                )}
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    {...register('vehicles.hasVehicles')}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Do you have vehicles?
                  </label>
                </div>
                {watch('vehicles.hasVehicles') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vehicle Details
                    </label>
                    <textarea
                      {...register('vehicles.details')}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Please describe your vehicles (make, model, year, color, license plate)"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Documents */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Upload className="mr-2 h-5 w-5 text-primary" />
                Supporting Documents
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Documents (ID, Pay Stubs, Bank Statements, etc.)
                  </label>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  {uploading && (
                    <p className="text-sm text-gray-500 mt-1">Uploading...</p>
                  )}
                </div>
                {documents.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Uploaded Documents:</h3>
                    <div className="space-y-2">
                      {documents.map((doc) => (
                        <div key={doc._id} className="flex items-center justify-between bg-white p-3 rounded-md border">
                          <span className="text-sm text-gray-700">{doc.filename}</span>
                          <button
                            type="button"
                            onClick={() => removeDocument(doc._id)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading || !isDirty}
                className="flex-1 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Application
                  </>
                )}
              </button>
              
              {application && application.status !== 'submitted' && (
                <button
                  type="button"
                  onClick={handleSubmitApplication}
                  disabled={submitting}
                  className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Submit Application
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Application;
