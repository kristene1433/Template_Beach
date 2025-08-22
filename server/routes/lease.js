const express = require('express');
const Application = require('../models/Application');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Generate lease agreement
router.post('/generate', auth, async (req, res) => {
  try {
    const { leaseStartDate, leaseEndDate, additionalTerms } = req.body;
    
    // Get user's application
    const application = await Application.findOne({ userId: req.user._id });
    if (!application) {
      return res.status(404).json({ error: 'Application not found. Please complete your application first.' });
    }

    if (!application.isComplete) {
      return res.status(400).json({ error: 'Application is not complete. Please submit your application first.' });
    }

    // Generate lease agreement content
    const leaseAgreement = generateLeaseAgreement(application, leaseStartDate, leaseEndDate, additionalTerms);

    res.json({
      message: 'Lease agreement generated successfully',
      leaseAgreement,
      application: {
        id: application._id,
        firstName: application.firstName,
        lastName: application.lastName,
        email: application.email,
        phone: application.phone,
        address: application.rentalProperty.address,
        rentalAmount: application.rentalProperty.rentalAmount,
        depositAmount: application.rentalProperty.depositAmount
      }
    });
  } catch (error) {
    console.error('Lease generation error:', error);
    res.status(500).json({ error: 'Server error generating lease agreement' });
  }
});

