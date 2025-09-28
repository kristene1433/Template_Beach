const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { jsPDF } = require('jspdf');
const Application = require('../models/Application');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Configure multer for memory storage (for Heroku compatibility)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Allow only PDF and image files
    if (file.mimetype === 'application/pdf' || 
        file.mimetype === 'image/jpeg' || 
        file.mimetype === 'image/jpg' || 
        file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, JPEG, and PNG files are allowed'), false);
    }
  }
});

// Generate lease agreement for a specific application
router.post('/generate/:applicationId', auth, async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { leaseStartDate, leaseEndDate, rentalAmount = 2500, depositAmount = 500 } = req.body;
    
    // Get the specific application
    const application = await Application.findOne({ 
      _id: applicationId, 
      userId: req.user._id 
    });
    
    if (!application) {
      return res.status(404).json({ error: 'Application not found. Please complete your application first.' });
    }

    // Save lease information to the application
    // Store dates as strings to avoid timezone issues
    application.leaseStartDate = leaseStartDate;
    application.leaseEndDate = leaseEndDate;
    application.rentalAmount = rentalAmount;
    application.depositAmount = depositAmount;
    application.leaseGenerated = true; // Mark lease as generated
    await application.save();

    // Generate lease agreement content
    const leaseAgreement = generateLeaseAgreement(application, leaseStartDate, leaseEndDate, rentalAmount);

    res.json({
      message: 'Lease agreement generated successfully',
      leaseAgreement,
      application: {
        id: application._id,
        firstName: application.firstName,
        lastName: application.lastName,
        phone: application.phone,
        address: application.address,
        additionalGuests: application.additionalGuests
      }
    });
  } catch (error) {
    console.error('Lease generation error:', error);
    res.status(500).json({ error: 'Server error generating lease agreement' });
  }
});

// Admin: Generate lease agreement for any application
router.post('/admin/generate', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { applicationId, leaseStartDate, leaseEndDate, rentalAmount = 2500, depositAmount = 500 } = req.body;
    
    if (!applicationId) {
      return res.status(400).json({ error: 'Application ID is required' });
    }

    // Get application by ID
    const application = await Application.findById(applicationId).populate('userId', 'email');
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Save lease information to the application
    // Store dates as strings to avoid timezone issues
    application.leaseStartDate = leaseStartDate;
    application.leaseEndDate = leaseEndDate;
    application.rentalAmount = rentalAmount;
    application.depositAmount = depositAmount;
    application.leaseGenerated = true; // Mark lease as generated
    await application.save();

    // Generate lease agreement content
    const leaseAgreement = generateLeaseAgreement(application, leaseStartDate, leaseEndDate, rentalAmount);

    // Return the lease content as JSON
    res.json({
      success: true,
      leaseAgreement,
      application: {
        id: application._id,
        firstName: application.firstName,
        lastName: application.lastName,
        phone: application.phone,
        address: application.address,
        additionalGuests: application.additionalGuests,
        leaseStartDate: application.leaseStartDate,
        leaseEndDate: application.leaseEndDate,
        rentalAmount: application.rentalAmount,
        depositAmount: application.depositAmount
      }
    });
  } catch (error) {
    console.error('Admin lease generation error:', error);
    res.status(500).json({ error: 'Server error generating lease agreement' });
  }
});

