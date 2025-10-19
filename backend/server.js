const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// Global process-level handlers to avoid crashing during development when
// third-party services (like MongoDB Atlas) are unreachable.
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.com'] 
    : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
// NOTE:
// The app's MongoDB connection is intentionally disabled for local runs to
// avoid the process exiting when Atlas or the network is unreachable.
// To enable DB connectivity, set the MONGODB_URI environment variable and
// uncomment the mongoose.connect(...) call below.

if (!process.env.MONGODB_URI) {
  console.warn('MONGODB_URI not provided - running without DB connection.');
} else {
  // Attempt to connect with retries using exponential backoff. This will
  // keep the server running while attempting to recover from transient
  // network/Atlas issues. If you'd prefer the server to exit on DB
  // connection failure, we can add a REQUIRE_DB env flag to enforce that.
  const MAX_CONNECT_ATTEMPTS = 6;
  let connectAttempts = 0;

  async function connectWithRetry() {
    connectAttempts += 1;
    // Base options; avoid deprecated driver options (useNewUrlParser/useUnifiedTopology)
    const opts = {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000
    };

    // Allow opting into insecure TLS for local dev only (not recommended for production)
    if (process.env.DB_ALLOW_INSECURE_TLS === 'true') {
      opts.tls = true;
      opts.tlsAllowInvalidCertificates = true;
      opts.tlsAllowInvalidHostnames = true;
      console.warn('DB_ALLOW_INSECURE_TLS=true: Mongoose will accept invalid TLS certs (dev only).');
    }

    try {
      await mongoose.connect(process.env.MONGODB_URI, opts);
      console.log('MongoDB connected successfully');
    } catch (err) {
      console.error(`MongoDB connection attempt ${connectAttempts} failed:`, err && err.message ? err.message : err);

      // Attach an error event listener for any later connection errors
      mongoose.connection.on('error', (e) => console.error('Mongoose connection error event:', e));

      if (connectAttempts < MAX_CONNECT_ATTEMPTS) {
        const backoff = Math.min(30000, 1000 * Math.pow(2, connectAttempts));
        console.log(`Retrying MongoDB connection in ${backoff}ms... (attempt ${connectAttempts + 1}/${MAX_CONNECT_ATTEMPTS})`);
        setTimeout(connectWithRetry, backoff);
      } else {
        const msg = 'Exceeded max MongoDB connection attempts.';
        if (process.env.REQUIRE_DB === 'true') {
          console.error(msg + ' REQUIRE_DB=true, exiting process.');
          console.error('Check MONGODB_URI, network connectivity, Node/OpenSSL compatibility, and Atlas IP whitelist.');
          process.exit(1);
        } else {
          console.error(msg + ' Server will continue to run without DB.');
          console.error('To make the server fail-fast when DB is unavailable set REQUIRE_DB=true in your environment.');
          console.error('Check MONGODB_URI, network connectivity, Node/OpenSSL compatibility, and Atlas IP whitelist.');
        }
      }
    }
  }

  connectWithRetry();
}

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/checks', require('./routes/checks'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// If the frontend has been built, serve the static files so the app can
// be accessed from a single URL (e.g. http://localhost:5000)
const distPath = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(distPath)) {
  console.log('Serving frontend from', distPath);
  app.use(express.static(distPath));

  // SPA fallback: serve index.html for non-API GET requests
  app.get('*', (req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  console.log('Frontend build not found at', distPath, '. API only.');
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 5000;
// Try starting the server on DEFAULT_PORT, and if it's in use try next ports
let startAttempts = 0;
const MAX_ATTEMPTS = 5;

function startServer(port) {
  const host = process.env.HOST || '0.0.0.0';
  const server = app.listen(port, host, () => {
    console.log(`Server running on http://${host}:${port}`);
  });

  server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE' && startAttempts < MAX_ATTEMPTS) {
      console.warn(`Port ${port} in use, trying port ${port + 1}...`);
      startAttempts += 1;
      // try next port
      startServer(port + 1);
    } else {
      // For non-address-in-use errors, log and keep the process alive so
      // transient issues (like DB connection errors) don't crash the app.
      console.error('Server error while starting:', err);
      // If it's a fatal error you'd want to exit in production, consider
      // implementing a supervisor or health-check that stops the process.
    }
  });
}

startServer(DEFAULT_PORT);
