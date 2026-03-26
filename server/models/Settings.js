const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  siteName: { type: String, default: "Le'Tohfa Journeys" },
  whatsappNumber: { type: String, default: "91XXXXXXXXXX" },
  
  // Dynamic Pricing Logic
  advanceAmount: { type: Number, default: 3000 },
  staycationPrice: { type: Number, default: 15000 },
  daycationPrice: { type: Number, default: 15000 },
  eventPrice: { type: Number, default: 25000 }, // Added Event Price

  globalNotification: {
    message: { type: String, default: "" },
    isActive: { type: Boolean, default: false },
    type: { type: String, enum: ['info', 'success', 'warning'], default: 'info' }
  },
  isMaintenanceMode: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);