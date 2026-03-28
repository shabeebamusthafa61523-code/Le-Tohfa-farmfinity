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

// 1. DB
connectDB();

// 2. REFINED CORS CONFIGURATION
const allowedOrigins = [
    "http://localhost:5173",
       "https://le-tohfa-farmfinity.vercel.app/"

    "https://shabeebamusthafa61523-code-farmfini-rho.vercel.app",
    "https://shabeebamusthafa61523-code-letoh-qa.vercel.app",
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

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
  console.error("Server Error:", err.message);
  res.status(500).json({
    message: err.message,
  });
});

module.exports = app;