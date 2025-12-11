// src/controllers/locationController.js
const { getQuery, getOne } = require('../config/database');

// Get all locations
exports.getAllLocations = (req, res) => {
  try {
    const locations = getQuery('SELECT * FROM locations ORDER BY name');

    res.status(200).json({
      success: true,
      count: locations.length,
      locations
    });

  } catch (error) {
    console.error('Get locations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching locations',
      error: error.message
    });
  }
};

// Get single location by ID
exports.getLocationById = (req, res) => {
  try {
    const { id } = req.params;

    const location = getOne('SELECT * FROM locations WHERE id = ?', [id]);

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }

    res.status(200).json({
      success: true,
      location
    });

  } catch (error) {
    console.error('Get location error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching location',
      error: error.message
    });
  }
};