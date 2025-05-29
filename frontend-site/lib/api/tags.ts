import { API_ENDPOINTS } from './endpoints';
import { api } from './index';

// Types pour les tags
export interface Tag {
  id: number;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  icon?: string;
  is_active: boolean;
  quizzes_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreateTagData {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

export interface UpdateTagData extends Partial<CreateTagData> {
  is_active?: boolean;
}

export interface TagQuizAssociation {
  tag_id: number;
  quiz_id: number;
  created_at: string;
}

/**
 * Service pour la gestion des tags utilisant les endpoints définis
 */
export const tagService = {
  /**
   * Récupérer tous les tags
   */
  getAll: async () => {
    return await api.get<Tag[]>(API_ENDPOINTS.tags.list);
  },

  /**
   * Créer un nouveau tag
   */
  create: async (tagData: CreateTagData) => {
    return await api.post<Tag>(API_ENDPOINTS.tags.create, tagData);
  },

  /**
   * Récupérer un tag par son ID
   */
  getById: async (id: number | string) => {
    return await api.get<Tag>(API_ENDPOINTS.tags.byId(id));
  },

  /**
   * Mettre à jour un tag
   */
  update: async (id: number | string, tagData: UpdateTagData) => {
    return await api.put<Tag>(API_ENDPOINTS.tags.update(id), tagData);
  },

  /**
   * Supprimer un tag
   */
  delete: async (id: number | string) => {
    return await api.delete(API_ENDPOINTS.tags.delete(id));
  },

  /**
   * Attacher des tags à un quiz
   */
  attachToQuiz: async (quizId: number | string, tagIds: number[]) => {
    return await api.post(API_ENDPOINTS.tags.attachToQuiz(quizId), {
      tag_ids: tagIds
    });
  },

  /**
   * Détacher un tag d'un quiz
   */
  detachFromQuiz: async (quizId: number | string, tagId: number | string) => {
    return await api.delete(API_ENDPOINTS.tags.detachFromQuiz(quizId, tagId));
  },

  /**
   * Récupérer les tags populaires
   */
  getPopular: async (limit: number = 10) => {
    return await api.get<Tag[]>(`${API_ENDPOINTS.tags.list}/popular?limit=${limit}`);
  },

  /**
   * Rechercher des tags
   */
  search: async (query: string) => {
    return await api.get<Tag[]>(`${API_ENDPOINTS.tags.list}/search?q=${encodeURIComponent(query)}`);
  },

  /**
   * Récupérer les tags d'un quiz
   */
  getByQuiz: async (quizId: number | string) => {
    return await api.get<Tag[]>(`${API_ENDPOINTS.quiz.byId(quizId)}/tags`);
  },

  /**
   * Récupérer les statistiques d'un tag
   */
  getStats: async (id: number | string) => {
    return await api.get<{
      quizzes_count: number;
      total_participants: number;
      average_score: number;
      most_popular_quiz: any;
    }>(`${API_ENDPOINTS.tags.byId(id)}/stats`);
  },

  /**
   * Récupérer les tags suggérés pour un quiz
   */
  getSuggestions: async (quizId: number | string) => {
    return await api.get<Tag[]>(`${API_ENDPOINTS.quiz.byId(quizId)}/suggested-tags`);
  },

  /**
   * Fusionner deux tags
   */
  merge: async (sourceTagId: number | string, targetTagId: number | string) => {
    return await api.post(`${API_ENDPOINTS.tags.byId(sourceTagId)}/merge`, {
      target_tag_id: targetTagId
    });
  },
};

export default tagService; 