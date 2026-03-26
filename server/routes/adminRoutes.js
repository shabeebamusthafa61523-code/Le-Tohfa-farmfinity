const express = require('express');
const router = express.Router();
const { 
    getAllBookings, 
    updateBookingStatus, 
    getFinancialOverview, 
    getStatsSummary ,
    syncRevenue
} = require('../controllers/adminController');

// Move it HERE (Before router.use(protect))
router.get('/sync-revenue', syncRevenue);

// Import your security guards
const { protect, admin } = require('../middleware/auth');

// Apply protect & admin to ALL routes in this file
router.use(protect);
router.use(admin);

// @route   GET /api/admin/stats-summary
router.get('/stats-summary', getStatsSummary);

// @route   GET /api/admin/bookings
router.get('/bookings', getAllBookings);

// @route   GET /api/admin/finance
router.get('/finance', getFinancialOverview);

// @route   PUT /api/admin/booking/:id
router.put('/booking/:id', updateBookingStatus);


module.exports = router;