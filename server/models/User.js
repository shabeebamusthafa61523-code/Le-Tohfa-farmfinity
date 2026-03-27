const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true }, // Make sure this is here!
  password: { type: String, required: true },
resetPasswordToken: String,
  resetPasswordExpire: Date,
  resetOTP: String,
  resetOTPExpire: Date,
// Add this to your existing User schema in models/User.js
role: {
  type: String,
  enum: ['user', 'admin'],
  default: 'user'
}}, { timestamps: true });

// Encrypt password before saving to DB
userSchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return; // Just return. Mongoose knows to continue because it's an async function.
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  // No next() call is needed here!
});
module.exports = mongoose.model('User', userSchema);