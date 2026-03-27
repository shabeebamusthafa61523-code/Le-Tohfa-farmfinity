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
// @desc    Simple Password Reset (Verify Email + Phone)
// @route   POST /api/auth/reset-password-simple
const resetPasswordSimple = asyncHandler(async (req, res) => {
  const { email, phone, newPassword } = req.body;

  // 1. Find user who matches BOTH email and phone
  const user = await User.findOne({ email, phone });

  if (!user) {
    res.status(404);
    throw new Error('Verification failed: Email and Phone do not match our records.');
  }

  // 2. Update the password
  user.password = newPassword; 
  await user.save();

  res.status(200).json({
    success: true,
    message: "Identity verified. Password updated successfully."
  });
});

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
  resetPasswordSimple ,
  getUserProfile,
};