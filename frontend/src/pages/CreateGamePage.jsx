// src/pages/CreateGamePage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI, gamesAPI, locationsAPI } from '../services/api';
import Navbar from '../components/NavBar';
const CreateGamePage = () => {
  const navigate = useNavigate();
 
  const [sports, setSports] = useState([]);
  const [locations, setLocations] = useState([]);
  const [sportDropdownOpen, setSportDropdownOpen] = useState(false);
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
 
  const [formData, setFormData] = useState({
    sport_id: '',
    title: '',
    description: '',
    location: '',
    date: '',
    time: '',
    players_needed: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  useEffect(() => {
    fetchSports();
    fetchLocations();
  }, []);
  const fetchSports = async () => {
    try {
      const response = await userAPI.getAllSports();
      setSports(response.data.sports);
    } catch (error) {
      console.error('Failed to fetch sports:', error);
    }
  };
  const fetchLocations = async () => {
    try {
      const response = await locationsAPI.getAllLocations();
      setLocations(response.data.locations);
    } catch (error) {
      console.error('Failed to fetch locations:', error);
    }
  };
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const selectedSport = sports.find(s => s.id === Number(formData.sport_id));
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await gamesAPI.createGame(formData);
      setSuccess('Game created successfully! 🎉');
      setTimeout(() => {
        navigate('/games');
      }, 1500);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create game');
    }
    setLoading(false);
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900">
      <Navbar />
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
       
        {/* Main Glass Card */}
        <div className="bg-white/25 backdrop-blur-3xl border border-white/40 rounded-3xl shadow-2xl ring-1 ring-white/20 p-8 md:p-12 transition-all duration-500">
         
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight text-center mb-12">
            Create New Game
          </h2>
          {/* Messages */}
          {loading && (
            <div className="mb-8 p-5 bg-blue-500/20 backdrop-blur border border-blue-400/50 text-blue-200 rounded-2xl text-center font-bold text-lg animate-pulse">
              Creating Game...
            </div>
          )}
          {error && (
            <div className="mb-8 p-5 bg-red-500/20 backdrop-blur border border-red-500/50 text-red-200 rounded-2xl text-center font-bold text-lg animate-pulse">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-8 p-5 bg-green-500/20 backdrop-blur border border-green-400/50 text-green-200 rounded-2xl text-center font-bold text-lg animate-bounce">
              {success}
            </div>
          )}
          <form onSubmit={handleSubmit} className={`space-y-8 ${loading || success ? 'hidden' : ''}`}>
            {/* Sport Selection */}
            <div>
              <label className="block text-xl font-bold text-white mb-3">
                Sport 
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setSportDropdownOpen(!sportDropdownOpen)}
                  className="w-full px-6 py-5 bg-white/20 border border-white/50 rounded-2xl text-white text-left flex items-center justify-between focus:outline-none focus:border-blue-400 focus:bg-white/30 focus:ring-4 focus:ring-blue-400/40 transition-all duration-300 backdrop-blur-sm shadow-inner text-lg font-medium hover:bg-white/25"
                >
                  <span className="flex items-center gap-3">
                    <span>{selectedSport ? selectedSport.icon : '🎽'}</span>
                    <span>{selectedSport ? selectedSport.name : 'Select a sport'}</span>
                  </span>
                  <svg className={`w-6 h-6 text-white/70 transition-transform duration-300 ${sportDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {sportDropdownOpen && (
                  <div className="absolute top-full mt-3 w-full bg-blue-950/95 backdrop-blur-3xl border border-white/60 rounded-2xl shadow-2xl ring-2 ring-white/40 overflow-hidden z-50">
                    {sports.map(sport => (
                      <button
                        key={sport.id}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, sport_id: sport.id }));
                          setSportDropdownOpen(false);
                        }}
                        className="w-full px-6 py-5 text-left flex items-center gap-4 hover:bg-blue-800/80 transition-all duration-300 text-white font-bold text-lg border-t border-white/30 first:border-t-0"
                      >
                        <span className="text-2xl">{sport.icon}</span>
                        <span>{sport.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {/* Location */}
            <div>
              <label className="block text-xl font-bold text-white mb-3">
                Location 
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setLocationDropdownOpen(!locationDropdownOpen)}
                  className="w-full px-6 py-5 bg-white/20 border border-white/50 rounded-2xl text-white text-left flex items-center justify-between focus:outline-none focus:border-blue-400 focus:bg-white/30 focus:ring-4 focus:ring-blue-400/40 transition-all duration-300 backdrop-blur-sm shadow-inner text-lg font-medium hover:bg-white/25"
                >
                  <span className="flex items-center gap-3">
                    <span>📍</span>
                    <span>{formData.location || 'Select a location'}</span>
                  </span>
                  <svg className={`w-6 h-6 text-white/70 transition-transform duration-300 ${locationDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {locationDropdownOpen && (
                  <div className="absolute top-full mt-3 w-full bg-blue-950/95 backdrop-blur-3xl border border-white/60 rounded-2xl shadow-2xl ring-2 ring-white/40 overflow-hidden z-50">
                    {locations.map(loc => (
                      <button
                        key={loc.id}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, location: loc.name }));
                          setLocationDropdownOpen(false);
                        }}
                        className="w-full px-6 py-5 text-left flex items-center gap-4 hover:bg-blue-800/80 transition-all duration-300 text-white font-bold text-lg border-t border-white/30 first:border-t-0"
                      >
                        <span className="text-2xl">📍</span>
                        <span>{loc.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {/* Rest of form (100% unchanged logic) */}
            <div>
              <label className="block text-xl font-bold text-white mb-3">Game Title </label>
              <input type="text" name="title" required value={formData.title} onChange={handleChange} className="w-full px-6 py-5 bg-white/20 border border-white/50 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:border-blue-400 focus:bg-white/30 focus:ring-4 focus:ring-blue-400/40 transition-all duration-300 backdrop-blur-sm shadow-inner text-lg" placeholder="e.g., Evening Football Match" />
            </div>
            <div>
              <label className="block text-xl font-bold text-white mb-3">Description (optional)</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows="4" className="w-full px-6 py-5 bg-white/20 border border-white/50 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:border-blue-400 focus:bg-white/30 focus:ring-4 focus:ring-blue-400/40 transition-all duration-300 backdrop-blur-sm shadow-inner text-lg resize-none" placeholder="Tell players about the game, skill level, vibe, etc..." />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-xl font-bold text-white mb-3">Date </label>
                <input type="date" name="date" required value={formData.date} onChange={handleChange} min={new Date().toISOString().split('T')[0]} className="w-full px-6 py-5 bg-white/20 border border-white/50 rounded-2xl text-white focus:outline-none focus:border-blue-400 focus:bg-white/30 focus:ring-4 focus:ring-blue-400/40 transition-all duration-300 backdrop-blur-sm shadow-inner text-lg" />
              </div>
              <div>
                <label className="block text-xl font-bold text-white mb-3">Time </label>
                <input type="time" name="time" required value={formData.time} onChange={handleChange} className="w-full px-6 py-5 bg-white/20 border border-white/50 rounded-2xl text-white focus:outline-none focus:border-blue-400 focus:bg-white/30 focus:ring-4 focus:ring-blue-400/40 transition-all duration-300 backdrop-blur-sm shadow-inner text-lg" />
              </div>
            </div>
            <div>
              <label className="block text-xl font-bold text-white mb-3">Players Needed </label>
              <input type="number" name="players_needed" required min="2" max="50" value={formData.players_needed} onChange={handleChange} className="w-full px-6 py-5 bg-white/20 border border-white/50 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:border-blue-400 focus:bg-white/30 focus:ring-4 focus:ring-blue-400/40 transition-all duration-300 backdrop-blur-sm shadow-inner text-lg" placeholder="e.g., 10" />
            </div>
            <div className="flex flex-col sm:flex-row gap-6 pt-8">
              <button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 text-white font-bold py-6 rounded-2xl shadow-2xl hover:shadow-3xl hover:shadow-blue-500/60 transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-blue-400/50 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 text-2xl tracking-wide">
                {loading ? 'Creating Game...' : 'Create Game'}
              </button>
              <button type="button" onClick={() => navigate('/games')} className="px-10 py-6 bg-white/15 backdrop-blur-sm border border-white/40 text-white font-bold rounded-2xl hover:bg-white/25 transform hover:-translate-y-1 transition-all duration-300 text-xl tracking-wide">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};
export default CreateGamePage;