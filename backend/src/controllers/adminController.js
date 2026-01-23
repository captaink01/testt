// src/controllers/adminController.js
const { runQuery, getQuery, getOne, saveDatabase } = require('../config/database');

// Get all users with their sport preferences
exports.getAllUsers = (req, res) => {
    try {
        const users = getQuery(`
      SELECT id, full_name, email, registration_number, phone, role, is_suspended, created_at 
      FROM users 
      WHERE role != 'admin'
      ORDER BY created_at DESC
    `);

        // Get sport preferences for each user
        const usersWithSports = users.map(user => {
            const sports = getQuery(
                `SELECT s.id, s.name, s.icon 
         FROM sports s
         INNER JOIN user_sports us ON s.id = us.sport_id
         WHERE us.user_id = ?`,
                [user.id]
            );
            return { ...user, sports };
        });

        res.status(200).json({
            success: true,
            count: usersWithSports.length,
            users: usersWithSports
        });

    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching users',
            error: error.message
        });
    }
};

// Suspend or unsuspend a user
exports.toggleSuspendUser = (req, res) => {
    try {
        const { id } = req.params;
        const { suspend } = req.body; // true to suspend, false to unsuspend

        const user = getOne('SELECT * FROM users WHERE id = ?', [id]);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.role === 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Cannot suspend admin users'
            });
        }

        runQuery(
            'UPDATE users SET is_suspended = ? WHERE id = ?',
            [suspend ? 1 : 0, id]
        );

        saveDatabase();

        res.status(200).json({
            success: true,
            message: suspend ? 'User suspended successfully' : 'User unsuspended successfully'
        });

    } catch (error) {
        console.error('Toggle suspend user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error updating user status',
            error: error.message
        });
    }
};

// Get all games (including pending, approved, rejected)
exports.getAllGames = (req, res) => {
    try {
        const { approval_status } = req.query;

        let sql = `
      SELECT g.*, 
             u.full_name as creator_name,
             u.registration_number as creator_reg_number,
             s.name as sport_name,
             s.icon as sport_icon,
             reviewer.full_name as reviewer_name
      FROM games g
      INNER JOIN users u ON g.creator_id = u.id
      INNER JOIN sports s ON g.sport_id = s.id
      LEFT JOIN users reviewer ON g.reviewed_by = reviewer.id
      WHERE 1=1
    `;
        const params = [];

        if (approval_status) {
            sql += ' AND g.approval_status = ?';
            params.push(approval_status);
        }

        sql += ' ORDER BY g.created_at DESC';

        const games = getQuery(sql, params);

        res.status(200).json({
            success: true,
            count: games.length,
            games
        });

    } catch (error) {
        console.error('Get all games error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching games',
            error: error.message
        });
    }
};

// Approve a game
exports.approveGame = (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.user.userId;

        const game = getOne('SELECT * FROM games WHERE id = ?', [id]);

        if (!game) {
            return res.status(404).json({
                success: false,
                message: 'Game not found'
            });
        }

        runQuery(
            `UPDATE games 
       SET approval_status = 'approved', reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
            [adminId, id]
        );

        saveDatabase();

        res.status(200).json({
            success: true,
            message: 'Game approved successfully'
        });

    } catch (error) {
        console.error('Approve game error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error approving game',
            error: error.message
        });
    }
};

// Reject a game
exports.rejectGame = (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.user.userId;

        const game = getOne('SELECT * FROM games WHERE id = ?', [id]);

        if (!game) {
            return res.status(404).json({
                success: false,
                message: 'Game not found'
            });
        }

        runQuery(
            `UPDATE games 
       SET approval_status = 'rejected', reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
            [adminId, id]
        );

        saveDatabase();

        res.status(200).json({
            success: true,
            message: 'Game rejected successfully'
        });

    } catch (error) {
        console.error('Reject game error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error rejecting game',
            error: error.message
        });
    }
};

// Delete a game (remove inappropriate content)
exports.deleteGame = (req, res) => {
    try {
        const { id } = req.params;

        const game = getOne('SELECT * FROM games WHERE id = ?', [id]);

        if (!game) {
            return res.status(404).json({
                success: false,
                message: 'Game not found'
            });
        }

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

// Detect conflicting games (same date, time, and location)
exports.getConflictingGames = (req, res) => {
    try {
        // Get all pending games grouped by date, time, and location
        const conflicts = getQuery(`
      SELECT 
        g.date,
        g.time,
        g.location,
        COUNT(*) as conflict_count
      FROM games g
      WHERE g.approval_status = 'pending'
      GROUP BY g.date, g.time, g.location
      HAVING COUNT(*) > 1
    `);

        // For each conflict, get the actual games
        const conflictDetails = conflicts.map(conflict => {
            const games = getQuery(
                `SELECT g.*, 
                u.full_name as creator_name,
                u.registration_number as creator_reg_number,
                s.name as sport_name,
                s.icon as sport_icon
         FROM games g
         INNER JOIN users u ON g.creator_id = u.id
         INNER JOIN sports s ON g.sport_id = s.id
         WHERE g.date = ? AND g.time = ? AND g.location = ? AND g.approval_status = 'pending'
         ORDER BY g.created_at`,
                [conflict.date, conflict.time, conflict.location]
            );

            return {
                date: conflict.date,
                time: conflict.time,
                location: conflict.location,
                games
            };
        });

        res.status(200).json({
            success: true,
            count: conflictDetails.length,
            conflicts: conflictDetails
        });

    } catch (error) {
        console.error('Get conflicting games error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error detecting conflicts',
            error: error.message
        });
    }
};

// Resolve conflict by approving one game and rejecting others
exports.resolveConflict = (req, res) => {
    try {
        const { approveGameId, rejectGameIds } = req.body;
        const adminId = req.user.userId;

        if (!approveGameId || !rejectGameIds || !Array.isArray(rejectGameIds)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide approveGameId and rejectGameIds array'
            });
        }

        // Approve the selected game
        runQuery(
            `UPDATE games 
       SET approval_status = 'approved', reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
            [adminId, approveGameId]
        );

        // Reject the other games
        rejectGameIds.forEach(gameId => {
            runQuery(
                `UPDATE games 
         SET approval_status = 'rejected', reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
                [adminId, gameId]
            );
        });

        saveDatabase();

        res.status(200).json({
            success: true,
            message: 'Conflict resolved successfully'
        });

    } catch (error) {
        console.error('Resolve conflict error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error resolving conflict',
            error: error.message
        });
    }
};
