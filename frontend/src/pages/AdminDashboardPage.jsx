// src/pages/AdminDashboardPage.jsx
import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminDashboardPage = () => {
    const { user, logout, isAdmin } = useContext(AuthContext);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [games, setGames] = useState([]);
    const [conflicts, setConflicts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (!isAdmin()) {
            navigate('/dashboard');
        }
    }, [user]);

    useEffect(() => {
        if (activeTab === 'users') {
            fetchUsers();
        } else if (activeTab === 'games') {
            fetchGames();
        } else if (activeTab === 'conflicts') {
            fetchConflicts();
        }
    }, [activeTab]);

    const getToken = () => localStorage.getItem('token');

    const showSuccess = (msg) => {
        setSuccessMessage(msg);
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const showError = (msg) => {
        setErrorMessage(msg);
        setTimeout(() => setErrorMessage(''), 3000);
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/admin/users`, {
                headers: { Authorization: `Bearer ${getToken()}` }
            });
            setUsers(response.data.users);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
        setLoading(false);
    };

    const fetchGames = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/admin/games`, {
                headers: { Authorization: `Bearer ${getToken()}` }
            });
            setGames(response.data.games);
        } catch (error) {
            console.error('Error fetching games:', error);
        }
        setLoading(false);
    };

    const fetchConflicts = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/admin/games/conflicts`, {
                headers: { Authorization: `Bearer ${getToken()}` }
            });
            setConflicts(response.data.conflicts);
        } catch (error) {
            console.error('Error fetching conflicts:', error);
        }
        setLoading(false);
    };

    const toggleSuspendUser = async (userId, suspend) => {
        try {
            await axios.put(`${API_URL}/admin/users/${userId}/suspend`,
                { suspend },
                { headers: { Authorization: `Bearer ${getToken()}` } }
            );
            showSuccess(suspend ? 'User suspended successfully' : 'User unsuspended successfully');
            fetchUsers();
        } catch (error) {
            console.error('Error suspending user:', error);
            showError('Failed to update user status');
        }
    };

    const approveGame = async (gameId) => {
        try {
            await axios.put(`${API_URL}/admin/games/${gameId}/approve`, {},
                { headers: { Authorization: `Bearer ${getToken()}` } }
            );
            showSuccess('Game approved successfully');
            fetchGames();
        } catch (error) {
            console.error('Error approving game:', error);
            showError('Failed to approve game');
        }
    };

    const rejectGame = async (gameId) => {
        try {
            await axios.put(`${API_URL}/admin/games/${gameId}/reject`, {},
                { headers: { Authorization: `Bearer ${getToken()}` } }
            );
            showSuccess('Game rejected successfully');
            fetchGames();
        } catch (error) {
            console.error('Error rejecting game:', error);
            showError('Failed to reject game');
        }
    };

    const deleteGame = async (gameId) => {
        if (!confirm('Are you sure you want to delete this game?')) return;

        try {
            await axios.delete(`${API_URL}/admin/games/${gameId}`,
                { headers: { Authorization: `Bearer ${getToken()}` } }
            );
            showSuccess('Game deleted successfully');
            fetchGames();
        } catch (error) {
            console.error('Error deleting game:', error);
            showError('Failed to delete game');
        }
    };

    const resolveConflict = async (approveGameId, rejectGameIds) => {
        try {
            await axios.post(`${API_URL}/admin/games/resolve-conflict`,
                { approveGameId, rejectGameIds },
                { headers: { Authorization: `Bearer ${getToken()}` } }
            );
            showSuccess('Conflict resolved successfully!');
            fetchConflicts();
        } catch (error) {
            console.error('Error resolving conflict:', error);
            showError('Failed to resolve conflict');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
            {/* Header */}
            <div className="bg-white/10 backdrop-blur-md border-b border-white/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-black text-white">Admin Dashboard</h1>
                            <p className="text-white/70 text-sm mt-1">Manage users, games, and conflicts</p>
                        </div>
                        <button
                            onClick={logout}
                            className="px-6 py-2 bg-red-500/80 hover:bg-red-600 text-white rounded-xl font-semibold transition-all duration-300"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

                {/* Messages */}
                {successMessage && (
                    <div className="mb-6 p-4 bg-green-500/20 backdrop-blur border border-green-500/50 text-green-200 rounded-2xl text-center font-bold text-lg animate-pulse">
                        {successMessage}
                    </div>
                )}
                {errorMessage && (
                    <div className="mb-6 p-4 bg-red-500/20 backdrop-blur border border-red-500/50 text-red-200 rounded-2xl text-center font-bold text-lg animate-pulse">
                        {errorMessage}
                    </div>
                )}

                <div className="flex gap-4 mb-6">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${activeTab === 'users'
                            ? 'bg-blue-500 text-white shadow-lg'
                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                            }`}
                    >
                        Users
                    </button>
                    <button
                        onClick={() => setActiveTab('games')}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${activeTab === 'games'
                            ? 'bg-blue-500 text-white shadow-lg'
                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                            }`}
                    >
                        Games
                    </button>
                    <button
                        onClick={() => setActiveTab('conflicts')}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${activeTab === 'conflicts'
                            ? 'bg-blue-500 text-white shadow-lg'
                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                            }`}
                    >
                        Conflicts {conflicts.length > 0 && `(${conflicts.length})`}
                    </button>
                </div>

                {/* Content */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">
                    {loading ? (
                        <div className="text-center py-12 text-white">Loading...</div>
                    ) : (
                        <>
                            {/* Users Tab */}
                            {activeTab === 'users' && (
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-4">User Management</h2>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-white">
                                            <thead>
                                                <tr className="border-b border-white/20">
                                                    <th className="text-left py-3 px-4">Name</th>
                                                    <th className="text-left py-3 px-4">Reg Number</th>
                                                    <th className="text-left py-3 px-4">Role</th>
                                                    <th className="text-left py-3 px-4">Sports</th>
                                                    <th className="text-left py-3 px-4">Status</th>
                                                    <th className="text-left py-3 px-4">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {users.map((user) => (
                                                    <tr key={user.id} className="border-b border-white/10 hover:bg-white/5">
                                                        <td className="py-3 px-4">{user.full_name}</td>
                                                        <td className="py-3 px-4">{user.registration_number}</td>
                                                        <td className="py-3 px-4">
                                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${user.role === 'organizer' ? 'bg-purple-500/30 text-purple-200' : 'bg-blue-500/30 text-blue-200'
                                                                }`}>
                                                                {user.role}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            {user.sports?.map(s => s.icon).join(' ') || 'None'}
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${user.is_suspended ? 'bg-red-500/30 text-red-200' : 'bg-green-500/30 text-green-200'
                                                                }`}>
                                                                {user.is_suspended ? 'Suspended' : 'Active'}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <button
                                                                onClick={() => toggleSuspendUser(user.id, !user.is_suspended)}
                                                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${user.is_suspended
                                                                    ? 'bg-green-500/80 hover:bg-green-600 text-white'
                                                                    : 'bg-red-500/80 hover:bg-red-600 text-white'
                                                                    }`}
                                                            >
                                                                {user.is_suspended ? 'Unsuspend' : 'Suspend'}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Games Tab */}
                            {activeTab === 'games' && (
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-4">Game Management</h2>
                                    <div className="space-y-4">
                                        {games.map((game) => (
                                            <div key={game.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <h3 className="text-xl font-bold text-white">{game.title}</h3>
                                                        <p className="text-white/70 text-sm mt-1">{game.description}</p>
                                                        <div className="flex gap-4 mt-3 text-sm text-white/80">
                                                            <span>🏀 {game.sport_name}</span>
                                                            <span>📍 {game.location}</span>
                                                            <span>📅 {game.date}</span>
                                                            <span>⏰ {game.time}</span>
                                                            <span>👤 {game.creator_name}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col gap-2 ml-4">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold text-center ${game.approval_status === 'approved' ? 'bg-green-500/30 text-green-200' :
                                                            game.approval_status === 'rejected' ? 'bg-red-500/30 text-red-200' :
                                                                'bg-yellow-500/30 text-yellow-200'
                                                            }`}>
                                                            {game.approval_status}
                                                        </span>
                                                        {game.approval_status === 'pending' && (
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => approveGame(game.id)}
                                                                    className="px-4 py-2 bg-green-500/80 hover:bg-green-600 text-white rounded-lg text-sm font-semibold transition-all"
                                                                >
                                                                    Approve
                                                                </button>
                                                                <button
                                                                    onClick={() => rejectGame(game.id)}
                                                                    className="px-4 py-2 bg-red-500/80 hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition-all"
                                                                >
                                                                    Reject
                                                                </button>
                                                            </div>
                                                        )}
                                                        <button
                                                            onClick={() => deleteGame(game.id)}
                                                            className="px-4 py-2 bg-red-700/80 hover:bg-red-800 text-white rounded-lg text-sm font-semibold transition-all"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Conflicts Tab */}
                            {activeTab === 'conflicts' && (
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-4">Conflicting Games</h2>
                                    {conflicts.length === 0 ? (
                                        <p className="text-white/70 text-center py-8">No conflicts detected</p>
                                    ) : (
                                        <div className="space-y-6">
                                            {conflicts.map((conflict, idx) => (
                                                <div key={idx} className="bg-red-500/10 rounded-xl p-4 border border-red-500/30">
                                                    <h3 className="text-lg font-bold text-red-200 mb-3">
                                                        Conflict: {conflict.date} at {conflict.time} - {conflict.location}
                                                    </h3>
                                                    <div className="space-y-2">
                                                        {conflict.games.map((game) => (
                                                            <div key={game.id} className="bg-white/5 rounded-lg p-3 flex justify-between items-center">
                                                                <div>
                                                                    <p className="text-white font-semibold">{game.title} - {game.sport_name}</p>
                                                                    <p className="text-white/70 text-sm">By {game.creator_name}</p>
                                                                </div>
                                                                <button
                                                                    onClick={() => {
                                                                        const otherGameIds = conflict.games
                                                                            .filter(g => g.id !== game.id)
                                                                            .map(g => g.id);
                                                                        resolveConflict(game.id, otherGameIds);
                                                                    }}
                                                                    className="px-4 py-2 bg-green-500/80 hover:bg-green-600 text-white rounded-lg text-sm font-semibold transition-all"
                                                                >
                                                                    Approve This
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;
