const express = require('express');
const router = express.Router();
const Availability = require('../models/Availability');
const auth = require('../middleware/auth');

// Get availability for a date range (public endpoint)
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const availability = await Availability.find({
      date: {
        $gte: start,
        $lte: end
      }
    }).sort({ date: 1 });
    
    res.json({ availability });
  } catch (error) {
    console.error('Error fetching availability:', error);
    res.status(500).json({ error: 'Failed to fetch availability' });
  }
});

// Get all availability (admin only)
router.get('/admin/all', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { startDate, endDate } = req.query;
    
    let query = {};
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const availability = await Availability.find(query)
      .sort({ date: 1 })
      .populate('createdBy updatedBy', 'email');
    
    res.json({ availability });
  } catch (error) {
    console.error('Error fetching availability:', error);
    res.status(500).json({ error: 'Failed to fetch availability' });
  }
});

// Update availability for a specific date (admin only)
router.put('/admin/:date', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { date } = req.params;
    const { isAvailable, reason } = req.body;

    if (typeof isAvailable !== 'boolean') {
      return res.status(400).json({ error: 'isAvailable must be a boolean' });
    }

    const targetDate = new Date(date);
    if (isNaN(targetDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    // Set time to start of day for consistent comparison
    targetDate.setHours(0, 0, 0, 0);

    const availability = await Availability.findOneAndUpdate(
      { date: targetDate },
      {
        isAvailable,
        reason: reason || '',
        updatedBy: req.user.id
      },
      { 
        upsert: true, 
        new: true,
        setDefaultsOnInsert: true
      }
    );

    // If this is a new record, set the createdBy field
    if (!availability.createdBy) {
      availability.createdBy = req.user.id;
      await availability.save();
    }

    res.json({ availability });
  } catch (error) {
    console.error('Error updating availability:', error);
    res.status(500).json({ error: 'Failed to update availability' });
  }
});

// Bulk update availability for multiple dates (admin only)
router.put('/admin/bulk', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { dates, isAvailable, reason } = req.body;

    if (!Array.isArray(dates) || dates.length === 0) {
      return res.status(400).json({ error: 'Dates array is required' });
    }

    if (typeof isAvailable !== 'boolean') {
      return res.status(400).json({ error: 'isAvailable must be a boolean' });
    }

    const operations = dates.map(date => ({
      updateOne: {
        filter: { date: new Date(date) },
        update: {
          isAvailable,
          reason: reason || '',
          updatedBy: req.user.id
        },
        upsert: true
      }
    }));

    await Availability.bulkWrite(operations);

    // Update createdBy for any new records
    const newRecords = await Availability.find({
      date: { $in: dates.map(d => new Date(d)) },
      createdBy: { $exists: false }
    });

    for (const record of newRecords) {
      record.createdBy = req.user.id;
      await record.save();
    }

    res.json({ message: 'Availability updated successfully' });
  } catch (error) {
    console.error('Error bulk updating availability:', error);
    res.status(500).json({ error: 'Failed to update availability' });
  }
});

// Delete availability record (admin only)
router.delete('/admin/:date', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { date } = req.params;
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const availability = await Availability.findOneAndDelete({ date: targetDate });
    
    if (!availability) {
      return res.status(404).json({ error: 'Availability record not found' });
    }

    res.json({ message: 'Availability record deleted successfully' });
  } catch (error) {
    console.error('Error deleting availability:', error);
    res.status(500).json({ error: 'Failed to delete availability' });
  }
});

module.exports = router;
