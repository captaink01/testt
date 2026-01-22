// src/config/database.js
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../../campus_sports.db');
let db = null;

// Initialize database
async function initDatabase() {
  try {
    const SQL = await initSqlJs();
    
    // Check if database file exists
    if (fs.existsSync(dbPath)) {
      const buffer = fs.readFileSync(dbPath);
      db = new SQL.Database(buffer);
      console.log('✅ Connected to existing database');
    } else {
      db = new SQL.Database();
      console.log('✅ Created new database');
      createTables();
    }
    
    return db;
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
}

// Create all tables
async function createTables() {
  try {
    // Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        email TEXT UNIQUE,
        reg_number TEXT UNIQUE,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'student_player',
        phone TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table created');

    // Sports table
    db.run(`
      CREATE TABLE IF NOT EXISTS sports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        icon TEXT
      )
    `);
    console.log('✅ Sports table created');

    // User sports preferences
    db.run(`
      CREATE TABLE IF NOT EXISTS user_sports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        sport_id INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (sport_id) REFERENCES sports(id) ON DELETE CASCADE,
        UNIQUE(user_id, sport_id)
      )
    `);
    console.log('✅ User sports table created');

    // Games table
    db.run(`
      CREATE TABLE IF NOT EXISTS games (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        creator_id INTEGER NOT NULL,
        sport_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        location TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        players_needed INTEGER NOT NULL,
        current_players INTEGER DEFAULT 0,
        status TEXT DEFAULT 'open',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (sport_id) REFERENCES sports(id)
      )
    `);
    console.log('✅ Games table created');

    // Game participants
    db.run(`
      CREATE TABLE IF NOT EXISTS game_participants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        game_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(game_id, user_id)
      )
    `);
    console.log('✅ Game participants table created');

    // Locations table
    db.run(`
      CREATE TABLE IF NOT EXISTS locations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        address TEXT,
        facilities TEXT,
        available_sports TEXT
      )
    `);
    console.log('✅ Locations table created');

    // Seed initial data
    await seedInitialData();
    
    // Save database to file
    saveDatabase();
  } catch (error) {
    console.error('❌ Error creating tables:', error);
  }
}

// Seed initial sports data
async function seedInitialData() {
  const bcrypt = require('bcrypt');

  // Seed admin user
  try {
    const adminPassword = 'adminpassword123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    db.run(
      'INSERT OR IGNORE INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)',
      ['System Admin', 'admin@buk.edu.ng', hashedPassword, 'admin']
    );
    console.log('✅ Admin user seeded (admin@buk.edu.ng / adminpassword123)');
  } catch (err) {
    console.error('Error seeding admin:', err);
  }

  const sports = [
    { name: 'Football', icon: '⚽' },
    { name: 'Basketball', icon: '🏀' },
    { name: 'Volleyball', icon: '🏐' },
    { name: 'Tennis', icon: '🎾' },
    { name: 'Badminton', icon: '🏸' },
    { name: 'Table Tennis', icon: '🏓' }
  ];

  sports.forEach(sport => {
    try {
      db.run(
        'INSERT OR IGNORE INTO sports (name, icon) VALUES (?, ?)',
        [sport.name, sport.icon]
      );
    } catch (err) {
      // Ignore duplicates
    }
  });
  console.log('✅ Sports data seeded');

  // Seed BUK locations
  const locations = [
    {
      name: 'New Campus Stadium',
      description: 'Main football stadium',
      address: 'New Campus, BUK',
      facilities: 'Football field, changing rooms',
      available_sports: 'Football'
    },
    {
      name: 'Old Campus Basketball Court',
      description: 'Outdoor basketball court',
      address: 'Old Campus, BUK',
      facilities: 'Basketball court',
      available_sports: 'Basketball'
    },
    {
      name: 'Faculty of Science Sports Complex',
      description: 'Multi-purpose sports facility',
      address: 'Faculty of Science, BUK',
      facilities: 'Volleyball court, badminton',
      available_sports: 'Volleyball, Badminton, Tennis'
    },
    {
      name: 'Hostel E Recreation Ground',
      description: 'Open field for casual games',
      address: 'Hostel E Area, BUK',
      facilities: 'Open field',
      available_sports: 'Football, Volleyball'
    }
  ];

  locations.forEach(loc => {
    try {
      db.run(
        `INSERT OR IGNORE INTO locations (name, description, address, facilities, available_sports) 
         VALUES (?, ?, ?, ?, ?)`,
        [loc.name, loc.description, loc.address, loc.facilities, loc.available_sports]
      );
    } catch (err) {
      // Ignore duplicates
    }
  });
  console.log('✅ Locations data seeded');

  saveDatabase();
}

// Save database to file
function saveDatabase() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
    console.log('✅ Database saved to file');
  }
}

// Get database instance
function getDatabase() {
  return db;
}

// Run query
function runQuery(sql, params = []) {
  try {
    db.run(sql, params);
    saveDatabase();
    return { success: true };
  } catch (error) {
    console.error('Query error:', error);
    return { success: false, error: error.message };
  }
}

// Get query results
function getQuery(sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  } catch (error) {
    console.error('Query error:', error);
    return [];
  }
}

// Get single row
function getOne(sql, params = []) {
  const results = getQuery(sql, params);
  return results.length > 0 ? results[0] : null;
}

module.exports = {
  initDatabase,
  getDatabase,
  runQuery,
  getQuery,
  getOne,
  saveDatabase
};