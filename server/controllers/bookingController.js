const Booking = require('../models/Booking');
const asyncHandler = require('express-async-handler');


// ✅ Get all bookings
const getBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({}).sort({ createdAt: -1 });
  res.json(bookings);
});

// ✅ Create Manual Booking (with conflict check)
// ✅ Create Manual Booking (Updated to include 'bookedBy')
const createManualBooking = asyncHandler(async (req, res) => {
  const {
    guestName,
    guestPhone,
    guestPlace,
    guestCount,
    plan,
    checkIn,
    checkOut,
    totalPrice,
    advance,
    bookedBy // <--- 1. Receive the account name from the frontend
  } = req.body;

  // Conflict check (prevents double booking)
  const conflict = await Booking.findOne({
    $or: [
      {
        checkIn: { $lt: new Date(checkOut) },
        checkOut: { $gt: new Date(checkIn) }
      }
    ]
  });

  if (conflict) {
    res.status(400);
    throw new Error('Selected dates already booked');
  }

  const remainingBalance = totalPrice - advance;

  let paymentStatus = 'Pending';
  if (remainingBalance <= 0) paymentStatus = 'Paid';
  else if (advance > 0) paymentStatus = 'Partial';

  const booking = await Booking.create({
    guestName,
    guestPhone,
    guestPlace,
    guestCount,
    plan,
    checkIn,
    checkOut,
    totalPrice,
    advancePaid: advance,
    remainingBalance,
    paymentStatus,
    bookingType: 'Manual',
    bookedBy: bookedBy || 'System' // <--- 2. Save the account name (e.g., "admin3")
  });

  res.status(201).json(booking);
});
// ✅ Update Booking
const updateBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  booking.guestName = req.body.guestName || booking.guestName;
  booking.guestPhone = req.body.guestPhone || booking.guestPhone;
  booking.guestCount = req.body.guestCount || booking.guestCount;
  booking.plan = req.body.plan || booking.plan;

  booking.totalPrice = Number(req.body.totalPrice);
  booking.advancePaid = Number(req.body.advancePaid);

  booking.remainingBalance = booking.totalPrice - booking.advancePaid;

  if (booking.remainingBalance <= 0) {
    booking.paymentStatus = 'Paid';
  } else if (booking.advancePaid > 0) {
    booking.paymentStatus = 'Partial';
  } else {
    booking.paymentStatus = 'Pending';
  }

  const updated = await booking.save();
  res.json(updated);
});

// ✅ Delete Booking
const deleteBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  await booking.deleteOne();
  res.json({ message: 'Removed' });
});

// ✅ Get Booked + Blocked Dates (SEPARATED)
const getBookedDates = asyncHandler(async (req, res) => {
  const today = new Date();

  const bookings = await Booking.find(
    { checkOut: { $gte: today } },
    'checkIn checkOut bookingType'
  );

  let bookedDates = [];
  let adminBlockedDates = [];

  bookings.forEach((booking) => {
    let current = new Date(booking.checkIn);
    let stopDate = new Date(booking.checkOut);

    current.setHours(12, 0, 0, 0);
    stopDate.setHours(12, 0, 0, 0);

    // ❗ IMPORTANT: checkout day NOT blocked
    while (current < stopDate) {
      const dateStr = current.toISOString().split('T')[0];

      if (booking.bookingType === 'Block') {
        adminBlockedDates.push(dateStr);
      } else {
        bookedDates.push(dateStr);
      }

      current.setDate(current.getDate() + 1);
    }
  });

 res.json({
  booked: [...new Set(bookedDates)],
  adminBlocked: [...new Set(adminBlockedDates)],
  allBookings: bookings // <--- Add this line so the calendar can check precise times
});
});

// ✅ Block Date
const blockDate = asyncHandler(async (req, res) => {
    const { date } = req.body; // "2026-03-20"

    if (!date) {
        res.status(400);
        throw new Error('Please provide a date');
    }

    const [year, month, day] = date.split('-').map(Number);
    
    // Create local markers for the very start and very end of the day
    const start = new Date(year, month - 1, day, 0, 0, 0); 
    const end = new Date(year, month - 1, day, 23, 59, 59);

    // 1. Check if a REAL GUEST (not an Admin Block) is already there
    const guestConflict = await Booking.findOne({
        guestName: { $ne: "ADMIN BLOCK" }, // Ignore existing admin blocks
        $or: [
            { checkIn: { $lt: end, $gt: start } },
            { checkOut: { $lt: end, $gt: start } },
            { $and: [{ checkIn: { $lte: start } }, { checkOut: { $gte: end } }] }
        ]
    });

    if (guestConflict) {
        res.status(400);
        throw new Error(`Conflict: ${guestConflict.guestName} is booked here.`);
    }

    // 2. If an Admin Block already exists, we don't need to create another one
    const existingBlock = await Booking.findOne({
        guestName: "ADMIN BLOCK",
        checkIn: { $gte: start, $lte: end }
    });

    if (existingBlock) {
        return res.status(200).json({ message: "Already blocked" });
    }

    // 3. Create the Block
    const block = await Booking.create({
        guestName: "ADMIN BLOCK",
        guestPhone: "0000",
        checkIn: start,
        checkOut: end, 
        plan: "Staycation", // Set to Staycation so the frontend hard-blocks it
        totalPrice: 0,
        advancePaid: 0,
        remainingBalance: 0,
        paymentStatus: 'Paid',
        bookingType: 'Manual'
    });

    res.status(201).json(block);
});
// @desc    Get logged in user bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
const getMyBookings = asyncHandler(async (req, res) => {
  // We only find bookings where the 'user' field matches the logged-in ID
  const bookings = await Booking.find({ user: req.user._id }).sort({ createdAt: -1 });
  
  if (bookings) {
    res.json(bookings);
  } else {
    res.status(404);
    throw new Error('No bookings found');
  }
});
module.exports = {
  getBookings,
  createManualBooking,
  updateBooking,
  deleteBooking,
  getBookedDates,
  blockDate,
  getMyBookings
};