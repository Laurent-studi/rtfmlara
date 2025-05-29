import { API_ENDPOINTS } from './endpoints';
import { api } from './index';

// Types pour les intérêts
export interface Interest {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  category: string;
  is_active: boolean;
  users_count: number;
  created_at: string;
  updated_at: string;
}

export interface UserInterest {
  id: number;
  user_id: number;
  interest_id: number;
  interest: Interest;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  added_at: string;
}

export interface AddUserInterestData {
  interest_id: number;
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

/**
 * Service pour la gestion des intérêts utilisant les endpoints définis
 */
export const interestService = {
  /**
   * Récupérer tous les intérêts disponibles
   */
  getAll: async () => {
    return await api.get<Interest[]>(API_ENDPOINTS.interests.list);
  },

  /**
   * Ajouter un intérêt à l'utilisateur
   */
  addToUser: async (data: AddUserInterestData) => {
    return await api.post<UserInterest>(API_ENDPOINTS.interests.addUser, data);
  },

  /**
   * Supprimer un intérêt de l'utilisateur
   */
  removeFromUser: async (interestId: number | string) => {
    return await api.delete(API_ENDPOINTS.interests.removeUser(interestId));
  },

  /**
   * Récupérer les intérêts de l'utilisateur connecté
   */
  getUserInterests: async () => {
    return await api.get<UserInterest[]>(`${API_ENDPOINTS.interests.addUser}/me`);
  },

  /**
   * Récupérer les intérêts par catégorie
   */
  getByCategory: async (category: string) => {
    return await api.get<Interest[]>(`${API_ENDPOINTS.interests.list}/category/${category}`);
  },

  /**
   * Récupérer les catégories d'intérêts
   */
  getCategories: async () => {
    return await api.get<string[]>(`${API_ENDPOINTS.interests.list}/categories`);
  },

  /**
   * Rechercher des intérêts
   */
  search: async (query: string) => {
    return await api.get<Interest[]>(`${API_ENDPOINTS.interests.list}/search?q=${encodeURIComponent(query)}`);
  },

  /**
   * Récupérer les intérêts populaires
   */
  getPopular: async (limit: number = 10) => {
    return await api.get<Interest[]>(`${API_ENDPOINTS.interests.list}/popular?limit=${limit}`);
  },

  /**
   * Mettre à jour le niveau d'un intérêt
   */
  updateLevel: async (interestId: number | string, level: 'beginner' | 'intermediate' | 'advanced' | 'expert') => {
    return await api.put(`${API_ENDPOINTS.interests.addUser}/${interestId}/level`, { level });
  },

  /**
   * Récupérer les quiz recommandés basés sur les intérêts
   */
  getRecommendedQuizzes: async () => {
    return await api.get(`${API_ENDPOINTS.interests.addUser}/recommended-quizzes`);
  },
};

export default interestService; 