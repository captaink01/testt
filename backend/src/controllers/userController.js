// src/controllers/userController.js
const { runQuery, getQuery, getOne, saveDatabase } = require('../config/database');

// Get all available sports
exports.getAllSports = (req, res) => {
  try {
    const sports = getQuery('SELECT * FROM sports ORDER BY name');
    
    res.status(200).json({
      success: true,
      count: sports.length,
      sports
    });
  } catch (error) {
    console.error('Get sports error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching sports',
      error: error.message
    });
  }
};

// Update user's favorite sports
exports.updateSportsPreferences = (req, res) => {
  try {
    const userId = req.user.userId;
    const { sport_ids } = req.body; // Array of sport IDs

    // Validation
    if (!sport_ids || !Array.isArray(sport_ids)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of sport IDs'
      });
    }

    // Delete existing preferences
    runQuery('DELETE FROM user_sports WHERE user_id = ?', [userId]);

    // Insert new preferences
    sport_ids.forEach(sportId => {
      runQuery(
        'INSERT INTO user_sports (user_id, sport_id) VALUES (?, ?)',
        [userId, sportId]
      );
    });

    saveDatabase();

    // Get updated sports list
    const userSports = getQuery(
      `SELECT s.id, s.name, s.icon 
       FROM sports s
       INNER JOIN user_sports us ON s.id = us.sport_id
       WHERE us.user_id = ?`,
      [userId]
    );

    res.status(200).json({
      success: true,
      message: 'Sports preferences updated successfully',
      sports: userSports
    });

  } catch (error) {
    console.error('Update sports preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating sports preferences',
      error: error.message
    });
  }
};

// Get user's sports preferences
exports.getMySports = (req, res) => {
  try {
    const userId = req.user.userId;

    const userSports = getQuery(
      `SELECT s.id, s.name, s.icon 
       FROM sports s
       INNER JOIN user_sports us ON s.id = us.sport_id
       WHERE us.user_id = ?`,
      [userId]
    );

    res.status(200).json({
      success: true,
      count: userSports.length,
      sports: userSports
    });

  } catch (error) {
    console.error('Get user sports error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user sports',
      error: error.message
    });
  }
};

// Update user profile (name, phone)
exports.updateProfile = (req, res) => {
  try {
    const userId = req.user.userId;
    const { full_name, phone } = req.body;

    // Validation
    if (!full_name) {
      return res.status(400).json({
        success: false,
        message: 'Full name is required'
      });
    }

    // Update user
    runQuery(
      'UPDATE users SET full_name = ?, phone = ? WHERE id = ?',
      [full_name, phone || null, userId]
    );

    saveDatabase();

    // Get updated user
    const updatedUser = getOne(
      'SELECT id, full_name, email, phone, created_at FROM users WHERE id = ?',
      [userId]
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating profile',
      error: error.message
    });
  }
};