// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { register, login, getProfile, createAdmin } = require('../controllers/authController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// Public routes (no authentication required)
router.post('/register', register);
router.post('/login', login);

// Protected routes (authentication required)
router.get('/profile', protect, getProfile);
router.post('/create-admin', protect, isAdmin, createAdmin);

module.exports = router;