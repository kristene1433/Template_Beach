const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const applicationRoutes = require('./routes/application');
const paymentRoutes = require('./routes/payment');
const leaseRoutes = require('./routes/lease');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware - Updated to allow Stripe, EmailJS, and Google Fonts
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://js.stripe.com", "https://api.emailjs.com"],
      connectSrc: ["'self'", "https://api.stripe.com", "https://api.emailjs.com", "https://api.emailjs.com/api/v1.0/email/send"],
      frameSrc: ["'self'", "https://js.stripe.com", "https://hooks.stripe.com"],
      imgSrc: ["'self'", "data:", "https:"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https:", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameAncestors: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// Rate limiting - Updated for Heroku compatibility
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  trustProxy: true,
  standardHeaders: true,
  legacyHeaders: false,
  // Custom key generator for Heroku
  keyGenerator: (req) => {
    // Use X-Forwarded-For header if available (Heroku), otherwise use IP
    return req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress;
  },
  // Skip rate limiting for health checks
  skip: (req) => req.path === '/api/health'
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parsing middleware - IMPORTANT: Must come before webhook route
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/palm-run-llc', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/application', applicationRoutes);
app.use('/api/lease', leaseRoutes);

// Payment routes - webhook needs raw body, other routes need JSON
app.use('/api/payment', paymentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Palm Run LLC API is running' });
});

// Serve static files from the React build
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error details:', {
    message: err.message,
    code: err.code,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
  
  // Handle rate limiting errors specifically
  if (err.code === 'ERR_ERL_UNEXPECTED_X_FORWARDED_FOR') {
    return res.status(429).json({ 
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.'
    });
  }
  
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler - serve React app for client-side routing
app.use('*', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  } else {
    res.status(404).json({ error: 'Route not found' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
