const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Application = require('../models/Application');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Configure multer for file uploads (memory storage for Heroku compatibility)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, JPEG, and PNG files are allowed'));
    }
  }
});

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
        _id: app._id,
        status: app.status,
        requestedStartDate: app.requestedStartDate,
        requestedEndDate: app.requestedEndDate,
        submittedAt: app.submittedAt,
        reviewedAt: app.reviewedAt,
        notes: app.notes,
        createdAt: app.createdAt,
        paymentReceived: app.paymentReceived,
        leaseGenerated: app.leaseGenerated,
        leaseSigned: app.leaseSigned,
        firstName: app.firstName,
        lastName: app.lastName,
        email: app.email,
        phone: app.phone,
        address: app.address,
        city: app.city,
        state: app.state,
        zipCode: app.zipCode,
        coApplicantName: app.coApplicantName,
        coApplicantEmail: app.coApplicantEmail,
        coApplicantPhone: app.coApplicantPhone,
        requestedMonths: app.requestedMonths,
        guestCount: app.guestCount,
        petInfo: app.petInfo,
        specialRequests: app.specialRequests
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

    const previousStatus = application.status;
    application.status = status;
    application.notes = notes;
    application.reviewedAt = new Date();
    application.reviewedBy = req.user._id;

    await application.save();

    // If application was just approved, automatically generate demo lease
    if (status === 'approved' && previousStatus !== 'approved') {
      try {
        // Generate demo lease content
        const demoLeaseContent = generateDemoLeaseContent(application);
        
        // Update application with demo lease data
        application.leaseGenerated = true;
        application.leaseContent = demoLeaseContent;
        application.leaseGeneratedAt = new Date();
        application.leaseGeneratedBy = req.user._id;
        
        await application.save();
        
        console.log(`Demo lease generated for application ${applicationId}`);
      } catch (leaseError) {
        console.error('Error generating demo lease:', leaseError);
        // Don't fail the status update if lease generation fails
      }
    }

    res.json({
      message: 'Application status updated successfully',
      application,
      demoLeaseGenerated: status === 'approved' && previousStatus !== 'approved'
    });
  } catch (error) {
    console.error('Application status update error:', error);
    res.status(500).json({ error: 'Server error updating application status' });
  }
});

// Helper function to generate demo lease content
const generateDemoLeaseContent = (application) => {
  const currentDate = new Date().toLocaleDateString();
  const startDate = application.requestedStartDate || new Date().toLocaleDateString();
  const endDate = application.requestedEndDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString();
  
  return `LEASE AGREEMENT

This Lease Agreement ("Agreement") is entered into on ${currentDate} between:

LANDLORD: Property Management Template Demo
TENANT: ${application.firstName} ${application.lastName}

PROPERTY ADDRESS:
${application.address.street}, ${application.address.city}, ${application.state} ${application.address.zipCode}

LEASE TERMS:
1. LEASE TERM: From ${startDate} to ${endDate}
2. RENT: $${application.rentalAmount || 2500} per month, due on the 1st of each month
3. SECURITY DEPOSIT: $${application.depositAmount || 500}
4. OCCUPANTS: ${application.firstName} ${application.lastName}${application.secondApplicantFirstName ? `, ${application.secondApplicantFirstName} ${application.secondApplicantLastName}` : ''}

TENANT RESPONSIBILITIES:
- Pay rent on time
- Maintain the property in good condition
- Follow all community rules and regulations
- Give 30 days notice before moving out

LANDLORD RESPONSIBILITIES:
- Maintain structural integrity of the property
- Provide necessary repairs
- Respect tenant privacy with proper notice

SPECIAL TERMS:
- This is a DEMO lease agreement for template demonstration purposes
- No actual legal obligations are created by this document
- For demonstration and presentation purposes only

SIGNATURES:
Landlord: _________________________ Date: _________
Tenant: _________________________ Date: _________

This agreement is for DEMONSTRATION PURPOSES ONLY.
Generated automatically when application was approved by admin.

Property Management Template - Demo Mode`;
};

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

