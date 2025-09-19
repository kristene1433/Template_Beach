const express = require('express');
const Application = require('../models/Application');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Get user's applications
router.get('/', auth, async (req, res) => {
  try {
    const applications = await Application.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ applications });
  } catch (error) {
    console.error('Applications fetch error:', error);
    res.status(500).json({ error: 'Server error fetching applications' });
  }
});

// Get application status summary
router.get('/status', auth, async (req, res) => {
  try {
    const applications = await Application.find({ userId: req.user._id }).sort({ createdAt: -1 });
    
    if (applications.length === 0) {
      return res.json({ 
        hasApplications: false,
        totalApplications: 0,
        latestStatus: 'not_started',
        applications: []
      });
    }
    
    // Get the most recent application for overall status
    const latestApplication = applications[0];
    
    // Determine the overall status based on applications
    let overallStatus = latestApplication.status;
    
    // If any application is approved, show approved
    if (applications.some(app => app.status === 'approved')) {
      overallStatus = 'approved';
    }
    // If any application is pending, show pending
    else if (applications.some(app => app.status === 'pending')) {
      overallStatus = 'pending';
    }
    // If any application is rejected, show rejected
    else if (applications.some(app => app.status === 'rejected')) {
      overallStatus = 'rejected';
    }
    // If all are draft, show draft
    else if (applications.every(app => app.status === 'draft')) {
      overallStatus = 'draft';
    }
    
    res.json({
      hasApplications: true,
      totalApplications: applications.length,
      latestStatus: overallStatus,
      applications: applications.map(app => ({
        id: app._id,
        status: app.status,
        requestedStartDate: app.requestedStartDate,
        requestedEndDate: app.requestedEndDate,
        submittedAt: app.submittedAt,
        reviewedAt: app.reviewedAt,
        notes: app.notes,
        createdAt: app.createdAt
      }))
    });
  } catch (error) {
    console.error('Application status fetch error:', error);
    res.status(500).json({ error: 'Server error fetching application status' });
  }
});

// Manual payment status update for testing
router.put('/:id/payment-status', auth, async (req, res) => {
  try {
    const application = await Application.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });
    
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    application.paymentReceived = true;
    application.lastUpdated = new Date();
    await application.save();
    
    console.log(`Manually updated application ${req.params.id} payment status to true`);
    
    res.json({ 
      message: 'Payment status updated successfully',
      application 
    });
  } catch (error) {
    console.error('Manual payment status update error:', error);
    res.status(500).json({ error: 'Server error updating payment status' });
  }
});

// Get specific application by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const application = await Application.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });
    
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    console.log(`Fetched application ${req.params.id} for user ${req.user._id}`);
    console.log('Application paymentReceived status:', application.paymentReceived);
    
    res.json({ application });
  } catch (error) {
    console.error('Application fetch error:', error);
    res.status(500).json({ error: 'Server error fetching application' });
  }
});

// Create new application
router.post('/', auth, async (req, res) => {
  try {
    // Remove any client-provided submittedAt to prevent tampering
    const { submittedAt, ...cleanData } = req.body;
    
    const applicationData = {
      ...cleanData,
      userId: req.user._id,
      status: 'draft'
    };

    const application = new Application(applicationData);
    await application.save();

    res.status(201).json({
      message: 'Application created successfully',
      application
    });
  } catch (error) {
    console.error('Application creation error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Server error creating application' });
  }
});

// Update application
router.put('/:id', auth, async (req, res) => {
  try {
    const application = await Application.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });
    
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Update application fields (excluding sensitive fields)
    Object.keys(req.body).forEach(key => {
      if (key !== 'userId' && key !== '_id' && key !== 'submittedAt') {
        application[key] = req.body[key];
      }
    });

    await application.save();

    res.json({
      message: 'Application updated successfully',
      application
    });
  } catch (error) {
    console.error('Application update error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Server error updating application' });
  }
});

// Submit application (mark as pending)
router.post('/:id/submit', auth, async (req, res) => {
  try {
    const application = await Application.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });
    
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Validate required fields
    const requiredFields = [
      'firstName', 'lastName', 'phone', 'address.street', 'address.city', 
              'address.state', 'address.zipCode', 'requestedStartDate', 'requestedEndDate'
    ];

    const missingFields = [];
    requiredFields.forEach(field => {
      const value = field.split('.').reduce((obj, key) => obj && obj[key], application);
      if (!value) {
        missingFields.push(field);
      }
    });

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Missing required fields',
        missingFields
      });
    }

    // Mark application as submitted
    application.status = 'pending';
    application.submittedAt = new Date();
    
    await application.save();

    res.json({
      message: 'Application submitted successfully',
      application
    });
  } catch (error) {
    console.error('Application submission error:', error);
    res.status(500).json({ error: 'Server error submitting application' });
  }
});

