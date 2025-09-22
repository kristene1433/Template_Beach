const express = require('express');
const router = express.Router();
const Rate = require('../models/Rate');
const auth = require('../middleware/auth');

// Get all active rates (public endpoint)
router.get('/', async (req, res) => {
  try {
    const rates = await Rate.find({ isActive: true })
      .sort({ startDate: 1 })
      .select('-createdBy -__v');
    
    res.json({ rates });
  } catch (error) {
    console.error('Error fetching rates:', error);
    res.status(500).json({ error: 'Failed to fetch rates' });
  }
});

// Get all rates (admin only)
router.get('/admin/all', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const rates = await Rate.find()
      .sort({ startDate: 1 })
      .populate('createdBy', 'email');
    
    res.json({ rates });
  } catch (error) {
    console.error('Error fetching rates:', error);
    res.status(500).json({ error: 'Failed to fetch rates' });
  }
});

// Create new rate (admin only)
router.post('/admin', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const {
      period,
      startDate,
      endDate,
      nightly,
      weekendNight,
      weekly,
      monthly,
      minStay
    } = req.body;

    // Validate required fields
    if (!period || !startDate || !endDate || !monthly) {
      return res.status(400).json({ error: 'Period, start date, end date, and monthly rate are required' });
    }

    // Check for overlapping periods
    const overlappingRate = await Rate.findOne({
      isActive: true,
      $or: [
        {
          startDate: { $lte: new Date(endDate) },
          endDate: { $gte: new Date(startDate) }
        }
      ]
    });

    if (overlappingRate) {
      return res.status(400).json({ 
        error: 'Rate period overlaps with existing rate',
        overlappingPeriod: overlappingRate.period
      });
    }

    const rate = new Rate({
      period,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      nightly: nightly || null,
      weekendNight: weekendNight || null,
      weekly: weekly || null,
      monthly,
      minStay: minStay || 30,
      createdBy: req.user.id
    });

    await rate.save();
    res.status(201).json({ rate });
  } catch (error) {
    console.error('Error creating rate:', error);
    res.status(500).json({ error: 'Failed to create rate' });
  }
});

// Update rate (admin only)
router.put('/admin/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const {
      period,
      startDate,
      endDate,
      nightly,
      weekendNight,
      weekly,
      monthly,
      minStay,
      isActive
    } = req.body;

    const rate = await Rate.findById(req.params.id);
    if (!rate) {
      return res.status(404).json({ error: 'Rate not found' });
    }

    // Check for overlapping periods (excluding current rate)
    if (startDate && endDate) {
      const overlappingRate = await Rate.findOne({
        _id: { $ne: req.params.id },
        isActive: true,
        $or: [
          {
            startDate: { $lte: new Date(endDate) },
            endDate: { $gte: new Date(startDate) }
          }
        ]
      });

      if (overlappingRate) {
        return res.status(400).json({ 
          error: 'Rate period overlaps with existing rate',
          overlappingPeriod: overlappingRate.period
        });
      }
    }

    // Update fields
    if (period) rate.period = period;
    if (startDate) rate.startDate = new Date(startDate);
    if (endDate) rate.endDate = new Date(endDate);
    if (nightly !== undefined) rate.nightly = nightly;
    if (weekendNight !== undefined) rate.weekendNight = weekendNight;
    if (weekly !== undefined) rate.weekly = weekly;
    if (monthly !== undefined) rate.monthly = monthly;
    if (minStay !== undefined) rate.minStay = minStay;
    if (isActive !== undefined) rate.isActive = isActive;

    await rate.save();
    res.json({ rate });
  } catch (error) {
    console.error('Error updating rate:', error);
    res.status(500).json({ error: 'Failed to update rate' });
  }
});

// Delete rate (admin only)
router.delete('/admin/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const rate = await Rate.findById(req.params.id);
    if (!rate) {
      return res.status(404).json({ error: 'Rate not found' });
    }

    await Rate.findByIdAndDelete(req.params.id);
    res.json({ message: 'Rate deleted successfully' });
  } catch (error) {
    console.error('Error deleting rate:', error);
    res.status(500).json({ error: 'Failed to delete rate' });
  }
});

module.exports = router;
