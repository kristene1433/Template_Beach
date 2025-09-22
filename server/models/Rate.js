const mongoose = require('mongoose');

const rateSchema = new mongoose.Schema({
  period: {
    type: String,
    required: true,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  nightly: {
    type: Number,
    default: null
  },
  weekendNight: {
    type: Number,
    default: null
  },
  weekly: {
    type: Number,
    default: null
  },
  monthly: {
    type: Number,
    required: true
  },
  minStay: {
    type: Number,
    required: true,
    default: 30
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient querying
rateSchema.index({ startDate: 1, endDate: 1 });
rateSchema.index({ isActive: 1 });

module.exports = mongoose.model('Rate', rateSchema);
