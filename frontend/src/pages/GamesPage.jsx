// src/pages/GamesPage.jsx
import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { gamesAPI, userAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/NavBar';

const GamesPage = () => {
  const { user } = useContext(AuthContext);
  const [games, setGames] = useState([]);
  const [sports, setSports] = useState([]);
  const [selectedSport, setSelectedSport] = useState('');
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    fetchSports();
    fetchGames();
  }, [selectedSport]);

  const fetchSports = async () => {
    try {
      const response = await userAPI.getAllSports();
      setSports(response.data.sports);
    } catch (error) {
      console.error('Failed to fetch sports:', error);
    }
  };

  const fetchGames = async () => {
    setLoading(true);
    try {
      const params = selectedSport ? { sport_id: selectedSport } : {};
      const response = await gamesAPI.getAllGames(params);
      setGames(response.data.games);
    } catch (error) {
      console.error('Failed to fetch games:', error);
    }
    setLoading(false);
  };

  const selectedSportObj = sports.find(s => s.id === Number(selectedSport)) || null;

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    }) + ` · ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900">
      <Navbar />

      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
          <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight drop-shadow-2xl">
            Browse Games
          </h1>
          
          {(user?.role === 'student_creator' || user?.role === 'admin') && (
            <Link
              to="/create-game"
              className="bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 text-white font-bold py-5 px-10 rounded-2xl shadow-2xl hover:shadow-3xl hover:shadow-blue-500/60 transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-blue-400/50 transition-all duration-300 text-xl tracking-wide"
            >
              ➕ Create Game
            </Link>
          )}
        </div>

        {/* Custom Styled Sport Filter Dropdown */}
        <div className="relative max-w-md mb-12">
          <div className="text-xl font-bold text-white mb-4">Filter by Sport</div>
          
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full px-6 py-5 bg-white/20 border border-white/50 rounded-2xl text-white text-left flex items-center justify-between focus:outline-none focus:border-blue-400 focus:bg-white/30 focus:ring-4 focus:ring-blue-400/40 transition-all duration-300 backdrop-blur-sm shadow-inner text-lg font-medium hover:bg-white/25"
          >
            <span className="flex items-center gap-3">
              <span>{selectedSportObj ? selectedSportObj.icon : '🎽'}</span>
              <span>{selectedSportObj ? selectedSportObj.name : 'All Sports'}</span>
            </span>
            <svg className={`w-6 h-6 text-white/70 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {dropdownOpen && (
            <div className="absolute top-full mt-3 w-full bg-white/30 backdrop-blur-3xl border border-white/50 rounded-2xl shadow-2xl ring-1 ring-white/30 overflow-hidden z-50">
              <button
                onClick={() => {
                  setSelectedSport('');
                  setDropdownOpen(false);
                }}
                className="w-full px-6 py-5 text-left flex items-center gap-3 hover:bg-white/20 transition-all duration-300 text-white font-medium text-lg"
              >
                <span>🎽</span>
                <span>All Sports</span>
              </button>
              {sports.map(sport => (
                <button
                  key={sport.id}
                  onClick={() => {
                    setSelectedSport(sport.id);
                    setDropdownOpen(false);
                  }}
                  className="w-full px-6 py-5 text-left flex items-center gap-3 hover:bg-white/20 transition-all duration-300 text-white font-medium text-lg border-t border-white/20"
                >
                  <span>{sport.icon}</span>
                  <span>{sport.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Loading / Empty / Games Grid */}
        {loading ? (
          <div className="text-center py-32">
            <div className="text-white/80 text-2xl font-bold animate-pulse">
              Loading games...
            </div>
          </div>
        ) : games.length === 0 ? (
          <div className="bg-white/25 backdrop-blur-3xl border border-white/40 rounded-3xl shadow-2xl ring-1 ring-white/20 p-16 text-center transition-all duration-500">
            <div className="text-8xl mb-8">🏟️</div>
            <p className="text-3xl font-black text-white mb-6">
              No games found
            </p>
            <p className="text-xl text-white/80 font-medium mb-10 max-w-lg mx-auto">
              Be the first to organize a game on campus!
            </p>
            <Link
              to="/create-game"
              className="inline-block bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 text-white font-bold py-5 px-12 rounded-2xl shadow-2xl hover:shadow-3xl hover:shadow-blue-500/60 transform hover:-translate-y-1 transition-all duration-300 text-xl tracking-wide"
            >
              Create the First Game
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {games.map(game => {
              const displayedStatus = game.current_players >= game.players_needed ? 'closed' : game.status;
              return (
                <Link
                  key={game.id}
                  to={`/games/${game.id}`}
                  className="group bg-white/25 backdrop-blur-3xl border border-white/40 rounded-3xl shadow-2xl ring-1 ring-white/20 p-8 transition-all duration-500 hover:bg-white/35 hover:scale-[1.02] hover:shadow-3xl hover:ring-blue-400/60"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="text-6xl drop-shadow-2xl">
                      {game.sport_icon}
                    </div>
                    <span className={`px-5 py-2 rounded-full text-lg font-bold tracking-wide backdrop-blur-sm ${
                      displayedStatus === 'open' 
                        ? 'bg-green-500/30 text-green-200 border border-green-400/50' 
                        : 'bg-white/20 text-white/70 border border-white/40'
                    }`}>
                      {displayedStatus.toUpperCase()}
                    </span>
                  </div>

                  {/* Improved typography – elegant, not just "big and bold" */}
                  <h3 className="text-2xl font-extrabold text-white mb-2 group-hover:text-blue-300 transition-colors duration-300 tracking-tight">
                    {game.title}
                  </h3>

                  <p className="text-lg font-semibold text-blue-300 mb-5">
                    {game.sport_name}
                  </p>

                  {game.description && (
                    <p className="text-base text-white/85 mb-6 line-clamp-2 leading-relaxed">
                      {game.description}
                    </p>
                  )}

                  <div className="space-y-4 mb-6 text-white/90">
                    <div className="flex items-center gap-4 text-base font-medium">
                      <span className="text-2xl">📍</span>
                      <span>{game.location}</span>
                    </div>
                    <div className="flex items-center gap-4 text-base font-medium">
                      <span className="text-2xl">📅</span>
                      <span>{formatDate(game.date)}</span>
                    </div>
                    <div className="flex items-center gap-4 text-lg font-bold">
                      <span className="text-2xl">👥</span>
                      <span className={game.current_players >= game.players_needed ? 'text-green-300' : 'text-blue-300'}>
                        {game.current_players} / {game.players_needed} players
                      </span>
                    </div>
                  </div>

                  <div className="pt-5 border-t border-white/30">
                    <p className="text-white/70 text-sm font-medium">
                      Created by <span className="text-white font-bold">{game.creator_name}</span>
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default GamesPage;