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
  email: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  ssn: {
    type: String,
    required: true,
    trim: true
  },
  
  // Current Address
  currentAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    monthlyRent: Number,
    landlordName: String,
    landlordPhone: String,
    reasonForMoving: String
  },
  
  // Employment Information
  employment: {
    employerName: String,
    jobTitle: String,
    employerPhone: String,
    employmentStartDate: Date,
    monthlyIncome: Number,
    supervisorName: String
  },
  
  // Rental Property Information
  rentalProperty: {
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String
    },
    rentalAmount: {
      type: Number,
      required: true
    },
    depositAmount: {
      type: Number,
      required: true
    },
    leaseStartDate: Date,
    leaseEndDate: Date
  },
  
  // Emergency Contact
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String,
    address: String
  },
  
  // References
  references: [{
    name: String,
    relationship: String,
    phone: String,
    email: String
  }],
  
  // Additional Information
  pets: {
    hasPets: {
      type: Boolean,
      default: false
    },
    petDetails: [{
      type: String,
      breed: String,
      weight: Number,
      age: Number
    }]
  },
  
  vehicles: {
    hasVehicles: {
      type: Boolean,
      default: false
    },
    vehicleDetails: [{
      make: String,
      model: String,
      year: Number,
      color: String,
      licensePlate: String
    }]
  },
  
  // Application Status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed'],
    default: 'pending'
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
  
  // Application completion
  isComplete: {
    type: Boolean,
    default: false
  },
  
  submittedAt: {
    type: Date,
    default: Date.now
  },
  
  reviewedAt: Date,
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for efficient queries
applicationSchema.index({ userId: 1, status: 1 });
applicationSchema.index({ email: 1 });

// Virtual for full name
applicationSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for full current address
applicationSchema.virtual('fullCurrentAddress').get(function() {
  if (!this.currentAddress.street) return '';
  return `${this.currentAddress.street}, ${this.currentAddress.city}, ${this.currentAddress.state} ${this.currentAddress.zipCode}`;
});

// Virtual for full rental property address
applicationSchema.virtual('fullRentalAddress').get(function() {
  if (!this.rentalProperty.address.street) return '';
  return `${this.rentalProperty.address.street}, ${this.rentalProperty.address.city}, ${this.rentalProperty.address.state} ${this.rentalProperty.address.zipCode}`;
});

// Ensure virtuals are serialized
applicationSchema.set('toJSON', { virtuals: true });
applicationSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Application', applicationSchema);
