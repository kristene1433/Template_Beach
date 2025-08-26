import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import {
  FileText,
  Download,
  Eye,
  AlertCircle
} from 'lucide-react';

const Lease = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [leaseData, setLeaseData] = useState(null);
  const [leaseContent, setLeaseContent] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const generateLeaseFromData = useCallback(async (leaseInfo) => {
    try {
      setLoading(true);
      const response = await axios.post(`/api/lease/generate/${leaseInfo.applicationId}`, {
        leaseStartDate: leaseInfo?.leaseStartDate || formatDateForAPI(new Date()),
        leaseEndDate: leaseInfo?.leaseEndDate || formatDateForAPI(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)),
        rentalAmount: leaseInfo?.rentalAmount || 2500
      });
      setLeaseContent(response.data.leaseAgreement);
      toast.success('Lease agreement loaded successfully!');
    } catch (error) {
      console.error('Error loading existing lease:', error);
      toast.error('Error loading lease agreement');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadLeaseStatus = useCallback(async () => {
    try {
      const response = await axios.get('/api/lease/status');
      if (response.data.hasApplication) {
        setLeaseData(response.data);
        // If there's a lease agreement, automatically generate and display it
        if (response.data.leaseSigned || response.data.leaseStartDate) {
          await generateLeaseFromData(response.data);
        }
      }
    } catch (error) {
      console.error('Error loading lease status:', error);
    }
  }, [generateLeaseFromData]);

  useEffect(() => {
    if (user) {
      loadLeaseStatus();
    }
  }, [user, loadLeaseStatus]);


  const generateLease = async () => {
    if (!leaseData) {
      toast.error('No lease information available');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`/api/lease/generate/${leaseData.applicationId}`, {
        leaseStartDate: leaseData?.leaseStartDate || formatDateForAPI(new Date()),
        leaseEndDate: leaseData?.leaseEndDate || formatDateForAPI(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)),
        rentalAmount: leaseData?.rentalAmount || 2500
      });
      setLeaseContent(response.data.leaseAgreement);
      setLeaseData(response.data.application);
      toast.success('Lease agreement generated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error generating lease');
    } finally {
      setLoading(false);
    }
  };

  const previewLease = async () => {
    if (!leaseContent) {
      await generateLease();
    }
    if (leaseContent) {
      setShowPreview(true);
    }
  };

  const downloadLease = async () => {
    try {
      const response = await axios.get('/api/lease/download', {
        params: {
          leaseStartDate: leaseData?.leaseStartDate || formatDateForAPI(new Date()),
          leaseEndDate: leaseData?.leaseEndDate || formatDateForAPI(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)),
          rentalAmount: leaseData?.rentalAmount || 2500
        },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `lease-agreement-${user.firstName}-${user.lastName}.txt`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Lease agreement downloaded successfully!');
    } catch (error) {
      toast.error('Error downloading lease agreement');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    
    try {
      // Handle both date strings and Date objects
      let dateObj;
      if (typeof dateString === 'string') {
        // If it's a date string like "2025-01-01", parse it directly
        if (dateString.includes('-')) {
          const [year, month, day] = dateString.split('-').map(Number);
          dateObj = new Date(year, month - 1, day);
        } else {
          dateObj = new Date(dateString);
        }
      } else {
        dateObj = new Date(dateString);
      }
      
      // Check if the date is valid
      if (isNaN(dateObj.getTime())) {
        return 'Invalid Date';
      }
      
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  // Helper function to format dates for API calls (YYYY-MM-DD format)
  const formatDateForAPI = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">Please log in to access your lease</h2>
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-primary px-6 py-4">
            <h1 className="text-2xl font-bold text-white flex items-center">
              <FileText className="mr-3 h-6 w-6" />
              Lease Agreement
            </h1>
            {leaseData && (
              <div className="mt-2 text-primary-light">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  leaseData.leaseSigned 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {leaseData.leaseSigned ? 'Signed' : 'Available for Review'}
                </span>
              </div>
            )}
          </div>

          <div className="p-6">
            {/* Application Status Check - Only show if no lease data */}
            {!leaseData && !loading && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium">Application Required</p>
                    <p className="mt-1">
                      You need to complete your rental application before you can access your lease agreement.
                    </p>
                    <button
                      onClick={() => navigate('/application')}
                      className="mt-2 bg-yellow-600 text-white px-4 py-2 rounded-md text-sm hover:bg-yellow-700 transition-colors"
                    >
                      Complete Application
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Lease Status Display */}
            {leaseData && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">
                      {leaseData.leaseSigned ? 'Lease Agreement Signed' : 'Lease Agreement Available'}
                    </p>
                    <p className="mt-1">
                      {leaseData.leaseSigned 
                        ? 'Your lease agreement has been signed and is active. You can view and download it below.'
                        : 'Your lease agreement is ready for review. You can generate, preview, and download it below.'
                      }
                    </p>
                    {leaseData.leaseStartDate && leaseData.leaseEndDate && (
                      <p className="mt-1 text-xs">
                        Lease Period: {formatDate(leaseData.leaseStartDate)} - {formatDate(leaseData.leaseEndDate)}
                      </p>
                    )}
                    {leaseData.rentalAmount && (
                      <p className="mt-1 text-xs">
                        Monthly Rent: ${leaseData.rentalAmount.toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Lease Actions */}
            {leaseData && (
              <div className="mb-6">
                <div className="flex flex-wrap gap-3">
                  {!leaseContent && (
                    <>
                      <button
                        onClick={() => generateLeaseFromData(leaseData)}
                        disabled={loading}
                        className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        {loading ? 'Loading...' : 'Load Lease'}
                      </button>
                      
                      <button
                        onClick={generateLease}
                        disabled={loading}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        {loading ? 'Generating...' : 'Generate New Lease'}
                      </button>
                    </>
                  )}
                  
                  {leaseContent && (
                    <>
                      <button
                        onClick={previewLease}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Preview Lease
                      </button>
                      
                      <button
                        onClick={downloadLease}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Lease
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}



            {leaseContent && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {leaseData?.leaseSigned ? 'Your Lease Agreement' : 'Generated Lease Agreement'}
                  </h3>
                </div>
                
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm font-mono text-gray-800">
                    {leaseContent}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lease Preview Modal */}
      {showPreview && leaseContent && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Lease Agreement Preview
                </h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-gray-50">
                <pre className="whitespace-pre-wrap text-sm font-mono text-gray-800 leading-relaxed">
                  {leaseContent}
                </pre>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Close
                </button>
                <button
                  onClick={downloadLease}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <Download className="w-4 h-4 mr-2 inline" />
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Lease;
