// src/pages/LoginPage.jsx
import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 px-4 py-12">
      {/* Heavy glassmorphism card with strong white tint – pure premium blue & white vibe */}
      <div className="max-w-md w-full bg-white/25 backdrop-blur-3xl border border-white/40 rounded-3xl shadow-2xl p-8 md:p-10 transition-all duration-500 ring-1 ring-white/20">
        
        <div className="text-center mb-10">
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-lg">
            Campus Sports Connect
          </h2>
          <p className="mt-3 text-lg text-white/90 font-medium">
            Welcome back, champion
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/25 backdrop-blur border border-red-500/50 text-red-200 rounded-2xl text-sm font-medium text-center animate-pulse">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-7">
          <div className="relative">
            <label className="block text-sm font-semibold text-white/95 mb-2">
              Email or Registration Number
            </label>
            <input
              type="text"
              name="identifier"
              required
              value={formData.identifier}
              onChange={handleChange}
              className="w-full px-5 py-4 bg-white/20 border border-white/50 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:border-blue-400 focus:bg-white/30 focus:ring-4 focus:ring-blue-400/40 transition-all duration-300 backdrop-blur-sm shadow-inner"
              placeholder="Email or Reg No (e.g. CST/21/SWE/00674)"
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-semibold text-white/95 mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-5 py-4 bg-white/20 border border-white/50 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:border-blue-400 focus:bg-white/30 focus:ring-4 focus:ring-blue-400/40 transition-all duration-300 backdrop-blur-sm shadow-inner"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 text-white font-bold py-5 px-6 rounded-2xl shadow-2xl hover:shadow-3xl hover:shadow-blue-500/60 transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-blue-400/50 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 text-lg tracking-wide"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-8 text-center text-white/80 text-sm font-medium">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-400 hover:text-white font-bold underline underline-offset-4 decoration-2 hover:decoration-4 transition-all duration-300">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;