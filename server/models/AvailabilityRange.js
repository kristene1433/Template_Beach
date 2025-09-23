const mongoose = require('mongoose');

const AvailabilityRangeSchema = new mongoose.Schema({
  startDate: { type: Date, required: true }, // UTC midnight
  endDate: { type: Date, required: true },   // UTC midnight, inclusive
  isAvailable: { type: Boolean, required: true, default: true },
  reason: { type: String, trim: true, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// Fast range intersection queries
AvailabilityRangeSchema.index({ startDate: 1, endDate: 1 });
AvailabilityRangeSchema.index({ isAvailable: 1 });

module.exports = mongoose.model('AvailabilityRange', AvailabilityRangeSchema);


