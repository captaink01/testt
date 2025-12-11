// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { initDatabase } = require('./src/config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ 
    message: 'Campus Sports Connect API',
    status: 'running',
    version: '1.0.0'
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const gameRoutes = require('./src/routes/gameRoutes');
const locationRoutes = require('./src/routes/locationRoutes');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/locations', locationRoutes);

// Initialize database and start server
async function startServer() {
  try {
    // Initialize database first
    await initDatabase();
    console.log('✅ Database initialized successfully');
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 API Health: http://localhost:${PORT}/api/health`);
      console.log(`🔐 Auth endpoints:`);
      console.log(`   - POST http://localhost:${PORT}/api/auth/register`);
      console.log(`   - POST http://localhost:${PORT}/api/auth/login`);
      console.log(`   - GET  http://localhost:${PORT}/api/auth/profile`);
      console.log(`👤 User endpoints:`);
      console.log(`   - GET  http://localhost:${PORT}/api/users/sports`);
      console.log(`   - GET  http://localhost:${PORT}/api/users/my-sports`);
      console.log(`   - PUT  http://localhost:${PORT}/api/users/sports-preferences`);
      console.log(`   - PUT  http://localhost:${PORT}/api/users/profile`);
         console.log(`🎮 Game endpoints:`);
      console.log(`   - GET  http://localhost:${PORT}/api/games`);
      console.log(`   - POST http://localhost:${PORT}/api/games`);
      console.log(`   - GET  http://localhost:${PORT}/api/games/:id`);
      console.log(`   - PUT  http://localhost:${PORT}/api/games/:id`);
      console.log(`   - POST http://localhost:${PORT}/api/games/:id/join`);
      console.log(`   - POST http://localhost:${PORT}/api/games/:id/leave`);
      console.log(`   - GET  http://localhost:${PORT}/api/games/my/created`);
      console.log(`   - GET  http://localhost:${PORT}/api/games/my/joined`);
      console.log(`📍 Location endpoints:`);
      console.log(`   - GET  http://localhost:${PORT}/api/locations`);
      console.log(`   - GET  http://localhost:${PORT}/api/locations/:id`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;