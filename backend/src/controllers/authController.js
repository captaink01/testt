// src/controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { runQuery, getOne, saveDatabase } = require('../config/database');

// Register new user
exports.register = async (req, res) => {
  try {
    const { full_name, email, reg_number, password, phone, role } = req.body;

    // Validation
    if (!full_name || !password || (!email && !reg_number)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, password, and either email or registration number'
      });
    }

    // Email validation if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email address'
        });
      }
    }

    // Reg number validation if provided
    if (reg_number) {
      const regRegex = /^[A-Z]{3}\/\d{2}\/[A-Z]{3}\/\d{5}$/;
      if (!regRegex.test(reg_number)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid registration number format. Expected format: CST/21/SWE/00674'
        });
      }
    }

    // Password length check
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists
    if (email) {
      const existingUser = getOne('SELECT * FROM users WHERE email = ?', [email]);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }
    }

    if (reg_number) {
      const existingUser = getOne('SELECT * FROM users WHERE reg_number = ?', [reg_number]);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this registration number already exists'
        });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user into database
    const userRole = role || 'student_player';
    const result = runQuery(
      'INSERT INTO users (full_name, email, reg_number, password, phone, role) VALUES (?, ?, ?, ?, ?, ?)',
      [full_name, email || null, reg_number || null, hashedPassword, phone || null, userRole]
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create user account'
      });
    }

    // Get the newly created user
    const newUser = reg_number
      ? getOne('SELECT id, full_name, email, reg_number, role, phone, created_at FROM users WHERE reg_number = ?', [reg_number])
      : getOne('SELECT id, full_name, email, reg_number, role, phone, created_at FROM users WHERE email = ?', [email]);

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, reg_number: newUser.reg_number, role: newUser.role },
      process.env.JWT_SECRET || 'fallback_secret_key_12345',
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

// Create a new admin user (Protected: Admin only)
exports.createAdmin = async (req, res) => {
  try {
    const { full_name, email, password } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, email, and password'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    const existingUser = getOne('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = runQuery(
      'INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)',
      [full_name, email, hashedPassword, 'admin']
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create admin account'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Admin account created successfully'
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

// Login user
exports.login = async (req, res) => {
  try {
    const { email, reg_number, identifier, password } = req.body;

    // Support both direct email/reg_number or a generic identifier
    const loginId = identifier || email || reg_number;

    // Validation
    if (!loginId || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email/registration number and password'
      });
    }

    // Find user by email or reg_number
    const user = getOne('SELECT * FROM users WHERE email = ? OR reg_number = ?', [loginId, loginId]);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, reg_number: user.reg_number, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret_key_12345',
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
      'SELECT id, full_name, email, reg_number, role, phone, created_at FROM users WHERE id = ?',
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

// Need to import getQuery function
const { getQuery } = require('../config/database');