// Admin: Edit application user information
router.put('/admin/:applicationId/edit', auth, async (req, res) => {
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

    // Define allowed fields that admins can edit
    const allowedFields = [
      'firstName',
      'lastName', 
      'secondApplicantFirstName',
      'secondApplicantLastName',
      'phone',
      'address.street',
      'address.city',
      'address.state',
      'address.zipCode',
      'additionalGuests',
      'requestedStartDate',
      'requestedEndDate',
      'notes'
    ];

    // Handle email update separately since it's in the User model
    let emailUpdate = null;
    if (updates.email) {
      emailUpdate = updates.email;
    }

    // Update allowed fields only
    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        if (key.includes('.')) {
          const [parent, child] = key.split('.');
          if (application[parent]) {
            application[parent][child] = updates[key];
          }
        } else {
          application[key] = updates[key];
        }
      }
    });

    // Update user email if provided
    if (emailUpdate) {
      const user = await User.findById(application.userId);
      if (user) {
        // Check if email is already taken by another user
        const existingUser = await User.findOne({ 
          email: emailUpdate.toLowerCase(),
          _id: { $ne: user._id }
        });
        if (existingUser) {
          return res.status(400).json({ error: 'Email is already taken by another user' });
        }
        
        user.email = emailUpdate.toLowerCase().trim();
        await user.save();
      }
    }

    // Add audit trail
    application.lastUpdated = new Date();
    application.updatedBy = req.user._id;

    await application.save();

    res.json({
      message: 'Application updated successfully',
      application
    });
  } catch (error) {
    console.error('Admin application edit error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Server error updating application' });
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

// Admin: Upload signed lease file
router.post('/admin/upload-lease', auth, upload.single('leaseFile'), async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { applicationId } = req.body;
    
    if (!applicationId) {
      return res.status(400).json({ error: 'Application ID is required' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Find the application
    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Save file information to the application (storing file content in database for Heroku compatibility)
    const fileContent = req.file.buffer ? req.file.buffer.toString('base64') : null;
    
    if (!fileContent) {
      console.error('No file buffer content available');
      return res.status(500).json({ error: 'File content could not be processed' });
    }

    // Update application with signed lease file info
    application.signedLeaseFile = {
      filename: `lease_${application._id}.pdf`,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      uploadedAt: new Date(),
      uploadedBy: 'admin',
      // Store file content as base64 for Heroku compatibility
      content: fileContent
    };

    // Mark lease as signed
    application.leaseSigned = true;
    application.leaseSignedAt = new Date();
    application.lastUpdated = new Date();
    await application.save();

    res.json({
      success: true,
      message: 'Signed lease uploaded successfully',
      signedLeaseFile: application.signedLeaseFile
    });
  } catch (error) {
    console.error('Lease upload error:', error);
    res.status(500).json({ error: 'Server error uploading lease file' });
  }
});

// Serve uploaded lease files
router.get('/admin/lease-file/:filename', auth, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { filename } = req.params;
    const filePath = path.join(__dirname, '../uploads/leases', filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Set appropriate headers
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Content-Type', 'application/pdf');
    
    // Send the file
    res.sendFile(filePath);
  } catch (error) {
    console.error('Error serving lease file:', error);
    res.status(500).json({ error: 'Server error serving file' });
  }
});

// Admin endpoint to remove lease
router.delete('/admin/remove-lease/:applicationId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { applicationId } = req.params;
    if (!applicationId) {
      return res.status(400).json({ error: 'Application ID is required' });
    }

    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Clear the lease data
    application.signedLeaseFile = null;
    application.leaseSigned = false;
    application.leaseSignedAt = null;
    application.lastUpdated = new Date();

    await application.save();

    res.json({ 
      success: true, 
      message: 'Lease removed successfully',
      application: {
        _id: application._id,
        leaseSigned: application.leaseSigned,
        signedLeaseFile: application.signedLeaseFile
      }
    });
  } catch (error) {
    console.error('Error removing lease:', error);
    res.status(500).json({ error: 'Server error removing lease' });
  }
});

module.exports = router;
