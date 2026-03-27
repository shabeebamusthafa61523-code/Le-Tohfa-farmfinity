require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const orderRoutes = require('./routes/orderRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

const app = express();
connectDB();

// --- IMPROVED MIDDLEWARE ---
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ["https://le-tohfa-farmfinity.onrender.com"] // Add your production frontend URL here
        : true, 
    credentials: true
}));
app.use(express.json());

// --- ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/order', orderRoutes); 
app.use('/api/bookings', bookingRoutes);
app.use('/api/settings', settingsRoutes);

// --- FALLBACKS ---
app.get('/api/dynamic-pricing', (req, res) => res.status(200).json([]));
app.get('/api/settings/sync', (req, res) => res.status(200).json({ success: true, settings: {} }));

// Health Check
app.get('/', (req, res) => res.send("Le'Tohfa API Logic Running... 🚀"));

// --- 404 CATCH-ALL ---
// If it reached here, the route definitely doesn't exist
app.use((req, res) => {
    res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

module.exports = app;