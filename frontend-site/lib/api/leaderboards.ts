import { API_ENDPOINTS } from './endpoints';
import { api } from './index';

// Types pour les classements
export interface LeaderboardEntry {
  id: number;
  user_id: number;
  username: string;
  avatar?: string;
  score: number;
  rank: number;
  total_quizzes: number;
  correct_answers: number;
  total_answers: number;
  accuracy_percentage: number;
  average_time: number;
  best_streak: number;
  points: number;
  badges_count: number;
  trophies_count: number;
  last_activity: string;
}

export interface GlobalLeaderboard {
  period: 'daily' | 'weekly' | 'monthly' | 'all_time';
  entries: LeaderboardEntry[];
  total_entries: number;
  user_rank?: number;
  user_entry?: LeaderboardEntry;
}

export interface CategoryLeaderboard {
  category: string;
  period: 'daily' | 'weekly' | 'monthly' | 'all_time';
  entries: LeaderboardEntry[];
  total_entries: number;
  user_rank?: number;
  user_entry?: LeaderboardEntry;
}

export interface QuizLeaderboard {
  quiz_id: number;
  quiz_title: string;
  entries: QuizLeaderboardEntry[];
  total_entries: number;
  user_rank?: number;
  user_entry?: QuizLeaderboardEntry;
}

export interface QuizLeaderboardEntry {
  id: number;
  user_id: number;
  username: string;
  avatar?: string;
  score: number;
  rank: number;
  correct_answers: number;
  total_questions: number;
  accuracy_percentage: number;
  completion_time: number;
  completed_at: string;
}

export interface UserStats {
  user_id: number;
  username: string;
  avatar?: string;
  global_rank: number;
  total_score: number;
  total_quizzes: number;
  total_questions: number;
  correct_answers: number;
  accuracy_percentage: number;
  average_score: number;
  best_score: number;
  current_streak: number;
  best_streak: number;
  total_time_played: number;
  average_time_per_quiz: number;
  fastest_quiz_time: number;
  badges_count: number;
  trophies_count: number;
  achievements_count: number;
  favorite_category?: string;
  join_date: string;
  last_activity: string;
  rank_history: RankHistoryEntry[];
  category_stats: CategoryStats[];
}

export interface RankHistoryEntry {
  date: string;
  rank: number;
  score: number;
}

export interface CategoryStats {
  category: string;
  rank: number;
  total_quizzes: number;
  average_score: number;
  best_score: number;
  accuracy_percentage: number;
}

export interface FriendsLeaderboard {
  entries: LeaderboardEntry[];
  user_rank: number;
  user_entry: LeaderboardEntry;
}

/**
 * Service pour la gestion des classements utilisant les endpoints définis
 */
