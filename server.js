require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const vehicleRoutes = require('./routes/vehicles');
const serviceRoutes = require('./routes/services');
const fuelRoutes = require('./routes/fuel');
const analyticsRoutes = require('./routes/analytics');
const exportRoutes = require('./routes/export');
const authRoutes = require('./routes/auth');
const garageRoutes = require('./routes/garage');
const aiRoutes = require('./routes/ai');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vehicle-tracker';

// Security Headers (configured to allow inline scripts/styles for static SPA)
app.use(
  helmet({
    contentSecurityPolicy: false
  })
);

app.use(cors());
app.use(express.json({ limit: '5mb' }));

// Rate Limiter for general API calls
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' }
});

// Stricter Rate Limiter for Auth & AI endpoints
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Rate limit exceeded for authentication or AI requests. Please slow down.' }
});

app.use('/api/', apiLimiter);
app.use('/api/auth/login', strictLimiter);
app.use('/api/auth/register', strictLimiter);
app.use('/api/ai/chat', strictLimiter);

// API routes
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/fuel', fuelRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/garage', garageRoutes);
app.use('/api/ai', aiRoutes);

// Serve static frontend assets
app.use(express.static(path.join(__dirname, 'public')));

// Attempt MongoDB connection with silent fallback to JSON store
if (process.env.NODE_ENV !== 'test') {
  mongoose
    .connect(MONGODB_URI, { serverSelectionTimeoutMS: 3000 })
    .then(() => {
      console.log('✅ Connected to MongoDB database successfully.');
    })
    .catch((err) => {
      console.warn('⚠️ MongoDB connection unavailable. Operating in local JSON storage mode (data/db.json).');
      console.warn(`Reason: ${err.message}`);
    });
}

// Export app for testing purposes
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 TrackNTune server running at http://localhost:${PORT}`);
  });
}

module.exports = app;
