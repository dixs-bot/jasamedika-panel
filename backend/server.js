require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employees');
const userRoutes = require('./routes/users');

const app = express();

app.use(cors());
const PORT = process.env.PORT || 8080;

// Sanity check untuk JWT_SECRET
if (!process.env.JWT_SECRET) {
  console.error('ERROR: JWT_SECRET environment variable is required!');
  console.error('Please set JWT_SECRET in your environment or .env file');
  console.error('Example: export JWT_SECRET="your_random_64_character_string_here"');
  process.exit(1);
}

// Middleware
app.use(cors({ origin: true })); // Allow all origins for development
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    port: PORT
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/users', userRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'PT Jasamedika Saranatama - Admin Panel API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      employees: '/api/employees',
      users: '/api/users'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint tidak ditemukan',
    message: `Path ${req.originalUrl} tidak tersedia`,
    availableEndpoints: [
      'GET /',
      'GET /health',
      'POST /api/auth/init-data',
      'POST /api/auth/login',
      'POST /api/auth/ubah-password-sendiri',
      'GET /api/auth/users',
      'POST /api/auth/users',
      'POST /api/auth/users/:id/reset-password',
      'GET /api/employees',
      'GET /api/employees/:id',
      'POST /api/employees',
      'PUT /api/employees/:id',
      'DELETE /api/employees/:id',
      'GET /api/users',
      'GET /api/users/:id'
    ]
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);

  // Handle multer errors
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(501).json({
      error: 'File terlalu besar',
      message: 'Ukuran file maksimal adalah 5MB'
    });
  }

  if (error.code === 'LIMIT_FILE_COUNT') {
    return res.status(501).json({
      error: 'Terlalu banyak file',
      message: 'Hanya satu file yang diperbolehkan'
    });
  }

  if (error.message.includes('file type')) {
    return res.status(501).json({
      error: 'Tipe file tidak valid',
      message: error.message
    });
  }

  // Default error response
  res.status(501).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Terjadi kesalahan pada server'
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('🚀 PT Jasamedika Saranatama - Admin Panel API Server');
  console.log('='.repeat(60));
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📍 Base URL: http://localhost:${PORT}`);
  console.log(`❤️  Health check: http://localhost:${PORT}/health`);
  console.log('='.repeat(60));
  console.log('Available endpoints:');
  console.log('  GET  /');
  console.log('  GET  /health');
  console.log('  POST /api/auth/init-data');
  console.log('  POST /api/auth/login');
  console.log('  POST /api/auth/ubah-password-sendiri');
  console.log('  GET  /api/auth/users (admin only)');
  console.log('  POST /api/auth/users (admin only)');
  console.log('  POST /api/auth/users/:id/reset-password (admin only)');
  console.log('  GET  /api/employees');
  console.log('  GET  /api/employees/:id');
  console.log('  POST /api/employees (auth required)');
  console.log('  PUT  /api/employees/:id (auth required)');
  console.log('  DELETE /api/employees/:id (auth required)');
  console.log('  GET  /api/users');
  console.log('  GET  /api/users/:id');
  console.log('='.repeat(60));
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

module.exports = app;