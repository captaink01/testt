// src/pages/RegisterPage.jsx
import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    full_name: "",
    registration_number: "",
    email: "",
    password: "",
    confirm_password: "",
    phone: "",
    role: "player",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    const { confirm_password, ...registerData } = formData;

    const result = await register(registerData);

    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 px-4 py-12">

      <div className="max-w-md w-full bg-white/25 backdrop-blur-3xl border border-white/40 rounded-3xl shadow-2xl p-8 md:p-10 transition-all duration-500 ring-1 ring-white/20">
        <div className="text-center mb-10">
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-lg">
            Campus Sports Connect
          </h2>
          <p className="mt-3 text-lg text-white/90 font-medium">
            Create your account
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/25 backdrop-blur border border-red-500/50 text-red-200 rounded-2xl text-sm font-medium text-center animate-pulse">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-white/95 mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="full_name"
              required
              value={formData.full_name}
              onChange={handleChange}
              className="w-full px-5 py-4 bg-white/20 border border-white/50 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:border-blue-400 focus:bg-white/30 focus:ring-4 focus:ring-blue-400/40 transition-all duration-300 backdrop-blur-sm shadow-inner"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white/95 mb-2">
              Registration Number
            </label>
            <input
              type="text"
              name="registration_number"
              required
              value={formData.registration_number}
              onChange={handleChange}
              className="w-full px-5 py-4 bg-white/20 border border-white/50 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:border-blue-400 focus:bg-white/30 focus:ring-4 focus:ring-blue-400/40 transition-all duration-300 backdrop-blur-sm shadow-inner"
              placeholder="CST/21/SWE/00674"
            />
            <p className="mt-1 text-xs text-white/70">Format: CST/21/SWE/00674</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-white/95 mb-2">
              Email (Optional)
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-5 py-4 bg-white/20 border border-white/50 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:border-blue-400 focus:bg-white/30 focus:ring-4 focus:ring-blue-400/40 transition-all duration-300 backdrop-blur-sm shadow-inner"
              placeholder="your.email@buk.edu.ng"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white/95 mb-2">
              Phone Number (Optional)
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-5 py-4 bg-white/20 border border-white/50 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:border-blue-400 focus:bg-white/30 focus:ring-4 focus:ring-blue-400/40 transition-all duration-300 backdrop-blur-sm shadow-inner"
              placeholder="08012345678"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white/95 mb-3">
              I want to
            </label>
            <div className="flex gap-4">
              <label className="flex-1 cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="player"
                  checked={formData.role === "player"}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="px-4 py-3 bg-white/20 border-2 border-white/50 rounded-xl text-white text-center font-semibold peer-checked:bg-blue-500/40 peer-checked:border-blue-400 peer-checked:ring-4 peer-checked:ring-blue-400/40 transition-all duration-300">
                  Play Only
                </div>
              </label>
              <label className="flex-1 cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="organizer"
                  checked={formData.role === "organizer"}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="px-4 py-3 bg-white/20 border-2 border-white/50 rounded-xl text-white text-center font-semibold peer-checked:bg-blue-500/40 peer-checked:border-blue-400 peer-checked:ring-4 peer-checked:ring-blue-400/40 transition-all duration-300">
                  Organize Games
                </div>
              </label>
            </div>
          </div>

          <div>
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
              placeholder="Minimum 6 characters"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white/95 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirm_password"
              required
              value={formData.confirm_password}
              onChange={handleChange}
              className="w-full px-5 py-4 bg-white/20 border border-white/50 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:border-blue-400 focus:bg-white/30 focus:ring-4 focus:ring-blue-400/40 transition-all duration-300 backdrop-blur-sm shadow-inner"
              placeholder="Confirm your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 text-white font-bold py-5 px-6 rounded-2xl shadow-2xl hover:shadow-3xl hover:shadow-blue-500/60 transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-blue-400/50 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 text-lg tracking-wide"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-8 text-center text-white/80 text-sm font-medium">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-400 hover:text-white font-bold underline underline-offset-4 decoration-2 hover:decoration-4 transition-all duration-300"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
