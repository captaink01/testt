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
  getJoinedGames
} = require('../controllers/gameController');
const { verifyToken, requireOrganizer, checkSuspension } = require('../middleware/authMiddleware');

// Public routes (with optional auth for filtering)
router.get('/', getAllGames);
router.get('/:id', getGameById);

// Protected routes (require authentication)
router.post('/', verifyToken, checkSuspension, requireOrganizer, createGame);
router.put('/:id', verifyToken, checkSuspension, updateGame);
router.delete('/:id', verifyToken, checkSuspension, deleteGame);
router.post('/:id/join', verifyToken, checkSuspension, joinGame);
router.post('/:id/leave', verifyToken, checkSuspension, leaveGame);
router.get('/my/created', verifyToken, checkSuspension, getMyGames);
router.get('/my/joined', verifyToken, checkSuspension, getJoinedGames);

module.exports = router;