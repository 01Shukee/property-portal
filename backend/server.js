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
  contentSecurityPolicy: false, // Adjust based on your needs
  crossOriginResourcePolicy: { policy: "same-site" }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all requests
app.use(limiter);

// Body parser with increased limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS Configuration - ENHANCED FOR PRODUCTION
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001', // Optional: for local testing on different ports
  'https://property-portal-u8rc.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean); // Remove undefined values

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests, server-to-server)
    if (!origin) return callback(null, true);
    
    // Check exact matches in allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Optional: Allow any Vercel preview deployments
    if (process.env.NODE_ENV === 'development' && origin.endsWith('.vercel.app')) {
      console.log(`⚠️  Allowing Vercel preview deployment: ${origin}`);
      return callback(null, true);
    }
    
    // Log blocked origins for debugging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.warn(`🚫 CORS blocked origin: ${origin}`);
      console.log(`✅ Allowed origins: ${JSON.stringify(allowedOrigins)}`);
    }
    
    callback(new Error('Not allowed by CORS'));
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
  maxAge: 86400, // 24 hours for preflight cache
};

app.use(cors(corsOptions));

// Handle preflight requests for all routes
app.options('*', cors(corsOptions));

// Health check endpoint (excluded from rate limiting in production)
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    memory: process.memoryUsage(),
    allowedOrigins: process.env.NODE_ENV === 'development' ? allowedOrigins : undefined
  });
});

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
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`🌐 CORS enabled for origins: ${allowedOrigins.join(', ')}`);
  console.log(`📧 Email service configured`);
  console.log(`🗑️  Cleanup scheduler active`);
  console.log(`🛡️  Security headers enabled`);
  console.log(`⚡ Rate limiting active (1000 requests/15 min per IP)`);
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