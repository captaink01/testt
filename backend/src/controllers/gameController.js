// src/controllers/gameController.js
const { runQuery, getQuery, getOne, saveDatabase } = require('../config/database');

// Create new game
exports.createGame = (req, res) => {
  try {
    const userId = req.user.userId;
    const { sport_id, title, description, location, date, time, players_needed } = req.body;

    // Validation
    if (!sport_id || !title || !location || !date || !time || !players_needed) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Insert game
    const result = runQuery(
      `INSERT INTO games (creator_id, sport_id, title, description, location, date, time, players_needed, current_players, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 'open')`,
      [userId, sport_id, title, description || '', location, date, time, players_needed]
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create game'
      });
    }

    // Get the newly created game
    const games = getQuery('SELECT * FROM games ORDER BY id DESC LIMIT 1');
    const newGame = games[0];

    res.status(201).json({
      success: true,
      message: 'Game created successfully',
      game: newGame
    });

  } catch (error) {
    console.error('Create game error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating game',
      error: error.message
    });
  }
};

// Get all games
exports.getAllGames = (req, res) => {
  try {
    const { sport_id, status } = req.query;

    let sql = `
      SELECT g.*, 
             u.full_name as creator_name,
             s.name as sport_name,
             s.icon as sport_icon
      FROM games g
      INNER JOIN users u ON g.creator_id = u.id
      INNER JOIN sports s ON g.sport_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (sport_id) {
      sql += ' AND g.sport_id = ?';
      params.push(sport_id);
    }

    if (status) {
      sql += ' AND g.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY g.created_at DESC';

    const games = getQuery(sql, params);

    res.status(200).json({
      success: true,
      count: games.length,
      games
    });

  } catch (error) {
    console.error('Get games error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching games',
      error: error.message
    });
  }
};

// Get single game by ID
exports.getGameById = (req, res) => {
  try {
    const { id } = req.params;

    const game = getOne(
      `SELECT g.*, 
              u.full_name as creator_name,
              u.email as creator_email,
              s.name as sport_name,
              s.icon as sport_icon
       FROM games g
       INNER JOIN users u ON g.creator_id = u.id
       INNER JOIN sports s ON g.sport_id = s.id
       WHERE g.id = ?`,
      [id]
    );

    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }

    // Get participants
    const participants = getQuery(
      `SELECT u.id, u.full_name, u.email, gp.joined_at
       FROM game_participants gp
       INNER JOIN users u ON gp.user_id = u.id
       WHERE gp.game_id = ?
       ORDER BY gp.joined_at`,
      [id]
    );

    res.status(200).json({
      success: true,
      game: {
        ...game,
        participants
      }
    });

  } catch (error) {
    console.error('Get game error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching game',
      error: error.message
    });
  }
};

// Update game
exports.updateGame = (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { title, description, location, date, time, players_needed, status } = req.body;

    // Check if game exists and user is creator
    const game = getOne('SELECT * FROM games WHERE id = ?', [id]);

    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }

    if (game.creator_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this game'
      });
    }

    // Update game
    runQuery(
      `UPDATE games 
       SET title = ?, description = ?, location = ?, date = ?, time = ?, players_needed = ?, status = ?
       WHERE id = ?`,
      [
        title || game.title,
        description !== undefined ? description : game.description,
        location || game.location,
        date || game.date,
        time || game.time,
        players_needed || game.players_needed,
        status || game.status,
        id
      ]
    );

    saveDatabase();

    // Get updated game
    const updatedGame = getOne('SELECT * FROM games WHERE id = ?', [id]);

    res.status(200).json({
      success: true,
      message: 'Game updated successfully',
      game: updatedGame
    });

  } catch (error) {
    console.error('Update game error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating game',
      error: error.message
    });
  }
};

// Delete game
exports.deleteGame = (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    // Check if game exists and user is creator
    const game = getOne('SELECT * FROM games WHERE id = ?', [id]);

    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }

    if (game.creator_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this game'
      });
    }

    // Delete game (participants will be deleted automatically due to CASCADE)
    runQuery('DELETE FROM games WHERE id = ?', [id]);
    saveDatabase();

    res.status(200).json({
      success: true,
      message: 'Game deleted successfully'
    });

  } catch (error) {
    console.error('Delete game error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting game',
      error: error.message
    });
  }
};

// Join game
exports.joinGame = (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    // Check if game exists
    const game = getOne('SELECT * FROM games WHERE id = ?', [id]);

    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }

    // Check if game is open
    if (game.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'This game is not accepting new players'
      });
    }

    // Check if already joined
    const alreadyJoined = getOne(
      'SELECT * FROM game_participants WHERE game_id = ? AND user_id = ?',
      [id, userId]
    );

    if (alreadyJoined) {
      return res.status(400).json({
        success: false,
        message: 'You have already joined this game'
      });
    }

    // Check if game is full
    if (game.current_players >= game.players_needed) {
      return res.status(400).json({
        success: false,
        message: 'This game is already full'
      });
    }

    // Add participant
    runQuery(
      'INSERT INTO game_participants (game_id, user_id) VALUES (?, ?)',
      [id, userId]
    );

    // Update current players count
    runQuery(
      'UPDATE games SET current_players = current_players + 1 WHERE id = ?',
      [id]
    );

    saveDatabase();

    res.status(200).json({
      success: true,
      message: 'Successfully joined the game'
    });

  } catch (error) {
    console.error('Join game error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error joining game',
      error: error.message
    });
  }
};

// Leave game
exports.leaveGame = (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    // Check if user is a participant
    const participant = getOne(
      'SELECT * FROM game_participants WHERE game_id = ? AND user_id = ?',
      [id, userId]
    );

    if (!participant) {
      return res.status(400).json({
        success: false,
        message: 'You are not a participant in this game'
      });
    }

    // Remove participant
    runQuery(
      'DELETE FROM game_participants WHERE game_id = ? AND user_id = ?',
      [id, userId]
    );

    // Update current players count
    runQuery(
      'UPDATE games SET current_players = current_players - 1 WHERE id = ?',
      [id]
    );

    saveDatabase();

    res.status(200).json({
      success: true,
      message: 'Successfully left the game'
    });

  } catch (error) {
    console.error('Leave game error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error leaving game',
      error: error.message
    });
  }
};

// Get my games (created by user)
exports.getMyGames = (req, res) => {
  try {
    const userId = req.user.userId;

    const games = getQuery(
      `SELECT g.*, 
              s.name as sport_name,
              s.icon as sport_icon
       FROM games g
       INNER JOIN sports s ON g.sport_id = s.id
       WHERE g.creator_id = ?
       ORDER BY g.created_at DESC`,
      [userId]
    );

    res.status(200).json({
      success: true,
      count: games.length,
      games
    });

  } catch (error) {
    console.error('Get my games error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching your games',
      error: error.message
    });
  }
};

// Get games user has joined
exports.getJoinedGames = (req, res) => {
  try {
    const userId = req.user.userId;

    const games = getQuery(
      `SELECT g.*, 
              u.full_name as creator_name,
              s.name as sport_name,
              s.icon as sport_icon,
              gp.joined_at
       FROM game_participants gp
       INNER JOIN games g ON gp.game_id = g.id
       INNER JOIN users u ON g.creator_id = u.id
       INNER JOIN sports s ON g.sport_id = s.id
       WHERE gp.user_id = ?
       ORDER BY gp.joined_at DESC`,
      [userId]
    );

    res.status(200).json({
      success: true,
      count: games.length,
      games
    });

  } catch (error) {
    console.error('Get joined games error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching joined games',
      error: error.message
    });
  }
};