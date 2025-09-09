import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import jsPDF from 'jspdf';
import {
  FileText,
  Download,
  Eye,
  AlertCircle,
  Upload,
  CheckCircle
} from 'lucide-react';

const Lease = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [leaseData, setLeaseData] = useState(null);
  const [leaseContent, setLeaseContent] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [signedLeaseFile, setSignedLeaseFile] = useState(null);
  const [uploadedLease, setUploadedLease] = useState(null);

  const openSignedLease = async (applicationId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to view the lease');
        return;
      }
      const res = await axios.get(`/api/lease/view-signed/${applicationId}` , {
        responseType: 'blob',
        headers: { Authorization: `Bearer ${token}` }
      });

      const blob = new Blob([res.data], { type: res.headers['content-type'] || 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error('Error opening signed lease:', error);
      const message = error.response?.data?.error || 'Unable to open signed lease';
      toast.error(message);
    }
  };

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
      // Always store latest payload
      setLeaseData(response.data);
      if (response.data.hasApplication) {
        // If there's a lease agreement, automatically generate and display it
        if (response.data.leaseStartDate) {
          await generateLeaseFromData(response.data);
        }
        // Check if there's an uploaded signed lease - only set if it actually exists
        if (response.data.signedLeaseFile && response.data.signedLeaseFile.filename) {
          setUploadedLease({
            filename: response.data.signedLeaseFile.filename,
            originalName: response.data.signedLeaseFile.originalName,
            url: `/api/lease/view-signed/${response.data.applicationId}`,
            size: response.data.signedLeaseFile.size,
            uploadedAt: response.data.signedLeaseFile.uploadedAt
          });
        } else {
          // Clear any existing uploaded lease state
          setUploadedLease(null);
        }
      } else {
        // No active applications; reset local UI state
        setUploadedLease(null);
        setLeaseContent('');
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




  const previewLease = async () => {
    if (!leaseContent) {
      toast.error('No lease content available. Please contact an administrator to generate your lease.');
      return;
    }
    setShowPreview(true);
  };

  const downloadLease = () => {
    if (!leaseContent) {
      toast.error('No lease content available. Please generate the lease first.');
      return;
    }
    
    try {
      // Generate PDF
      const doc = new jsPDF();
      
      // Set title
      doc.setFontSize(20);
      doc.text('Lease Agreement', 105, 20, { align: 'center' });
      
      // Add lease content with proper page handling
      doc.setFontSize(10);
      const splitText = doc.splitTextToSize(leaseContent, 170);
      
             let yPosition = 40;
      
      for (let i = 0; i < splitText.length; i++) {
        // Check if we need a new page
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.text(splitText[i], 20, yPosition);
        yPosition += 7;
      }
      
      // Save the PDF
      doc.save(`lease-agreement-${user.firstName}-${user.lastName}.pdf`);
      
      toast.success('Lease agreement downloaded successfully as PDF!');
    } catch (error) {
      console.error('Error downloading lease:', error);
      toast.error('Error downloading lease agreement');
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload a PDF, JPEG, or PNG file');
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      
      setSignedLeaseFile(file);
      toast.success('File selected successfully');
    }
  };

  const uploadSignedLease = async () => {
    if (!signedLeaseFile) {
      toast.error('Please select a file to upload');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('signedLease', signedLeaseFile);
      formData.append('applicationId', leaseData.applicationId);

      const response = await axios.post('/api/lease/upload-signed', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploadedLease(response.data.uploadedLease);
      setSignedLeaseFile(null);
      toast.success('Signed lease uploaded successfully!');
      
      // Refresh lease status to show uploaded file
      await loadLeaseStatus();
    } catch (error) {
      console.error('Error uploading signed lease:', error);
      toast.error(error.response?.data?.error || 'Error uploading signed lease');
    } finally {
      setUploading(false);
    }
  };

  const removeUploadedLease = async () => {
    if (!uploadedLease) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/lease/remove-signed/${leaseData.applicationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUploadedLease(null);
      toast.success('Signed lease removed successfully');
      await loadLeaseStatus();
    } catch (error) {
      console.error('Error removing signed lease:', error);
      toast.error('Error removing signed lease');
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
    <div className="min-h-screen bg-white">
      {/* Hero header to match site */}
      <section className="relative pt-16">
        <div className="absolute inset-0 z-0">
          <video className="w-full h-48 md:h-64 object-cover" poster="/images/image1.jpg" autoPlay muted loop playsInline>
            <source src="/videos/beach-video.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="relative z-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-white flex items-center">
              <FileText className="mr-3 h-7 w-7" />
              Lease Agreement
            </h1>
            {leaseData && (
              <div className="mt-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border border-white/40 bg-white/20 text-white backdrop-blur-md ${
                  leaseData.signedLeaseFile
                    ? 'bg-green-600/30'
                    : leaseData.leaseStartDate && leaseData.leaseEndDate
                    ? 'bg-yellow-600/30'
                    : 'bg-white/20'
                }`}>
                  {leaseData.signedLeaseFile ? 'Signed' : leaseData.leaseStartDate && leaseData.leaseEndDate ? 'Available to Sign' : 'Not Started'}
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/90 backdrop-blur-md border border-white/30 rounded-lg shadow-medium overflow-hidden">
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

            {/* All Applications Completed - Return to Default State */}
            {leaseData && leaseData.message === 'No active applications found' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">All Applications Completed</p>
                    <p className="mt-1">
                      Your previous rental applications have been completed. You can start a new application for future rentals.
                    </p>
                    <button
                      onClick={() => navigate('/application')}
                      className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors"
                    >
                      Start New Application
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Lease Status Display */}
            {leaseData && leaseData.message !== 'No active applications found' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">
                      {leaseData.signedLeaseFile ? 'Lease Ready to View and Sign' : leaseData.leaseStartDate && leaseData.leaseEndDate ? 'Lease Available to Sign' : 'Lease Agreement Not Started'}
                    </p>
                    <p className="mt-1">
                      {leaseData.signedLeaseFile 
                        ? 'The lease is ready to view and sign. You can preview and download it below.'
                        : leaseData.leaseStartDate && leaseData.leaseEndDate
                        ? 'Your lease agreement is available to view and download. You can preview it below and download it to sign.'
                        : 'Your lease agreement has not been generated yet. Please wait for an administrator to create your lease.'
                      }
                    </p>
                    {leaseData.leaseStartDate && leaseData.leaseEndDate && (
                      <p className="mt-1 text-xs">
                        Lease Period: {new Date(leaseData.leaseStartDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} - {new Date(leaseData.leaseEndDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
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
             {leaseData && leaseData.message !== 'No active applications found' && (
               <div className="mb-6">
                 <div className="flex flex-wrap gap-3">
                   {!leaseContent && leaseData.leaseStartDate && leaseData.leaseEndDate && (
                     <button
                       onClick={() => generateLeaseFromData(leaseData)}
                       disabled={loading}
                       className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center"
                     >
                       <FileText className="w-4 h-4 mr-2" />
                       {loading ? 'Loading...' : 'Load Lease'}
                     </button>
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

                 {/* Uploaded Lease History */}
                 {leaseData.signedLeaseFile && (
                   <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                     <h4 className="text-sm font-medium text-green-900 mb-3 flex items-center">
                       <CheckCircle className="w-4 h-4 mr-2" />
                       Your Uploaded Lease
                     </h4>
                     <div className="flex items-center justify-between">
                       <div className="flex items-center space-x-2">
                         <span className="text-sm text-green-700">
                           Signed lease uploaded: {leaseData.signedLeaseFile.originalName || 'Lease Document'}
                         </span>
                         {leaseData.signedLeaseFile.uploadedAt && (
                           <span className="text-xs text-green-600">
                             on {new Date(leaseData.signedLeaseFile.uploadedAt + 'T00:00:00').toLocaleDateString('en-US', { 
                               month: 'long', 
                               day: 'numeric', 
                               year: 'numeric' 
                             })}
                           </span>
                         )}
                       </div>
                       <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openSignedLease(leaseData.applicationId)}
                          className="bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition-colors text-sm flex items-center"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Lease
                        </button>
                         <button
                           onClick={removeUploadedLease}
                           className="bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 transition-colors text-sm"
                         >
                           Remove
                         </button>
                       </div>
                     </div>
                     <p className="text-xs text-green-600 mt-2">
                       This is your signed lease document. You can view it anytime or remove it if needed.
                     </p>
                   </div>
                 )}

                                 {/* Upload New Signed Lease Section */}
                 {!leaseData.signedLeaseFile && (
                   <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                     <h4 className="text-sm font-medium text-gray-900 mb-3">Upload Signed Lease</h4>
                     
                     <div className="space-y-3">
                       <div className="flex items-center space-x-3">
                         <input
                           type="file"
                           id="signedLeaseUpload"
                           accept=".pdf,.jpg,.jpeg,.png"
                           onChange={handleFileUpload}
                           className="hidden"
                         />
                         <label
                           htmlFor="signedLeaseUpload"
                           className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer flex items-center"
                         >
                           <Upload className="w-4 h-4 mr-2" />
                           Choose File
                         </label>
                         {signedLeaseFile && (
                           <span className="text-sm text-gray-600">
                             {signedLeaseFile.name}
                           </span>
                         )}
                       </div>
                       
                       {signedLeaseFile && (
                         <div className="flex items-center space-x-3">
                           <button
                             onClick={uploadSignedLease}
                             disabled={uploading}
                             className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center"
                           >
                             <Upload className="w-4 h-4 mr-2" />
                             {uploading ? 'Uploading...' : 'Upload Signed Lease'}
                           </button>
                           <button
                             onClick={() => setSignedLeaseFile(null)}
                             className="bg-gray-500 text-white px-3 py-2 rounded-md hover:bg-gray-600 transition-colors text-sm"
                           >
                             Cancel
                           </button>
                         </div>
                       )}
                     </div>
                     
                     <p className="text-xs text-gray-500 mt-2">
                       Supported formats: PDF, JPEG, PNG (max 10MB). Scan your signed lease and upload it here.
                     </p>
                   </div>
                 )}
              </div>
            )}

            {leaseContent && leaseData && leaseData.message !== 'No active applications found' && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Your Lease Agreement
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
