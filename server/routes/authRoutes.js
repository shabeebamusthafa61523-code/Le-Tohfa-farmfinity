const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  getUsers, 
  deleteUser, 
  updateUserProfile, 
  resetPasswordSimple ,getUserProfile,
} = require('../controllers/authController');
const { protect, admin } = require('../middleware/auth');
// router.use(cors({
//     origin: 'https://shabeebamusthafa61523-code-farmfini-rho.vercel.app',
//     credentials: true
// }));
// Public
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', resetPasswordSimple);

// Private (User)
router.put('/update-profile', protect, updateUserProfile);
router.get('/profile', protect, getUserProfile);

// Private (Admin Only)
router.route('/')
    .get(protect, admin, getUsers);

router.route('/:id')
    .delete(protect, admin, deleteUser);

module.exports = router;