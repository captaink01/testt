// src/pages/MyGamesPage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { gamesAPI } from '../services/api';
import Navbar from '../components/NavBar';

const MyGamesPage = () => {
  const [myGames, setMyGames] = useState([]);
  const [joinedGames, setJoinedGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('created'); // 'created' or 'joined'

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    setLoading(true);
    try {
      const [createdRes, joinedRes] = await Promise.all([
        gamesAPI.getMyGames(),
        gamesAPI.getJoinedGames()
      ]);
      setMyGames(createdRes.data.games);
      setJoinedGames(joinedRes.data.games);
    } catch (error) {
      console.error('Failed to fetch games:', error);
    }
    setLoading(false);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const displayGames = activeTab === 'created' ? myGames : joinedGames;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 pt-24 pb-16">
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-12">My Games</h1>

        {/* Tabs */}
        <div className="bg-white/25 backdrop-blur-3xl border border-white/40 rounded-3xl shadow-2xl ring-1 ring-white/20 mb-6 transition-all duration-500">
          <div className="flex border-b border-white/30">
            <button
              onClick={() => setActiveTab('created')}
              className={`flex-1 px-6 py-4 font-bold text-lg ${
                activeTab === 'created'
                  ? 'text-white border-b-2 border-white'
                  : 'text-white/70 hover:text-white'
              } transition-all duration-300`}
            >
              Created by Me ({myGames.length})
            </button>
            <button
              onClick={() => setActiveTab('joined')}
              className={`flex-1 px-6 py-4 font-bold text-lg ${
                activeTab === 'joined'
                  ? 'text-white border-b-2 border-white'
                  : 'text-white/70 hover:text-white'
              } transition-all duration-300`}
            >
              Joined ({joinedGames.length})
            </button>
          </div>
        </div>

        {/* Games List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-white/80 text-lg animate-pulse">Loading games...</p>
          </div>
        ) : displayGames.length === 0 ? (
          <div className="bg-white/25 backdrop-blur-3xl border border-white/40 rounded-3xl shadow-2xl ring-1 ring-white/20 p-12 text-center transition-all duration-500">
            <p className="text-white/80 text-xl mb-6">
              {activeTab === 'created' 
                ? 'You haven\'t created any games yet'
                : 'You haven\'t joined any games yet'
              }
            </p>
            <Link
              to={activeTab === 'created' ? '/create-game' : '/games'}
              className="inline-block px-8 py-4 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 text-white font-bold rounded-2xl shadow-2xl hover:shadow-3xl hover:shadow-blue-500/60 transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-blue-400/50 transition-all duration-300 text-xl tracking-wide"
            >
              {activeTab === 'created' ? 'Create a Game' : 'Browse Games'}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayGames.map(game => (
              <Link
                key={game.id}
                to={`/games/${game.id}`}
                className="bg-white/20 backdrop-blur-3xl border border-white/40 rounded-3xl shadow-2xl ring-1 ring-white/20 p-6 hover:shadow-3xl hover:shadow-white/20 transform hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-4xl">{game.sport_icon}</span>
                  <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                    game.status === 'open' 
                      ? 'bg-green-500/20 text-green-200 border border-green-400/50'
                      : 'bg-gray-500/20 text-gray-200 border border-gray-400/50'
                  } backdrop-blur`}>
                    {game.status === 'open' ? 'Open' : 'Closed'}
                  </span>
                </div>

                <h3 className="text-2xl font-black text-white mb-2">
                  {game.title}
                </h3>

                <p className="text-base text-white/80 mb-4">{game.sport_name}</p>

                <div className="space-y-3">
                  <div className="flex items-center text-base text-white/90">
                    <span className="font-bold mr-3">📍</span>
                    {game.location}
                  </div>
                  <div className="flex items-center text-base text-white/90">
                    <span className="font-bold mr-3">📅</span>
                    {formatDate(game.date)} at {game.time}
                  </div>
                  <div className="flex items-center text-base text-white/90">
                    <span className="font-bold mr-3">👥</span>
                    {game.current_players} / {game.players_needed} players
                  </div>
                </div>

                {activeTab === 'joined' && (
                  <div className="mt-4 pt-4 border-t border-white/30">
                    <p className="text-sm text-white/70">
                      Organized by <span className="font-bold">{game.creator_name}</span>
                    </p>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyGamesPage;