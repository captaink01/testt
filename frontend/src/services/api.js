// src/services/api.js
import axios from 'axios';

// Base URL for your backend
const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
};

// User API calls
export const userAPI = {
  getAllSports: () => api.get('/users/sports'),
  getMySports: () => api.get('/users/my-sports'),
  updateSportsPreferences: (sportIds) => 
    api.put('/users/sports-preferences', { sport_ids: sportIds }),
  updateProfile: (profileData) => api.put('/users/profile', profileData),
};

// Games API calls
export const gamesAPI = {
  getAllGames: (params) => api.get('/games', { params }),
  createGame: (gameData) => api.post('/games', gameData),
  getGameById: (id) => api.get(`/games/${id}`),
  updateGame: (id, gameData) => api.put(`/games/${id}`, gameData),
  deleteGame: (id) => api.delete(`/games/${id}`),
  joinGame: (id) => api.post(`/games/${id}/join`),
  leaveGame: (id) => api.post(`/games/${id}/leave`),
  getMyGames: () => api.get('/games/my/created'),
  getJoinedGames: () => api.get('/games/my/joined'),
};

// Locations API calls
export const locationsAPI = {
  getAllLocations: () => api.get('/locations'),
  getLocationById: (id) => api.get(`/locations/${id}`),
};

export default api;