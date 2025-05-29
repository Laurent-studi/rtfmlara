import { API_ENDPOINTS } from './endpoints';
import { api } from './index';

// Types pour les sessions hors ligne
export interface OfflineSession {
  id: number;
  quiz_id: number;
  user_id: number;
  session_data: OfflineSessionData;
  status: 'pending' | 'synchronized' | 'failed';
  score: number;
  completion_percentage: number;
  time_taken: number;
  answers_count: number;
  correct_answers: number;
  created_offline_at: string;
  synchronized_at?: string;
  created_at: string;
  updated_at: string;
}

export interface OfflineSessionData {
  quiz: {
    id: number;
    title: string;
    questions: OfflineQuestion[];
  };
  answers: OfflineAnswer[];
  start_time: string;
  end_time?: string;
  device_info: {
    platform: string;
    user_agent: string;
    screen_resolution: string;
  };
}

export interface OfflineQuestion {
  id: number;
  question_text: string;
  question_type: 'single' | 'multiple' | 'text';
  time_limit?: number;
  points: number;
  answers: {
    id: number;
    text: string;
    is_correct: boolean;
  }[];
}

export interface OfflineAnswer {
  question_id: number;
  answer_ids: number[];
  answer_text?: string;
  time_taken: number;
  is_correct: boolean;
  points_earned: number;
  answered_at: string;
}

export interface CreateOfflineSessionData {
  quiz_id: number;
  session_data: OfflineSessionData;
}

export interface SubmitOfflineAnswerData {
  question_id: number;
  answer_ids: number[];
  answer_text?: string;
  time_taken: number;
}

export interface CompleteOfflineSessionData {
  total_time: number;
  completion_percentage: number;
  final_score: number;
}

export interface SynchronizeSessionData {
  session_id: number;
  force_sync?: boolean;
}

/**
 * Service pour la gestion des sessions hors ligne utilisant les endpoints définis
 */
export const offlineSessionService = {
  /**
   * Récupérer toutes les sessions hors ligne
   */
  getAll: async (params?: {
    status?: 'pending' | 'synchronized' | 'failed';
    page?: number;
    limit?: number;
  }) => {
    const searchParams = new URLSearchParams();
    
    if (params?.status) searchParams.append('status', params.status);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const url = searchParams.toString() 
      ? `${API_ENDPOINTS.offlineSessions.list}?${searchParams.toString()}`
      : API_ENDPOINTS.offlineSessions.list;

    return await api.get<{
      data: OfflineSession[];
      total: number;
      current_page: number;
      last_page: number;
    }>(url);
  },

  /**
   * Créer une nouvelle session hors ligne
   */
  create: async (sessionData: CreateOfflineSessionData) => {
    return await api.post<OfflineSession>(API_ENDPOINTS.offlineSessions.create, sessionData);
  },

  /**
   * Récupérer une session hors ligne par son ID
   */
  getById: async (id: number | string) => {
    return await api.get<OfflineSession>(API_ENDPOINTS.offlineSessions.byId(id));
  },

  /**
   * Soumettre une réponse dans une session hors ligne
   */
  submitAnswer: async (id: number | string, answerData: SubmitOfflineAnswerData) => {
    return await api.post(API_ENDPOINTS.offlineSessions.submitAnswer(id), answerData);
  },

  /**
   * Terminer une session hors ligne
   */
  complete: async (id: number | string, completionData: CompleteOfflineSessionData) => {
    return await api.post<OfflineSession>(API_ENDPOINTS.offlineSessions.complete(id), completionData);
  },

  /**
   * Synchroniser une session hors ligne
   */
  synchronize: async (id: number | string, syncData?: SynchronizeSessionData) => {
    return await api.post<OfflineSession>(API_ENDPOINTS.offlineSessions.synchronize(id), syncData);
  },

  /**
   * Supprimer une session hors ligne
   */
  delete: async (id: number | string) => {
    return await api.delete(API_ENDPOINTS.offlineSessions.delete(id));
  },

  /**
   * Récupérer les sessions en attente de synchronisation
   */
  getPending: async () => {
    return await api.get<OfflineSession[]>(`${API_ENDPOINTS.offlineSessions.list}/pending`);
  },

  /**
   * Récupérer les sessions synchronisées
   */
  getSynchronized: async () => {
    return await api.get<OfflineSession[]>(`${API_ENDPOINTS.offlineSessions.list}/synchronized`);
  },

  /**
   * Récupérer les sessions échouées
   */
  getFailed: async () => {
    return await api.get<OfflineSession[]>(`${API_ENDPOINTS.offlineSessions.list}/failed`);
  },

  /**
   * Synchroniser toutes les sessions en attente
   */
  synchronizeAll: async () => {
    return await api.post(`${API_ENDPOINTS.offlineSessions.list}/synchronize-all`);
  },

  /**
   * Réessayer la synchronisation des sessions échouées
   */
  retryFailed: async () => {
    return await api.post(`${API_ENDPOINTS.offlineSessions.list}/retry-failed`);
  },

  /**
   * Récupérer les statistiques des sessions hors ligne
   */
  getStats: async () => {
    return await api.get<{
      total_sessions: number;
      pending_sessions: number;
      synchronized_sessions: number;
      failed_sessions: number;
      total_offline_time: number;
      average_score: number;
      sync_success_rate: number;
    }>(`${API_ENDPOINTS.offlineSessions.list}/stats`);
  },

  /**
   * Vérifier la connectivité et synchroniser si possible
   */
  checkAndSync: async () => {
    return await api.post(`${API_ENDPOINTS.offlineSessions.list}/check-and-sync`);
  },

  /**
   * Exporter les données hors ligne
   */
  export: async (format: 'json' | 'csv' = 'json') => {
    return await api.get(`${API_ENDPOINTS.offlineSessions.list}/export?format=${format}`);
  },

  /**
   * Importer des données de session hors ligne
   */
  import: async (sessionData: OfflineSessionData[]) => {
    return await api.post(`${API_ENDPOINTS.offlineSessions.list}/import`, {
      sessions: sessionData
    });
  },

  /**
   * Nettoyer les sessions anciennes
   */
  cleanup: async (olderThanDays: number = 30) => {
    return await api.post(`${API_ENDPOINTS.offlineSessions.list}/cleanup`, {
      older_than_days: olderThanDays
    });
  },
};

export default offlineSessionService; 