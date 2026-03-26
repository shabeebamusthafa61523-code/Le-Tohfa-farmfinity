const express = require('express');
const router = express.Router();
const { 
  getBookings, 
  createManualBooking, 
  getBookedDates,
   updateBooking,
   deleteBooking,
   blockDate,
   getMyBookings
} = require('../controllers/bookingController');
const { protect, admin } = require('../middleware/auth');

// Public route for frontend availability checks
router.get('/booked-dates', getBookedDates);
router.get('/mybookings', getMyBookings);

// Protected Admin routes
router.route('/')
  .get(protect, admin, getBookings);

router.post('/admin-book-manual', protect, admin, createManualBooking);
router.post('/block-date', protect, admin, blockDate);

router.route('/:id')
  .put(protect, admin, updateBooking)
  .delete(protect, admin, deleteBooking);
module.exports = router;