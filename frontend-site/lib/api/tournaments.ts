import { API_ENDPOINTS } from './endpoints';
import { api } from './index';

// Types pour les tournois
export interface Tournament {
  id: number;
  name: string;
  description?: string;
  type: 'single_elimination' | 'double_elimination' | 'round_robin' | 'swiss';
  status: 'upcoming' | 'registration' | 'active' | 'completed' | 'cancelled';
  max_participants: number;
  current_participants: number;
  entry_fee?: number;
  prize_pool?: number;
  start_date: string;
  end_date?: string;
  registration_deadline: string;
  organizer_id: number;
  quiz_ids: number[];
  rules: TournamentRules;
  brackets?: TournamentBracket[];
  participants: TournamentParticipant[];
  created_at: string;
  updated_at: string;
}

export interface TournamentRules {
  elimination_type: 'single' | 'double';
  match_format: 'best_of_1' | 'best_of_3' | 'best_of_5';
  time_limit_per_question?: number;
  allow_late_registration: boolean;
  minimum_participants: number;
  seeding_method: 'random' | 'ranking' | 'manual';
}

export interface TournamentBracket {
  id: number;
  tournament_id: number;
  round: number;
  match_number: number;
  participant1_id?: number;
  participant2_id?: number;
  winner_id?: number;
  status: 'pending' | 'active' | 'completed';
  scheduled_at?: string;
  completed_at?: string;
}

export interface TournamentParticipant {
  id: number;
  tournament_id: number;
  user_id: number;
  user: {
    id: number;
    username: string;
    avatar?: string;
  };
  seed: number;
  status: 'registered' | 'active' | 'eliminated' | 'winner';
  total_score: number;
  matches_played: number;
  matches_won: number;
  matches_lost: number;
  registered_at: string;
  eliminated_at?: string;
}

export interface CreateTournamentData {
  name: string;
  description?: string;
  type: 'single_elimination' | 'double_elimination' | 'round_robin' | 'swiss';
  max_participants: number;
  entry_fee?: number;
  prize_pool?: number;
  start_date: string;
  registration_deadline: string;
  quiz_ids: number[];
  rules: Partial<TournamentRules>;
}

export interface RegisterTournamentData {
  tournament_id: number;
  payment_method?: string;
}

/**
 * Service pour la gestion des tournois utilisant les endpoints définis
 */
export const tournamentService = {
  /**
   * Récupérer tous les tournois
   */
  getAll: async (params?: {
    status?: string;
    type?: string;
    page?: number;
    limit?: number;
  }) => {
    const searchParams = new URLSearchParams();
    
    if (params?.status) searchParams.append('status', params.status);
    if (params?.type) searchParams.append('type', params.type);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const url = searchParams.toString() 
      ? `${API_ENDPOINTS.tournaments.list}?${searchParams.toString()}`
      : API_ENDPOINTS.tournaments.list;

    return await api.get<{
      data: Tournament[];
      total: number;
      current_page: number;
      last_page: number;
    }>(url);
  },

  /**
   * Récupérer un tournoi par son ID
   */
  getById: async (id: number | string) => {
    return await api.get<Tournament>(API_ENDPOINTS.tournaments.byId(id));
  },

  /**
   * Créer un nouveau tournoi
   */
  create: async (tournamentData: CreateTournamentData) => {
    return await api.post<Tournament>(API_ENDPOINTS.tournaments.create, tournamentData);
  },

  /**
   * Mettre à jour un tournoi
   */
  update: async (id: number | string, tournamentData: Partial<CreateTournamentData>) => {
    return await api.put<Tournament>(API_ENDPOINTS.tournaments.update(id), tournamentData);
  },

  /**
   * Supprimer un tournoi
   */
  delete: async (id: number | string) => {
    return await api.delete(API_ENDPOINTS.tournaments.delete(id));
  },

  /**
   * S'inscrire à un tournoi
   */
  register: async (id: number | string, data?: RegisterTournamentData) => {
    return await api.post<TournamentParticipant>(API_ENDPOINTS.tournaments.register(id), data);
  },

  /**
   * Se désinscrire d'un tournoi
   */
  unregister: async (id: number | string) => {
    return await api.delete(`${API_ENDPOINTS.tournaments.byId(id)}/unregister`);
  },

  /**
   * Démarrer un tournoi
   */
  start: async (id: number | string) => {
    return await api.post(`${API_ENDPOINTS.tournaments.byId(id)}/start`);
  },

  /**
   * Récupérer les brackets d'un tournoi
   */
  getBrackets: async (id: number | string) => {
    return await api.get<TournamentBracket[]>(`${API_ENDPOINTS.tournaments.byId(id)}/brackets`);
  },

  /**
   * Récupérer les participants d'un tournoi
   */
  getParticipants: async (id: number | string) => {
    return await api.get<TournamentParticipant[]>(`${API_ENDPOINTS.tournaments.byId(id)}/participants`);
  },

  /**
   * Récupérer le classement d'un tournoi
   */
  getLeaderboard: async (id: number | string) => {
    return await api.get<TournamentParticipant[]>(`${API_ENDPOINTS.tournaments.byId(id)}/leaderboard`);
  },

  /**
   * Récupérer les matchs d'un tournoi
   */
  getMatches: async (id: number | string, round?: number) => {
    const url = round 
      ? `${API_ENDPOINTS.tournaments.byId(id)}/matches?round=${round}`
      : `${API_ENDPOINTS.tournaments.byId(id)}/matches`;

    return await api.get(url);
  },

  /**
   * Récupérer les tournois à venir
   */
  getUpcoming: async () => {
    return await api.get<Tournament[]>(`${API_ENDPOINTS.tournaments.list}/upcoming`);
  },

  /**
   * Récupérer les tournois actifs
   */
  getActive: async () => {
    return await api.get<Tournament[]>(`${API_ENDPOINTS.tournaments.list}/active`);
  },

  /**
   * Récupérer les tournois terminés
   */
  getCompleted: async () => {
    return await api.get<Tournament[]>(`${API_ENDPOINTS.tournaments.list}/completed`);
  },

  /**
   * Récupérer les tournois auxquels l'utilisateur participe
   */
  getMyTournaments: async () => {
    return await api.get<Tournament[]>(`${API_ENDPOINTS.tournaments.list}/my-tournaments`);
  },

  /**
   * Récupérer les statistiques d'un tournoi
   */
  getStats: async (id: number | string) => {
    return await api.get(`${API_ENDPOINTS.tournaments.byId(id)}/stats`);
  },

  /**
   * Générer les brackets
   */
  generateBrackets: async (id: number | string) => {
    return await api.post(`${API_ENDPOINTS.tournaments.byId(id)}/generate-brackets`);
  },

  /**
   * Avancer au round suivant
   */
  advanceRound: async (id: number | string) => {
    return await api.post(`${API_ENDPOINTS.tournaments.byId(id)}/advance-round`);
  },

  /**
   * Finaliser un tournoi
   */
  finalize: async (id: number | string) => {
    return await api.post(`${API_ENDPOINTS.tournaments.byId(id)}/finalize`);
  },
};

export default tournamentService; 