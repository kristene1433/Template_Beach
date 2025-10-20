const express = require('express');
const router = express.Router();

// Simple setup endpoint for post-deployment initialization
router.post('/setup-demo', async (req, res) => {
  try {
    // Only allow setup in production with demo mode
    if (process.env.NODE_ENV !== 'production' || process.env.DEMO_MODE !== 'true') {
      return res.status(403).json({ error: 'Setup not allowed in this environment' });
    }

    // Check if demo data already exists
    const User = require('../models/User');
    const existingUsers = await User.countDocuments({ 
      email: { $in: ['demo@example.com', 'admin@example.com'] } 
    });
    
    if (existingUsers > 0) {
      return res.json({ 
        message: 'Demo data already exists',
        status: 'already_setup'
      });
    }

    // Run setup script
    const setupProduction = require('../scripts/setupProduction');
    
    // Note: This is a simplified version - in production you might want to 
    // run the full setup script or handle this differently
    
    res.json({ 
      message: 'Demo setup initiated. Please run the setup script manually or check the deployment logs.',
      status: 'setup_required'
    });

  } catch (error) {
    console.error('Setup endpoint error:', error);
    res.status(500).json({ error: 'Setup failed' });
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    environment: process.env.NODE_ENV,
    demoMode: process.env.DEMO_MODE === 'true',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
