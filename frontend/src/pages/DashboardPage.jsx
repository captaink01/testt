// src/pages/DashboardPage.jsx
import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { userAPI } from '../services/api';
import Navbar from '../components/NavBar';

const DashboardPage = () => {
  const { user } = useContext(AuthContext);
  
  const [allSports, setAllSports] = useState([]);
  const [selectedSports, setSelectedSports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSports();
    fetchMySports();
  }, []);

  const fetchSports = async () => {
    try {
      const response = await userAPI.getAllSports();
      setAllSports(response.data.sports);
    } catch (error) {
      console.error('Failed to fetch sports:', error);
    }
  };

  const fetchMySports = async () => {
    try {
      const response = await userAPI.getMySports();
      const mySportIds = response.data.sports.map(s => s.id);
      setSelectedSports(mySportIds);
    } catch (error) {
      console.error('Failed to fetch user sports:', error);
    }
  };

  const handleSportToggle = (sportId) => {
    setSelectedSports(prev => 
      prev.includes(sportId)
        ? prev.filter(id => id !== sportId)
        : [...prev, sportId]
    );
  };

  const handleSavePreferences = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      await userAPI.updateSportsPreferences(selectedSports);
      setMessage('Sports preferences saved successfully!');
      setTimeout(() => setMessage(''), 4000);
    } catch (error) {
      setMessage('Failed to save preferences. Please try again.');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900">
      <Navbar />

      {/* Main Content Area */}
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        {/* Welcome Glass Card */}
        <div className="bg-white/25 backdrop-blur-3xl border border-white/40 rounded-3xl shadow-2xl ring-1 ring-white/20 p-8 md:p-12 mb-10 transition-all duration-500">
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-6">
            Welcome back, {user?.full_name}!
          </h2>
          <div className="space-y-3 text-white/90 text-lg font-medium">
            <p><span className="text-white/70">Email:</span> {user?.email}</p>
            {user?.phone && <p><span className="text-white/70">Phone:</span> {user?.phone}</p>}
            <p className="text-white/70 text-base mt-6">
              Member since {new Date(user?.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Sports Preferences Section */}
        <div className="bg-white/25 backdrop-blur-3xl border border-white/40 rounded-3xl shadow-2xl ring-1 ring-white/20 p-8 md:p-12 transition-all duration-500">
          <h3 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-4">
            Select Your Favorite Sports
          </h3>
          <p className="text-xl text-white/80 font-medium mb-10 max-w-4xl">
            Choose the sports you love  we'll connect you with players, games, and teams on campus.
          </p>

          {/* Success / Error Message */}
          {message && (
            <div className={`mb-8 p-5 rounded-2xl text-center font-bold text-lg backdrop-blur-sm border transition-all duration-500 ${
              message.includes('success')
                ? 'bg-green-500/20 border-green-400/50 text-green-200'
                : 'bg-red-500/20 border-red-500/50 text-red-200'
            }`}>
              {message}
            </div>
          )}

          {/* Sports Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-10">
            {allSports.map((sport) => (
              <label
                key={sport.id}
                className={`relative group cursor-pointer transition-all duration-500 rounded-3xl overflow-hidden ${
                  selectedSports.includes(sport.id)
                    ? 'ring-4 ring-blue-400/60 shadow-2xl shadow-blue-500/40'
                    : 'ring-1 ring-white/30 hover:ring-white/60'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedSports.includes(sport.id)}
                  onChange={() => handleSportToggle(sport.id)}
                  className="sr-only"
                />
                <div className={`h-full min-h-40 bg-white/${selectedSports.includes(sport.id) ? '30' : '15'} backdrop-blur-sm border ${selectedSports.includes(sport.id) ? 'border-blue-400/60' : 'border-white/40'} rounded-3xl p-6 flex flex-col items-center justify-center gap-4 transition-all duration-500 group-hover:bg-white/30 group-hover:scale-105`}>
                  <span className="text-6xl md:text-7xl drop-shadow-lg">
                    {sport.icon}
                  </span>
                  <span className="text-white font-bold text-lg md:text-xl tracking-wide text-center">
                    {sport.name}
                  </span>
                  {/* Selected Checkmark */}
                  {selectedSports.includes(sport.id) && (
                    <div className="absolute top-4 right-4 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shadow-xl">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </label>
            ))}
          </div>

          {/* Save Button */}
          <div className="flex flex-col items-center">
            <button
              onClick={handleSavePreferences}
              disabled={loading || selectedSports.length === 0}
              className="bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 text-white font-bold py-5 px-12 rounded-2xl shadow-2xl hover:shadow-3xl hover:shadow-blue-500/60 transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-blue-400/50 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 text-xl tracking-wide min-w-80"
            >
              {loading ? 'Saving Preferences...' : 'Save Preferences'}
            </button>
            
            {selectedSports.length === 0 && (
              <p className="mt-6 text-white/70 text-lg font-medium">
                Please select at least one sport to continue
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;