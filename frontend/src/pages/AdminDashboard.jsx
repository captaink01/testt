import { useState, useEffect } from 'react';
import { gamesAPI } from '../services/api';
import Navbar from '../components/NavBar';

const AdminDashboard = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [conflicts, setConflicts] = useState([]);

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      setLoading(true);
      const response = await gamesAPI.getAllGames({ admin_status: 'pending' });
      const pendingGames = response.data.games;
      setGames(pendingGames);
      detectConflicts(pendingGames);
    } catch (err) {
      setError('Failed to fetch pending games');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const detectConflicts = (allPending) => {
    const conflictMap = {};
    allPending.forEach(game => {
      const key = `${game.location}_${game.date}_${game.time}`;
      if (!conflictMap[key]) conflictMap[key] = [];
      conflictMap[key].push(game.id);
    });

    const conflictIds = Object.values(conflictMap)
      .filter(ids => ids.length > 1)
      .flat();

    setConflicts(conflictIds);
  };

  const handleStatusUpdate = async (gameId, status) => {
    try {
      await gamesAPI.updateGameStatus(gameId, status);
      setGames(games.filter(g => g.id !== gameId));
      // Re-detect conflicts after removal
      detectConflicts(games.filter(g => g.id !== gameId));
    } catch (err) {
      alert('Failed to update game status');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900">
      <Navbar />
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-black text-white mb-2">Admin Control Center</h1>
          <p className="text-blue-200 text-lg">Regulate and approve campus sports activities</p>
        </header>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
          </div>
        ) : error ? (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-6 rounded-2xl text-center">
            {error}
          </div>
        ) : (
          <div className="grid gap-8">
            <section className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl overflow-hidden shadow-2xl">
              <div className="px-8 py-6 border-b border-white/10 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Pending Approvals</h2>
                <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                  {games.length} Games
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white/5 text-blue-200 text-sm uppercase tracking-wider">
                    <tr>
                      <th className="px-8 py-4">Sport & Title</th>
                      <th className="px-8 py-4">Creator</th>
                      <th className="px-8 py-4">Location & Time</th>
                      <th className="px-8 py-4">Status/Conflicts</th>
                      <th className="px-8 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {games.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-8 py-12 text-center text-white/50 text-lg">
                          No pending games to review.
                        </td>
                      </tr>
                    ) : (
                      games.map(game => (
                        <tr key={game.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <span className="text-3xl">{game.sport_icon}</span>
                              <div>
                                <div className="font-bold text-white text-lg">{game.title}</div>
                                <div className="text-blue-300 text-sm">{game.sport_name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="text-white font-medium">{game.creator_name}</div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="text-white">{game.location}</div>
                            <div className="text-blue-300 text-sm">{game.date} @ {game.time}</div>
                          </td>
                          <td className="px-8 py-6">
                            {conflicts.includes(game.id) ? (
                              <span className="flex items-center gap-2 text-amber-400 font-bold bg-amber-400/10 px-3 py-1 rounded-lg border border-amber-400/30">
                                ⚠️ Scheduling Conflict
                              </span>
                            ) : (
                              <span className="text-green-400 font-medium">Clear</span>
                            )}
                          </td>
                          <td className="px-8 py-6 text-right">
                            <div className="flex justify-end gap-3">
                              <button
                                onClick={() => handleStatusUpdate(game.id, 'approved')}
                                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl font-bold transition-all transform hover:scale-105"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(game.id, 'rejected')}
                                className="bg-red-500/20 hover:bg-red-500 text-red-200 hover:text-white px-4 py-2 rounded-xl font-bold border border-red-500/50 transition-all"
                              >
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;