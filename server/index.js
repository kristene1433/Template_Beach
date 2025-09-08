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

// Behind proxies/load balancers (Heroku/Render/Cloudflare), trust the first proxy
app.set('trust proxy', 1);
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

// Rate limiting - tuned to reduce false positives behind proxies/CDNs
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // allow more requests per IP/window
  standardHeaders: true,
  legacyHeaders: false,
  // Use best-effort client IP (Cloudflare/NGINX/Heroku) -> first item of X-Forwarded-For
  keyGenerator: (req) => {
    const xff = req.headers['x-forwarded-for'];
    const cf = req.headers['cf-connecting-ip'];
    const xr = req.headers['x-real-ip'];
    const ipFromXff = Array.isArray(xff)
      ? xff[0]
      : (typeof xff === 'string' ? xff.split(',')[0].trim() : null);
    return cf || xr || ipFromXff || req.ip || (req.connection && req.connection.remoteAddress) || 'unknown';
  },
  // Skip rate limiting for safe/static routes and preflight
  skip: (req) => {
    return req.method === 'OPTIONS' ||
           req.path === '/' ||
           req.path === '/api/health' ||
           req.path.startsWith('/static/') ||
           req.path.startsWith('/images/') ||
           req.path.startsWith('/videos/') ||
           req.path.endsWith('.css') ||
           req.path.endsWith('.js') ||
           req.path.endsWith('.ico') ||
           req.path.endsWith('.json') ||
           req.path.endsWith('.png') ||
           req.path.endsWith('.jpg') ||
           req.path.endsWith('.jpeg') ||
           req.path.endsWith('.svg');
  },
  skipSuccessfulRequests: true // don't count 2xx/3xx towards the limit
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
  // Serve static files with proper MIME types
  app.use(express.static(path.join(__dirname, '../client/build'), {
    setHeaders: (res, path) => {
      if (path.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css');
      } else if (path.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript');
      } else if (path.endsWith('.json')) {
        res.setHeader('Content-Type', 'application/json');
      }
    }
  }));
  // Also serve public assets (images/videos) without hitting the rate limiter
  app.use('/images', express.static(path.join(__dirname, '../client/public/images')));
  app.use('/videos', express.static(path.join(__dirname, '../client/public/videos')));
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
