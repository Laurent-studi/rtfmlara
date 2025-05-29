import { API_ENDPOINTS } from './endpoints';
import { api } from './index';

// Types pour l'authentification
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  avatar?: string;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  expires_at: string;
}

export interface ResetPasswordData {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}

/**
 * Service d'authentification utilisant les endpoints définis
 */
export const authService = {
  /**
   * Connexion utilisateur
   */
  login: async (credentials: LoginCredentials) => {
    const response = await api.post<AuthResponse>(API_ENDPOINTS.auth.login, credentials);
    
    if (response.success && response.data?.token) {
      // Stocker le token d'authentification
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response;
  },

  /**
   * Inscription utilisateur
   */
  register: async (userData: RegisterData) => {
    const response = await api.post<AuthResponse>(API_ENDPOINTS.auth.register, userData);
    
    if (response.success && response.data?.token) {
      // Stocker le token d'authentification
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response;
  },

  /**
   * Déconnexion utilisateur
   */
  logout: async () => {
    const response = await api.post(API_ENDPOINTS.auth.logout);
    
    // Supprimer les données d'authentification du localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    
    return response;
  },

  /**
   * Récupérer les informations de l'utilisateur connecté
   */
  getUser: async () => {
    return await api.get<User>(API_ENDPOINTS.auth.user);
  },

  /**
   * Demande de réinitialisation de mot de passe
   */
  forgotPassword: async (email: string) => {
    return await api.post(API_ENDPOINTS.auth.forgotPassword, { email });
  },

  /**
   * Réinitialisation du mot de passe
   */
  resetPassword: async (data: ResetPasswordData) => {
    return await api.post(API_ENDPOINTS.auth.resetPassword, data);
  },

  /**
   * Vérifier si l'utilisateur est connecté
   */
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('auth_token');
    return !!token;
  },

  /**
   * Récupérer le token d'authentification
   */
  getToken: (): string | null => {
    return localStorage.getItem('auth_token');
  },

  /**
   * Récupérer l'utilisateur depuis le localStorage
   */
  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('Erreur lors du parsing de l\'utilisateur:', error);
        return null;
      }
    }
    return null;
  },

  /**
   * Mettre à jour les informations utilisateur dans le localStorage
   */
  updateCurrentUser: (user: User) => {
    localStorage.setItem('user', JSON.stringify(user));
  },
};

// Exportations pour compatibilité
export const login = authService.login;
export const register = authService.register;
export const logout = authService.logout;
export const getUser = authService.getUser;
export const forgotPassword = authService.forgotPassword;
export const resetPassword = authService.resetPassword;
export const isAuthenticated = authService.isAuthenticated;
export const getToken = authService.getToken;
export const getCurrentUser = authService.getCurrentUser;

export default authService; 