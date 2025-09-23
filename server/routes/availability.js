const express = require('express');
const router = express.Router();
const Availability = require('../models/Availability');
const AvailabilityRange = require('../models/AvailabilityRange');
const { auth, adminAuth } = require('../middleware/auth');

// Get availability for a date range (public endpoint)
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Return expanded day map generated from ranges for the requested window
    const ranges = await AvailabilityRange.find({
      startDate: { $lte: end },
      endDate: { $gte: start }
    }).sort({ startDate: 1 });

    const days = [];
    for (const r of ranges) {
      const cur = new Date(r.startDate);
      const last = new Date(r.endDate);
      cur.setUTCHours(0,0,0,0);
      last.setUTCHours(0,0,0,0);
      while (cur <= last) {
        if (cur >= start && cur <= end) {
          days.push({ date: new Date(cur).toISOString(), isAvailable: r.isAvailable });
        }
        cur.setUTCDate(cur.getUTCDate() + 1);
      }
    }

    res.json({ availability: days });
  } catch (error) {
    console.error('Error fetching availability:', error);
    res.status(500).json({ error: 'Failed to fetch availability' });
  }
});

// Get all availability (admin only)
router.get('/admin/all', auth, adminAuth, async (req, res) => {
  try {

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

// Update availability for a specific date (admin only) - range-aware
router.put('/admin/:date', auth, adminAuth, async (req, res) => {
  try {

    const { date } = req.params;
    const { isAvailable, reason } = req.body;

    if (typeof isAvailable !== 'boolean') {
      return res.status(400).json({ error: 'isAvailable must be a boolean' });
    }

    const targetDate = new Date(date);
    if (isNaN(targetDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    // Normalize to UTC midnight
    targetDate.setUTCHours(0, 0, 0, 0);

    // Range update algorithm: find any overlapping ranges around the day
    const dayStart = new Date(targetDate);
    const dayEnd = new Date(targetDate);
    
    // Fetch overlapping ranges
    const overlapping = await AvailabilityRange.find({
      startDate: { $lte: dayEnd },
      endDate: { $gte: dayStart }
    }).sort({ startDate: 1 });

    // Remove/adjust overlapping ranges
    for (const r of overlapping) {
      // If the range is exactly the day
      if (r.startDate.getTime() === dayStart.getTime() && r.endDate.getTime() === dayStart.getTime()) {
        r.isAvailable = isAvailable;
        r.reason = reason || r.reason;
        await r.save();
      } else if (r.startDate.getTime() === dayStart.getTime() && r.endDate.getTime() > dayStart.getTime()) {
        // Shrink from the start
        r.startDate = new Date(dayStart.getTime() + 24*3600*1000);
        await r.save();
      } else if (r.endDate.getTime() === dayStart.getTime() && r.startDate.getTime() < dayStart.getTime()) {
        // Shrink from the end
        r.endDate = new Date(dayStart.getTime() - 24*3600*1000);
        await r.save();
      } else if (r.startDate.getTime() < dayStart.getTime() && r.endDate.getTime() > dayStart.getTime()) {
        // Split into two ranges around the day
        const left = new AvailabilityRange({
          startDate: r.startDate,
          endDate: new Date(dayStart.getTime() - 24*3600*1000),
          isAvailable: r.isAvailable,
          reason: r.reason,
          createdBy: r.createdBy
        });
        const right = new AvailabilityRange({
          startDate: new Date(dayStart.getTime() + 24*3600*1000),
          endDate: r.endDate,
          isAvailable: r.isAvailable,
          reason: r.reason,
          createdBy: r.createdBy
        });
        await r.deleteOne();
        await left.save();
        await right.save();
      }
    }

    // Upsert the single-day range
    await AvailabilityRange.updateOne(
      { startDate: dayStart, endDate: dayStart },
      { $set: { isAvailable, reason: reason || '', createdBy: req.user.id } },
      { upsert: true }
    );

    // Attempt to merge adjacent ranges with the same state
    const prev = await AvailabilityRange.findOne({ endDate: new Date(dayStart.getTime() - 24*3600*1000), isAvailable }).sort({ startDate: 1 });
    const next = await AvailabilityRange.findOne({ startDate: new Date(dayStart.getTime() + 24*3600*1000), isAvailable }).sort({ startDate: 1 });
    const current = await AvailabilityRange.findOne({ startDate: dayStart, endDate: dayStart, isAvailable });
    if (current) {
      if (prev) {
        current.startDate = prev.startDate;
        await prev.deleteOne();
        await current.save();
      }
      if (next) {
        current.endDate = next.endDate;
        await next.deleteOne();
        await current.save();
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating availability:', error);
    res.status(500).json({ error: 'Failed to update availability' });
  }
});

// Bulk update availability for multiple dates (admin only)
router.put('/admin/bulk', auth, adminAuth, async (req, res) => {
  try {

    const { dates, isAvailable, reason } = req.body;

    if (!Array.isArray(dates) || dates.length === 0) {
      return res.status(400).json({ error: 'Dates array is required' });
    }

    if (typeof isAvailable !== 'boolean') {
      return res.status(400).json({ error: 'isAvailable must be a boolean' });
    }

    // Normalize all dates to the start of the day to ensure consistent matching
    const toStartOfDay = (d) => {
      const parsed = new Date(d);
      if (isNaN(parsed.getTime())) return null;
      // Normalize to UTC midnight to avoid timezone drift
      parsed.setUTCHours(0, 0, 0, 0);
      return parsed;
    };

    const normalizedDates = dates
      .map(toStartOfDay)
      .filter(Boolean);

    if (normalizedDates.length === 0) {
      return res.status(400).json({ error: 'No valid dates provided' });
    }

    // Build contiguous ranges from normalizedDates
    normalizedDates.sort((a, b) => a - b);
    const ranges = [];
    let start = normalizedDates[0];
    let prev = normalizedDates[0];
    for (let i = 1; i < normalizedDates.length; i++) {
      const d = normalizedDates[i];
      const nextDay = new Date(prev.getTime());
      nextDay.setUTCDate(nextDay.getUTCDate() + 1);
      if (d.getTime() !== nextDay.getTime()) {
        ranges.push({ startDate: start, endDate: prev });
        start = d;
      }
      prev = d;
    }
    ranges.push({ startDate: start, endDate: prev });

    // For each range, perform the same splitting/merging logic as single-day
    for (const r of ranges) {
      const overlapping = await AvailabilityRange.find({
        startDate: { $lte: r.endDate },
        endDate: { $gte: r.startDate }
      }).sort({ startDate: 1 });

      for (const o of overlapping) {
        if (o.startDate <= r.startDate && o.endDate >= r.endDate) {
          // Split into up to two outer ranges around the new block
          if (o.startDate.getTime() < r.startDate.getTime()) {
            const left = new AvailabilityRange({
              startDate: o.startDate,
              endDate: new Date(r.startDate.getTime() - 24*3600*1000),
              isAvailable: o.isAvailable,
              reason: o.reason,
              createdBy: o.createdBy
            });
            await left.save();
          }
          if (o.endDate.getTime() > r.endDate.getTime()) {
            const right = new AvailabilityRange({
              startDate: new Date(r.endDate.getTime() + 24*3600*1000),
              endDate: o.endDate,
              isAvailable: o.isAvailable,
              reason: o.reason,
              createdBy: o.createdBy
            });
            await right.save();
          }
          await o.deleteOne();
        } else if (o.startDate < r.startDate && o.endDate >= r.startDate && o.endDate <= r.endDate) {
          // Trim overlapping tail
          o.endDate = new Date(r.startDate.getTime() - 24*3600*1000);
          await o.save();
        } else if (o.endDate > r.endDate && o.startDate >= r.startDate && o.startDate <= r.endDate) {
          // Trim overlapping head
          o.startDate = new Date(r.endDate.getTime() + 24*3600*1000);
          await o.save();
        }
      }

      // Upsert new range
      await AvailabilityRange.updateOne(
        { startDate: r.startDate, endDate: r.endDate },
        { $set: { isAvailable, reason: reason || '', createdBy: req.user.id } },
        { upsert: true }
      );

      // Merge with adjacent ranges of same state
      let merged = await AvailabilityRange.findOne({ startDate: r.startDate, endDate: r.endDate, isAvailable });
      if (merged) {
        const prevAdj = await AvailabilityRange.findOne({ endDate: new Date(r.startDate.getTime() - 24*3600*1000), isAvailable });
        if (prevAdj) {
          merged.startDate = prevAdj.startDate;
          await prevAdj.deleteOne();
          await merged.save();
        }
        const nextAdj = await AvailabilityRange.findOne({ startDate: new Date(r.endDate.getTime() + 24*3600*1000), isAvailable });
        if (nextAdj) {
          merged.endDate = nextAdj.endDate;
          await nextAdj.deleteOne();
          await merged.save();
        }
      }
    }

    res.json({ message: 'Availability updated successfully' });
  } catch (error) {
    console.error('Error bulk updating availability:', error);
    res.status(500).json({ error: 'Failed to update availability' });
  }
});

// Delete availability record (admin only)
router.delete('/admin/:date', auth, adminAuth, async (req, res) => {
  try {

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
