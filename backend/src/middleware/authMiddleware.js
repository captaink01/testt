// src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const { getOne } = require('../config/database');

// Verify JWT token
exports.verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

// Check if user is suspended
exports.checkSuspension = (req, res, next) => {
  try {
    const userId = req.user.userId;
    const user = getOne('SELECT is_suspended FROM users WHERE id = ?', [userId]);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.is_suspended === 1) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact the administrator.'
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error checking user status'
    });
  }
};

// Require player role or higher (player, organizer, admin)
exports.requirePlayer = (req, res, next) => {
  const userRole = req.user.role;
  const allowedRoles = ['player', 'organizer', 'admin'];

  if (!allowedRoles.includes(userRole)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Player role required.'
    });
  }

  next();
};

// Require organizer role or higher (organizer, admin)
exports.requireOrganizer = (req, res, next) => {
  const userRole = req.user.role;
  const allowedRoles = ['organizer', 'admin'];

  if (!allowedRoles.includes(userRole)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Organizer role required.'
    });
  }

  next();
};

// Require admin role only
exports.requireAdmin = (req, res, next) => {
  const userRole = req.user.role;

  if (userRole !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin role required.'
    });
  }

  next();
};