import axios from 'axios';

// Configuration de base pour axios
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

// API pour l'authentification
export const authApi = {
  // Connexion
  login: async (credentials: LoginCredentials) => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  // Inscription
  register: async (credentials: RegisterCredentials) => {
    const response = await api.post<AuthResponse>('/auth/register', credentials);
    return response.data;
  },

  // Déconnexion
  logout: async () => {
    await api.post('/auth/logout');
  },

  // Récupérer l'utilisateur actuel
  getCurrentUser: async () => {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  // Vérifier si l'utilisateur est connecté
  isAuthenticated: () => {
    return !!localStorage.getItem('auth_token');
  },

  // Stocker le token d'authentification
  setAuthToken: (token: string) => {
    localStorage.setItem('auth_token', token);
  },

  // Récupérer le token d'authentification
  getAuthToken: () => {
    return localStorage.getItem('auth_token');
  },

  // Supprimer le token d'authentification
  removeAuthToken: () => {
    localStorage.removeItem('auth_token');
  },
};

export default authApi; 