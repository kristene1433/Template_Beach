const express = require('express');
const Application = require('../models/Application');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Get user's application
router.get('/', auth, async (req, res) => {
  try {
    const application = await Application.findOne({ userId: req.user._id });
    
    if (!application) {
      return res.json({ application: null });
    }
    
    res.json({ application });
  } catch (error) {
    console.error('Application fetch error:', error);
    res.status(500).json({ error: 'Server error fetching application' });
  }
});

// Create new application
router.post('/', auth, async (req, res) => {
  try {
    // Check if user already has an application
    const existingApplication = await Application.findOne({ userId: req.user._id });
    if (existingApplication) {
      return res.status(400).json({ error: 'Application already exists for this user' });
    }

    const applicationData = {
      ...req.body,
      userId: req.user._id,
      email: req.user.email
    };

    const application = new Application(applicationData);
    await application.save();

    // Update user's application status
    await User.findByIdAndUpdate(req.user._id, { applicationCompleted: true });

    res.status(201).json({
      message: 'Application submitted successfully',
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
router.put('/', auth, async (req, res) => {
  try {
    const application = await Application.findOne({ userId: req.user._id });
    
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Update application fields
    Object.keys(req.body).forEach(key => {
      if (key !== 'userId' && key !== '_id') {
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

// Submit application (mark as complete)
router.post('/submit', auth, async (req, res) => {
  try {
    const application = await Application.findOne({ userId: req.user._id });
    
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Validate required fields
    const requiredFields = [
      'firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'ssn',
      'currentAddress.street', 'currentAddress.city', 'currentAddress.state', 'currentAddress.zipCode',
      'employment.employerName', 'employment.jobTitle', 'employment.monthlyIncome',
      'rentalProperty.address.street', 'rentalProperty.address.city', 'rentalProperty.address.state', 'rentalProperty.address.zipCode',
      'rentalProperty.rentalAmount', 'rentalProperty.depositAmount'
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

    // Mark application as complete and submitted
    application.isComplete = true;
    application.status = 'pending';
    application.submittedAt = new Date();
    
    await application.save();

    // Update user's application status
    await User.findByIdAndUpdate(req.user._id, { applicationCompleted: true });

    res.json({
      message: 'Application submitted successfully',
      application
    });
  } catch (error) {
    console.error('Application submission error:', error);
    res.status(500).json({ error: 'Server error submitting application' });
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

// Get application status
router.get('/status', auth, async (req, res) => {
  try {
    const application = await Application.findOne({ userId: req.user._id });
    
    if (!application) {
      return res.json({ 
        status: 'not_started',
        message: 'No application found'
      });
    }

    res.json({
      status: application.status,
      isComplete: application.isComplete,
      submittedAt: application.submittedAt,
      reviewedAt: application.reviewedAt,
      notes: application.notes
    });
  } catch (error) {
    console.error('Status fetch error:', error);
    res.status(500).json({ error: 'Server error fetching status' });
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

module.exports = router;
