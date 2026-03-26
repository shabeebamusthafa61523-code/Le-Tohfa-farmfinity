const express = require('express');
const router = express.Router();
const { 
  createOrder, 
  payWithWallet, 
  createRazorpayOrder, 
  verifyWebsitePayment,
  getMyBookings 
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

// All routes are prefixed with /api/bookings/website in app.js
router.post('/create', protect, createOrder);
router.post('/pay-wallet', protect, payWithWallet);
router.post('/razorpay-order/:id', protect, createRazorpayOrder);
router.post('/verify-razorpay', protect, verifyWebsitePayment);
router.get('/my-bookings', protect, getMyBookings);
module.exports = router;