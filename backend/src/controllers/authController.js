// src/controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { runQuery, getOne, getQuery, saveDatabase } = require('../config/database');

// Register new user
exports.register = async (req, res) => {
  try {
    const { full_name, email, registration_number, password, phone, role } = req.body;

    // Validation
    if (!full_name || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name and password'
      });
    }

    // Role validation
    const validRoles = ['player', 'organizer'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be either "player" or "organizer"'
      });
    }

    // Students must provide registration number
    if (!registration_number) {
      return res.status(400).json({
        success: false,
        message: 'Please provide registration number'
      });
    }

    // Validate registration number format (CST/21/SWE/00674)
    const regNumberRegex = /^[A-Z]{3}\/\d{2}\/[A-Z]{3}\/\d{5}$/;
    if (!regNumberRegex.test(registration_number)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid registration number format. Expected format: CST/21/SWE/00674'
      });
    }

    // Password length check
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if registration number already exists
    const existingUser = getOne('SELECT * FROM users WHERE registration_number = ?', [registration_number]);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this registration number already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user into database
    const result = runQuery(
      'INSERT INTO users (full_name, email, registration_number, password, phone, role) VALUES (?, ?, ?, ?, ?, ?)',
      [full_name, email || null, registration_number, hashedPassword, phone || null, role || 'player']
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create user account'
      });
    }

    // Get the newly created user
    const newUser = getOne('SELECT id, full_name, email, registration_number, phone, role, created_at FROM users WHERE registration_number = ?', [registration_number]);

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: newUser
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
};

// Login user (unified - supports registration number or email)
exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    // Validation
    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide registration number/email and password'
      });
    }

    // Detect if identifier is email or registration number
    const isEmail = identifier.includes('@');
    let user;

    if (isEmail) {
      // Admin login with email
      user = getOne('SELECT * FROM users WHERE email = ?', [identifier]);
    } else {
      // Student login with registration number
      user = getOne('SELECT * FROM users WHERE registration_number = ?', [identifier]);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is suspended
    if (user.is_suspended === 1) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact the administrator.'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
};

// Get current user profile
exports.getProfile = (req, res) => {
  try {
    const userId = req.user.userId;

    // Get user info
    const user = getOne(
      'SELECT id, full_name, email, registration_number, phone, role, is_suspended, created_at FROM users WHERE id = ?',
      [userId]
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's sports preferences
    const userSports = getQuery(
      `SELECT s.id, s.name, s.icon 
       FROM sports s
       INNER JOIN user_sports us ON s.id = us.sport_id
       WHERE us.user_id = ?`,
      [userId]
    );

    res.status(200).json({
      success: true,
      user: {
        ...user,
        sports: userSports
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching profile',
      error: error.message
    });
  }
};