// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import GamesPage from './pages/GamesPage';
import CreateGamePage from './pages/CreateGamePage';
import GameDetailsPage from './pages/GameDetailsPage';
import MyGamesPage from './pages/MyGamesPage';
import LocationsPage from './pages/LocationsPage';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public Routes */}
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            
            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/games" 
              element={
                <ProtectedRoute>
                  <GamesPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/create-game" 
              element={
                <ProtectedRoute>
                  <CreateGamePage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/games/:id" 
              element={
                <ProtectedRoute>
                  <GameDetailsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/my-games" 
              element={
                <ProtectedRoute>
                  <MyGamesPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/locations" 
              element={
                <ProtectedRoute>
                  <LocationsPage />
                </ProtectedRoute>
              } 
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            
            {/* Default Route */}
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;