// src/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { verifyToken, requireAdmin, checkSuspension } = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');

// All admin routes require authentication and admin role
router.use(verifyToken);
router.use(checkSuspension);
router.use(requireAdmin);

// User management
router.get('/users', adminController.getAllUsers);
router.put('/users/:id/suspend', adminController.toggleSuspendUser);

// Game management
router.get('/games', adminController.getAllGames);
router.put('/games/:id/approve', adminController.approveGame);
router.put('/games/:id/reject', adminController.rejectGame);
router.delete('/games/:id', adminController.deleteGame);

// Conflict detection and resolution
router.get('/games/conflicts', adminController.getConflictingGames);
router.post('/games/resolve-conflict', adminController.resolveConflict);

module.exports = router;
