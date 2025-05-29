// Exporter toutes les fonctions de l'API thème

import { API_ENDPOINTS } from './endpoints';

// Configuration de base de l'API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Interface pour les réponses API standardisées
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: any;
}

// Fonction pour obtenir les en-têtes d'authentification
const getAuthHeaders = (): HeadersInit => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

// Fonction utilitaire pour faire des requêtes HTTP
const makeRequest = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  try {
    const url = `${API_BASE_URL}/${endpoint.replace(/^\//, '')}`;
    
    const response = await fetch(url, {
      headers: getAuthHeaders(),
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Une erreur est survenue',
        errors: data.errors,
      };
    }

    return {
      success: true,
      data: data.data || data,
      message: data.message,
    };
  } catch (error) {
    console.error('Erreur API:', error);
    return {
      success: false,
      message: 'Erreur de connexion au serveur',
    };
  }
};

// Structure API centralisée utilisant les endpoints définis
export const api = {
  // Méthodes HTTP de base
  get: <T = any>(endpoint: string): Promise<ApiResponse<T>> => 
    makeRequest<T>(endpoint, { method: 'GET' }),
  
  post: <T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> => 
    makeRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),
  
  put: <T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> => 
    makeRequest<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),
  
  delete: <T = any>(endpoint: string): Promise<ApiResponse<T>> => 
    makeRequest<T>(endpoint, { method: 'DELETE' }),

  // Méthodes spécialisées pour l'authentification
  auth: {
    login: (credentials: { email: string; password: string }) =>
      api.post(API_ENDPOINTS.auth.login, credentials),
    
    register: (userData: { username: string; email: string; password: string; password_confirmation: string }) =>
      api.post(API_ENDPOINTS.auth.register, userData),
    
    logout: () => api.post(API_ENDPOINTS.auth.logout),
    
    getUser: () => api.get(API_ENDPOINTS.auth.user),
    
    forgotPassword: (email: string) =>
      api.post(API_ENDPOINTS.auth.forgotPassword, { email }),
    
    resetPassword: (data: { token: string; email: string; password: string; password_confirmation: string }) =>
      api.post(API_ENDPOINTS.auth.resetPassword, data),
  },

  // Méthodes pour les quiz
  quiz: {
    getAll: () => api.get(API_ENDPOINTS.quiz.list),
    
    getFeatured: () => api.get(API_ENDPOINTS.quiz.featured),
    
    getPublic: () => api.get(API_ENDPOINTS.quiz.public),
    
    getCategories: () => api.get(API_ENDPOINTS.quiz.categories),
    
    getRecent: () => api.get(API_ENDPOINTS.quiz.recent),
    
    getRandom: () => api.get(API_ENDPOINTS.quiz.random),
    
    getById: (id: number | string) => api.get(API_ENDPOINTS.quiz.byId(id)),
    
    create: (quizData: any) => api.post(API_ENDPOINTS.quiz.create, quizData),
    
    update: (id: number | string, quizData: any) => 
      api.put(API_ENDPOINTS.quiz.update(id), quizData),
    
    delete: (id: number | string) => api.delete(API_ENDPOINTS.quiz.delete(id)),
    
    getByTag: (tagSlug: string) => api.get(API_ENDPOINTS.quiz.byTag(tagSlug)),
  },

  // Méthodes pour les questions
  questions: {
    getByQuiz: (quizId: number | string) => 
      api.get(API_ENDPOINTS.questions.list(quizId)),
    
    create: (quizId: number | string, questionData: any) =>
      api.post(API_ENDPOINTS.questions.create(quizId), questionData),
    
    getById: (id: number | string) => api.get(API_ENDPOINTS.questions.byId(id)),
    
    update: (id: number | string, questionData: any) =>
      api.put(API_ENDPOINTS.questions.update(id), questionData),
    
    delete: (id: number | string) => api.delete(API_ENDPOINTS.questions.delete(id)),
  },

  // Méthodes pour les sessions de quiz
  sessions: {
    getAll: () => api.get(API_ENDPOINTS.sessions.list),
    
    create: (sessionData: any) => api.post(API_ENDPOINTS.sessions.create, sessionData),
    
    getById: (id: number | string) => api.get(API_ENDPOINTS.sessions.byId(id)),
    
    join: (id: number | string, playerData: any) =>
      api.post(API_ENDPOINTS.sessions.join(id), playerData),
    
    start: (id: number | string) => api.post(API_ENDPOINTS.sessions.start(id)),
    
    submitAnswer: (id: number | string, answerData: any) =>
      api.post(API_ENDPOINTS.sessions.submitAnswer(id), answerData),
  },

  // Méthodes pour la présentation
  presentation: {
    createSession: (sessionData: any) => 
      api.post(API_ENDPOINTS.presentation.create, sessionData),
    
    getState: (sessionId: string) => 
      api.get(API_ENDPOINTS.presentation.getState(sessionId)),
    
    start: (sessionId: string) => 
      api.post(API_ENDPOINTS.presentation.start(sessionId)),
    
    next: (sessionId: string) => 
      api.post(API_ENDPOINTS.presentation.next(sessionId)),
    
    end: (sessionId: string) => 
      api.post(API_ENDPOINTS.presentation.end(sessionId)),
    
    getLeaderboard: (sessionId: string) => 
      api.get(API_ENDPOINTS.presentation.leaderboard(sessionId)),
    
    join: (joinData: any) => 
      api.post(API_ENDPOINTS.presentation.join, joinData),
    
    submitAnswer: (sessionId: string, answerData: any) =>
      api.post(API_ENDPOINTS.presentation.submitAnswer(sessionId), answerData),
  },

  // Méthodes pour les thèmes
  themes: {
    getAll: () => api.get(API_ENDPOINTS.themes.list),
    
    getDefault: () => api.get(API_ENDPOINTS.themes.default),
    
    getCurrent: () => api.get(API_ENDPOINTS.themes.current),
    
    getUserTheme: () => api.get(API_ENDPOINTS.themes.userTheme),
    
    setUserTheme: (themeData: any) => 
      api.post(API_ENDPOINTS.themes.setUserTheme, themeData),
    
    apply: (themeData: any) => api.post(API_ENDPOINTS.themes.apply, themeData),
    
    reset: () => api.post(API_ENDPOINTS.themes.reset),
    
    create: (themeData: any) => api.post(API_ENDPOINTS.themes.create, themeData),
    
    getById: (id: number | string) => api.get(API_ENDPOINTS.themes.byId(id)),
    
    update: (id: number | string, themeData: any) =>
      api.put(API_ENDPOINTS.themes.update(id), themeData),
    
    delete: (id: number | string) => api.delete(API_ENDPOINTS.themes.delete(id)),
    
    setDefault: (id: number | string) => 
      api.post(API_ENDPOINTS.themes.setDefault(id)),
  },

  // Méthodes pour les achievements
  achievements: {
    getUserAchievements: () => api.get(API_ENDPOINTS.achievements.userAchievements),
    
    getForUser: (userId: number | string) => 
      api.get(API_ENDPOINTS.achievements.forUser(userId)),
    
    getUnachieved: () => api.get(API_ENDPOINTS.achievements.unachieved),
    
    check: () => api.post(API_ENDPOINTS.achievements.check),
    
    getRecent: () => api.get(API_ENDPOINTS.achievements.recent),
    
    getCategories: () => api.get(API_ENDPOINTS.achievements.categories),
    
    getByCategory: (category: string) => 
      api.get(API_ENDPOINTS.achievements.byCategory(category)),
  },

  // Méthodes pour les notifications
  notifications: {
    getAll: () => api.get(API_ENDPOINTS.notifications.list),
    
    getUnread: () => api.get(API_ENDPOINTS.notifications.unread),
    
    markAllRead: () => api.post(API_ENDPOINTS.notifications.markAllRead),
    
    update: (id: number | string, data: any) =>
      api.put(API_ENDPOINTS.notifications.update(id), data),
    
    delete: (id: number | string) => 
      api.delete(API_ENDPOINTS.notifications.delete(id)),
  },

  // Méthodes pour les statistiques
  statistics: {
    getGeneral: () => api.get(API_ENDPOINTS.statistics.general),
  },
};