// Download lease agreement as PDF
router.get('/download', auth, async (req, res) => {
  try {
    const { leaseStartDate, leaseEndDate, additionalTerms } = req.query;
    
    // Get user's application
    const application = await Application.findOne({ userId: req.user._id });
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    if (!application.isComplete) {
      return res.status(400).json({ error: 'Application is not complete' });
    }

    // Generate lease agreement
    const leaseAgreement = generateLeaseAgreement(application, leaseStartDate, leaseEndDate, additionalTerms);

    // Set headers for PDF download
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="lease-agreement-${application.firstName}-${application.lastName}.txt"`);

    res.send(leaseAgreement);
  } catch (error) {
    console.error('Lease download error:', error);
    res.status(500).json({ error: 'Server error downloading lease agreement' });
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

    if (!application.isComplete) {
      return res.json({
        hasApplication: true,
        isComplete: false,
        message: 'Application is not complete. Please submit your application first.'
      });
    }

    // Generate preview with default dates
    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() + 30); // 30 days from now
    
    const defaultEndDate = new Date(defaultStartDate);
    defaultEndDate.setFullYear(defaultEndDate.getFullYear() + 1); // 1 year lease

    const leasePreview = generateLeaseAgreement(
      application, 
      defaultStartDate.toISOString().split('T')[0], 
      defaultEndDate.toISOString().split('T')[0]
    );

    res.json({
      hasApplication: true,
      isComplete: true,
      leasePreview,
      application: {
        firstName: application.firstName,
        lastName: application.lastName,
        email: application.email,
        phone: application.phone,
        address: application.rentalProperty.address,
        rentalAmount: application.rentalProperty.rentalAmount,
        depositAmount: application.rentalProperty.depositAmount
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
    const { leaseStartDate, leaseEndDate, additionalTerms, signature } = req.body;
    
    if (!signature) {
      return res.status(400).json({ error: 'Digital signature is required' });
    }

    // Get user's application
    const application = await Application.findOne({ userId: req.user._id });
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    if (!application.isComplete) {
      return res.status(400).json({ error: 'Application is not complete' });
    }

    // Update application with lease information
    application.rentalProperty.leaseStartDate = leaseStartDate;
    application.rentalProperty.leaseEndDate = leaseEndDate;
    application.leaseSigned = true;
    application.leaseSignedAt = new Date();
    application.leaseSignature = signature;
    application.additionalTerms = additionalTerms;

    await application.save();

    // Update user's lease status
    await User.findByIdAndUpdate(req.user._id, { leaseSigned: true });

    res.json({
      message: 'Lease agreement signed successfully',
      application: {
        id: application._id,
        leaseSigned: application.leaseSigned,
        leaseSignedAt: application.leaseSignedAt,
        leaseStartDate: application.rentalProperty.leaseStartDate,
        leaseEndDate: application.rentalProperty.leaseEndDate
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
    const application = await Application.findOne({ userId: req.user._id });
    
    if (!application) {
      return res.json({
        hasApplication: false,
        leaseSigned: false,
        message: 'No application found'
      });
    }

    res.json({
      hasApplication: true,
      isComplete: application.isComplete,
      leaseSigned: application.leaseSigned,
      leaseSignedAt: application.leaseSignedAt,
      leaseStartDate: application.rentalProperty.leaseStartDate,
      leaseEndDate: application.rentalProperty.leaseEndDate
    });
  } catch (error) {
    console.error('Lease status fetch error:', error);
    res.status(500).json({ error: 'Server error fetching lease status' });
  }
});

// Helper function to generate lease agreement content
function generateLeaseAgreement(application, leaseStartDate, leaseEndDate, additionalTerms = '') {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const startDate = leaseStartDate ? new Date(leaseStartDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : 'TBD';

  const endDate = leaseEndDate ? new Date(leaseEndDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : 'TBD';

  return `LEASE AGREEMENT

This Lease Agreement (the "Lease") is made and entered into on ${currentDate}, by and between:

LANDLORD: Palm Run LLC
TENANT: ${application.firstName} ${application.lastName}

PROPERTY ADDRESS:
${application.rentalProperty.address.street}
${application.rentalProperty.address.city}, ${application.rentalProperty.address.state} ${application.rentalProperty.address.zipCode}

LEASE TERM:
Commencement Date: ${startDate}
Termination Date: ${endDate}

RENTAL AMOUNT:
Monthly Rent: $${application.rentalProperty.rentalAmount}
Security Deposit: $${application.rentalProperty.depositAmount}

TENANT INFORMATION:
Name: ${application.firstName} ${application.lastName}
Email: ${application.email}
Phone: ${application.phone}
Date of Birth: ${application.dateOfBirth ? new Date(application.dateOfBirth).toLocaleDateString() : 'N/A'}
SSN: ${application.ssn ? '***-**-' + application.ssn.slice(-4) : 'N/A'}

CURRENT ADDRESS:
${application.currentAddress.street}
${application.currentAddress.city}, ${application.currentAddress.state} ${application.currentAddress.zipCode}
Monthly Rent: $${application.currentAddress.monthlyRent || 'N/A'}
Landlord: ${application.currentAddress.landlordName || 'N/A'}
Landlord Phone: ${application.currentAddress.landlordPhone || 'N/A'}

EMPLOYMENT INFORMATION:
Employer: ${application.employment.employerName || 'N/A'}
Job Title: ${application.employment.jobTitle || 'N/A'}
Employer Phone: ${application.employment.employerPhone || 'N/A'}
Employment Start Date: ${application.employment.employmentStartDate ? new Date(application.employment.employmentStartDate).toLocaleDateString() : 'N/A'}
Monthly Income: $${application.employment.monthlyIncome || 'N/A'}
Supervisor: ${application.employment.supervisorName || 'N/A'}

EMERGENCY CONTACT:
Name: ${application.emergencyContact.name || 'N/A'}
Relationship: ${application.emergencyContact.relationship || 'N/A'}
Phone: ${application.emergencyContact.phone || 'N/A'}
Address: ${application.emergencyContact.address || 'N/A'}

REFERENCES:
${application.references.map((ref, index) => 
  `${index + 1}. ${ref.name || 'N/A'} - ${ref.relationship || 'N/A'} - ${ref.phone || 'N/A'} - ${ref.email || 'N/A'}`
).join('\n')}

PETS:
Has Pets: ${application.pets.hasPets ? 'Yes' : 'No'}
${application.pets.hasPets && application.pets.petDetails.length > 0 ? 
  application.pets.petDetails.map((pet, index) => 
    `Pet ${index + 1}: ${pet.type || 'N/A'} - ${pet.breed || 'N/A'} - ${pet.weight || 'N/A'} lbs - ${pet.age || 'N/A'} years old`
  ).join('\n') : 'No pets'
}

VEHICLES:
Has Vehicles: ${application.vehicles.hasVehicles ? 'Yes' : 'No'}
${application.vehicles.hasVehicles && application.vehicles.vehicleDetails.length > 0 ? 
  application.vehicles.vehicleDetails.map((vehicle, index) => 
    `Vehicle ${index + 1}: ${vehicle.year || 'N/A'} ${vehicle.make || 'N/A'} ${vehicle.model || 'N/A'} - ${vehicle.color || 'N/A'} - License: ${vehicle.licensePlate || 'N/A'}`
  ).join('\n') : 'No vehicles'
}

ADDITIONAL TERMS:
${additionalTerms || 'Standard lease terms apply as per state and local regulations.'}

TENANT SIGNATURE:
By signing this lease agreement, I acknowledge that I have read, understood, and agree to all terms and conditions outlined above.

Signature: _________________________
Date: ${currentDate}

LANDLORD SIGNATURE:
By signing this lease agreement, I acknowledge that I have read, understood, and agree to all terms and conditions outlined above.

Signature: _________________________
Date: ${currentDate}

This lease agreement is generated based on the information provided in the rental application. All information is subject to verification and approval by Palm Run LLC.`;
}

module.exports = router;
