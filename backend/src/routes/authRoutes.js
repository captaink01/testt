// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/authController');
const { verifyToken, checkSuspension } = require('../middleware/authMiddleware');

// Public routes (no authentication required)
router.post('/register', register);
router.post('/login', login);

// Protected routes (authentication required)
router.get('/profile', verifyToken, checkSuspension, getProfile);

module.exports = router;