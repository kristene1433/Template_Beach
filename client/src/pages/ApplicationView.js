import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  User, 
  MapPin, 
  Phone, 
  Users, 
  FileText,
  ArrowLeft,
  Mail,
  Calendar,
  DollarSign,
  CheckCircle,
  Download,
  Upload,
  CreditCard,
  History,
  Building2,
  AlertCircle,
  Edit3,
  Save,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import CompletionStatus from '../components/CompletionStatus';

const ApplicationView = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [leaseStatus, setLeaseStatus] = useState(null);
  const [payments, setPayments] = useState([]);
  const [signedLeaseFile, setSignedLeaseFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [showSignModal, setShowSignModal] = useState(false);
  const [leasePreview, setLeasePreview] = useState('');
  // const [leasePreviewHash, setLeasePreviewHash] = useState(''); // currently unused
  const [typedSignatureName, setTypedSignatureName] = useState('');
  const [consentChecked, setConsentChecked] = useState(false);
  const [signing, setSigning] = useState(false);
  const [signMode, setSignMode] = useState('type'); // 'type' | 'draw'
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const drawingRef = useRef(false);
  const [hasDrawing, setHasDrawing] = useState(false);
  const [typedSignatureName2, setTypedSignatureName2] = useState('');
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Size canvas to container width
    const parent = canvas.parentElement;
    const width = parent ? parent.clientWidth : 520;
    const height = 180;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#111827';
    ctxRef.current = ctx;
    setHasDrawing(false);
  }, []);

  const fetchApplicationData = useCallback(async () => {
    try {
      const [applicationRes, leaseRes, paymentsRes] = await Promise.all([
        fetch(`/api/application/${id}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/lease/status', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch(`/api/payment/history?applicationId=${id}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (applicationRes.ok) {
        const data = await applicationRes.json();
        console.log('Application data received:', data.application);
        console.log('Payment received status:', data.application?.paymentReceived);
        setApplication(data.application);
      } else {
        toast.error('Application not found');
        navigate('/dashboard');
        return;
      }

      if (leaseRes.ok) {
        const leaseData = await leaseRes.json();
        setLeaseStatus(leaseData);
      }

      if (paymentsRes.ok) {
        const paymentsData = await paymentsRes.json();
        console.log('Payments data received:', paymentsData.payments);
        setPayments(paymentsData.payments || []);
      }
    } catch (error) {
      console.error('Error loading application data:', error);
      toast.error('Failed to load application data');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    if (!user) return;
    fetchApplicationData();
  }, [user, fetchApplicationData]);

  // Initialize signature canvas when modal opens and Draw mode is active
  useEffect(() => {
    if (showSignModal && signMode === 'draw') {
      initCanvas();
    }
  }, [showSignModal, signMode, initCanvas]);

  // Check if user is authenticated
  if (!user) {
    navigate('/login');
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Application not found</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-blue-600 bg-blue-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      case 'completed':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Submitted';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Declined';
      case 'completed':
        return 'Complete';
      default:
        return 'Unknown';
    }
  };

  const formatDate = (value) => {
    if (!value) return 'Not set';

    // If it's already a Date instance
    if (value instanceof Date) {
      if (isNaN(value.getTime())) return 'Invalid Date';
      return value.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }

    // Normalize YYYY-MM-DD strings to local midnight to avoid UTC timezone shift
    let normalizedValue = value;
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      normalizedValue = `${value}T00:00:00`;
    }

    // If it's a number (timestamp) or string (ISO) – let Date handle it
    const d = new Date(normalizedValue);
    if (isNaN(d.getTime())) return 'Invalid Date';

    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };


  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100); // Convert from cents
  };

  // Calculate payment totals for this application
  const calculatePaymentTotals = () => {
    if (!application || !payments) return { totalOwed: 0, totalPaid: 0, balance: 0 };

    // Only show amounts if lease has been generated by admin
    let totalOwed = 0;
    if (application.leaseGenerated) {
      const depositAmount = application.depositAmount || 0;
      const rentalAmount = application.rentalAmount || 0;
      totalOwed = depositAmount + rentalAmount;
    }

    // Calculate total paid from successful payments
    const totalPaid = payments
      .filter(payment => payment.status === 'succeeded')
      .reduce((sum, payment) => sum + payment.amount, 0);

    // Calculate balance (what's still owed)
    const balance = totalOwed - (totalPaid / 100); // Convert from cents

    return {
      totalOwed: totalOwed,
      totalPaid: totalPaid / 100, // Convert from cents
      balance: balance
    };
  };

  const paymentTotals = calculatePaymentTotals();


  const handleLeaseDownload = async () => {
    if (!application?.leaseGenerated) {
      toast.error('Lease not yet generated by admin');
      return;
    }

    try {
      // Get lease data from the application
      const leaseStartDate = application.leaseStartDate || application.requestedStartDate;
      const leaseEndDate = application.leaseEndDate || application.requestedEndDate;
      const rentalAmount = application.rentalAmount || 2500;
      const depositAmount = application.depositAmount || 500;

      // Fetch lease data with proper authentication
      console.log('Downloading lease for application:', id);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/lease/download?applicationId=${id}&leaseStartDate=${leaseStartDate}&leaseEndDate=${leaseEndDate}&rentalAmount=${rentalAmount}&depositAmount=${depositAmount}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Response status:', response.status);
      console.log('Response content-type:', response.headers.get('content-type'));

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to download lease');
      }

      // Get the PDF content
      const pdfBlob = await response.blob();
      console.log('PDF blob type:', pdfBlob.type);
      console.log('PDF blob size:', pdfBlob.size);
      
      // Validate that we received a PDF
      if (pdfBlob.size === 0) {
        throw new Error('Empty PDF file received');
      }
      
      console.log('PDF blob validation passed, creating download link');
      
      // Create and trigger download
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `lease-agreement-${application.firstName}-${application.lastName}.pdf`;
      link.style.display = 'none';
      document.body.appendChild(link);
      
      console.log('Triggering download...');
      link.click();
      
      // Clean up after a short delay
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        console.log('Download cleanup completed');
      }, 1000);
      
      toast.success('Lease agreement downloaded successfully!');
    } catch (error) {
      console.error('Error downloading lease:', error);
      toast.error(error.message || 'Error downloading lease agreement');
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

  const handleLeaseUpload = async () => {
    if (!signedLeaseFile) {
      toast.error('Please select a file to upload');
      return;
    }

    try {
      setUploading(true);
      
      const formData = new FormData();
      formData.append('signedLease', signedLeaseFile);
      formData.append('applicationId', id);

      const response = await fetch('/api/lease/upload-signed', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        await response.json();
        toast.success('Signed lease uploaded successfully!');
        
        // Refresh application data to show updated status
        await fetchApplicationData();
        
        // Clear the file input
        setSignedLeaseFile(null);
        const fileInput = document.getElementById('lease-upload-input');
        if (fileInput) fileInput.value = '';
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to upload signed lease');
      }
    } catch (error) {
      console.error('Error uploading signed lease:', error);
      toast.error('Error uploading signed lease');
    } finally {
      setUploading(false);
    }
  };

  const handleMakePayment = () => {
    // Navigate to payment page with application context
    navigate(`/payment?applicationId=${id}`);
  };

  const openSignModal = async () => {
    try {
      setShowSignModal(true);
      setLeasePreview('Loading preview...');
      // setLeasePreviewHash('');
      const res = await fetch(`/api/lease/preview/${id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLeasePreview(data.leaseText || '');
        // setLeasePreviewHash(data.leaseTextHash || '');
        if (application) {
          setTypedSignatureName(`${application.firstName} ${application.lastName}`);
          if (application.secondApplicantFirstName && application.secondApplicantLastName) {
            setTypedSignatureName2(`${application.secondApplicantFirstName} ${application.secondApplicantLastName}`);
          }
        }
      } else {
        const e = await res.json();
        setLeasePreview(e.error || 'Failed to load preview');
      }
      // Prepare canvas after modal opens
      setTimeout(() => { if (signMode === 'draw') initCanvas(); }, 0);
    } catch (err) {
      console.error('Preview error', err);
      setLeasePreview('Error loading preview');
    }
  };

  const submitSignature = async () => {
    try {
      if (!typedSignatureName || !consentChecked) {
        toast.error('Please provide your typed signature and consent.');
        return;
      }
      setSigning(true);
      let signatureImageBase64 = '';
      if (signMode === 'draw' && hasDrawing && canvasRef.current) {
        signatureImageBase64 = canvasRef.current.toDataURL('image/png');
      }
      const res = await fetch(`/api/lease/sign/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ typedName: typedSignatureName, typedName2: typedSignatureName2 || '', signatureImageBase64, consent: true })
      });
      if (res.ok) {
        toast.success('Lease signed successfully');
        setShowSignModal(false);
        // refresh application data
        if (typeof fetchApplicationData === 'function') {
          fetchApplicationData();
        } else {
          window.location.reload();
        }
      } else {
        const e = await res.json();
        toast.error(e.error || 'Failed to sign lease');
      }
    } catch (err) {
      console.error('Sign error', err);
      toast.error('Error signing lease');
    } finally {
      setSigning(false);
    }
  };

  // Canvas drawing handlers
  const startDraw = (e) => {
    e.preventDefault();
    drawingRef.current = true;
    setHasDrawing(true);
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(x, y);
  };
  const drawMove = (e) => {
    if (!drawingRef.current) return;
    e.preventDefault();
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    ctxRef.current.lineTo(x, y);
    ctxRef.current.stroke();
  };
  const endDraw = () => {
    drawingRef.current = false;
  };
  const clearCanvas = () => {
    const c = canvasRef.current;
    if (!c || !ctxRef.current) return;
    ctxRef.current.clearRect(0, 0, c.width, c.height);
    setHasDrawing(false);
  };

  

  const handleEditClick = () => {
    if (application) {
      setEditData({
        firstName: application.firstName || '',
        lastName: application.lastName || '',
        phone: application.phone || '',
        address: {
          street: application.address?.street || '',
          city: application.address?.city || '',
          state: application.address?.state || '',
          zipCode: application.address?.zipCode || ''
        },
        secondApplicantFirstName: application.secondApplicantFirstName || '',
        secondApplicantLastName: application.secondApplicantLastName || ''
      });
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData({});
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setEditData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setEditData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSaveEdit = async () => {
    try {
      setSaving(true);
      
      const response = await fetch(`/api/application/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(editData)
      });

      if (response.ok) {
        const updatedApplication = await response.json();
        setApplication(updatedApplication.application);
        setIsEditing(false);
        setEditData({});
        toast.success('Application updated successfully!');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update application');
      }
    } catch (error) {
      console.error('Error updating application:', error);
      toast.error('Error updating application');
    } finally {
      setSaving(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      <div className="pt-16 min-h-screen py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Application Details</h1>
              <p className="text-gray-600 mt-2">
                View your rental application information
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="btn-secondary flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>

    {showSignModal && (
      <div className="fixed inset-0 bg-gray-800/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Sign Lease</h3>
            <button className="text-gray-500 hover:text-gray-700" onClick={() => setShowSignModal(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="mb-3">
                <div className="inline-flex rounded-md shadow-sm" role="group">
                  <button onClick={() => setSignMode('type')} className={`px-3 py-1 text-sm border ${signMode==='type' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'}`}>Type</button>
                  <button onClick={() => setSignMode('draw')} className={`px-3 py-1 text-sm border -ml-px ${signMode==='draw' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'}`}>Draw</button>
                </div>
              </div>

              {signMode === 'type' ? (
                <>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Typed Signature Name</label>
                  <input
                    value={typedSignatureName}
                    onChange={(e) => setTypedSignatureName(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="First Last"
                  />
                  {application?.secondApplicantFirstName && application?.secondApplicantLastName && (
                    <>
                      <label className="block text-sm font-medium text-gray-700 mb-1 mt-3">Co‑Applicant Typed Signature Name</label>
                      <input
                        value={typedSignatureName2}
                        onChange={(e) => setTypedSignatureName2(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="First Last"
                      />
                    </>
                  )}
                </>
              ) : (
                <>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Draw Your Signature</label>
                  <div className="border rounded-md bg-white">
                    <canvas
                      ref={canvasRef}
                      onMouseDown={startDraw}
                      onMouseMove={drawMove}
                      onMouseUp={endDraw}
                      onMouseLeave={endDraw}
                      onTouchStart={startDraw}
                      onTouchMove={drawMove}
                      onTouchEnd={endDraw}
                      className="w-full h-44"
                    />
                  </div>
                  <div className="mt-2">
                    <button onClick={clearCanvas} className="px-3 py-1 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Clear</button>
                  </div>
                </>
              )}

              <label className="flex items-center mt-3 space-x-2">
                <input type="checkbox" checked={consentChecked} onChange={(e) => setConsentChecked(e.target.checked)} />
                <span className="text-sm text-gray-700">I consent to use electronic records and signatures (ESIGN).</span>
              </label>

              <button
                onClick={submitSignature}
                disabled={signing}
                className="mt-4 inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {signing ? 'Signing...' : 'Sign and Submit'}
              </button>
            </div>

            <div className="border rounded-md p-3 bg-gray-50 overflow-auto max-h-80">
              <pre className="whitespace-pre-wrap text-xs text-gray-800">{leasePreview}</pre>
            </div>
          </div>
        </div>
      </div>
    )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Application Information */}
          <div className="lg:col-span-2">
            <div className="card">
              {/* Personal Information Section */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                    <User className="h-5 w-5 mr-2 text-blue-600" />
                    Personal Information
                  </h3>
                  {!isEditing ? (
                    <button
                      onClick={handleEditClick}
                      className="flex items-center px-3 py-2 text-sm text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit
                    </button>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleSaveEdit}
                        disabled={saving}
                        className="flex items-center px-3 py-2 text-sm text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={saving}
                        className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start space-x-3">
                    <User className="w-5 h-5 text-gray-400 mt-1" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">Name</p>
                      {isEditing ? (
                        <div className="flex space-x-2 mt-1">
                          <input
                            type="text"
                            value={editData.firstName || ''}
                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                            className="flex-1 min-w-0 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="First Name"
                          />
                          <input
                            type="text"
                            value={editData.lastName || ''}
                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                            className="flex-1 min-w-0 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Last Name"
                          />
                        </div>
                      ) : (
                        <p className="text-gray-600">{application.firstName} {application.lastName}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Users className="w-5 h-5 text-gray-400 mt-1" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">Co-Applicant</p>
                      {isEditing ? (
                        <div className="flex space-x-2 mt-1">
                          <input
                            type="text"
                            value={editData.secondApplicantFirstName || ''}
                            onChange={(e) => handleInputChange('secondApplicantFirstName', e.target.value)}
                            className="flex-1 min-w-0 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="First Name"
                          />
                          <input
                            type="text"
                            value={editData.secondApplicantLastName || ''}
                            onChange={(e) => handleInputChange('secondApplicantLastName', e.target.value)}
                            className="flex-1 min-w-0 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Last Name"
                          />
                        </div>
                      ) : (
                        <p className="text-gray-600">
                          {application.secondApplicantFirstName && application.secondApplicantLastName 
                            ? `${application.secondApplicantFirstName} ${application.secondApplicantLastName}`
                            : 'Not provided'
                          }
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Email</p>
                      <p className="text-gray-600">{user.email}</p>
                      <p className="text-xs text-gray-500">Email cannot be changed</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Phone</p>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={editData.phone || ''}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Phone Number"
                        />
                      ) : (
                        <p className="text-gray-600">{application.phone}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 md:col-span-2">
                    <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Address</p>
                      {isEditing ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editData.address?.street || ''}
                            onChange={(e) => handleInputChange('address.street', e.target.value)}
                            className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Street Address"
                          />
                          <div className="grid grid-cols-3 gap-2">
                            <input
                              type="text"
                              value={editData.address?.city || ''}
                              onChange={(e) => handleInputChange('address.city', e.target.value)}
                              className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="City"
                            />
                            <input
                              type="text"
                              value={editData.address?.state || ''}
                              onChange={(e) => handleInputChange('address.state', e.target.value)}
                              className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="State"
                            />
                            <input
                              type="text"
                              value={editData.address?.zipCode || ''}
                              onChange={(e) => handleInputChange('address.zipCode', e.target.value)}
                              className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="ZIP Code"
                            />
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-600">
                          {application.address?.street}, {application.address?.city}, {application.address?.state} {application.address?.zipCode}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                                              <p className="text-sm font-medium text-gray-900">Requested Dates</p>
                      <p className="text-gray-600">
                                  {application.requestedStartDate && application.requestedEndDate 
              ? `${new Date(application.requestedStartDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} - ${new Date(application.requestedEndDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
              : 'Not specified'
            }
                    </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Guests Section */}
              {application.additionalGuests && application.additionalGuests.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <Users className="h-5 w-5 mr-2 text-blue-600" />
                    Additional Guests
                  </h3>

                  <div className="space-y-4">
                    {application.additionalGuests.map((guest, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-4">Guest {index + 1}</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center space-x-3">
                            <User className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">First Name</p>
                              <p className="text-gray-600">{guest.firstName}</p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <User className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">Last Name</p>
                              <p className="text-gray-600">{guest.lastName}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            guest.isAdult ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {guest.isAdult ? 'Adult (18+)' : 'Minor'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lease Agreement Section */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <Building2 className="h-5 w-5 mr-2 text-blue-600" />
                  Lease Agreement
                </h3>
                
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">Lease Status</h4>
                      <p className="text-sm text-gray-600">
                        {application?.leaseGenerated 
                          ? 'Lease has been generated by admin' 
                          : 'Waiting for admin to generate lease'
                        }
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {application?.leaseGenerated ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-yellow-500" />
                      )}
                    </div>
                  </div>

                  {application?.leaseGenerated && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-3">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Start Date</p>
                            <p className="text-gray-600">{formatDate(application.leaseStartDate)}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">End Date</p>
                            <p className="text-gray-600">{formatDate(application.leaseEndDate)}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Monthly Rent</p>
                            <p className="text-gray-600">{formatCurrency(application.rentalAmount * 100)}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Security Deposit</p>
                            <p className="text-gray-600">{formatCurrency(application.depositAmount * 100)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 pt-4 border-t border-gray-200">
                        <div className="flex flex-col sm:flex-row gap-3">
                          <button
                            onClick={handleLeaseDownload}
                            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download Lease
                          </button>
                          {!application?.leaseSigned && (
                            <button
                              onClick={openSignModal}
                              className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Sign Lease
                            </button>
                          )}
                          {application?.leaseSigned && (
                            <div className="flex items-center text-green-600">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              <span className="text-sm font-medium">Lease Signed & Uploaded</span>
                            </div>
                          )}
                        </div>
                        
                        {!application?.leaseSigned && (
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Upload Signed Lease
                              </label>
                              <input
                                id="lease-upload-input"
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={handleFileUpload}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                              />
                              {signedLeaseFile && (
                                <p className="text-sm text-green-600 mt-1">
                                  Selected: {signedLeaseFile.name}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={handleLeaseUpload}
                              disabled={!signedLeaseFile || uploading}
                              className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              {uploading ? 'Uploading...' : 'Upload Signed Lease'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {!application?.leaseGenerated && (
                    <div className="text-center py-4">
                      <AlertCircle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        Your application is being reviewed. The lease will be generated once approved by our admin team.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Section */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
                  Payments
                </h3>
                
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">Payment Summary</h4>
                      <p className="text-sm text-gray-600">
                        {payments.length > 0 
                          ? `${payments.length} payment(s) for this application`
                          : 'No payments made yet'
                        }
                      </p>
                    </div>
                    <button
                      onClick={handleMakePayment}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Make Payment
                    </button>
                  </div>

                  {payments.length > 0 ? (
                    <div className="space-y-3">
                      {/* Payment Summary */}
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center">
                            <h5 className="text-sm font-medium text-blue-900">Total Owed</h5>
                            <p className="text-lg font-bold text-blue-900">
                              {formatCurrency(paymentTotals.totalOwed * 100)}
                            </p>
                            <p className="text-xs text-blue-700">
                              {application?.leaseGenerated 
                                ? `$${application?.depositAmount || 0} deposit + $${application?.rentalAmount || 0} rent`
                                : 'Amounts will be set when lease is created'
                              }
                            </p>
                          </div>
                          <div className="text-center">
                            <h5 className="text-sm font-medium text-green-700">Total Paid</h5>
                            <p className="text-lg font-bold text-green-700">
                              {formatCurrency(paymentTotals.totalPaid * 100)}
                            </p>
                            <p className="text-xs text-green-600">
                              {payments.filter(payment => payment.status === 'succeeded').length} successful payments
                            </p>
                          </div>
                          <div className="text-center">
                            <h5 className="text-sm font-medium text-gray-700">Balance</h5>
                            <p className={`text-lg font-bold ${paymentTotals.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {formatCurrency(paymentTotals.balance * 100)}
                            </p>
                            <p className="text-xs text-gray-600">
                              {paymentTotals.balance > 0 ? 'Amount owed' : 'Overpaid'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h5 className="text-sm font-medium text-gray-900">Recent Payments</h5>
                        {payments.slice(0, 3).map((payment) => (
                          <div key={payment._id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                            <div className="flex items-center space-x-3">
                              <div className={`w-2 h-2 rounded-full ${payment.status === 'succeeded' ? 'bg-green-500' : payment.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {payment.description}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatDate(payment.createdAt)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-gray-900">
                                {formatCurrency(payment.amount)}
                              </p>
                              <p className={`text-xs px-2 py-1 rounded-full ${getStatusColor(payment.status)}`}>
                                {payment.status}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {payments.length > 3 && (
                        <div className="text-center pt-2">
                          <button
                            onClick={() => navigate(`/payment/history?applicationId=${id}`)}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            View All Payments
                            <History className="w-4 h-4 ml-1 inline" />
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Payment Summary for No Payments */}
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center">
                            <h5 className="text-sm font-medium text-gray-700">Total Owed</h5>
                            <p className="text-lg font-bold text-gray-700">
                              {formatCurrency(paymentTotals.totalOwed * 100)}
                            </p>
                            <p className="text-xs text-gray-600">
                              {application?.leaseGenerated 
                                ? `$${application?.depositAmount || 0} deposit + $${application?.rentalAmount || 0} rent`
                                : 'Amounts will be set when lease is created'
                              }
                            </p>
                          </div>
                          <div className="text-center">
                            <h5 className="text-sm font-medium text-gray-500">Total Paid</h5>
                            <p className="text-lg font-bold text-gray-500">$0.00</p>
                            <p className="text-xs text-gray-500">No payments made</p>
                          </div>
                          <div className="text-center">
                            <h5 className="text-sm font-medium text-red-600">Balance</h5>
                            <p className="text-lg font-bold text-red-600">
                              {formatCurrency(paymentTotals.totalOwed * 100)}
                            </p>
                            <p className="text-xs text-red-500">Full amount owed</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-center py-4">
                        <CreditCard className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Ready to make a payment?</h4>
                        <p className="text-xs text-gray-500">
                          Click "Make Payment" above to get started
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Application Status */}
          <div className="lg:col-span-1">
            <div className="card">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-blue-600" />
                Application Status
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Status:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                    {getStatusText(application.status)}
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Submitted</p>
                    <p className="text-gray-600">{formatDate(application.submittedAt)}</p>
                  </div>
                </div>



                {application.notes && (
                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Admin Notes:</h4>
                    <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
                      {application.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="card mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-blue-600" />
                Application Progress
              </h3>
              <CompletionStatus 
                application={application} 
                leaseStatus={leaseStatus}
                recentPayments={payments}
                onApplicationUpdate={(updatedApplication) => {
                  setApplication(updatedApplication);
                }}
              />
            </div>

            {/* Action Buttons */}
            <div className="card mt-6">
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/application')}
                  className="w-full btn-primary flex items-center justify-center"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  New Application
                </button>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>

    </div>
  );
};

export default ApplicationView;
