// src/pages/LocationsPage.jsx
import { useState, useEffect } from 'react';
import { locationsAPI } from '../services/api';
import Navbar from '../components/NavBar';

const LocationsPage = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const response = await locationsAPI.getAllLocations();
      setLocations(response.data.locations);
    } catch (error) {
      console.error('Failed to fetch locations:', error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">
            Play Locations
          </h1>
          <p className="text-white/80 text-lg">
            Popular sports venues around Bayero University Kano campus
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-white/80 text-lg animate-pulse">Loading locations...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {locations.map((location) => (
              <div
                key={location.id}
                className="bg-white/20 backdrop-blur-3xl border border-white/40 rounded-3xl shadow-2xl ring-1 ring-white/20 p-6 hover:shadow-3xl hover:shadow-white/20 transform hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-black text-white mb-1">
                      {location.name}
                    </h3>
                    <p className="text-base text-white/70">📍 {location.address}</p>
                  </div>
                  <span className="text-4xl">🏟️</span>
                </div>

                {/* Description */}
                {location.description && (
                  <p className="text-white/90 mb-4 text-base">
                    {location.description}
                  </p>
                )}

                {/* Facilities */}
                <div className="mb-4">
                  <h4 className="font-bold text-xl text-white mb-2">Facilities</h4>
                  <p className="text-base text-white/80">{location.facilities}</p>
                </div>

                {/* Available Sports */}
                <div className="pt-4 border-t border-white/30">
                  <h4 className="font-bold text-xl text-white mb-2">Available Sports</h4>
                  <div className="flex flex-wrap gap-2">
                    {location.available_sports.split(',').map((sport, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-blue-500/20 text-blue-200 border border-blue-400/50 rounded-full text-sm font-bold backdrop-blur"
                      >
                        {sport.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default LocationsPage;