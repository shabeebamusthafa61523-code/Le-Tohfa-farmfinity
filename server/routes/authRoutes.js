const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  getUsers, 
  deleteUser, 
  updateUserProfile, 
  resetPasswordWithOTP ,getUserProfile,sendOTP
} = require('../controllers/authController');
const { protect, admin } = require('../middleware/auth');

// Public
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', resetPasswordWithOTP);
router.post('/send-otp', sendOTP);

// Private (User)
router.put('/update-profile', protect, updateUserProfile);
router.get('/profile', protect, getUserProfile);

// Private (Admin Only)
router.route('/')
    .get(protect, admin, getUsers);

router.route('/:id')
    .delete(protect, admin, deleteUser);

module.exports = router;