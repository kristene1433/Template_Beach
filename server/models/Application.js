const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  applicationNumber: {
    type: String,
    unique: true,
    sparse: true // Allow null values but ensure uniqueness when set
  },
  // Personal Information
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  secondApplicantFirstName: {
    type: String,
    trim: true
  },
  secondApplicantLastName: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  
  // Address
  address: {
    street: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      required: true,
      trim: true
    },
    zipCode: {
      type: String,
      required: true,
      trim: true
    }
  },
  
  // Additional Guests
  additionalGuests: [{
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    isAdult: {
      type: Boolean,
      default: true
    }
  }],
  
  // Application Status
  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'rejected', 'completed'],
    default: 'draft'
  },
  
  // Requested Lease Dates
  requestedStartDate: {
    type: String, // Store as YYYY-MM-DD string to avoid timezone issues
    required: true,
    trim: true
  },
  requestedEndDate: {
    type: String, // Store as YYYY-MM-DD string to avoid timezone issues
    required: true,
    trim: true
  },
  
  // Documents
  documents: [{
    name: String,
    type: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Notes
  notes: String,
  
  submittedAt: {
    type: Date,
    default: null
  },
  
  reviewedAt: Date,
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Lease Information
  leaseStartDate: String, // Store as YYYY-MM-DD string to avoid timezone issues
  leaseEndDate: String,   // Store as YYYY-MM-DD string to avoid timezone issues
  leaseSigned: {
    type: Boolean,
    default: false
  },
  leaseSignedAt: Date,
  leaseSignature: {
    typedName: String,
    method: String,
    signedAt: Date
  },
  rentalAmount: Number,
  depositAmount: Number,
  
  // Signed Lease File
  signedLeaseFile: {
    filename: String,
    originalName: String,
    path: String,
    mimetype: String,
    size: Number,
    uploadedAt: Date,
    content: String  // Base64-encoded file content for database storage
  },
  
  // Progress Tracking Fields
  leaseGenerated: {
    type: Boolean,
    default: false
  },
  leaseContent: {
    type: String,
    default: ''
  },
  leaseGeneratedAt: Date,
  leaseGeneratedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  paymentReceived: {
    type: Boolean,
    default: false
  },
  
  // Audit Trail
  lastUpdated: Date,
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  leaseAudit: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Index for efficient queries
applicationSchema.index({ userId: 1, status: 1 });

// Virtual for full name
applicationSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for second applicant full name
applicationSchema.virtual('secondApplicantFullName').get(function() {
  if (!this.secondApplicantFirstName || !this.secondApplicantLastName) return '';
  return `${this.secondApplicantFirstName} ${this.secondApplicantLastName}`;
});

// Virtual for full address
applicationSchema.virtual('fullAddress').get(function() {
  if (!this.address.street) return '';
  return `${this.address.street}, ${this.address.city}, ${this.address.state} ${this.address.zipCode}`;
});

// Pre-save middleware to automatically set submittedAt when status changes to 'pending'
applicationSchema.pre('save', async function(next) {
  // Generate application number if not set
  if (!this.applicationNumber && this.isNew) {
    try {
      // Find the highest application number
      const lastApp = await this.constructor.findOne(
        { applicationNumber: { $exists: true, $ne: null } },
        { applicationNumber: 1 },
        { sort: { applicationNumber: -1 } }
      );
      
      let nextNumber = 1;
      if (lastApp && lastApp.applicationNumber) {
        const lastNum = parseInt(lastApp.applicationNumber.replace('APP-', ''));
        if (!isNaN(lastNum)) {
          nextNumber = lastNum + 1;
        }
      }
      
      this.applicationNumber = `APP-${nextNumber.toString().padStart(4, '0')}`;
      console.log(`Generated application number: ${this.applicationNumber}`);
    } catch (error) {
      console.error('Error generating application number:', error);
      // Continue without application number if generation fails
    }
  }

  // Only set submittedAt when status changes to 'pending' and it's not already set
  if (this.isModified('status') && this.status === 'pending' && !this.submittedAt) {
    this.submittedAt = new Date();
    console.log('Pre-save: Set submittedAt for status change to pending');
  }
  
  next();
});

// Ensure virtuals are serialized
applicationSchema.set('toJSON', { virtuals: true });
applicationSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Application', applicationSchema);
