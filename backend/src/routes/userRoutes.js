// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { 
  getAllSports, 
  updateSportsPreferences, 
  getMySports,
  updateProfile 
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/sports', getAllSports);

// Protected routes (require authentication)
router.get('/my-sports', protect, getMySports);
router.put('/sports-preferences', protect, updateSportsPreferences);
router.put('/profile', protect, updateProfile);

module.exports = router;