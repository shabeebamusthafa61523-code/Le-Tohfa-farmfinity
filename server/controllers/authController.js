const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const asyncHandler = require('express-async-handler');

// Helper: Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// controllers/authController.js



// @desc    Auth user & get token
// @route   POST /api/auth/login
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone, // ✅ Explicitly sending phone
        role: user.role,
      },
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Register a new user
// @route   POST /api/auth/register
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({ name, email, phone, password });
if (!name || !email || !phone || !password) {
    res.status(400);
    throw new Error('Please fill in all fields');
  }
  if (user) {
    res.status(201).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone, // ✅ Explicitly sending phone
        role: user.role,
      },
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Update User Profile
// @route   PUT /api/auth/profile
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone, // ✅ Explicitly sending updated phone
        role: updatedUser.role,
      },
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});


// @desc    Forgot Password - Send Reset Link
// @route   POST /api/auth/forgot-password
// @desc    Professional Reset with OTP Simulation
const sendEmail = require('../utils/sendEmail');

// @desc    Step 1: Send OTP to Email
const sendOTP = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // 1. Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    
    // 2. Save OTP and Expiry (10 mins) to User model
    user.resetOTP = otp;
    user.resetOTPExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

    // 3. Send the Email
    const htmlMessage = `
      <div style="font-family: serif; border: 1px solid #e0e7e0; padding: 20px; border-radius: 15px;">
        <h2 style="color: #2d3a2d; font-style: italic;">Le'Tohfa Security</h2>
        <p>Your verification code for password reset is:</p>
        <h1 style="color: #8ba88b; letter-spacing: 5px;">${otp}</h1>
        <p style="font-size: 12px; color: #999;">This code expires in 10 minutes.</p>
      </div>
    `;

    await sendEmail({
      email: user.email,
      subject: "Your Le'Tohfa Verification Code",
      html: htmlMessage,
    });

    res.status(200).json({ success: true, message: "OTP sent to email" });
  } catch (error) {
    res.status(500).json({ message: "Email could not be sent" });
  }
};

// @desc    Step 2: Verify OTP and Reset Password
const resetPasswordWithOTP = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const user = await User.findOne({ 
      email, 
      resetOTP: otp, 
      resetOTPExpire: { $gt: Date.now() } 
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired OTP" });

    // Update password and clear OTP fields
    user.password = newPassword;
    user.resetOTP = undefined;
    user.resetOTPExpire = undefined;
    await user.save();

    res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
// @desc    Get all users (Admin only)
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password').sort({ createdAt: -1 });
  res.json(users);
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone, // ✅ This will now return the phone number
        role: user.role,
      }
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// Remember to add it to your module.exports at the bottom!

// @desc    Delete user (Admin only)
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    if (user.role === 'admin' && user._id.toString() === req.user._id.toString()) {
      res.status(400);
      throw new Error('Cannot delete own admin account');
    }
    await user.deleteOne();
    res.json({ message: 'User removed' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

module.exports = { 
  registerUser, 
  loginUser, 
  getUsers, 
  deleteUser, 
  updateUserProfile, 
  resetPasswordWithOTP ,
  getUserProfile,
  sendOTP
};