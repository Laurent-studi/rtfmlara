import { API_ENDPOINTS } from './endpoints';
import { api } from './index';

// Types pour Battle Royale basés sur les modèles PHP
export interface BattleRoyaleSession {
  id: number;
  name: string;
  max_players: number;
  elimination_interval: number;
  status: 'waiting' | 'active' | 'finished';
  started_at?: string;
  ended_at?: string;
  created_at: string;
  // Propriétés calculées
  current_participants: number;
  survivors_count?: number;
  eliminated_count?: number;
  participants: BattleRoyaleParticipant[];
  winner?: BattleRoyaleParticipant;
}

export interface BattleRoyaleParticipant {
  id: number;
  session_id: number;
  user_id?: number;
  username?: string;
  avatar?: string;
  position?: number;
  eliminated_at?: string;
  score: number;
  // Relations
  user?: {
    id: number;
    username: string;
    avatar?: string;
  };
}

export interface CreateBattleRoyaleData {
  name: string;
  max_players?: number;
  elimination_interval?: number;
}

export interface JoinBattleRoyaleData {
  username: string;
  user_id?: number;
}

export interface SubmitBattleRoyaleAnswerData {
  question_id: number;
  answer_ids: number[];
  time_taken: number;
}

/**
 * Service pour Battle Royale utilisant les endpoints définis
 */
export const battleRoyaleService = {
  /**
   * Récupérer toutes les sessions Battle Royale
   */
  getAll: async () => {
    return await api.get<BattleRoyaleSession[]>(API_ENDPOINTS.battleRoyale.list);
  },

  /**
   * Récupérer une session par son ID
   */
  getById: async (id: number | string) => {
    return await api.get<BattleRoyaleSession>(API_ENDPOINTS.battleRoyale.byId(id));
  },

  /**
   * Créer une nouvelle session Battle Royale
   */
  create: async (sessionData: CreateBattleRoyaleData) => {
    return await api.post<BattleRoyaleSession>(API_ENDPOINTS.battleRoyale.create, sessionData);
  },

  /**
   * Rejoindre une session Battle Royale
   */
  join: async (id: number | string, playerData: JoinBattleRoyaleData) => {
    return await api.post<BattleRoyaleParticipant>(API_ENDPOINTS.battleRoyale.join(id), playerData);
  },

  /**
   * Démarrer une session Battle Royale
   */
  start: async (id: number | string) => {
    return await api.post(API_ENDPOINTS.battleRoyale.start(id));
  },

  /**
   * Soumettre une réponse
   */
  submitAnswer: async (id: number | string, answerData: SubmitBattleRoyaleAnswerData) => {
    return await api.post(API_ENDPOINTS.battleRoyale.submitAnswer(id), answerData);
  },

  /**
   * Éliminer un participant (automatique ou manuel)
   */
  eliminate: async (id: number | string, participantId?: number | string) => {
    const data = participantId ? { participant_id: participantId } : {};
    return await api.post(API_ENDPOINTS.battleRoyale.eliminate(id), data);
  },

  /**
   * Récupérer l'état en temps réel d'une session
   */
  getState: async (id: number | string) => {
    return await api.get(`${API_ENDPOINTS.battleRoyale.byId(id)}/state`);
  },

  /**
   * Récupérer les participants d'une session
   */
  getParticipants: async (id: number | string) => {
    return await api.get<BattleRoyaleParticipant[]>(`${API_ENDPOINTS.battleRoyale.byId(id)}/participants`);
  },

  /**
   * Récupérer les participants éliminés
   */
  getEliminatedParticipants: async (id: number | string) => {
    return await api.get<BattleRoyaleParticipant[]>(`${API_ENDPOINTS.battleRoyale.byId(id)}/eliminated`);
  },

  /**
   * Récupérer les participants survivants
   */
  getSurvivors: async (id: number | string) => {
    return await api.get<BattleRoyaleParticipant[]>(`${API_ENDPOINTS.battleRoyale.byId(id)}/survivors`);
  },

  /**
   * Récupérer les statistiques d'une session
   */
  getStats: async (id: number | string) => {
    return await api.get(`${API_ENDPOINTS.battleRoyale.byId(id)}/stats`);
  },

  /**
   * Récupérer l'historique des sessions Battle Royale
   */
  getHistory: async () => {
    return await api.get<BattleRoyaleSession[]>(`${API_ENDPOINTS.battleRoyale.list}/history`);
  },

  /**
   * Récupérer les sessions actives
   */
  getActive: async () => {
    return await api.get<BattleRoyaleSession[]>(`${API_ENDPOINTS.battleRoyale.list}/active`);
  },

  /**
   * Récupérer mes sessions Battle Royale
   */
  getMySessions: async () => {
    return await api.get<BattleRoyaleSession[]>(`${API_ENDPOINTS.battleRoyale.list}/my-sessions`);
  },

  /**
   * Quitter une session
   */
  leave: async (id: number | string) => {
    return await api.post(`${API_ENDPOINTS.battleRoyale.byId(id)}/leave`);
  },

  /**
   * Récupérer le classement final
   */
  getFinalRanking: async (id: number | string) => {
    return await api.get<BattleRoyaleParticipant[]>(`${API_ENDPOINTS.battleRoyale.byId(id)}/final-ranking`);
  },
};

export default battleRoyaleService; 