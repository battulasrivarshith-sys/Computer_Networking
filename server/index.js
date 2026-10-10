require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const passwordRoutes = require('./routes/passwords');

const app = express();

// Security middleware
app.use(helmet()); // sets a solid set of HTTP security headers
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN ? process.env.CLIENT_ORIGIN.split(',') : '*',
  })
);
app.use(express.json({ limit: '10kb' })); // reject oversized bodies

// Brute-force protection on authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts, please try again in 15 minutes' },
});

// Health check (no auth required — useful for monitoring / smoke tests)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/passwords', passwordRoutes);

// Unknown routes
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// Global error handler — never leak stack traces to clients
app.use((err, req, res, next) => {
  console.error('[error]', err);
  const status = err.statusCode || err.status || 500;
  res.status(status).json({ message: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  connectDB().then(() => {
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  });
}

module.exports = app;
