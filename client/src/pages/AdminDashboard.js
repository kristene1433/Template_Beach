import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { sendLeaseNotification } from '../utils/emailjs';
import AdminProgressBar from '../components/AdminProgressBar';
import axios from 'axios';
import jsPDF from 'jspdf';
import {
  Users, FileText, Search, Eye, Download, Calendar, 
  Phone, Mail, MapPin, UserCheck, Clock, CheckCircle,
  XCircle, AlertCircle, LogOut, DollarSign, Trash2,
  ArrowRightLeft, CreditCard
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showLeaseModal, setShowLeaseModal] = useState(false);
  const [leaseFormData, setLeaseFormData] = useState({
    leaseStartDate: '',
    leaseEndDate: '',
    rentalAmount: 2500,
    depositAmount: 500
  });
  const [selectedApplicationForLease, setSelectedApplicationForLease] = useState(null);
  const [leaseContent, setLeaseContent] = useState('');
  const [leaseGenerated, setLeaseGenerated] = useState(false);
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);
  const [selectedApplicationForDocuments, setSelectedApplicationForDocuments] = useState(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [userApplications, setUserApplications] = useState([]);
  const [transferData, setTransferData] = useState({
    fromApplicationId: '',
    toApplicationId: '',
    depositAmount: '',
    transferNotes: ''
  });
  const [transferring, setTransferring] = useState(false);
  const [applicationPayments, setApplicationPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [isEditingApplication, setIsEditingApplication] = useState(false);
  const [editApplicationData, setEditApplicationData] = useState({});
  const [savingApplication, setSavingApplication] = useState(false);
  const [rates, setRates] = useState([]);
  const [showRatesModal, setShowRatesModal] = useState(false);
  const [showAddRateModal, setShowAddRateModal] = useState(false);
  const [rateFormData, setRateFormData] = useState({
    period: '',
    startDate: '',
    endDate: '',
    monthly: '',
    minStay: 30
  });
  const [editingRate, setEditingRate] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [availabilityCurrentMonth, setAvailabilityCurrentMonth] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState([]);
  const [availabilityMode, setAvailabilityMode] = useState('view'); // 'view', 'select', 'bulk'
  const [showManualPaymentModal, setShowManualPaymentModal] = useState(false);
  const [manualPaymentData, setManualPaymentData] = useState({
    applicationId: '',
    amount: '',
    paymentType: 'rent',
    paymentDate: new Date().toISOString().split('T')[0],
    checkNumber: '',
    notes: ''
  });
  const [savingManualPayment, setSavingManualPayment] = useState(false);
  const [showRemovePaymentModal, setShowRemovePaymentModal] = useState(false);
  const [selectedPaymentForRemoval, setSelectedPaymentForRemoval] = useState(null);
  const [removingPayment, setRemovingPayment] = useState(false);

  const loadAvailability = useCallback(async () => {
    try {
      const startDate = new Date(availabilityCurrentMonth.getFullYear(), availabilityCurrentMonth.getMonth() - 1, 1);
      const endDate = new Date(availabilityCurrentMonth.getFullYear(), availabilityCurrentMonth.getMonth() + 4, 0);
      
      const response = await fetch(`/api/availability/admin/all?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Normalize dates to YYYY-MM-DD for stable comparisons in UI
        const normalized = (data.availability || []).map(item => {
          const d = new Date(item.date);
          // Store as UTC midnight string to ensure consistent match
          d.setUTCHours(0, 0, 0, 0);
          return { ...item, date: d.toISOString() };
        });
        setAvailability(normalized);
      } else {
        toast.error('Failed to load availability');
      }
    } catch (error) {
      console.error('Error loading availability:', error);
      toast.error('Error loading availability');
    }
  }, [availabilityCurrentMonth]);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/admin/login');
      return;
    }
    loadApplications();
    loadRates();
    loadAvailability();
  }, [user, navigate, loadAvailability]);

  const loadApplications = async () => {
    try {
      const response = await fetch('/api/application/admin/all', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Admin applications data:', data.applications);
        

        
        setApplications(data.applications || []);
      } else {
        toast.error('Failed to load applications');
      }
    } catch (error) {
      console.error('Error loading applications:', error);
      toast.error('Error loading applications');
    } finally {
      setIsLoading(false);
    }
  };

  const loadRates = async () => {
    try {
      const response = await fetch('/api/rates/admin/all', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRates(data.rates || []);
      } else {
        toast.error('Failed to load rates');
      }
    } catch (error) {
      console.error('Error loading rates:', error);
      toast.error('Error loading rates');
    }
  };


  const handleLogout = () => {
    logout();
    navigate('/admin/login');
    toast.success('Logged out successfully');
  };

  const handleManualPaymentSubmit = async (e) => {
    e.preventDefault();
    
    if (!manualPaymentData.applicationId || !manualPaymentData.amount) {
      toast.error('Please select an application and enter an amount');
      return;
    }

    setSavingManualPayment(true);
    
    try {
      const response = await fetch('/api/payment/admin/manual-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(manualPaymentData)
      });

      if (response.ok) {
        toast.success('Check payment recorded successfully');
        setShowManualPaymentModal(false);
        setManualPaymentData({
          applicationId: '',
          amount: '',
          paymentType: 'rent',
          paymentDate: new Date().toISOString().split('T')[0],
          checkNumber: '',
          notes: ''
        });
        // Refresh applications to show updated payment info
        loadApplications();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to record payment');
      }
    } catch (error) {
      console.error('Error recording manual payment:', error);
      toast.error('Failed to record payment');
    } finally {
      setSavingManualPayment(false);
    }
  };

  const openManualPaymentModal = (application) => {
    setManualPaymentData({
      applicationId: application._id,
      amount: '',
      paymentType: 'rent',
      paymentDate: new Date().toISOString().split('T')[0],
      checkNumber: '',
      notes: ''
    });
    setShowManualPaymentModal(true);
  };

  const handleRemovePayment = async (paymentId) => {
    if (!paymentId) {
      toast.error('No payment selected for removal');
      return;
    }

    setRemovingPayment(true);
    
    try {
      const response = await fetch(`/api/payment/admin/remove/${paymentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        toast.success('Payment removed successfully');
        setShowRemovePaymentModal(false);
        setSelectedPaymentForRemoval(null);
        // Refresh payment history
        if (selectedApplication) {
          fetchApplicationPayments(selectedApplication._id);
        }
        // Refresh applications to show updated payment info
        loadApplications();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to remove payment');
      }
    } catch (error) {
      console.error('Error removing payment:', error);
      toast.error('Failed to remove payment');
    } finally {
      setRemovingPayment(false);
    }
  };

  const updateApplicationStatus = async (applicationId, newStatus) => {
    try {
      const response = await fetch(`/api/application/admin/${applicationId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        toast.success('Application status updated');
        loadApplications();
        if (selectedApplication && selectedApplication._id === applicationId) {
          setSelectedApplication(prev => ({ ...prev, status: newStatus }));
        }
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Error updating status');
    }
  };

  const updateApplicationProgress = async (applicationId, updates) => {
    try {
      const response = await fetch(`/api/application/admin/${applicationId}/progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        toast.success('Progress updated successfully');
        loadApplications();
        if (selectedApplication && selectedApplication._id === applicationId) {
          setSelectedApplication(prev => ({ ...prev, ...updates }));
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to update progress');
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('Error updating progress');
    }
  };

  const generateLease = async (application) => {
    setSelectedApplicationForLease(application);
    setShowLeaseModal(true);
  };

  const refreshSelectedApplication = async (applicationId) => {
    try {
      const response = await fetch(`/api/application/admin/${applicationId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSelectedApplication(data.application);
      }
    } catch (error) {
      console.error('Error refreshing application:', error);
    }
  };

  const handleViewApplication = async (application) => {
    try {
      const response = await fetch(`/api/application/admin/${application._id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSelectedApplication(data.application);
        // Fetch payments for this application
        fetchApplicationPayments(data.application._id, data.application);
      } else {
        // Fallback to the application data from the list if the detailed fetch fails
        setSelectedApplication(application);
        fetchApplicationPayments(application._id, application);
      }
    } catch (error) {
      console.error('Error fetching application details:', error);
      // Fallback to the application data from the list
      setSelectedApplication(application);
      fetchApplicationPayments(application._id, application);
    }
  };

  const handleLeaseSubmit = async (e) => {
    e.preventDefault();
    
    if (!leaseFormData.leaseStartDate || !leaseFormData.leaseEndDate || !leaseFormData.rentalAmount) {
      toast.error('Please fill in all lease details');
      return;
    }

    try {
      const response = await fetch('/api/lease/admin/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          applicationId: selectedApplicationForLease._id,
          leaseStartDate: leaseFormData.leaseStartDate,
          leaseEndDate: leaseFormData.leaseEndDate,
          rentalAmount: parseInt(leaseFormData.rentalAmount),
          depositAmount: parseInt(leaseFormData.depositAmount)
        })
      });

      if (response.ok) {
        const data = await response.json();
        setLeaseContent(data.leaseAgreement);
        setLeaseGenerated(true);
                 toast.success('Lease agreement generated successfully as a PDF!');
        
        await loadApplications();
        
        if (selectedApplication && selectedApplication._id === selectedApplicationForLease._id) {
          const updatedApp = {
            ...selectedApplication,
            leaseStartDate: leaseFormData.leaseStartDate,
            leaseEndDate: leaseFormData.leaseEndDate,
            rentalAmount: parseInt(leaseFormData.rentalAmount),
            depositAmount: parseInt(leaseFormData.depositAmount),
            leaseGenerated: true // Mark lease as generated
          };
          setSelectedApplication(updatedApp);
          
          setApplications(prevApps => 
            prevApps.map(app => 
              app._id === selectedApplicationForLease._id 
                ? { ...updatedApp, leaseGenerated: true }
                : app
            )
          );
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to generate lease');
      }
    } catch (error) {
      console.error('Error generating lease:', error);
      toast.error('Error generating lease');
    }
  };

  const viewLease = () => {
    if (!leaseContent) {
      toast.error('No lease content available. Please generate the lease first.');
      return;
    }
    
    // Generate PDF
    const doc = new jsPDF();
    
    // Set title
    doc.setFontSize(20);
    doc.text('Lease Agreement', 105, 20, { align: 'center' });
    
    // Add lease content with proper page handling
    doc.setFontSize(10);
    const splitText = doc.splitTextToSize(leaseContent, 170);
    
    let yPosition = 40;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    
    for (let i = 0; i < splitText.length; i++) {
      const line = splitText[i];
      
      // Check if we need to add a new page
      if (yPosition > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
      
      doc.text(line, 20, yPosition);
      yPosition += 7; // Line height
    }
    
    // Open PDF in new window
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');
    
    // Clean up URL after a delay
    setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);
  };

  const downloadLease = () => {
    // Generate PDF
    const doc = new jsPDF();
    
    // Set title
    doc.setFontSize(20);
    doc.text('Lease Agreement', 105, 20, { align: 'center' });
    
    // Add lease content with proper page handling
    doc.setFontSize(10);
    const splitText = doc.splitTextToSize(leaseContent, 170);
    
    let yPosition = 40;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    
    for (let i = 0; i < splitText.length; i++) {
      const line = splitText[i];
      
      // Check if we need to add a new page
      if (yPosition > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
      
      doc.text(line, 20, yPosition);
      yPosition += 7; // Line height
    }
    
    // Download PDF
    doc.save(`lease-agreement-${selectedApplicationForLease.firstName}-${selectedApplicationForLease.lastName}.pdf`);
    toast.success('Lease PDF downloaded successfully!');
  };

  const sendLeaseEmail = async (sendToManager = false) => {
    try {
      const leaseData = {
        firstName: selectedApplicationForLease.firstName,
        lastName: selectedApplicationForLease.lastName,
        secondApplicantFirstName: selectedApplicationForLease.secondApplicantFirstName,
        secondApplicantLastName: selectedApplicationForLease.secondApplicantLastName,
        leaseStartDate: leaseFormData.leaseStartDate,
        leaseEndDate: leaseFormData.leaseEndDate,
        rentalAmount: leaseFormData.rentalAmount,
        depositAmount: leaseFormData.depositAmount,
        tenantEmail: selectedApplicationForLease.userId?.email || selectedApplicationForLease.email,
        leaseContent: leaseContent
      };

      const result = await sendLeaseNotification(leaseData);
      
      if (result.success) {
        toast.success(`Lease notification email sent successfully to tenant!`);
      } else {
        toast.error(`Failed to send email: ${result.error}`);
      }
    } catch (error) {
      console.error('Error sending lease email:', error);
      toast.error('Error sending lease email');
    }
  };

  const viewSignedLease = async (applicationId) => {
    try {
      // Debug logs removed for production hardening
      
      const response = await axios.get(`/api/lease/view-signed/${applicationId}`, {
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
        // Debug log removed
      
      // Get the MIME type from the response headers or default to PDF
      const contentType = response.headers['content-type'] || 'application/pdf';
      
      // Create blob with proper MIME type
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      
      // Open in new tab
      window.open(url, '_blank');
      
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error('Error viewing signed lease:', error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers
      });
      toast.error(`Error viewing signed lease: ${error.response?.status || error.message}`);
    }
  };

  const reviewDocuments = (application) => {
    setSelectedApplicationForDocuments(application);
    setShowDocumentsModal(true);
  };

  const resetLeaseModal = () => {
    setShowLeaseModal(false);
    setSelectedApplicationForLease(null);
    setLeaseFormData({
      leaseStartDate: '',
      leaseEndDate: '',
      rentalAmount: 2500,
      depositAmount: 500
    });
    setLeaseContent('');
    setLeaseGenerated(false);
  };

  // Admin amount transfer functions
  const handleTransferAmount = (application) => {
    setSelectedApplicationForLease(application);
    setTransferData(prev => ({ 
      ...prev, 
      // Source is the currently viewed application
      fromApplicationId: application._id,
      toApplicationId: '',
      depositAmount: '',
      transferNotes: ''
    }));
    setShowTransferModal(true);
    fetchAvailableDeposits(application.userId._id);
    fetchUserApplications(application.userId._id);
  };

  const fetchAvailableDeposits = async (userId) => {
    try {
      const response = await fetch(`/api/payment/admin/available-deposits?userId=${userId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Available deposits/payments data:', data);
        // setAvailableDeposits(data.deposits || []);
      }
    } catch (error) {
      console.error('Error fetching applications with payments:', error);
      toast.error('Failed to load applications with payments');
    }
  };

  const fetchUserApplications = async (userId) => {
    try {
      const response = await fetch(`/api/payment/admin/user-applications?userId=${userId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserApplications(data.applications);
      }
    } catch (error) {
      console.error('Error fetching user applications:', error);
      toast.error('Failed to load user applications');
    }
  };

  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    
    if (!transferData.fromApplicationId || !transferData.toApplicationId || !transferData.depositAmount) {
      toast.error('Please select destination application and enter transfer amount');
      return;
    }

    if (transferData.fromApplicationId === transferData.toApplicationId) {
      toast.error('Source and destination applications cannot be the same');
      return;
    }

    try {
      setTransferring(true);
      
      const response = await fetch('/api/payment/admin/transfer-amount', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          fromApplicationId: transferData.fromApplicationId,
          toApplicationId: transferData.toApplicationId,
          depositAmount: parseInt(transferData.depositAmount) * 100, // Convert to cents
          transferNotes: transferData.transferNotes
        })
      });

      if (response.ok) {
        toast.success('Amount transferred successfully!');
        setShowTransferModal(false);
        setTransferData({ fromApplicationId: '', toApplicationId: '', depositAmount: '', transferNotes: '' });
        loadApplications(); // Refresh applications
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to transfer amount');
      }
    } catch (error) {
      console.error('Error transferring amount:', error);
      toast.error('Error transferring amount');
    } finally {
      setTransferring(false);
    }
  };

  const resetTransferModal = () => {
    setShowTransferModal(false);
    setTransferData({ fromApplicationId: '', toApplicationId: '', depositAmount: '', transferNotes: '' });
    // setAvailableDeposits([]);
    setUserApplications([]);
  };

  // Fetch payments for a specific application
  const fetchApplicationPayments = async (applicationId, application = null) => {
    const targetApplication = application || selectedApplication;
    
    if (!targetApplication || !targetApplication.userId) {
      console.error('Cannot fetch payments: application or userId is null');
      return;
    }
    
    try {
      setLoadingPayments(true);
      const response = await fetch(`/api/payment/admin/history/${targetApplication.userId._id}?applicationId=${applicationId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Filter payments for this specific application
        const filteredPayments = data.payments.filter(payment => {
          // Handle both populated and non-populated applicationId
          const paymentAppId = payment.applicationId?._id || payment.applicationId;
          return paymentAppId && paymentAppId.toString() === applicationId;
        });
        setApplicationPayments(filteredPayments);
      }
    } catch (error) {
      console.error('Error fetching application payments:', error);
      toast.error('Failed to load payment history');
    } finally {
      setLoadingPayments(false);
    }
  };

  const deleteApplication = async (applicationId) => {
    if (!window.confirm('Are you sure you want to delete this application? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/application/admin/${applicationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        toast.success('Application deleted successfully');
        // Remove from local state
        setApplications(prevApps => prevApps.filter(app => app._id !== applicationId));
        // Close modal if the deleted application was selected
        if (selectedApplication && selectedApplication._id === applicationId) {
          setSelectedApplication(null);
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to delete application');
      }
    } catch (error) {
      console.error('Error deleting application:', error);
      toast.error('Error deleting application');
    }
  };

  // Admin edit application functions
  const handleEditApplication = () => {
    if (selectedApplication) {
      setEditApplicationData({
        firstName: selectedApplication.firstName || '',
        lastName: selectedApplication.lastName || '',
        secondApplicantFirstName: selectedApplication.secondApplicantFirstName || '',
        secondApplicantLastName: selectedApplication.secondApplicantLastName || '',
        phone: selectedApplication.phone || '',
        address: {
          street: selectedApplication.address?.street || '',
          city: selectedApplication.address?.city || '',
          state: selectedApplication.address?.state || '',
          zipCode: selectedApplication.address?.zipCode || ''
        },
        requestedStartDate: selectedApplication.requestedStartDate || '',
        requestedEndDate: selectedApplication.requestedEndDate || '',
        additionalGuests: selectedApplication.additionalGuests || [],
        notes: selectedApplication.notes || ''
      });
      setIsEditingApplication(true);
    }
  };

  const handleCancelEditApplication = () => {
    setIsEditingApplication(false);
    setEditApplicationData({});
  };

  const handleApplicationInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setEditApplicationData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setEditApplicationData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSaveApplicationEdit = async () => {
    try {
      setSavingApplication(true);
      
      const response = await fetch(`/api/application/admin/${selectedApplication._id}/edit`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(editApplicationData)
      });

      if (response.ok) {
        const updatedApplication = await response.json();
        setSelectedApplication(updatedApplication.application);
        setIsEditingApplication(false);
        setEditApplicationData({});
        toast.success('Application updated successfully!');
        // Refresh the applications list
        loadApplications();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update application');
      }
    } catch (error) {
      console.error('Error updating application:', error);
      toast.error('Error updating application');
    } finally {
      setSavingApplication(false);
    }
  };

  // Rates management functions
  const handleAddRate = () => {
    setEditingRate(null);
    setRateFormData({
      period: '',
      startDate: '',
      endDate: '',
      nightly: '',
      weekendNight: '',
      weekly: '',
      monthly: '',
      minStay: 30
    });
    setShowAddRateModal(true);
  };

  const handleEditRate = (rate) => {
    setEditingRate(rate);
    setRateFormData({
      period: rate.period,
      startDate: rate.startDate.split('T')[0],
      endDate: rate.endDate.split('T')[0],
      monthly: rate.monthly || '',
      minStay: rate.minStay || 30
    });
    setShowAddRateModal(true);
  };

  const handleRateSubmit = async (e) => {
    e.preventDefault();
    
    if (!rateFormData.period || !rateFormData.startDate || !rateFormData.endDate || !rateFormData.monthly) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const url = editingRate ? `/api/rates/admin/${editingRate._id}` : '/api/rates/admin';
      const method = editingRate ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...rateFormData,
          monthly: parseInt(rateFormData.monthly),
          minStay: parseInt(rateFormData.minStay)
        })
      });

      if (response.ok) {
        toast.success(editingRate ? 'Rate updated successfully' : 'Rate created successfully');
        setShowAddRateModal(false);
        loadRates();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to save rate');
      }
    } catch (error) {
      console.error('Error saving rate:', error);
      toast.error('Error saving rate');
    }
  };

  const handleDeleteRate = async (rateId) => {
    if (!window.confirm('Are you sure you want to delete this rate? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/rates/admin/${rateId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        toast.success('Rate deleted successfully');
        loadRates();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to delete rate');
      }
    } catch (error) {
      console.error('Error deleting rate:', error);
      toast.error('Error deleting rate');
    }
  };

  const toggleRateStatus = async (rateId, isActive) => {
    try {
      const response = await fetch(`/api/rates/admin/${rateId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ isActive: !isActive })
      });

      if (response.ok) {
        toast.success(`Rate ${!isActive ? 'activated' : 'deactivated'} successfully`);
        loadRates();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to update rate status');
      }
    } catch (error) {
      console.error('Error updating rate status:', error);
      toast.error('Error updating rate status');
    }
  };

  // Availability management functions
  const navigateAvailabilityMonth = (direction) => {
    setAvailabilityCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + direction);
      return newMonth;
    });
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isDateAvailable = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    const availabilityRecord = availability.find(record => 
      record.date.split('T')[0] === dateStr
    );
    return availabilityRecord ? availabilityRecord.isAvailable : true;
  };

  const isDateInPast = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const generateAvailabilityCalendarMonths = () => {
    const months = [];
    for (let i = -1; i < 5; i++) {
      const month = new Date(availabilityCurrentMonth);
      month.setMonth(availabilityCurrentMonth.getMonth() + i);
      months.push(month);
    }
    return months;
  };

  const toggleDateAvailability = async (date, isAvailable) => {
    try {
      const response = await fetch(`/api/availability/admin/${date.toISOString().split('T')[0]}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          isAvailable,
          reason: isAvailable ? 'Available' : 'Unavailable'
        })
      });

      if (response.ok) {
        toast.success(`Date ${isAvailable ? 'marked as available' : 'marked as unavailable'}`);
        // Optimistic update
        const dateKey = date.toISOString().split('T')[0];
        setAvailability(prev => {
          const idx = prev.findIndex(r => r.date.split('T')[0] === dateKey);
          if (idx !== -1) {
            const copy = [...prev];
            copy[idx] = { ...copy[idx], isAvailable };
            return copy;
          }
          const d = new Date(dateKey);
          d.setUTCHours(0, 0, 0, 0);
          return [...prev, { date: d.toISOString(), isAvailable }];
        });
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to update availability');
      }
    } catch (error) {
      console.error('Error updating availability:', error);
      toast.error('Error updating availability');
    }
  };

  const handleBulkAvailabilityUpdate = async (isAvailable) => {
    if (selectedDates.length === 0) {
      toast.error('Please select dates first');
      return;
    }

    try {
      const response = await fetch('/api/availability/admin/bulk', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          dates: selectedDates.map(date => date.toISOString().split('T')[0]),
          isAvailable,
          reason: isAvailable ? 'Available' : 'Unavailable'
        })
      });

      if (response.ok) {
        toast.success(`${selectedDates.length} dates ${isAvailable ? 'marked as available' : 'marked as unavailable'}`);
        const keys = selectedDates.map(d => d.toISOString().split('T')[0]);
        setAvailability(prev => {
          const map = new Map(prev.map(r => [r.date.split('T')[0], r]));
          keys.forEach(k => {
            const existing = map.get(k);
            if (existing) {
              map.set(k, { ...existing, isAvailable });
            } else {
              const d = new Date(k);
              d.setUTCHours(0, 0, 0, 0);
              map.set(k, { date: d.toISOString(), isAvailable });
            }
          });
          return Array.from(map.values());
        });
        setSelectedDates([]);
        setAvailabilityMode('view');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to update availability');
      }
    } catch (error) {
      console.error('Error bulk updating availability:', error);
      toast.error('Error updating availability');
    }
  };

  const toggleDateSelection = (date) => {
    if (isDateInPast(date)) return;
    
    setSelectedDates(prev => {
      const dateStr = date.toISOString().split('T')[0];
      const isSelected = prev.some(d => d.toISOString().split('T')[0] === dateStr);
      
      if (isSelected) {
        return prev.filter(d => d.toISOString().split('T')[0] !== dateStr);
      } else {
        return [...prev, date];
      }
    });
  };

  const isDateSelected = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return selectedDates.some(d => d.toISOString().split('T')[0] === dateStr);
  };


  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.secondApplicantFirstName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.secondApplicantLastName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.phone.includes(searchTerm) ||
      (app.userId?.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || app.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'completed': return <UserCheck className="h-4 w-4 text-blue-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (status) {
      case 'pending': return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'approved': return `${baseClasses} bg-green-100 text-green-800`;
      case 'rejected': return `${baseClasses} bg-red-100 text-red-800`;
      case 'completed': return `${baseClasses} bg-blue-100 text-blue-800`;
      default: return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const formatDate = (value) => {
    if (!value) return 'Not set';

    // If it's already a Date instance
    if (value instanceof Date) {
      if (isNaN(value.getTime())) return 'Invalid Date';
      return value.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }

    // If it's a number (timestamp) or string (ISO) – let Date handle it
    const d = new Date(value);
    if (isNaN(d.getTime())) return 'Invalid Date';

    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* Hero header to match site */}
      <section className="relative pt-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <video className="w-full h-64 md:h-60 object-cover object-center" poster="/images/image1.jpg" autoPlay muted loop playsInline>
            <source src="/videos/beach-video.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex items-center">
                <div className="mr-3">
                  <svg className="h-6 w-6 md:h-8 md:w-8" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-label="Palm Run logo">
                    <path d="M34 28 C33 40 32 50 32 60 L28 60 C28 50 29 40 30 28 Z" fill="#8B5A2B"/>
                    <path d="M29 34 H33 M28.8 38 H32.6 M28.6 42 H32.4 M28.4 46 H32.2 M28.2 50 H32" stroke="#A87444" strokeWidth="1.6" strokeLinecap="round"/>
                    <circle cx="31" cy="28" r="2.2" fill="#6B4423"/>
                    <circle cx="35" cy="27" r="2" fill="#6B4423"/>
                    <path d="M32 20 C22 12, 13 15, 8 20 C16 20, 24 22, 32 24 Z" fill="#1E9E57"/>
                    <path d="M32 20 C26 10, 20 10, 14 12 C20 14, 26 18, 32 22 Z" fill="#26B36A"/>
                    <path d="M32 20 C42 12, 51 15, 56 20 C48 20, 40 22, 32 24 Z" fill="#1E9E57"/>
                    <path d="M32 20 C38 10, 44 10, 50 12 C44 14, 38 18, 32 22 Z" fill="#26B36A"/>
                    <path d="M32 20 C30 12, 32 8, 36 6 C34 10, 34 16, 32 20 Z" fill="#1E9E57"/>
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white">Admin Dashboard</h1>
                  <p className="text-sm md:text-base text-gray-200">Property Management</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <span className="text-xs md:text-sm text-gray-200 truncate">Welcome, {user?.email}</span>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center px-3 py-2 rounded-md text-xs md:text-sm font-medium text-white bg-white/20 hover:bg-white/30 border border-white/30 backdrop-blur-md w-full sm:w-auto"
                >
                  <LogOut className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8 -mt-2 md:mt-0">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/90 backdrop-blur-md border border-white/30 overflow-hidden shadow-medium rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Applications
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {applications.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-md border border-white/30 overflow-hidden shadow-medium rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Pending Review
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {applications.filter(app => app.status === 'pending').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-md border border-white/30 overflow-hidden shadow-medium rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Approved
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {applications.filter(app => app.status === 'approved').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-md border border-white/30 overflow-hidden shadow-medium rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FileText className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Completed
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {applications.filter(app => app.status === 'completed').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white/90 backdrop-blur-md border border-white/30 shadow-medium rounded-lg mb-6">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-red-500 focus:border-red-500"
                    placeholder="Search by name, email, or phone..."
                  />
                </div>
              </div>
              <div className="sm:w-48">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Declined</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </div>
        </div>



        {/* Management Sections */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Property Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Manage Rates Section */}
          <div className="bg-white/90 backdrop-blur-md border border-white/30 shadow-medium rounded-lg overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
              <div className="flex items-center">
                <DollarSign className="h-6 w-6 text-blue-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Manage Rates</h3>
              </div>
              <p className="text-sm text-gray-600 mt-1">Configure rental rates and pricing periods</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Current Rates</h4>
                    <p className="text-sm text-gray-500">{rates.length} rate periods configured</p>
                  </div>
                  <button
                    onClick={() => setShowRatesModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Manage Rates
                  </button>
                </div>
                <div className="text-xs text-gray-500">
                  Set up seasonal pricing, minimum stays, and special rates for different periods.
                </div>
              </div>
            </div>
          </div>

          {/* Manage Availability Section */}
          <div className="bg-white/90 backdrop-blur-md border border-white/30 shadow-medium rounded-lg overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200">
              <div className="flex items-center">
                <Calendar className="h-6 w-6 text-green-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Manage Availability</h3>
              </div>
              <p className="text-sm text-gray-600 mt-1">Control when the property is available for rent</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Property Calendar</h4>
                    <p className="text-sm text-gray-500">Mark dates as available or unavailable</p>
                  </div>
                  <button
                    onClick={() => setShowAvailabilityModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Manage Availability
                  </button>
                </div>
                <div className="text-xs text-gray-500">
                  Block out maintenance periods, personal use, or other unavailable dates.
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>

        {/* Applications List */}
        <div className="bg-white/90 backdrop-blur-md border border-white/30 shadow-medium overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredApplications.length === 0 ? (
              <li className="px-6 py-12 text-center text-gray-500">
                No applications found matching your criteria.
              </li>
            ) : (
              filteredApplications.map((application) => (
                <li key={application._id}>
                  <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                    {/* Application Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {application.firstName[0]}{application.lastName[0]}
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {application.applicationNumber && (
                              <span className="text-blue-600 font-semibold mr-2">
                                {application.applicationNumber}
                              </span>
                            )}
                            {application.firstName} {application.lastName}
                            {application.secondApplicantFirstName && application.secondApplicantLastName && (
                              <span className="text-gray-500 ml-1">
                                & {application.secondApplicantFirstName} {application.secondApplicantLastName}
                              </span>
                            )}
                          </p>
                          <p className="text-sm text-gray-500">
                            {application.userId?.email || 'No email'}
                          </p>
                          {application.rentalAmount && (
                            <p className="text-sm text-gray-500">
                              Monthly Rent: ${application.rentalAmount.toLocaleString()}
                            </p>
                          )}
                          <div className="flex items-center mt-1">
                            {getStatusIcon(application.status)}
                            <span className={getStatusBadge(application.status)}>
                              {application.status}
                            </span>
                            {application.signedLeaseFile && (
                              <div className="ml-2 flex items-center">
                                <svg className="h-4 w-4 text-green-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span className="text-xs text-green-600 font-medium">Signed</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => handleViewApplication(application)}
                          className="inline-flex items-center px-2 py-1 md:px-3 md:py-2 border border-gray-300 shadow-sm text-xs md:text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <Eye className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                          <span className="hidden sm:inline">View</span>
                        </button>
                        {application.documents && application.documents.length > 0 && (
                          <button
                            onClick={() => reviewDocuments(application)}
                            className="inline-flex items-center px-2 py-1 md:px-3 md:py-2 border border-transparent shadow-sm text-xs md:text-sm leading-4 font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                          >
                            <FileText className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                            <span className="hidden sm:inline">Review Documents ({application.documents.length})</span>
                          </button>
                        )}
                        {application.signedLeaseFile && (
                          <button
                            onClick={() => viewSignedLease(application._id)}
                            className="inline-flex items-center px-2 py-1 md:px-3 md:py-2 border border-transparent shadow-sm text-xs md:text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            <Eye className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                            <span className="hidden sm:inline">View Signed Lease</span>
                          </button>
                        )}
                        <button
                          onClick={() => deleteApplication(application._id)}
                          className="inline-flex items-center px-2 py-1 md:px-3 md:py-2 border border-transparent shadow-sm text-xs md:text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-offset-2 focus:ring-red-500"
                        >
                          <Trash2 className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                          <span className="hidden sm:inline">Delete</span>
                        </button>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-4">
                      <AdminProgressBar 
                        application={application} 
                        onProgressUpdate={updateApplicationProgress}
                      />
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      {/* Application Detail Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Application Details
                </h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => refreshSelectedApplication(selectedApplication._id)}
                    className="text-gray-400 hover:text-gray-600 p-1"
                    title="Refresh data"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setSelectedApplication(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                  <h4 className="text-md font-medium text-gray-900 border-b pb-2">
                    Personal Information
                  </h4>
                    {!isEditingApplication ? (
                      <button
                        onClick={handleEditApplication}
                        className="flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={handleSaveApplicationEdit}
                          disabled={savingApplication}
                          className="flex items-center px-3 py-1 text-sm text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {savingApplication ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={handleCancelEditApplication}
                          disabled={savingApplication}
                          className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <UserCheck className="h-5 w-5 text-gray-400 mr-2" />
                      <div className="flex-1">
                        {isEditingApplication ? (
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              value={editApplicationData.firstName || ''}
                              onChange={(e) => handleApplicationInputChange('firstName', e.target.value)}
                              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="First Name"
                            />
                            <input
                              type="text"
                              value={editApplicationData.lastName || ''}
                              onChange={(e) => handleApplicationInputChange('lastName', e.target.value)}
                              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Last Name"
                            />
                          </div>
                        ) : (
                      <span className="text-sm">
                        <strong>Name:</strong> {selectedApplication.firstName} {selectedApplication.lastName}
                        {selectedApplication.applicationNumber && (
                          <span className="ml-2 text-blue-600 font-semibold">
                            ({selectedApplication.applicationNumber})
                          </span>
                        )}
                      </span>
                        )}
                    </div>
                    </div>
                      <div className="flex items-center">
                        <UserCheck className="h-5 w-5 text-gray-400 mr-2" />
                      <div className="flex-1">
                        {isEditingApplication ? (
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              value={editApplicationData.secondApplicantFirstName || ''}
                              onChange={(e) => handleApplicationInputChange('secondApplicantFirstName', e.target.value)}
                              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Co-Applicant First Name"
                            />
                            <input
                              type="text"
                              value={editApplicationData.secondApplicantLastName || ''}
                              onChange={(e) => handleApplicationInputChange('secondApplicantLastName', e.target.value)}
                              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Co-Applicant Last Name"
                            />
                          </div>
                        ) : (
                        <span className="text-sm">
                            <strong>Co-Applicant:</strong> {selectedApplication.secondApplicantFirstName && selectedApplication.secondApplicantLastName 
                              ? `${selectedApplication.secondApplicantFirstName} ${selectedApplication.secondApplicantLastName}`
                              : 'None'
                            }
                        </span>
                    )}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm">
                        <strong>Email:</strong> {selectedApplication.userId?.email || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-gray-400 mr-2" />
                      <div className="flex-1">
                        {isEditingApplication ? (
                          <input
                            type="tel"
                            value={editApplicationData.phone || ''}
                            onChange={(e) => handleApplicationInputChange('phone', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Phone Number"
                          />
                        ) : (
                      <span className="text-sm">
                        <strong>Phone:</strong> {selectedApplication.phone}
                      </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                      <div className="flex-1">
                        {isEditingApplication ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={editApplicationData.address?.street || ''}
                              onChange={(e) => handleApplicationInputChange('address.street', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Street Address"
                            />
                            <div className="flex space-x-2">
                              <input
                                type="text"
                                value={editApplicationData.address?.city || ''}
                                onChange={(e) => handleApplicationInputChange('address.city', e.target.value)}
                                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="City"
                              />
                              <input
                                type="text"
                                value={editApplicationData.address?.state || ''}
                                onChange={(e) => handleApplicationInputChange('address.state', e.target.value)}
                                className="w-20 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="State"
                              />
                              <input
                                type="text"
                                value={editApplicationData.address?.zipCode || ''}
                                onChange={(e) => handleApplicationInputChange('address.zipCode', e.target.value)}
                                className="w-24 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="ZIP"
                              />
                            </div>
                          </div>
                        ) : (
                      <span className="text-sm">
                        <strong>Address:</strong><br />
                        {selectedApplication.fullAddress}
                      </span>
                        )}
                      </div>
                    </div>
                    {selectedApplication.rentalAmount && (
                      <div className="flex items-center">
                        <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm">
                          <strong>Monthly Rent:</strong> ${selectedApplication.rentalAmount.toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                      <div className="flex-1">
                        {isEditingApplication ? (
                          <div className="flex space-x-2">
                            <input
                              type="date"
                              value={editApplicationData.requestedStartDate || ''}
                              onChange={(e) => handleApplicationInputChange('requestedStartDate', e.target.value)}
                              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <span className="text-gray-500 self-center">to</span>
                            <input
                              type="date"
                              value={editApplicationData.requestedEndDate || ''}
                              onChange={(e) => handleApplicationInputChange('requestedEndDate', e.target.value)}
                              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        ) : (
                      <span className="text-sm">
                                    <strong>Requested Dates:</strong> {selectedApplication.requestedStartDate && selectedApplication.requestedEndDate 
              ? `${new Date(selectedApplication.requestedStartDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${new Date(selectedApplication.requestedEndDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
              : 'Not specified'
            }
                      </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Additional Guests */}
                  <div className="flex items-start">
                    <Users className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                    <div className="flex-1">
                      {isEditingApplication ? (
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Additional Guests:</label>
                          {(editApplicationData.additionalGuests || []).map((guest, index) => (
                            <div key={index} className="flex space-x-2 items-center">
                              <input
                                type="text"
                                value={guest.firstName || ''}
                                onChange={(e) => {
                                  const newGuests = [...editApplicationData.additionalGuests];
                                  newGuests[index] = { ...newGuests[index], firstName: e.target.value };
                                  handleApplicationInputChange('additionalGuests', newGuests);
                                }}
                                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="First Name"
                              />
                              <input
                                type="text"
                                value={guest.lastName || ''}
                                onChange={(e) => {
                                  const newGuests = [...editApplicationData.additionalGuests];
                                  newGuests[index] = { ...newGuests[index], lastName: e.target.value };
                                  handleApplicationInputChange('additionalGuests', newGuests);
                                }}
                                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Last Name"
                              />
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={guest.isAdult || false}
                                  onChange={(e) => {
                                    const newGuests = [...editApplicationData.additionalGuests];
                                    newGuests[index] = { ...newGuests[index], isAdult: e.target.checked };
                                    handleApplicationInputChange('additionalGuests', newGuests);
                                  }}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="ml-1 text-xs text-gray-600">Adult</span>
                              </label>
                              <button
                                type="button"
                                onClick={() => {
                                  const newGuests = editApplicationData.additionalGuests.filter((_, i) => i !== index);
                                  handleApplicationInputChange('additionalGuests', newGuests);
                                }}
                                className="text-red-600 hover:text-red-800"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              const newGuests = [...(editApplicationData.additionalGuests || []), { firstName: '', lastName: '', isAdult: true }];
                              handleApplicationInputChange('additionalGuests', newGuests);
                            }}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            + Add Guest
                          </button>
                        </div>
                      ) : (
                      <span className="text-sm">
                          <strong>Additional Guests ({(selectedApplication.additionalGuests || []).length}):</strong> 
                          {(selectedApplication.additionalGuests || []).length > 0 ? (
                            selectedApplication.additionalGuests.map((guest, index) => (
                          <span key={index}>
                            {guest.firstName} {guest.lastName}
                            {guest.isAdult ? ' (Adult)' : ' (Child)'}
                            {index < selectedApplication.additionalGuests.length - 1 ? ', ' : ''}
                          </span>
                            ))
                          ) : (
                            ' None'
                          )}
                      </span>
                      )}
                    </div>
                  </div>

                  {/* Admin Notes */}
                  <div className="flex items-start">
                    <FileText className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                    <div className="flex-1">
                      {isEditingApplication ? (
                        <div>
                          <label className="text-sm font-medium text-gray-700">Admin Notes:</label>
                          <textarea
                            value={editApplicationData.notes || ''}
                            onChange={(e) => handleApplicationInputChange('notes', e.target.value)}
                            className="w-full mt-1 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Add admin notes..."
                            rows={3}
                          />
                        </div>
                      ) : (
                        <span className="text-sm">
                          <strong>Admin Notes:</strong> {selectedApplication.notes || 'None'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Lookups */}
                <div className="space-y-2">
                  <h4 className="text-md font-medium text-gray-900 border-b pb-2">
                    Quick Lookups
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <a
                      href={`https://www.google.com/search?q=${encodeURIComponent(`${selectedApplication.firstName} ${selectedApplication.lastName}`)}${selectedApplication.userId?.email ? `%20${encodeURIComponent(selectedApplication.userId.email)}` : ''}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    >
                      <Search className="h-4 w-4 mr-2" />
                      Google Search
                    </a>
                    <a
                      href={`https://www.facebook.com/search/people/?q=${encodeURIComponent(`${selectedApplication.firstName} ${selectedApplication.lastName}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    >
                      <Search className="h-4 w-4 mr-2" />
                      Facebook People
                    </a>
                    <a
                      href={`https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(`${selectedApplication.firstName} ${selectedApplication.lastName}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    >
                      <Search className="h-4 w-4 mr-2" />
                      LinkedIn People
                    </a>
                    {selectedApplication.userId?.email && (
                      <a
                        href={`https://www.google.com/search?q=${encodeURIComponent(selectedApplication.userId.email)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Google Email
                      </a>
                    )}
                  </div>
                </div>

                {/* Application Status */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-900 border-b pb-2">
                    Application Status
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm">
                        <strong>Submitted:</strong> {formatDate(selectedApplication.submittedAt || selectedApplication.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center">
                      {getStatusIcon(selectedApplication.status)}
                      <span className="text-sm ml-2">
                        <strong>Status:</strong> 
                        <span className={`ml-2 ${getStatusBadge(selectedApplication.status)}`}>
                          {selectedApplication.status}
                        </span>
                      </span>
                    </div>
                    {selectedApplication.signedLeaseFile && (
                      <div className="flex items-center">
                        <svg className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm">
                          <strong>Lease Uploaded:</strong> 
                          <span className="text-green-600 ml-2">{formatDate(selectedApplication.signedLeaseFile.uploadedAt)}</span>
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Update Status:
                    </label>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => updateApplicationStatus(selectedApplication._id, 'approved')}
                        className="px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => updateApplicationStatus(selectedApplication._id, 'rejected')}
                        className="px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => updateApplicationStatus(selectedApplication._id, 'completed')}
                        className="px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Complete
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lease Information */}
              {(selectedApplication.leaseStartDate || selectedApplication.leaseEndDate || selectedApplication.rentalAmount) && (
                <div className="mt-6">
                  <h4 className="text-md font-medium text-gray-900 border-b pb-2 mb-4">
                    Lease Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedApplication.leaseStartDate && (
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm">
                          <strong>Start Date:</strong> {formatDate(selectedApplication.leaseStartDate)}
                        </span>
                      </div>
                    )}
                    {selectedApplication.leaseEndDate && (
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm">
                          <strong>End Date:</strong> {formatDate(selectedApplication.leaseEndDate)}
                        </span>
                      </div>
                    )}
                    {selectedApplication.rentalAmount && (
                      <div className="flex items-center">
                        <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm">
                          <strong>Monthly Rent:</strong> ${selectedApplication.rentalAmount.toLocaleString()}
                        </span>
                      </div>
                    )}
                    {selectedApplication.signedLeaseFile && (
                      <div className="flex items-center">
                        <svg className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm">
                          <strong>Signed Lease:</strong> 
                          <span className="text-green-600 ml-1">Uploaded</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Documents Section */}
              {selectedApplication.documents && selectedApplication.documents.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-md font-medium text-gray-900 border-b pb-2 mb-4">
                    Uploaded Documents ({selectedApplication.documents.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedApplication.documents.map((document, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="text-sm font-medium text-gray-900">{document.name}</h5>
                            <p className="text-xs text-gray-500">{document.type}</p>
                            <p className="text-xs text-gray-500">
                              Uploaded: {formatDate(document.uploadedAt)}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => window.open(document.url, '_blank')}
                              className="inline-flex items-center px-2 py-1 border border-transparent shadow-sm text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </button>
                            <a
                              href={document.url}
                              download={document.name}
                              className="inline-flex items-center px-2 py-1 border border-transparent shadow-sm text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Download
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Signed Lease Notification */}
              {selectedApplication.signedLeaseFile && (
                <div className="mt-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-green-800">
                          Signed Lease Uploaded!
                        </h4>
                        <div className="mt-2 text-sm text-green-700">
                          <p>The tenant has uploaded their signed lease agreement.</p>
                          <div className="mt-2 flex items-center space-x-2">
                            <span className="text-xs text-green-600">
                              File: {selectedApplication.signedLeaseFile.originalName}
                            </span>
                            <span className="text-xs text-green-600">
                              Uploaded: {formatDate(selectedApplication.signedLeaseFile.uploadedAt)}
                            </span>
                          </div>
                        </div>
                        <div className="mt-3">
                          <button
                            onClick={() => viewSignedLease(selectedApplication._id)}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Signed Lease
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Information */}
              <div className="mt-6">
                <h4 className="text-md font-medium text-gray-900 border-b pb-2 mb-4 flex items-center">
                  <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
                  Payment Information
                </h4>
                
                {loadingPayments ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-sm text-gray-500 mt-2">Loading payment history...</p>
                  </div>
                ) : applicationPayments.length > 0 ? (
                  <div className="space-y-3">
                    {/* Payment Summary */}
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <h5 className="text-sm font-medium text-blue-900">Total Owed</h5>
                          <p className="text-lg font-bold text-blue-900">
                            ${selectedApplication.leaseGenerated 
                              ? (selectedApplication.depositAmount || 0) + (selectedApplication.rentalAmount || 0)
                              : 0
                            }
                          </p>
                          <p className="text-xs text-blue-700">
                            {selectedApplication.leaseGenerated 
                              ? `$${selectedApplication.depositAmount || 0} deposit + $${selectedApplication.rentalAmount || 0} rent`
                              : 'Amounts will be set when lease is created'
                            }
                          </p>
                        </div>
                        <div className="text-center">
                          <h5 className="text-sm font-medium text-green-700">Total Paid</h5>
                          <p className="text-lg font-bold text-green-700">
                            ${(applicationPayments
                              .filter(payment => payment.status === 'succeeded')
                              .reduce((total, payment) => total + payment.amount, 0) / 100).toFixed(2)}
                          </p>
                          <p className="text-xs text-green-600">
                            {applicationPayments.filter(payment => payment.status === 'succeeded').length} successful payments
                          </p>
                        </div>
                        <div className="text-center">
                          <h5 className="text-sm font-medium text-gray-700">Balance</h5>
                          <p className={`text-lg font-bold ${(() => {
                            const totalOwed = selectedApplication.leaseGenerated 
                              ? (selectedApplication.depositAmount || 0) + (selectedApplication.rentalAmount || 0)
                              : 0;
                            const totalPaid = applicationPayments
                              .filter(payment => payment.status === 'succeeded')
                              .reduce((total, payment) => total + payment.amount, 0) / 100;
                            return totalOwed - totalPaid > 0 ? 'text-red-600' : 'text-green-600';
                          })()}`}>
                            ${(() => {
                              const totalOwed = selectedApplication.leaseGenerated 
                                ? (selectedApplication.depositAmount || 0) + (selectedApplication.rentalAmount || 0)
                                : 0;
                              const totalPaid = applicationPayments
                                .filter(payment => payment.status === 'succeeded')
                                .reduce((total, payment) => total + payment.amount, 0) / 100;
                              return (totalOwed - totalPaid).toFixed(2);
                            })()}
                          </p>
                          <p className="text-xs text-gray-600">
                            {(() => {
                              const totalOwed = selectedApplication.leaseGenerated 
                                ? (selectedApplication.depositAmount || 0) + (selectedApplication.rentalAmount || 0)
                                : 0;
                              const totalPaid = applicationPayments
                                .filter(payment => payment.status === 'succeeded')
                                .reduce((total, payment) => total + payment.amount, 0) / 100;
                              return totalOwed - totalPaid > 0 ? 'Amount owed' : 'Overpaid';
                            })()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Recent Payments */}
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-gray-900">Recent Payments</h5>
                      {applicationPayments.slice(0, 3).map((payment) => (
                        <div key={payment._id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                          <div className="flex items-center space-x-3">
                            <div className={`w-2 h-2 rounded-full ${payment.status === 'succeeded' ? 'bg-green-500' : payment.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {payment.description}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(payment.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-gray-900">
                              ${(payment.amount / 100).toFixed(2)}
                            </p>
                            <p className={`text-xs px-2 py-1 rounded-full ${
                              payment.status === 'succeeded' ? 'bg-green-100 text-green-800' :
                              payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {payment.status}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-600">
                      No payments have been made for this application yet.
                    </p>
                  </div>
                )}
              </div>

              {/* Payment Management Buttons */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h5 className="text-sm font-medium text-gray-900 mb-3">Payment Management</h5>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => openManualPaymentModal(selectedApplication)}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-green-700 bg-green-100 border border-green-300 rounded-md hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Add Check Payment
                  </button>
                  <button
                    onClick={() => setShowRemovePaymentModal(true)}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-700 bg-red-100 border border-red-300 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Remove Payment
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Add check payments or remove incorrect entries from payment history.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
                {selectedApplication.documents && selectedApplication.documents.length > 0 && (
                  <button
                    onClick={() => reviewDocuments(selectedApplication)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Review Documents ({selectedApplication.documents.length})
                  </button>
                )}
                {selectedApplication.status === 'approved' && (
                  <button
                    onClick={() => generateLease(selectedApplication)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Generate Lease Agreement
                  </button>
                )}
                <button
                  onClick={() => handleTransferAmount(selectedApplication)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  <ArrowRightLeft className="h-4 w-4 mr-2" />
                  Transfer Amount
                </button>
                <button
                  onClick={() => deleteApplication(selectedApplication._id)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Application
                </button>
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lease Generation Modal */}
      {showLeaseModal && selectedApplicationForLease && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  {leaseGenerated ? 'Lease Generated Successfully' : 'Generate Lease Agreement'}
                </h3>
                <button
                  onClick={resetLeaseModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  {leaseGenerated ? 'Lease for:' : 'Generating lease for:'} <strong>{selectedApplicationForLease.firstName} {selectedApplicationForLease.lastName}</strong>
                </p>
              </div>

              {!leaseGenerated ? (
                <form onSubmit={handleLeaseSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lease Start Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={leaseFormData.leaseStartDate}
                      onChange={(e) => setLeaseFormData(prev => ({ ...prev, leaseStartDate: e.target.value }))}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lease End Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={leaseFormData.leaseEndDate}
                      onChange={(e) => setLeaseFormData(prev => ({ ...prev, leaseEndDate: e.target.value }))}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Monthly Rental Amount ($) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="100"
                      value={leaseFormData.rentalAmount}
                      onChange={(e) => setLeaseFormData(prev => ({ ...prev, rentalAmount: parseInt(e.target.value) || 0 }))}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Security Deposit Amount ($) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="100"
                      value={leaseFormData.depositAmount}
                      onChange={(e) => setLeaseFormData(prev => ({ ...prev, depositAmount: parseInt(e.target.value) || 0 }))}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={resetLeaseModal}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Generate Lease
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                                     <div className="bg-green-50 border border-green-200 rounded-md p-4">
                     <p className="text-sm text-green-800">
                       Lease agreement has been generated successfully as a PDF! You can now view, download, or send it via email.
                     </p>
                   </div>
                  
                  <div className="flex flex-col space-y-3">
                                         <button
                       onClick={viewLease}
                       className="flex items-center justify-center space-x-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                     >
                       <Eye className="h-4 w-4" />
                       <span>View PDF</span>
                     </button>
                     
                     <button
                       onClick={downloadLease}
                       className="flex items-center justify-center space-x-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                     >
                       <Download className="h-4 w-4" />
                       <span>Download PDF</span>
                     </button>
                    
                    <button
                      onClick={() => sendLeaseEmail(false)}
                      className="flex items-center justify-center space-x-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                      <Mail className="h-4 w-4" />
                      <span>Send to Tenant</span>
                    </button>
                  </div>
                  
                  <div className="flex justify-end pt-4">
                    <button
                      onClick={resetLeaseModal}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Documents Review Modal */}
      {showDocumentsModal && selectedApplicationForDocuments && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Review Documents - {selectedApplicationForDocuments.firstName} {selectedApplicationForDocuments.lastName}
                </h3>
                <button
                  onClick={() => setShowDocumentsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              {/* Completed Application Notice */}
              {selectedApplicationForDocuments.status === 'completed' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium">Application Completed</p>
                      <p className="mt-1">
                        This application has been marked as completed. All documents are preserved for record-keeping and cannot be modified.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {selectedApplicationForDocuments.documents && selectedApplicationForDocuments.documents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedApplicationForDocuments.documents.map((document, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">{document.name}</h4>
                            <p className="text-xs text-gray-500">{document.type}</p>
                            <p className="text-xs text-gray-500">
                              Uploaded: {formatDate(document.uploadedAt)}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => window.open(document.url, '_blank')}
                              className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </button>
                            <a
                              href={document.url}
                              download={document.name}
                              className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500">No documents have been uploaded for this application.</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-6 border-t mt-6">
                <button
                  onClick={() => setShowDocumentsModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Amount Transfer Modal */}
      {showTransferModal && selectedApplicationForLease && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Transfer Amount
                </h3>
                <button
                  onClick={resetTransferModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  Transferring for: <strong>{selectedApplicationForLease.firstName} {selectedApplicationForLease.lastName}</strong>
                </p>
                <p className="text-xs text-gray-500">
                  User ID: {selectedApplicationForLease.userId._id}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Admin can transfer any amount between this user's applications
                </p>
              </div>

              <form onSubmit={handleTransferSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    From Application
                  </label>
                  <div className="px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-sm text-gray-700">
                    {selectedApplicationForLease.applicationNumber 
                      ? `${selectedApplicationForLease.applicationNumber} - ${selectedApplicationForLease.requestedStartDate ? new Date(selectedApplicationForLease.requestedStartDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Current'}`
                      : `${selectedApplicationForLease.requestedStartDate ? new Date(selectedApplicationForLease.requestedStartDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Current'}`
                    }
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    To Application *
                  </label>
                  <select
                    value={transferData.toApplicationId}
                    onChange={(e) => setTransferData(prev => ({ ...prev, toApplicationId: e.target.value }))}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    required
                  >
                    <option value="">Choose destination application...</option>
                    {userApplications.map((application) => (
                      <option key={application._id} value={application._id}>
                        {application.applicationNumber 
                          ? `${application.applicationNumber} - ${application.requestedStartDate ? new Date(application.requestedStartDate).getFullYear() : 'Current'} (${application.status})`
                          : `${application.requestedStartDate ? new Date(application.requestedStartDate).getFullYear() : 'Current'} (${application.status})`
                        }
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount to Transfer ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={transferData.depositAmount}
                    onChange={(e) => setTransferData(prev => ({ ...prev, depositAmount: e.target.value }))}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter amount to transfer"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Transfer Notes (Optional)
                  </label>
                  <textarea
                    value={transferData.transferNotes}
                    onChange={(e) => setTransferData(prev => ({ ...prev, transferNotes: e.target.value }))}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    rows="3"
                    placeholder="Add any notes about this transfer..."
                  />
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetTransferModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={transferring}
                    className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                  >
                    {transferring ? 'Transferring...' : 'Transfer Amount'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Rates Management Modal */}
      {showRatesModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-6xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Manage Rental Rates
                </h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleAddRate}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <DollarSign className="h-4 w-4 mr-1" />
                    Add Rate
                  </button>
                  <button
                    onClick={() => setShowRatesModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Period
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Monthly Rate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Min Stay
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {rates.map((rate, index) => (
                      <tr key={rate._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {rate.period}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${rate.monthly?.toLocaleString() || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {rate.minStay} nights
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            rate.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {rate.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => handleEditRate(rate)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => toggleRateStatus(rate._id, rate.isActive)}
                            className={`${rate.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                          >
                            {rate.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDeleteRate(rate._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {rates.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No rates configured yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Rate Modal */}
      {showAddRateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingRate ? 'Edit Rate' : 'Add New Rate'}
                </h3>
                <button
                  onClick={() => setShowAddRateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleRateSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Period Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={rateFormData.period}
                      onChange={(e) => setRateFormData(prev => ({ ...prev, period: e.target.value }))}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                      placeholder="e.g., Sep 01 - Sep 30 2025"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Monthly Rate ($) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={rateFormData.monthly}
                      onChange={(e) => setRateFormData(prev => ({ ...prev, monthly: e.target.value }))}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                      placeholder="3200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={rateFormData.startDate}
                      onChange={(e) => setRateFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={rateFormData.endDate}
                      onChange={(e) => setRateFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                </div>


                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Stay (nights) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={rateFormData.minStay}
                    onChange={(e) => setRateFormData(prev => ({ ...prev, minStay: e.target.value }))}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                    placeholder="30"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddRateModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {editingRate ? 'Update Rate' : 'Create Rate'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Availability Management Modal */}
      {showAvailabilityModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-7xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Manage Availability
                </h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setAvailabilityMode('view')}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      availabilityMode === 'view' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    View
                  </button>
                  <button
                    onClick={() => setAvailabilityMode('select')}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      availabilityMode === 'select' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Select Dates
                  </button>
                  <button
                    onClick={() => setShowAvailabilityModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {availabilityMode === 'select' && selectedDates.length > 0 && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-800">
                      {selectedDates.length} date{selectedDates.length !== 1 ? 's' : ''} selected
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleBulkAvailabilityUpdate(true)}
                        className="px-3 py-1 text-sm font-medium text-green-800 bg-green-200 rounded hover:bg-green-300"
                      >
                        Mark as Available
                      </button>
                      <button
                        onClick={() => handleBulkAvailabilityUpdate(false)}
                        className="px-3 py-1 text-sm font-medium text-red-800 bg-red-200 rounded hover:bg-red-300"
                      >
                        Mark as Unavailable
                      </button>
                      <button
                        onClick={() => setSelectedDates([])}
                        className="px-3 py-1 text-sm font-medium text-gray-800 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        Clear Selection
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center mb-6">
                <button
                  onClick={() => navigateAvailabilityMonth(-1)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Previous
                </button>
                <button
                  onClick={() => navigateAvailabilityMonth(1)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Next &gt;
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {generateAvailabilityCalendarMonths().map((month, index) => (
                  <div key={index} className="bg-white rounded-lg border border-gray-200 p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                      {month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h3>
                    
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                        <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
                          {day}
                        </div>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-7 gap-1">
                      {Array.from({ length: getFirstDayOfMonth(month) }, (_, i) => (
                        <div key={`empty-${i}`} className="h-8"></div>
                      ))}
                      
                      {Array.from({ length: getDaysInMonth(month) }, (_, i) => {
                        const day = i + 1;
                        const date = new Date(month.getFullYear(), month.getMonth(), day);
                        const isAvailable = isDateAvailable(date);
                        const isPast = isDateInPast(date);
                        const isSelected = isDateSelected(date);
                        
                        return (
                          <div
                            key={day}
                            onClick={() => {
                              if (isPast) return;
                              if (availabilityMode === 'select') {
                                toggleDateSelection(date);
                              } else {
                                toggleDateAvailability(date, !isAvailable);
                              }
                            }}
                            className={`h-8 flex items-center justify-center text-sm font-medium rounded cursor-pointer ${
                              isPast
                                ? 'text-gray-300 bg-gray-100 cursor-not-allowed'
                                : isSelected
                                  ? 'text-white bg-blue-600'
                                  : isAvailable
                                    ? 'text-gray-900 bg-green-100 hover:bg-green-200'
                                    : 'text-gray-500 bg-red-100 hover:bg-red-200 line-through'
                            }`}
                          >
                            {day}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex justify-center space-x-6">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-100 rounded mr-2"></div>
                  <span className="text-sm text-gray-600">Available</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-100 rounded mr-2"></div>
                  <span className="text-sm text-gray-600">Unavailable</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-100 rounded mr-2"></div>
                  <span className="text-sm text-gray-600">Past dates</span>
                </div>
                {availabilityMode === 'select' && (
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-blue-600 rounded mr-2"></div>
                    <span className="text-sm text-gray-600">Selected</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Payment Modal */}
      {showManualPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Add Check Payment</h3>
              <p className="text-sm text-gray-600 mt-1">
                {manualPaymentData.applicationId 
                  ? 'Record a manual check payment for this tenant' 
                  : 'Record a manual check payment for any tenant'
                }
              </p>
            </div>
            
            <form onSubmit={handleManualPaymentSubmit} className="p-6 space-y-4">
              {!manualPaymentData.applicationId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Application
                  </label>
                  <select
                    value={manualPaymentData.applicationId}
                    onChange={(e) => setManualPaymentData(prev => ({ ...prev, applicationId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Choose an application...</option>
                    {applications.map((app) => (
                      <option key={app._id} value={app._id}>
                        {app.userId?.firstName} {app.userId?.lastName} - {app.propertyAddress}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Type
                </label>
                <select
                  value={manualPaymentData.paymentType}
                  onChange={(e) => setManualPaymentData(prev => ({ ...prev, paymentType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="rent">Rent</option>
                  <option value="deposit">Deposit</option>
                  <option value="late_fee">Late Fee</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={manualPaymentData.amount}
                  onChange={(e) => setManualPaymentData(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Date
                </label>
                <input
                  type="date"
                  value={manualPaymentData.paymentDate}
                  onChange={(e) => setManualPaymentData(prev => ({ ...prev, paymentDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Check Number (Optional)
                </label>
                <input
                  type="text"
                  value={manualPaymentData.checkNumber}
                  onChange={(e) => setManualPaymentData(prev => ({ ...prev, checkNumber: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 1234"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={manualPaymentData.notes}
                  onChange={(e) => setManualPaymentData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Additional notes about this payment..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowManualPaymentModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingManualPayment}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingManualPayment ? 'Recording...' : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Remove Payment Modal */}
      {showRemovePaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Remove Payment</h3>
              <p className="text-sm text-gray-600 mt-1">Select a payment to remove from the payment history</p>
            </div>
            
            <div className="p-6">
              {applicationPayments.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-500">No payments to remove</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {applicationPayments.map((payment) => (
                    <div
                      key={payment._id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedPaymentForRemoval?._id === payment._id
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedPaymentForRemoval(payment)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${
                            payment.status === 'succeeded' ? 'bg-green-500' : 
                            payment.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {payment.description}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(payment.createdAt).toLocaleDateString()} • 
                              {payment.paymentMethod === 'check' ? ' Check Payment' : ' Card Payment'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">
                            ${(payment.amount / 100).toFixed(2)}
                          </p>
                          <p className={`text-xs px-2 py-1 rounded-full ${
                            payment.status === 'succeeded' ? 'bg-green-100 text-green-800' :
                            payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {payment.status}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 mt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowRemovePaymentModal(false);
                    setSelectedPaymentForRemoval(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRemovePayment(selectedPaymentForRemoval?._id)}
                  disabled={!selectedPaymentForRemoval || removingPayment}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {removingPayment ? 'Removing...' : 'Remove Payment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default AdminDashboard;
