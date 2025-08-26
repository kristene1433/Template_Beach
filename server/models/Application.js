const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
  
  // Requested Lease Start
  requestedMonths: {
    type: String,
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
    default: Date.now
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
  leaseSignature: String,
  rentalAmount: Number,
  depositAmount: Number
}, {
  timestamps: true
});

// Index for efficient queries
applicationSchema.index({ userId: 1, status: 1 });

// Virtual for full name
applicationSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for full address
applicationSchema.virtual('fullAddress').get(function() {
  if (!this.address.street) return '';
  return `${this.address.street}, ${this.address.city}, ${this.address.state} ${this.address.zipCode}`;
});

// Ensure virtuals are serialized
applicationSchema.set('toJSON', { virtuals: true });
applicationSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Application', applicationSchema);
