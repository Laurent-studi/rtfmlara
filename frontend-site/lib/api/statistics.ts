import { API_ENDPOINTS } from './endpoints';
import { api } from './index';

// Types pour les statistiques
export interface GeneralStatistics {
  total_users: number;
  total_quizzes: number;
  total_sessions: number;
  total_questions: number;
  total_answers: number;
  active_users_today: number;
  active_users_week: number;
  active_users_month: number;
  popular_categories: CategoryStats[];
  recent_activity: ActivityStats[];
  performance_metrics: PerformanceMetrics;
}

export interface CategoryStats {
  category: string;
  quizzes_count: number;
  sessions_count: number;
  average_score: number;
  total_participants: number;
}

export interface ActivityStats {
  date: string;
  users_count: number;
  sessions_count: number;
  quizzes_created: number;
}

export interface PerformanceMetrics {
  average_response_time: number;
  server_uptime: number;
  database_queries_per_second: number;
  cache_hit_rate: number;
}

/**
 * Service pour les statistiques utilisant les endpoints définis
 */
export const statisticsService = {
  /**
   * Récupérer les statistiques générales
   */
  getGeneral: async () => {
    return await api.get<GeneralStatistics>(API_ENDPOINTS.statistics.general);
  },

  /**
   * Récupérer les statistiques par période
   */
  getByPeriod: async (period: 'day' | 'week' | 'month' | 'year') => {
    return await api.get<GeneralStatistics>(`${API_ENDPOINTS.statistics.general}?period=${period}`);
  },

  /**
   * Récupérer les statistiques en temps réel
   */
  getRealTime: async () => {
    return await api.get(`${API_ENDPOINTS.statistics.general}/realtime`);
  },
};

export default statisticsService; 