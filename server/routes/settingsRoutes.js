const express = require('express');
const { getSettings, updateSettings } = require('../controllers/settingsController.js');
const { protect, admin } = require('../middleware/auth.js');

const router = express.Router();

/**
 * @route   GET /api/settings
 * @desc    Fetch global site configurations (Public)
 */
router.get('/', getSettings);

/**
 * @route   PUT /api/settings/update
 * @desc    Update global site configurations (Admin Only)
 */
router.put('/update', protect, admin, updateSettings);

module.exports = router;