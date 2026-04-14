const Booking = require('../models/Booking');
const User = require('../models/User');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const asyncHandler = require('express-async-handler');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Step 1: Create Initial Booking (Draft)
// @route   POST /api/bookings/website/create
const createOrder = asyncHandler(async (req, res) => {
  const { guestName, guestPhone, plan, checkIn, checkOut, totalPrice, guestCount } = req.body;

  // Validation
  if (!guestName || !guestPhone || !checkIn || !totalPrice) {
    res.status(400);
    throw new Error("Please provide all required booking details.");
  }

  const booking = await Booking.create({
    user: req.user._id,
    bookedBy: req.user.name || 'Website User',
    guestName,
    guestPhone,
    plan,
    checkIn,
    checkOut,
    totalPrice,
    guestCount,
    remainingBalance: totalPrice, // Initially, balance is the full price
    advancePaid: 0,
    paymentStatus: 'Pending',
    status: 'Pending',
    bookingType: 'Online'
  });

  if (booking) {
    res.status(201).json(booking);
  } else {
    res.status(400);
    throw new Error('Invalid booking data');
  }
});

// @desc    Step 2a: Pay Full Amount via Wallet
// @route   POST /api/bookings/website/pay-wallet
const payWithWallet = asyncHandler(async (req, res) => {
  const { bookingId } = req.body;
  
  const booking = await Booking.findById(bookingId);
  const user = await User.findById(req.user._id);

  if (!booking) {
    res.status(404);
    throw new Error("Booking not found");
  }

  if (booking.paymentStatus === 'Paid') {
    res.status(400);
    throw new Error("Booking is already paid");
  }

  if (user.walletBalance < booking.totalPrice) {
    res.status(400);
    throw new Error("Insufficient wallet balance");
  }

  // Deduct from wallet and update booking to full payment
  user.walletBalance -= booking.totalPrice;
  
  booking.paymentStatus = 'Paid';
  booking.paymentMethod = 'Wallet';
  booking.status = 'Confirmed';
  booking.advancePaid = booking.totalPrice;
  booking.remainingBalance = 0; 

  await user.save();
  await booking.save();

  res.status(200).json({ 
    success: true, 
    message: "Full payment successful via wallet!", 
    newBalance: user.walletBalance 
  });
});

// @desc    Step 2b: Create Razorpay Order (Fixed ₹3000 Advance)
// @route   POST /api/bookings/website/razorpay-order/:id
const createRazorpayOrder = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    res.status(404);
    throw new Error("Booking not found");
  }

  const ADVANCE_AMOUNT = 3000; 

  const options = {
    amount: ADVANCE_AMOUNT * 100, // Amount in paise
    currency: "INR",
    receipt: `receipt_${booking._id.toString().slice(-6)}`,
  };

  try {
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    res.status(500);
    throw new Error("Razorpay Order Creation Failed");
  }
});

// @desc    Step 3: Verify Razorpay Payment & Confirm Booking
// @route   POST /api/bookings/website/verify-razorpay
const verifyWebsitePayment = asyncHandler(async (req, res) => {
  const { 
    razorpay_order_id, 
    razorpay_payment_id, 
    razorpay_signature, 
    bookingId 
  } = req.body;

  // 1. Signature Verification
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    res.status(400);
    throw new Error("Payment verification failed: Invalid signature.");
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    res.status(404);
    throw new Error("Booking record not found during verification");
  }

  const ADVANCE_PAID = 3000; 

  // 2. Update Booking with partial payment details
  booking.paymentStatus = 'Partial'; 
  booking.status = 'Confirmed';
  booking.advancePaid = ADVANCE_PAID;
  booking.remainingBalance = booking.totalPrice - ADVANCE_PAID;
  
  booking.paymentMethod = 'Razorpay';
  booking.razorpayOrderId = razorpay_order_id;
  booking.razorpayPaymentId = razorpay_payment_id;

  await booking.save();
  
  res.json({ 
    success: true, 
    message: "Advance payment verified. Booking confirmed!",
    remainingBalance: booking.remainingBalance
  });
});

// @desc    Fetch User's Booking History
// @route   GET /api/bookings/mybookings
const getMyBookings = asyncHandler(async (req, res) => {
  // Add the same filter here so users don't see failed attempts
  const bookings = await Booking.find({ 
    user: req.user._id,
    paymentStatus: { $ne: 'Pending' } 
  }).sort({ createdAt: -1 });
  
  res.json(bookings);
});

module.exports = {
  createOrder,
  payWithWallet,
  createRazorpayOrder,
  verifyWebsitePayment,
  getMyBookings
};