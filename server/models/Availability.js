const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  reason: {
    type: String,
    trim: true,
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient querying by date range
availabilitySchema.index({ date: 1 });
availabilitySchema.index({ isAvailable: 1 });

module.exports = mongoose.model('Availability', availabilitySchema);
