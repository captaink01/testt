// src/components/Navbar.jsx
import { useContext, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const NavBar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { label: 'Dashboard', path: '/dashboard', icon: '🏠' },
    { label: 'Browse Games', path: '/games', icon: '🎮' },
    { label: 'Create Game', path: '/create-game', icon: '➕' },
    { label: 'My Games', path: '/my-games', icon: '📋' },
    { label: 'Locations', path: '/locations', icon: '📍' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/20 backdrop-blur-3xl border-b border-white/30 shadow-2xl ring-1 ring-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">

          {/* Logo */}
          <NavLink to="/dashboard" className="flex items-center gap-3 group">
            <span className="text-4xl group-hover:scale-110 transition-transform duration-300">⚽</span>
            <span className="text-2xl font-black text-white tracking-tight hidden sm:block">
              Campus Sports Connect
            </span>
          </NavLink>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 text-white/80 font-semibold text-lg tracking-wide transition-all duration-300 hover:text-white hover:translate-y-[-2px] ${
                    isActive ? 'text-white drop-shadow-lg' : ''
                  }`
                }
                end
              >
                <span className="text-2xl transition-transform duration-300 group-hover:scale-125">
                  {link.icon}
                </span>
                <span>{link.label}</span>
                <span className="absolute -bottom-2 left-0 w-0 h-1 bg-blue-400 rounded-full transition-all duration-500 hover:w-full"></span>
              </NavLink>
            ))}
          </div>

          {/* User Section + Mobile Menu Button */}
          <div className="flex items-center gap-6">
            {/* Logout Button - exact same style as Sign In button */}
            <button
              onClick={handleLogout}
              className="bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 text-white font-bold py-3 px-7 rounded-2xl shadow-2xl hover:shadow-3xl hover:shadow-blue-500/60 transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-blue-400/50 transition-all duration-300 text-lg tracking-wide"
            >
              Logout
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden text-white p-2"
            >
              <div className="space-y-1.5">
                <span className={`block w-8 h-1 bg-white/80 rounded-full transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-2.5' : ''}`}></span>
                <span className={`block w-8 h-1 bg-white/80 rounded-full transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
                <span className={`block w-8 h-1 bg-white/80 rounded-full transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-2.5' : ''}`}></span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu - drops down with same glass effect */}
      <div className={`lg:hidden absolute top-full left-0 right-0 bg-blue-950/95 backdrop-blur-3xl border-b border-white/40 shadow-2xl transition-all duration-500 overflow-hidden ${isMobileMenuOpen ? 'max-h-96 py-6' : 'max-h-0 py-0'}`}>
        <div className="px-6 space-y-4">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-4 text-white/90 font-semibold text-xl py-3 px-5 rounded-2xl transition-all duration-300 hover:bg-white/20 hover:text-white ${
                  isActive ? 'bg-white/20 text-white drop-shadow-lg' : ''
                }`
              }
              end
            >
              <span className="text-3xl">{link.icon}</span>
              <span>{link.label}</span>
            </NavLink>
          ))}

          {/* User name in mobile menu */}
          <div className="pt-4 border-t border-white/30">
            <p className="text-white/80 text-sm font-medium px-5">
              Logged in as:{' '}
              <span className="text-white font-bold">{user?.full_name}</span>
            </p>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;