// Fonctions de compatibilité pour l'ancien système
export const getAllThemes = () => api.themes.getAll();
export const getDefaultTheme = () => api.themes.getDefault();
export const getCurrentUserTheme = () => api.themes.getUserTheme();
export const applyTheme = (themeData: any) => api.themes.setUserTheme(themeData);
export const resetTheme = () => api.themes.reset();
export const createTheme = (themeData: any) => api.themes.create(themeData);
export const updateTheme = (id: number | string, themeData: any) => api.themes.update(id, themeData);
export const deleteTheme = (id: number | string) => api.themes.delete(id);
export const setDefaultTheme = (id: number | string) => api.themes.setDefault(id);

export const getUserQuizzes = () => api.quiz.getAll();
export const getQuiz = (id: number | string) => api.quiz.getById(id);
export const createQuiz = (quizData: any) => api.quiz.create(quizData);
export const updateQuiz = (id: number | string, quizData: any) => api.quiz.update(id, quizData);
export const deleteQuiz = (id: number | string) => api.quiz.delete(id);
export const getQuizQuestions = (quizId: number | string) => api.questions.getByQuiz(quizId);
export const addQuizQuestion = (quizId: number | string, questionData: any) => api.questions.create(quizId, questionData);
export const updateQuestion = (id: number | string, questionData: any) => api.questions.update(id, questionData);
export const deleteQuestion = (id: number | string) => api.questions.delete(id);

// Exportation par défaut
export default api; 