// Download lease agreement as PDF
router.get('/download', auth, async (req, res) => {
  try {
    const { applicationId, leaseStartDate, leaseEndDate, rentalAmount = 2500, depositAmount = 500 } = req.query;
    
    // Get the specific application
    let application;
    if (applicationId) {
      application = await Application.findOne({ 
        _id: applicationId, 
        userId: req.user._id 
      });
    } else {
      // Fallback to user's most recent application
      application = await Application.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
    }
    
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Save lease information to the application
    // Store dates as strings to avoid timezone issues
    application.leaseStartDate = leaseStartDate;
    application.leaseEndDate = leaseEndDate;
    application.rentalAmount = rentalAmount;
    application.depositAmount = depositAmount;
    await application.save();

    // Generate lease agreement text
    const leaseAgreement = generateLeaseAgreement(application, leaseStartDate, leaseEndDate, rentalAmount);

    // Create PDF
    console.log('Creating PDF for application:', application._id);
    console.log('Lease agreement length:', leaseAgreement.length);
    try {
      const doc = new jsPDF();
      console.log('jsPDF instance created successfully');
      
      // Set title
      doc.setFontSize(16);
      doc.text('Lease Agreement', 20, 20);
      console.log('Title added to PDF');
      
      // Add lease content with proper page handling
      doc.setFontSize(10);
      const lines = leaseAgreement.split('\n');
      console.log('Text split into', lines.length, 'lines');
      
      let yPosition = 40;
      const pageHeight = 280;
      const lineHeight = 6;
      
      for (let i = 0; i < lines.length; i++) {
        // Check if we need a new page
        if (yPosition > pageHeight) {
          doc.addPage();
          yPosition = 20;
        }
        
        // Split long lines if needed
        const text = lines[i] || '';
        const splitText = doc.splitTextToSize(text, 170);
        
        for (let j = 0; j < splitText.length; j++) {
          if (yPosition > pageHeight) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(splitText[j], 20, yPosition);
          yPosition += lineHeight;
        }
      }

      console.log('All text added to PDF');

      // Set headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="lease-agreement-${application.firstName}-${application.lastName}.pdf"`);

      console.log('Generating PDF buffer...');
      // Send PDF buffer directly
      const pdfBuffer = doc.output('arraybuffer');
      console.log('PDF buffer generated, size:', pdfBuffer.byteLength);
      
      if (pdfBuffer.byteLength === 0) {
        throw new Error('Generated PDF buffer is empty');
      }
      
      res.send(Buffer.from(pdfBuffer));
      console.log('PDF response sent successfully');
    } catch (pdfError) {
      console.error('PDF generation error:', pdfError);
      // Fallback to text if PDF generation fails
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="lease-agreement-${application.firstName}-${application.lastName}.txt"`);
      res.send(leaseAgreement);
    }
  } catch (error) {
    console.error('Lease download error:', error);
    res.status(500).json({ error: 'Server error downloading lease agreement' });
  }
});

// Test PDF generation endpoint
router.get('/test-pdf', (req, res) => {
  try {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Test PDF', 20, 20);
    doc.text('This is a test PDF generation.', 20, 40);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="test.pdf"');
    
    const pdfBuffer = doc.output('arraybuffer');
    res.send(Buffer.from(pdfBuffer));
  } catch (error) {
    console.error('Test PDF error:', error);
    res.status(500).json({ error: 'Test PDF generation failed' });
  }
});

// Get lease agreement preview
router.get('/preview', auth, async (req, res) => {
  try {
    // Get user's application
    const application = await Application.findOne({ userId: req.user._id });
    if (!application) {
      return res.json({ 
        hasApplication: false,
        message: 'No application found. Please complete your application first.'
      });
    }

    // Generate preview with default dates
    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() + 30); // 30 days from now
    
    const defaultEndDate = new Date(defaultStartDate);
    defaultEndDate.setFullYear(defaultEndDate.getFullYear() + 1); // 1 year lease

    // Format dates as YYYY-MM-DD strings to avoid timezone issues
    const formatDateForAPI = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const leasePreview = generateLeaseAgreement(
      application, 
      formatDateForAPI(defaultStartDate), 
      formatDateForAPI(defaultEndDate),
      2500
    );

    res.json({
      hasApplication: true,
      isComplete: true,
      leasePreview,
      application: {
        firstName: application.firstName,
        lastName: application.lastName,
        phone: application.phone,
        address: application.address,
        additionalGuests: application.additionalGuests
      }
    });
  } catch (error) {
    console.error('Lease preview error:', error);
    res.status(500).json({ error: 'Server error generating lease preview' });
  }
});

// Sign lease agreement
router.post('/sign', auth, async (req, res) => {
  try {
    const { leaseStartDate, leaseEndDate, rentalAmount, depositAmount, signature } = req.body;
    
    if (!signature) {
      return res.status(400).json({ error: 'Digital signature is required' });
    }

    // Get user's application
    const application = await Application.findOne({ userId: req.user._id });
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Update application with lease information
    // Store dates as strings to avoid timezone issues
    application.leaseStartDate = leaseStartDate;
    application.leaseEndDate = leaseEndDate;
    application.leaseSigned = true;
    application.leaseSignedAt = new Date();
    application.leaseSignature = signature;
    application.rentalAmount = rentalAmount;
    application.depositAmount = depositAmount;

    await application.save();

    // Update user's lease status
    await User.findByIdAndUpdate(req.user._id, { leaseSigned: true });

    res.json({
      message: 'Lease agreement signed successfully',
      application: {
        id: application._id,
        leaseSigned: application.leaseSigned,
        leaseSignedAt: application.leaseSignedAt,
        leaseStartDate: application.leaseStartDate,
        leaseEndDate: application.leaseEndDate
      }
    });
  } catch (error) {
    console.error('Lease signing error:', error);
    res.status(500).json({ error: 'Server error signing lease agreement' });
  }
});

// Get lease status
router.get('/status', auth, async (req, res) => {
  try {
    // Get all applications for the user, sorted by creation date
    const applications = await Application.find({ userId: req.user._id }).sort({ createdAt: -1 });
    
    if (applications.length === 0) {
      return res.json({
        hasApplication: false,
        leaseSigned: false,
        message: 'No application found'
      });
    }

    // Find the most recent application that's not completed
    const mostRecentActiveApplication = applications.find(app => app.status !== 'completed');
    
    // Find the application with a lease (most recent one with lease info that's not completed)
    const applicationWithLease = applications.find(app => 
      app.leaseStartDate && 
      app.leaseEndDate && 
      app.status !== 'completed'
    );
    
    if (applicationWithLease) {
      const hasSignedFile = !!(applicationWithLease.signedLeaseFile && applicationWithLease.signedLeaseFile.content);
      res.json({
        hasApplication: true,
        isComplete: true,
        leaseSigned: applicationWithLease.leaseSigned || false,
        leaseSignedAt: applicationWithLease.leaseSignedAt,
        leaseStartDate: applicationWithLease.leaseStartDate,
        leaseEndDate: applicationWithLease.leaseEndDate,
        rentalAmount: applicationWithLease.rentalAmount,
        depositAmount: applicationWithLease.depositAmount,
        applicationId: applicationWithLease._id,
        signedLeaseFile: hasSignedFile ? {
          originalName: applicationWithLease.signedLeaseFile.originalName,
          mimetype: applicationWithLease.signedLeaseFile.mimetype,
          size: applicationWithLease.signedLeaseFile.size,
          uploadedAt: applicationWithLease.signedLeaseFile.uploadedAt
        } : undefined
      });
    } else if (mostRecentActiveApplication) {
      // User has active applications but no lease yet
      res.json({
        hasApplication: true,
        isComplete: false,
        leaseSigned: false,
        message: 'Application submitted, waiting for lease generation'
      });
    } else {
      // All applications are completed, return to default state
      res.json({
        hasApplication: false,
        isComplete: false,
        leaseSigned: false,
        message: 'No active applications found'
      });
    }
  } catch (error) {
    console.error('Lease status fetch error:', error);
    res.status(500).json({ error: 'Server error fetching lease status' });
  }
});

// Helper function to generate lease agreement content using the Palm Run LLC template
function generateLeaseAgreement(application, leaseStartDate, leaseEndDate, rentalAmount = 2500) {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const startDate = leaseStartDate ? (() => {
    // Handle both date strings (YYYY-MM-DD) and Date objects
    let dateObj;
    if (typeof leaseStartDate === 'string') {
      // If it's a string like "2025-01-01", parse it directly
      const [year, month, day] = leaseStartDate.split('-').map(Number);
      dateObj = new Date(year, month - 1, day);
    } else {
      // If it's already a Date object
      dateObj = new Date(leaseStartDate);
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
  })() : 'TBD';

  const endDate = leaseEndDate ? (() => {
    // Handle both date strings (YYYY-MM-DD) and Date objects
    let dateObj;
    if (typeof leaseEndDate === 'string') {
      // If it's a string like "2025-01-31", parse it directly
      const [year, month, day] = leaseEndDate.split('-').map(Number);
      dateObj = new Date(year, month - 1, day);
    } else {
      // If it's already a Date object
      dateObj = new Date(leaseEndDate);
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
  })() : 'TBD';

  // Calculate dates for payment terms
  const startDateObj = leaseStartDate ? (() => {
    let dateObj;
    if (typeof leaseStartDate === 'string') {
      const [year, month, day] = leaseStartDate.split('-').map(Number);
      dateObj = new Date(year, month - 1, day);
    } else {
      dateObj = new Date(leaseStartDate);
    }
    
    if (isNaN(dateObj.getTime())) {
      return new Date(); // Fallback to current date
    }
    
    return dateObj;
  })() : new Date();
  
  const sixtyDaysBefore = new Date(startDateObj);
  sixtyDaysBefore.setDate(sixtyDaysBefore.getDate() - 60);
  
  // Cancellation deadline is 60 days BEFORE the lease start date
  const cancellationDeadline = new Date(startDateObj);
  cancellationDeadline.setDate(cancellationDeadline.getDate() - 60);

  const sixtyDaysBeforeFormatted = sixtyDaysBefore.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const cancellationDeadlineFormatted = cancellationDeadline.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });



  // Build tenant name(s) for lease
  let tenantNames = `${application.firstName} ${application.lastName}`;
  if (application.secondApplicantFirstName && application.secondApplicantLastName) {
    tenantNames += ` and ${application.secondApplicantFirstName} ${application.secondApplicantLastName}`;
  }

  return `PALM RUN LLC. MONTHLY RENTAL AGREEMENT

This Agreement made and entered on ${currentDate}, between Palm Run, LLC (hereinafter referred
to as the "Manager"), mailing address 18650 Gulf Blvd, #207, Indian Shores, FL 33785,
and ${tenantNames} (hereinafter referred to as the "Renter"), mailing address ${application.address.street}, ${application.address.city}, ${application.address.state} ${application.address.zipCode}, concerning the premises known as "18650 Gulf Blvd, #207, Indian Shores, FL 33785". The
Owner of the property is Palm Run, LLC.

1. **Rent**: Renter agrees to pay the sum of $${rentalAmount}
US Dollars (Rental Fee) for the rental period of ${startDate} to ${endDate}, to be paid in via Zelle,
Paypal, Venmo, Money order, fed wire, USDC, or US Checks made payable to "Palm Run,
LLC". The Rental Fee is non-refundable if Renter cancels this agreement after ${cancellationDeadlineFormatted}, unless the Manager can secure a replacement tenant for the same Rental
Period, under the same or better terms. The rental period begins at 4 P.M. on the first day
and ends at 10:00 A.M. the last day of the rental period.

2. **Deposit & Payment**: A $500 US dollar deposit towards the Rental Fee is due upon
execution of this Agreement. The balance of the Rental Fee $${rentalAmount} is due on or before ${sixtyDaysBeforeFormatted}. Following the renter's departure, an inspection of the premises will
be conducted. Based upon the condition of the Premises, all, a portion of, or none of the
Security Deposit may be refunded, depending on whether any damage, beyond normal
wear and tear, has occurred.

**Credit Card Processing Fee**: A 3% processing fee will be applied to all credit card
payments. This fee covers the cost of credit card processing services. Alternative payment
methods (Zelle, PayPal, Venmo, Money Order, Fed Wire, USDC, or US Checks) do not incur
this processing fee.

3. **Quiet Enjoyment**: Renter shall enjoy use of the Premises and is expected to share
the common areas respectfully. Renter is prohibited from hosting gatherings exceeding
eight individuals or creating excessive noise that would interfere with the quiet enjoyment
of other tenants or surrounding neighbors.

4. **Condition of the Premises**: An initial walk-through inspection will be conducted by
both the Renter and Manager to agree on the initial condition of the Premises. The Manager
confirms that the Premises are in good order, repair, and clean livable condition at the time
of this agreement.

5. **Manager Responsibility**: Manager is responsible for payment of normal electric,
water, sewer, local telephone, basic cable TV, high speed wireless internet, and lawn care
service. The rental property includes a one car dedicated parking space for sole use of
Renter.

6. **Renter Responsibilities**: Renter agrees to maintain the Premises in a clean and
orderly condition. Overnight guests are limited to four persons (including Renters). Daytime
guests, present between 8 AM and 10 PM, are limited to four persons (including Renter),
unless otherwise agreed upon by the Owner. Smoking and pets are strictly prohibited on
the premises.

7. **Limitation of Liability**: Manager or Owner is not responsible for injury to Renter or
their guests or for any damage to or theft of Renter's property, unless such injury, damage,
or theft results from the gross negligence or intentional misconduct of the Manager/Owner.

**Gulf Shores Condominium Rules and Regulations**

1. Lounge chairs, rafts or tubes SHALL NOT be placed in corridors or walkways outside Apartment doors (by order of Fire Marshall).

2. No towels or laundry of any kind shall be hung out or exposed on the balcony railings. Wet towels, etc. can be hung on chairs or a wooden drying rack.

3. ABSOLUTELY no feeding of birds from balconies, decks or walkways.

4. NO skateboarding, roller skating or bike riding in WALKWAYS or PARKING LOT.

5. Please observe RULES posted in POOL AREA.

6. Children under the age of 14 MUST be accompanied by an adult in the POOL AREA.

7. Please use assigned parking spaces only, and do not back in. Cars illegally parked will be TOWED at Owners expense.

8. NO PETS are permitted for Renters or Guests.

9. ELECTRIC GRILLS ONLY.

10. Limit of 4 persons can occupy a 2 bedroom apartment.

**POOL HOURS**
DAILY: 9:00 AM to 10:00 PM
NO LIFEGUARDS ON DUTY

**LOBBY AND COMMON AMENITIES HOURS**
DAILY: 7:00 AM to 11:00 PM

**NOTE: OWNERS AND AGENTS ARE RESPONSIBLE FOR RENTERS AND GUESTS TO ABIDE BY THESE RULES.**

IN WITNESS WHEREOF, THE PARTIES HAVE EXECUTED THIS RENTAL AGREEMENT THE DAY
AND YEAR FIRST ABOVE WRITTEN.

Renters:
${application.firstName} ${application.lastName}_______________ DATED: ____________________

Jay Pommrehn for Palm Run, LLC:
_________________________ DATED: ____________________

Receipt of Deposit is hereby acknowledged by Manager (Owner's Agent):
By _________________________________ Date ________________________

---
Generated on: ${currentDate}
Application ID: ${application._id}
Tenant: ${application.firstName} ${application.lastName}
Phone: ${application.phone}
Email: ${application.userId ? application.userId.email : 'N/A'}`;
}

// Upload signed lease
router.post('/upload-signed', auth, upload.single('signedLease'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // File upload validation completed

    const { applicationId } = req.body;
    
    if (!applicationId) {
      return res.status(400).json({ error: 'Application ID is required' });
    }

    // Find the application
    const application = await Application.findOne({ 
      _id: applicationId, 
      userId: req.user._id 
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Save file information to the application (storing file content in database for Heroku compatibility)
    const fileContent = req.file.buffer ? req.file.buffer.toString('base64') : null;
    
    if (!fileContent) {
      console.error('No file buffer content available');
      return res.status(500).json({ error: 'File content could not be processed' });
    }

    application.signedLeaseFile = {
      filename: `signed-lease-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(req.file.originalname)}`,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      uploadedAt: new Date(),
      // Store file content as base64 for Heroku compatibility
      content: fileContent
    };

    // Mark lease as signed
    application.leaseSigned = true;
    application.leaseSignedAt = new Date();

    await application.save();

    res.json({
      message: 'Signed lease uploaded successfully',
      uploadedLease: {
        filename: `signed-lease-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(req.file.originalname)}`,
        originalName: req.file.originalname,
        url: `/api/lease/view-signed/${applicationId}`,
        size: req.file.size,
        uploadedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error uploading signed lease:', error);
    res.status(500).json({ error: 'Server error uploading signed lease' });
  }
});

// View signed lease
router.get('/view-signed/:applicationId', auth, async (req, res) => {
  try {
    const { applicationId } = req.params;
    // Debug logging removed for security
    
    // Validate applicationId
    if (!applicationId || !require('mongoose').Types.ObjectId.isValid(applicationId)) {
      console.log('Invalid application ID:', applicationId);
      return res.status(400).json({ error: 'Invalid application ID' });
    }
    
    let application;
    
    // If user is admin, they can view any application's signed lease
    if (req.user.role === 'admin') {
      application = await Application.findById(applicationId);
      // Admin access - application lookup
    } else {
      // Regular users can only view their own signed lease
      application = await Application.findOne({ 
        _id: applicationId, 
        userId: req.user._id 
      });
      // User access - application lookup
    }

    if (!application) {
      console.log('Application not found for ID:', applicationId);
      return res.status(404).json({ error: 'Application not found' });
    }
    
    if (!application.signedLeaseFile) {
      console.log('No signed lease file found for application:', applicationId);
      return res.status(404).json({ error: 'Signed lease file not found' });
    }
    
    // File validation completed - sensitive data removed from logs

    // Check if file content exists in database
    if (!application.signedLeaseFile.content) {
      console.log('File content is missing for application:', applicationId);
      return res.status(404).json({ error: 'File content not found' });
    }

    // Convert base64 content back to buffer
    const fileBuffer = Buffer.from(application.signedLeaseFile.content, 'base64');
    
    // Set appropriate headers
    res.set({
      'Content-Type': application.signedLeaseFile.mimetype || 'application/octet-stream',
      'Content-Disposition': `inline; filename="${application.signedLeaseFile.originalName || 'lease.pdf'}"`,
      'Content-Length': fileBuffer.length
    });

    res.send(fileBuffer);
  } catch (error) {
    console.error('Error viewing signed lease:', error);
    res.status(500).json({ error: 'Server error viewing signed lease' });
  }
 });

// Remove signed lease
router.delete('/remove-signed/:applicationId', auth, async (req, res) => {
  try {
    const { applicationId } = req.params;
    
    const application = await Application.findOne({ 
      _id: applicationId, 
      userId: req.user._id 
    });

    if (!application || !application.signedLeaseFile) {
      return res.status(404).json({ error: 'Signed lease not found' });
    }

    // No filesystem cleanup needed since files are stored in database

    // Clear file information from application
    application.signedLeaseFile = undefined;
    application.leaseSigned = false;
    application.leaseSignedAt = undefined;

    await application.save();

    res.json({ message: 'Signed lease removed successfully' });
  } catch (error) {
    console.error('Error removing signed lease:', error);
    res.status(500).json({ error: 'Server error removing signed lease' });
  }
});

// View most recent signed lease for the current user (no ID required)
router.get('/view-signed', auth, async (req, res) => {
  try {
    // Find the most recent application with a signed lease for this user
    const application = await Application
      .findOne({ userId: req.user._id, signedLeaseFile: { $exists: true } })
      .sort({ updatedAt: -1 });

    if (!application || !application.signedLeaseFile) {
      return res.status(404).json({ error: 'Signed lease file not found' });
    }

    if (!application.signedLeaseFile.content) {
      return res.status(404).json({ error: 'File content not found' });
    }

    const fileBuffer = Buffer.from(application.signedLeaseFile.content, 'base64');
    res.set({
      'Content-Type': application.signedLeaseFile.mimetype || 'application/octet-stream',
      'Content-Disposition': `inline; filename="${application.signedLeaseFile.originalName || 'lease.pdf'}"`,
      'Content-Length': fileBuffer.length
    });
    res.send(fileBuffer);
  } catch (error) {
    console.error('Error viewing signed lease (no id):', error);
    res.status(500).json({ error: 'Server error viewing signed lease' });
  }
});

module.exports = router;
