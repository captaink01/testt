// src/routes/locationRoutes.js
const express = require('express');
const router = express.Router();
const { getAllLocations, getLocationById } = require('../controllers/locationController');

// Public routes
router.get('/', getAllLocations);
router.get('/:id', getLocationById);

module.exports = router;