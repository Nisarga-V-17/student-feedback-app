const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Debug: Check environment variables
console.log('=== ENVIRONMENT VARIABLE CHECK ===');
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI loaded:', process.env.MONGODB_URI ? 'YES' : 'NO');
if (process.env.MONGODB_URI) {
  console.log('MONGODB_URI length:', process.env.MONGODB_URI.length);
  // Show first and last part of URI (for security)
  const uri = process.env.MONGODB_URI;
  console.log('URI starts with:', uri.substring(0, 30) + '...');
  console.log('URI ends with:', '...' + uri.substring(uri.length - 20));
}

const connectDB = require('./config/database');
const app = express();

// Database connection
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/profile', require('./routes/profile'));

// Basic test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});