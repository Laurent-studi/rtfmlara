import { API_ENDPOINTS } from './endpoints';
import { api } from './index';

// Types pour les ligues
export interface League {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  min_score: number;
  max_score?: number;
  color: string;
  rank: number;
  rewards: LeagueReward[];
  participants_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Propriétés supplémentaires pour l'interface utilisateur
  status?: 'active' | 'upcoming' | 'ended';
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  is_private?: boolean;
  prize_pool?: number;
  max_participants?: number;
  start_date?: string;
  end_date?: string;
  creator?: {
    id: number;
    username: string;
  };
  rules?: string;
}

export interface LeagueReward {
  type: 'badge' | 'trophy' | 'points' | 'title';
  value: string | number;
  description: string;
}

export interface UserLeague {
  id: number;
  user_id: number;
  league_id: number;
  league: League;
  current_score: number;
  rank_in_league: number;
  joined_at: string;
  promoted_at?: string;
  relegated_at?: string;
}

export interface LeagueStats {
  current_league: League;
  current_rank: number;
  points_to_promotion?: number;
  points_to_relegation?: number;
  season_stats: {
    games_played: number;
    wins: number;
    losses: number;
    draws: number;
    total_score: number;
    average_score: number;
  };
}

export interface LeagueParticipant {
  id: number;
  league_id: number;
  user_id: number;
  user: {
    id: number;
    username: string;
    avatar?: string;
  };
  score: number;
  rank: number;
  joined_at: string;
}

/**
 * Service pour la gestion des ligues utilisant les endpoints définis
 */
export const leagueService = {
  /**
   * Récupérer toutes les ligues
   */
  getAll: async () => {
    return await api.get<League[]>(API_ENDPOINTS.leagues.list);
  },

  /**
   * Récupérer la ligue actuelle de l'utilisateur
   */
  getCurrent: async () => {
    return await api.get<UserLeague>(API_ENDPOINTS.leagues.current);
  },

  /**
   * Récupérer mes ligues
   */
  getMyLeagues: async () => {
    return await api.get<League[]>(`${API_ENDPOINTS.leagues.list}/my-leagues`);
  },

  /**
   * Rejoindre une ligue
   */
  join: async (leagueId: number | string) => {
    return await api.post(`${API_ENDPOINTS.leagues.list}/${leagueId}/join`);
  },

  /**
   * Quitter une ligue
   */
  leave: async (leagueId: number | string) => {
    return await api.post(`${API_ENDPOINTS.leagues.list}/${leagueId}/leave`);
  },

  /**
   * Récupérer les statistiques de ligue de l'utilisateur
   */
  getStats: async () => {
    return await api.get<LeagueStats>(`${API_ENDPOINTS.leagues.current}/stats`);
  },

  /**
   * Récupérer le classement d'une ligue
   */
  getLeaderboard: async (leagueId: number | string, params?: {
    page?: number;
    limit?: number;
  }) => {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const url = searchParams.toString() 
      ? `${API_ENDPOINTS.leagues.list}/${leagueId}/leaderboard?${searchParams.toString()}`
      : `${API_ENDPOINTS.leagues.list}/${leagueId}/leaderboard`;

    return await api.get(url);
  },

  /**
   * Récupérer l'historique des ligues de l'utilisateur
   */
  getHistory: async () => {
    return await api.get<UserLeague[]>(`${API_ENDPOINTS.leagues.current}/history`);
  },

  /**
   * Récupérer les récompenses disponibles
   */
  getRewards: async (leagueId: number | string) => {
    return await api.get<LeagueReward[]>(`${API_ENDPOINTS.leagues.list}/${leagueId}/rewards`);
  },

  /**
   * Récupérer les promotions/relégations récentes
   */
  getRecentChanges: async () => {
    return await api.get(`${API_ENDPOINTS.leagues.list}/recent-changes`);
  },

  /**
   * Simuler une promotion/relégation
   */
  simulate: async (score: number) => {
    return await api.post(`${API_ENDPOINTS.leagues.current}/simulate`, { score });
  },
};

export default leagueService; 