const Booking = require('../models/Booking.js');
const User = require('../models/User');

// @desc    Get all bookings for admin dashboard
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({}).populate('user', 'name email');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings' });
  }
};


// @desc    Get stats summary with 7-day revenue history
const getStatsSummary = async (req, res) => {
  try {
    const bookings = await Booking.find();
    const totalUsers = await User.countDocuments();
    
    // 1. Calculate main totals using your Schema fields
    const totals = bookings.reduce((acc, booking) => {
      // REVENUE = money already collected (advancePaid)
      acc.totalRevenue += booking.advancePaid || 0;
      // PENDING = money yet to be collected (remainingBalance)
      acc.pendingBalance += booking.remainingBalance || 0;
      return acc;
    }, { totalRevenue: 0, pendingBalance: 0 });

    // 2. Calculate Revenue History for the Chart (Last 7 Days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const revenueHistoryRaw = await Booking.aggregate([
      { 
        $match: { 
          createdAt: { $gte: sevenDaysAgo },
          // Filter out blocked dates or failed attempts if necessary
          paymentStatus: { $ne: 'Cancelled' } 
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          amount: { $sum: "$advancePaid" } // Chart follows money collected
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // 3. Fill in missing dates
    const historyMap = new Map(revenueHistoryRaw.map(item => [item._id, item.amount]));
    const revenueHistory = [];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      
      revenueHistory.push({
        date: dayName,
        amount: historyMap.get(dateStr) || 0
      });
    }

    res.json({
      totalRevenue: totals.totalRevenue,
      pendingBalance: totals.pendingBalance,
      totalBookings: bookings.length,
      totalUsers: totalUsers,
      revenueHistory 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error calculating stats" });
  }
};

// @desc    Update booking status and Settle Payments
const updateBookingStatus = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Handle the "Settle" logic
    if (req.body.status === 'Confirmed' || req.body.paymentStatus === 'Paid') {
      // When confirmed/paid, remaining balance moves to advancePaid (Revenue)
      booking.advancePaid = booking.totalPrice; 
      booking.remainingBalance = 0;
      booking.paymentStatus = 'Paid';
    }

    if (req.body.status) booking.status = req.body.status;
    
    const updatedBooking = await booking.save();
    res.json(updatedBooking);
  } catch (error) {
    res.status(500).json({ message: 'Error updating status' });
  }
};

// @desc    Sync existing 'Paid' bookings
const syncRevenue = async (req, res) => {
  try {
    // Find bookings marked as 'Paid' but where math isn't synced
    const paidBookings = await Booking.find({ paymentStatus: 'Paid' });

    let updatedCount = 0;
    for (let booking of paidBookings) {
      if (booking.remainingBalance !== 0 || booking.advancePaid !== booking.totalPrice) {
        booking.advancePaid = booking.totalPrice;
        booking.remainingBalance = 0;
        await booking.save();
        updatedCount++;
      }
    }

    res.json({
      success: true,
      message: "Revenue synced successfully",
      updatedCount,
    });
  } catch (error) {
    res.status(500).json({ message: "Sync Error" });
  }
};


// @desc    Get financial overview
const getFinancialOverview = async (req, res) => {
  try {
    const bookings = await Booking.find().populate('user', 'name email');
    
    const formattedData = bookings.map(b => ({
      id: b._id,
      guestName: b.user ? b.user.name : 'Unknown Guest',
      plan: b.plan,
      date: b.bookingDate,
      total: b.totalPrice,
      paid: b.amountPaid,
      balance: b.totalPrice - (b.amountPaid || 0),
      status: b.paymentStatus
    }));

    res.json(formattedData);
  } catch (error) {
    res.status(500).json({ message: "Error fetching financial data" });
  }
};

// @desc    Get stats summary


// @desc    Get stats summary with 7-day revenue history

// @desc    Sync existing 'Paid' bookings to reflect in Total Revenue
// @route   GET /api/admin/sync-revenue

// ... keep other functions (getAllBookings, etc.) the same
// EXPORT ALL FUNCTIONS AT ONCE
module.exports = {
  getAllBookings,
  updateBookingStatus,
  getFinancialOverview,
  getStatsSummary,
  syncRevenue
};