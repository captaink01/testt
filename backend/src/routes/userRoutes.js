// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const {
  getAllSports,
  updateSportsPreferences,
  getMySports,
  updateProfile
} = require('../controllers/userController');
const { verifyToken, checkSuspension } = require('../middleware/authMiddleware');

// Public routes
router.get('/sports', getAllSports);

// Protected routes (require authentication)
router.get('/my-sports', verifyToken, checkSuspension, getMySports);
router.put('/sports-preferences', verifyToken, checkSuspension, updateSportsPreferences);
router.put('/profile', verifyToken, checkSuspension, updateProfile);

module.exports = router;