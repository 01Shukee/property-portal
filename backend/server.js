const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Initialize Express app
const app = express();

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }, // CHANGED for CORS
  crossOriginEmbedderPolicy: false // Disable for CORS
}));

// Body parser with increased limits (MUST come before CORS middleware)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS Configuration - FIXED FOR VERCEL + RENDER.COM
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://property-portal-u8rc.vercel.app',
  'https://property-portal-frontend.vercel.app', // Add this too
  process.env.FRONTEND_URL
].filter(Boolean); // Remove undefined values

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests, server-to-server)
    if (!origin) return callback(null, true);
    
    // Allow all subdomains of vercel.app
    if (origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    
    // Check exact matches in allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Log blocked origins for debugging
    console.warn(`🚫 CORS blocked origin: ${origin}`);
    console.log(`✅ Allowed origins include: ${JSON.stringify(allowedOrigins)}`);
    
    callback(null, false); // Instead of throwing error, return false
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],
  exposedHeaders: [
    'Content-Range',
    'X-Content-Range',
    'X-Total-Count',
    'X-Total-Pages'
  ],
  preflightContinue: false, // Important!
  maxAge: 86400, // 24 hours for preflight cache
};

// Apply CORS middleware to ALL requests
app.use(cors(corsOptions));

// EXPLICITLY handle preflight OPTIONS requests for all routes
app.options('*', cors(corsOptions)); // This line is CRITICAL

// Rate limiting (AFTER CORS to avoid blocking preflight)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'OPTIONS' // Skip preflight requests from rate limiting
});

// Apply rate limiting to all non-OPTIONS requests
app.use(limiter);

// Health check endpoint (excluded from rate limiting in production)
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    memory: process.memoryUsage(),
    allowedOrigins: allowedOrigins
  });
});

// Log all requests for debugging (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    console.log('Headers:', req.headers);
    next();
  });
}

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/homeowners', require('./routes/homeowners'));
app.use('/api/properties', require('./routes/properties'));
app.use('/api/maintenance', require('./routes/maintenance'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/leases', require('./routes/leases'));
app.use('/api/activity', require('./routes/activity'));
app.use('/api/units', require('./routes/units'));
app.use('/api/statements', require('./routes/statements'));
app.use('/api/tenant-invitations', require('./routes/tenantInvitations'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Cleanup jobs
const { startCleanupSchedule } = require('./utils/cleanupJobs');
startCleanupSchedule();

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, '0.0.0.0', () => { // Listen on all interfaces
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`🌐 CORS enabled for origins: ${allowedOrigins.join(', ')}`);
  console.log(`📧 Email service configured`);
  console.log(`🗑️  Cleanup scheduler active`);
  console.log(`🛡️  Security headers enabled`);
  console.log(`⚡ Rate limiting active (1000 requests/15 min per IP)`);
  console.log(`🔄 Preflight OPTIONS requests explicitly handled`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  console.error(err.stack);
  server.close(() => process.exit(1));
});

// Handle SIGTERM
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err);
  process.exit(1);
});

module.exports = app;