const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const applicationRoutes = require('./routes/application');
const paymentRoutes = require('./routes/payment');
const leaseRoutes = require('./routes/lease');

const app = express();
const PORT = process.env.PORT || 5000;

// Production configuration validation
const isProduction = process.env.NODE_ENV === 'production';
const requiredProdEnv = ['MONGODB_URI', 'JWT_SECRET', 'STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET', 'CLIENT_URL'];
const missingProdEnv = isProduction ? requiredProdEnv.filter((key) => !process.env[key]) : [];

if (missingProdEnv.length) {
  console.error('Missing required env vars in production:', missingProdEnv.join(', '));
  console.error('The API will respond with 500 errors until these values are configured.');
}

// Behind proxies/load balancers (Heroku/Render/Cloudflare), trust the first proxy
app.set('trust proxy', 1);
// Security middleware - Updated to allow Stripe, EmailJS, and Google Fonts
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://js.stripe.com", "https://api.emailjs.com"],
      connectSrc: ["'self'", "https://api.stripe.com", "https://api.emailjs.com", "https://api.emailjs.com/api/v1.0/email/send", "https://maps.googleapis.com"],
      frameSrc: ["'self'", "https://js.stripe.com", "https://hooks.stripe.com", "https://www.google.com", "https://maps.google.com"],
      imgSrc: ["'self'", "data:", "https:"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https:", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameAncestors: ["'none'"],
    },
  } : undefined,
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
if (process.env.NODE_ENV === 'production') {
  app.use(cors({
    origin: [process.env.CLIENT_URL].filter(Boolean),
    credentials: true
  }));
} else {
  // In development, allow all origins
  app.use(cors({
    origin: true,
    credentials: true
  }));
}

// Mount Stripe webhook BEFORE JSON body parsing so raw body is available
app.use('/api/payment/webhook', paymentRoutes.webhookRouter);

// Body parsing middleware for all other routes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database connection with better error handling
if (!isProduction || !missingProdEnv.includes('MONGODB_URI')) {
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/palm-run-llc', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('[MongoDB] Connected successfully');
  })
  .catch(err => {
    console.error('[MongoDB] Connection error:', err);
    console.error('MongoDB URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
    // Don't exit the process, let the app continue
  });
} else {
  console.warn('[MongoDB] Skipping connection because MONGODB_URI is not configured for production.');
}

if (missingProdEnv.length) {
  app.use('/api', (req, res) => {
    res.status(500).json({
      error: 'Server configuration error',
      message: 'Required environment variables are missing. Update your deployment configuration and redeploy.',
      missingEnv: missingProdEnv,
    });
  });
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/application', applicationRoutes);
app.use('/api/lease', leaseRoutes);
app.use('/api/rates', require('./routes/rates'));
app.use('/api/availability', require('./routes/availability'));
app.use('/api/setup', require('./routes/setup'));

// Payment routes (JSON parsed)
app.use('/api/payment', paymentRoutes.router);

// Serve static files from the React app build directory
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Rental Property Template API is running',
    environment: process.env.NODE_ENV,
    demoMode: process.env.DEMO_MODE === 'true'
  });
});

// Video test endpoint
app.get('/api/video-test', (req, res) => {
  const videoPath = path.join(__dirname, '../client/public/videos/beach-video.mp4');
  const exists = fs.existsSync(videoPath);
  res.json({ 
    videoExists: exists, 
    videoPath: videoPath,
    buildPath: path.join(__dirname, '../client/build/videos/beach-video.mp4'),
    buildExists: fs.existsSync(path.join(__dirname, '../client/build/videos/beach-video.mp4'))
  });
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
  // Ensure correct Content-Type headers for images and videos
  app.use('/images', express.static(path.join(__dirname, '../client/public/images'), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
        res.setHeader('Content-Type', 'image/jpeg');
      } else if (filePath.endsWith('.png')) {
        res.setHeader('Content-Type', 'image/png');
      } else if (filePath.endsWith('.webp')) {
        res.setHeader('Content-Type', 'image/webp');
      }
    }
  }));
  
  // Serve videos with proper MIME type
  app.use('/videos', express.static(path.join(__dirname, '../client/public/videos'), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.mp4')) {
        res.setHeader('Content-Type', 'video/mp4');
      } else if (filePath.endsWith('.webm')) {
        res.setHeader('Content-Type', 'video/webm');
      } else if (filePath.endsWith('.ogg')) {
        res.setHeader('Content-Type', 'video/ogg');
      }
      // Cache images for 1 year; cache busting via query string when needed
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  }));
  
  // Catch-all handler: send back React's index.html file for any non-API routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
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

// Process error handlers
process.on('uncaughtException', (err) => {
  console.error('[Process] Uncaught Exception:', err);
  console.error('Stack:', err.stack);
  // Don't exit, let the app try to recover
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Process] Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit, let the app try to recover
});

// Start server with better error handling
if (require.main === module) {
  const server = app.listen(PORT, () => {
    console.log('[Server] Listening on port ' + PORT);
    console.log('[Server] Environment: ' + (process.env.NODE_ENV || 'development'));
    console.log('[Server] Health check: http://localhost:' + PORT + '/api/health');
    if (missingProdEnv.length) {
      console.warn('[Server] Missing required environment variables:', missingProdEnv.join(', '));
    }
  });

  server.on('error', (err) => {
    console.error('[Server] Startup error:', err);
    if (err.code === 'EADDRINUSE') {
      console.error('[Server] Port ' + PORT + ' is already in use');
    }
  });
}

module.exports = app;
