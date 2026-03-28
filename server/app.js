require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const orderRoutes = require('./routes/orderRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

const app = express();

// 1. DB
connectDB();


const allowedOrigins = [
  "http://localhost:5173",
  "https://shabeebamusthafa61523-code-farmfini-rho.vercel.app"
];

app.use((req, res, next) => {
    const origin = req.headers.origin;
    const allowedOrigins = [
        "https://shabeebamusthafa61523-code-farmfini-rho.vercel.app",
        "https://shabeebamusthafa61523-code-letoh-qa.vercel.app",
        "http://localhost:5173"
    ];

    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }

    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');

    // FIX: Browsers need a 204 or 200 for OPTIONS to proceed to the POST request
    if (req.method === 'OPTIONS') {
        return res.status(204).send();
    }
    next();
});

// 3. Handle Preflight

// 4. Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 5. Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/settings', settingsRoutes);

// 6. Health Check
app.get('/', (req, res) => {
  res.send("API Running 🚀");
});

// 7. Error Handling
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({
    message: err.message,
  });
});

module.exports = app;