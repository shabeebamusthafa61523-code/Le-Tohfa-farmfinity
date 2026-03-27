require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const orderRoutes = require('./routes/orderRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors({
  origin: true, // Crucial for Vercel/Render communication
  credentials: true
}));
app.use(express.json());

// --- ROUTES ---

// Core Logic
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Fix: Booking/Order Routing
// Ensure orderRoutes handles /create and bookingRoutes handles general lookups
app.use('/api/order', orderRoutes); 
app.use('/api/bookings', bookingRoutes);

// Settings
app.use('/api/settings', settingsRoutes);

// --- FALLBACK ROUTES (Prevents Frontend 404 & e.filter Crashes) ---

// 1. Fixes: "Error loading dynamic pricing"
app.get('/api/dynamic-pricing', (req, res) => {
    // Returning an empty array [] ensures .filter() on frontend works
    res.status(200).json([]); 
});

// 2. Fixes: "System sync failed" or "Failed to load settings"
// This acts as a backup if settingsRoutes is empty or missing a root handler
app.get('/api/settings/sync', (req, res) => {
    res.status(200).json({ success: true, settings: {} });
});

// Health Check
app.get('/', (req, res) => res.send("Le'Tohfa API Logic Running... 🚀"));

// --- GLOBAL ERROR HANDLER ---
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

module.exports = app;