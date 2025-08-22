import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import {
  FileText,
  Download,
  Eye,
  PenTool,
  CheckCircle,
  AlertCircle,
  Clock,
  User,
  Home,
  Calendar,
  DollarSign,
  MapPin,
  Phone,
  Mail,
  PenTool as Signature,
  Save
} from 'lucide-react';

const Lease = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [leaseData, setLeaseData] = useState(null);
  const [leaseContent, setLeaseContent] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [signature, setSignature] = useState('');
  const [signing, setSigning] = useState(false);
  const [application, setApplication] = useState(null);

  useEffect(() => {
    if (user) {
      loadApplication();
      loadLeaseStatus();
    }
  }, [user]);

  const loadApplication = async () => {
    try {
      const response = await axios.get('/api/applications/');
      if (response.data.application) {
        setApplication(response.data.application);
      }
    } catch (error) {
      console.error('Error loading application:', error);
    }
  };

  const loadLeaseStatus = async () => {
    try {
      const response = await axios.get('/api/lease/status');
      if (response.data.lease) {
        setLeaseData(response.data.lease);
      }
    } catch (error) {
      console.error('Error loading lease status:', error);
    }
  };

  const generateLease = async () => {
    if (!application) {
      toast.error('Please complete your application first');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/lease/generate');
      setLeaseContent(response.data.leaseContent);
      setLeaseData(response.data.lease);
      toast.success('Lease agreement generated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error generating lease');
    } finally {
      setLoading(false);
    }
  };

  const previewLease = async () => {
    if (!leaseContent) {
      await generateLease();
    }
    setShowPreview(true);
  };

  const downloadLease = async () => {
    try {
      const response = await axios.get('/api/lease/download', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `lease-agreement-${user.firstName}-${user.lastName}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Lease agreement downloaded successfully!');
    } catch (error) {
      toast.error('Error downloading lease agreement');
    }
  };

  const handleSignatureChange = (e) => {
    setSignature(e.target.value);
  };

  const signLease = async () => {
    if (!signature.trim()) {
      toast.error('Please provide your signature');
      return;
    }

    setSigning(true);
    try {
      await axios.post('/api/lease/sign', { signature });
      toast.success('Lease agreement signed successfully!');
      await loadLeaseStatus();
      setSignature('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error signing lease');
    } finally {
      setSigning(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
                  leaseData.signed 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {leaseData.signed ? 'Signed' : 'Pending Signature'}
                </span>
              </div>
            )}
          </div>

          <div className="p-6">
            {/* Application Status Check */}
            {!application && (
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

            {application && !application.status === 'submitted' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <Clock className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Application Under Review</p>
                    <p className="mt-1">
                      Your application is currently being reviewed. Once approved, you'll be able to access your lease agreement.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Lease Actions */}
            {application && application.status === 'submitted' && (
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row gap-3">
                  {!leaseData && (
                    <button
                      onClick={generateLease}
                      disabled={loading}
                      className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Generating...
                        </>
                      ) : (
                        <>
                          <FileText className="mr-2 h-5 w-5" />
                          Generate Lease Agreement
                        </>
                      )}
                    </button>
                  )}
                  
                  {leaseData && (
                    <>
                      <button
                        onClick={previewLease}
                        className="bg-secondary text-white px-6 py-3 rounded-lg hover:bg-secondary-dark transition-colors flex items-center justify-center"
                      >
                        <Eye className="mr-2 h-5 w-5" />
                        Preview Lease
                      </button>
                      
                      <button
                        onClick={downloadLease}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                      >
                        <Download className="mr-2 h-5 w-5" />
                        Download PDF
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Lease Information */}
            {leaseData && (
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Lease Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-600">Tenant:</span>
                      <span className="ml-2 font-medium">{user.firstName} {user.lastName}</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-600">Email:</span>
                      <span className="ml-2 font-medium">{user.email}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-600">Phone:</span>
                      <span className="ml-2 font-medium">{user.phone}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Home className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-600">Property:</span>
                      <span className="ml-2 font-medium">{user.address}</span>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-600">Monthly Rent:</span>
                      <span className="ml-2 font-medium">${user.rentalAmount}</span>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-600">Security Deposit:</span>
                      <span className="ml-2 font-medium">${user.depositAmount}</span>
                    </div>
                  </div>
                </div>
                
                {leaseData.signed && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                      <span className="text-sm text-green-800 font-medium">
                        Lease signed on {formatDate(leaseData.signedAt)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Digital Signature */}
            {leaseData && !leaseData.signed && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Signature className="mr-2 h-5 w-5 text-primary" />
                  Digital Signature
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  By typing your full name below, you agree to the terms and conditions outlined in this lease agreement.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Legal Name *
                    </label>
                    <input
                      type="text"
                      value={signature}
                      onChange={handleSignatureChange}
                      placeholder="Type your full legal name as it appears on your ID"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  
                  <button
                    onClick={signLease}
                    disabled={signing || !signature.trim()}
                    className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {signing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Signing...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-5 w-5" />
                        Sign Lease Agreement
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Lease Preview Modal */}
            {showPreview && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
                  <div className="bg-primary px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">Lease Agreement Preview</h2>
                    <button
                      onClick={() => setShowPreview(false)}
                      className="text-white hover:text-primary-light transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                    <div className="prose max-w-none">
                      <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800 leading-relaxed">
                        {leaseContent}
                      </pre>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 px-6 py-4 flex justify-end">
                    <button
                      onClick={() => setShowPreview(false)}
                      className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                    >
                      Close Preview
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lease;