// Delete application
router.delete('/:id', auth, async (req, res) => {
  try {
    const application = await Application.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });
    
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Only allow deletion of draft applications
    if (application.status !== 'draft') {
      return res.status(400).json({ error: 'Only draft applications can be deleted' });
    }

    await Application.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Application deleted successfully'
    });
  } catch (error) {
    console.error('Application deletion error:', error);
    res.status(500).json({ error: 'Server error deleting application' });
  }
});

// Upload documents
router.post('/documents', auth, async (req, res) => {
  try {
    const { documents } = req.body;
    
    const application = await Application.findOne({ userId: req.user._id });
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Add new documents
    if (Array.isArray(documents)) {
      application.documents.push(...documents);
    }

    await application.save();

    res.json({
      message: 'Documents uploaded successfully',
      documents: application.documents
    });
  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({ error: 'Server error uploading documents' });
  }
});

// Remove document
router.delete('/documents/:documentId', auth, async (req, res) => {
  try {
    const { documentId } = req.params;
    
    const application = await Application.findOne({ userId: req.user._id });
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Prevent deletion of documents from completed applications
    if (application.status === 'completed') {
      return res.status(403).json({ 
        error: 'Cannot delete documents from completed applications. Documents are preserved for record-keeping.' 
      });
    }

    // Remove document by ID
    application.documents = application.documents.filter(
      doc => doc._id.toString() !== documentId
    );

    await application.save();

    res.json({
      message: 'Document removed successfully',
      documents: application.documents
    });
  } catch (error) {
    console.error('Document removal error:', error);
    res.status(500).json({ error: 'Server error removing document' });
  }
});

// Admin: Get all applications
router.get('/admin/all', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const applications = await Application.find()
      .populate('userId', 'firstName lastName email phone')
      .sort({ createdAt: -1 });

    res.json({ applications });
  } catch (error) {
    console.error('Admin applications fetch error:', error);
    res.status(500).json({ error: 'Server error fetching applications' });
  }
});

// Admin: Get single application by ID
router.get('/admin/:applicationId', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { applicationId } = req.params;
    const application = await Application.findById(applicationId)
      .populate('userId', 'firstName lastName email phone');

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json({ application });
  } catch (error) {
    console.error('Admin single application fetch error:', error);
    res.status(500).json({ error: 'Server error fetching application' });
  }
});

// Admin: Update application status
router.put('/admin/:applicationId/status', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { applicationId } = req.params;
    const { status, notes } = req.body;

    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    application.status = status;
    application.notes = notes;
    application.reviewedAt = new Date();
    application.reviewedBy = req.user._id;

    await application.save();

    res.json({
      message: 'Application status updated successfully',
      application
    });
  } catch (error) {
    console.error('Application status update error:', error);
    res.status(500).json({ error: 'Server error updating application status' });
  }
});

// Admin: Update application progress
router.put('/admin/:applicationId/progress', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { applicationId } = req.params;
    const updates = req.body;

    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Update application fields based on progress updates
    Object.keys(updates).forEach(key => {
      if (application.schema.paths[key]) {
        application[key] = updates[key];
      }
    });

    // Add audit trail
    application.lastUpdated = new Date();
    application.updatedBy = req.user._id;

    await application.save();

    res.json({
      message: 'Application progress updated successfully',
      application
    });
  } catch (error) {
    console.error('Application progress update error:', error);
    res.status(500).json({ error: 'Server error updating application progress' });
  }
});

// Admin: Delete application
router.delete('/admin/:applicationId', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { applicationId } = req.params;
    const application = await Application.findById(applicationId);
    
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Admin can delete any application regardless of status
    await Application.findByIdAndDelete(applicationId);

    res.json({
      message: 'Application deleted successfully'
    });
  } catch (error) {
    console.error('Admin application deletion error:', error);
    res.status(500).json({ error: 'Server error deleting application' });
  }
});



module.exports = router;