export const leaderboardService = {
  /**
   * Récupérer le classement global
   */
  getGlobal: async (params?: {
    period?: 'daily' | 'weekly' | 'monthly' | 'all_time';
    limit?: number;
    page?: number;
  }) => {
    const searchParams = new URLSearchParams();
    
    if (params?.period) searchParams.append('period', params.period);
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.page) searchParams.append('page', params.page.toString());

    const url = searchParams.toString() 
      ? `${API_ENDPOINTS.leaderboards.list}?${searchParams.toString()}`
      : API_ENDPOINTS.leaderboards.list;

    return await api.get<GlobalLeaderboard>(url);
  },

  /**
   * Récupérer le classement par catégorie
   */
  getByCategory: async (category: string, params?: {
    period?: 'daily' | 'weekly' | 'monthly' | 'all_time';
    limit?: number;
    page?: number;
  }) => {
    const searchParams = new URLSearchParams();
    
    if (params?.period) searchParams.append('period', params.period);
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.page) searchParams.append('page', params.page.toString());

    const url = searchParams.toString() 
      ? `${API_ENDPOINTS.leaderboards.byCategory(category)}?${searchParams.toString()}`
      : API_ENDPOINTS.leaderboards.byCategory(category);

    return await api.get<CategoryLeaderboard>(url);
  },

  /**
   * Récupérer le classement d'un quiz spécifique
   */
  getByQuiz: async (quizId: number | string, params?: {
    limit?: number;
    page?: number;
  }) => {
    const searchParams = new URLSearchParams();
    
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.page) searchParams.append('page', params.page.toString());

    const url = searchParams.toString() 
      ? `${API_ENDPOINTS.leaderboards.byQuiz(quizId)}?${searchParams.toString()}`
      : API_ENDPOINTS.leaderboards.byQuiz(quizId);

    return await api.get<QuizLeaderboard>(url);
  },

  /**
   * Récupérer le classement des amis
   */
  getFriends: async (params?: {
    period?: 'daily' | 'weekly' | 'monthly' | 'all_time';
    limit?: number;
  }) => {
    const searchParams = new URLSearchParams();
    
    if (params?.period) searchParams.append('period', params.period);
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const url = searchParams.toString() 
      ? `${API_ENDPOINTS.leaderboards.friends}?${searchParams.toString()}`
      : API_ENDPOINTS.leaderboards.friends;

    return await api.get<FriendsLeaderboard>(url);
  },

  /**
   * Récupérer les statistiques d'un utilisateur
   */
  getUserStats: async (userId?: number | string) => {
    const endpoint = userId 
      ? `${API_ENDPOINTS.leaderboards.userStats}/${userId}`
      : API_ENDPOINTS.leaderboards.userStats;

    return await api.get<UserStats>(endpoint);
  },

  /**
   * Récupérer le rang actuel de l'utilisateur
   */
  getCurrentUserRank: async (category?: string) => {
    const endpoint = category 
      ? `${API_ENDPOINTS.leaderboards.userStats}/rank?category=${category}`
      : `${API_ENDPOINTS.leaderboards.userStats}/rank`;

    return await api.get<{
      global_rank: number;
      category_rank?: number;
      total_users: number;
      percentile: number;
    }>(endpoint);
  },

  /**
   * Récupérer l'historique des rangs
   */
  getRankHistory: async (period: 'week' | 'month' | 'year' = 'month') => {
    return await api.get<RankHistoryEntry[]>(`${API_ENDPOINTS.leaderboards.userStats}/history?period=${period}`);
  },

  /**
   * Récupérer les statistiques par catégorie
   */
  getCategoryStats: async () => {
    return await api.get<CategoryStats[]>(`${API_ENDPOINTS.leaderboards.userStats}/categories`);
  },

  /**
   * Récupérer le top des utilisateurs par critère
   */
  getTopBy: async (criteria: 'score' | 'accuracy' | 'speed' | 'streak', params?: {
    period?: 'daily' | 'weekly' | 'monthly' | 'all_time';
    category?: string;
    limit?: number;
  }) => {
    const searchParams = new URLSearchParams();
    searchParams.append('criteria', criteria);
    
    if (params?.period) searchParams.append('period', params.period);
    if (params?.category) searchParams.append('category', params.category);
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    return await api.get<LeaderboardEntry[]>(`${API_ENDPOINTS.leaderboards.list}/top?${searchParams.toString()}`);
  },

  /**
   * Récupérer les utilisateurs proches dans le classement
   */
  getNearbyUsers: async (range: number = 5) => {
    return await api.get<{
      above: LeaderboardEntry[];
      current: LeaderboardEntry;
      below: LeaderboardEntry[];
    }>(`${API_ENDPOINTS.leaderboards.userStats}/nearby?range=${range}`);
  },

  /**
   * Comparer avec un autre utilisateur
   */
  compareWith: async (userId: number | string) => {
    return await api.get<{
      current_user: UserStats;
      compared_user: UserStats;
      comparison: {
        rank_difference: number;
        score_difference: number;
        accuracy_difference: number;
        better_categories: string[];
        worse_categories: string[];
      };
    }>(`${API_ENDPOINTS.leaderboards.userStats}/compare/${userId}`);
  },

  /**
   * Récupérer les records personnels
   */
  getPersonalRecords: async () => {
    return await api.get<{
      best_score: { value: number; quiz_title: string; date: string };
      best_accuracy: { value: number; quiz_title: string; date: string };
      fastest_completion: { value: number; quiz_title: string; date: string };
      longest_streak: { value: number; start_date: string; end_date: string };
      most_quizzes_day: { value: number; date: string };
    }>(`${API_ENDPOINTS.leaderboards.userStats}/records`);
  },

  /**
   * Récupérer les tendances de performance
   */
  getPerformanceTrends: async (period: 'week' | 'month' | 'quarter' = 'month') => {
    return await api.get<{
      score_trend: { date: string; value: number }[];
      accuracy_trend: { date: string; value: number }[];
      speed_trend: { date: string; value: number }[];
      activity_trend: { date: string; value: number }[];
    }>(`${API_ENDPOINTS.leaderboards.userStats}/trends?period=${period}`);
  },

  /**
   * Récupérer les défis disponibles
   */
  getChallenges: async () => {
    return await api.get<{
      id: number;
      title: string;
      description: string;
      target: number;
      current_progress: number;
      reward: string;
      expires_at?: string;
    }[]>(`${API_ENDPOINTS.leaderboards.list}/challenges`);
  },

  /**
   * Participer à un défi
   */
  joinChallenge: async (challengeId: number | string) => {
    return await api.post(`${API_ENDPOINTS.leaderboards.list}/challenges/${challengeId}/join`);
  },

  /**
   * Récupérer les récompenses disponibles
   */
  getRewards: async () => {
    return await api.get(`${API_ENDPOINTS.leaderboards.userStats}/rewards`);
  },

  /**
   * Réclamer une récompense
   */
  claimReward: async (rewardId: number | string) => {
    return await api.post(`${API_ENDPOINTS.leaderboards.userStats}/rewards/${rewardId}/claim`);
  },
};

export default leaderboardService; 