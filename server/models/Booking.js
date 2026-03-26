const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  // Link to User model (optional for manual/walk-in bookings)
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  // Guest Details
  guestName: { type: String, required: true },
  guestPhone: { type: String, required: true },
  guestPlace: { type: String },
  guestCount: { type: Number, default: 1 },
  
  // Booking Specs
  plan: { 
    type: String, 
    enum: ['Staycation', 'Daycation', 'Event'], 
    default: 'Staycation' 
  },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  
  // Financials
  totalPrice: { type: Number, required: true },
  advancePaid: { type: Number, default: 0 },
  remainingBalance: { type: Number, required: true },
  paymentStatus: { 
    type: String, 
    enum: ['Pending', 'Partial', 'Paid'], 
    default: 'Pending' 
  },
  paymentMethod: {
    type: String,
    enum: ['Razorpay', 'Wallet', 'Cash', 'UPI', 'Bank Transfer'],
    default: 'Cash'
  },

  // Metadata & Tracking
  bookingType: {
    type: String,
    enum: ['Manual', 'Online', 'Block'],
    default: 'Manual'
  },
  bookedBy: {
    type: String,
    default: 'Website/Direct' 
  },

  // Razorpay Specifics
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String }

}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);