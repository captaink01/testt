// src/routes/gameRoutes.js
const express = require('express');
const router = express.Router();
const {
  createGame,
  getAllGames,
  getGameById,
  updateGame,
  deleteGame,
  joinGame,
  leaveGame,
  getMyGames,
  getJoinedGames,
  updateGameStatus
} = require('../controllers/gameController');
const { protect, isCreator, isAdmin, optionalAuth } = require('../middleware/authMiddleware');

// Public routes
router.get('/', optionalAuth, getAllGames);
router.get('/:id', getGameById);

// Protected routes (require authentication)
router.post('/', protect, isCreator, createGame);
router.put('/:id', protect, updateGame);
router.delete('/:id', protect, deleteGame);
router.post('/:id/join', protect, joinGame);
router.post('/:id/leave', protect, leaveGame);
router.get('/my/created', protect, getMyGames);
router.get('/my/joined', protect, getJoinedGames);

// Admin routes
router.patch('/:id/status', protect, isAdmin, updateGameStatus);

module.exports = router;