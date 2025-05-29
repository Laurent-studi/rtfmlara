import { API_ENDPOINTS } from './endpoints';
import { api } from './index';
import { Quiz, Question } from './quiz';

// Types pour les sessions de quiz
export interface QuizSession {
  id: number;
  quiz_id: number;
  quiz?: Quiz;
  host_id: number;
  session_code: string;
  status: 'waiting' | 'active' | 'paused' | 'completed';
  current_question_index: number;
  current_question?: Question;
  participants_count: number;
  max_participants?: number;
  started_at?: string;
  ended_at?: string;
  created_at: string;
  updated_at: string;
  participants?: Participant[];
  settings?: SessionSettings;
}

export interface Participant {
  id: number;
  session_id: number;
  user_id?: number;
  username: string;
  avatar?: string;
  score: number;
  current_streak: number;
  best_streak: number;
  answers_count: number;
  correct_answers: number;
  joined_at: string;
  last_activity: string;
  is_connected: boolean;
}

export interface SessionSettings {
  show_leaderboard: boolean;
  show_correct_answers: boolean;
  allow_anonymous: boolean;
  question_time_limit?: number;
  auto_advance: boolean;
  shuffle_questions: boolean;
  shuffle_answers: boolean;
}

export interface CreateSessionData {
  quiz_id: number;
  max_participants?: number;
  settings?: Partial<SessionSettings>;
}

export interface JoinSessionData {
  session_code?: string;
  session_id?: number;
  username: string;
  user_id?: number;
}

export interface SubmitAnswerData {
  question_id: number;
  answer_ids: number[];
  time_taken: number;
}

export interface SessionAnswer {
  id: number;
  session_id: number;
  participant_id: number;
  question_id: number;
  answer_ids: number[];
  is_correct: boolean;
  points_earned: number;
  time_taken: number;
  submitted_at: string;
}

/**
 * Service pour la gestion des sessions de quiz utilisant les endpoints définis
 */
export const sessionService = {
  /**
   * Récupérer toutes les sessions
   */
  getAll: async () => {
    return await api.get<QuizSession[]>(API_ENDPOINTS.sessions.list);
  },

  /**
   * Créer une nouvelle session
   */
  create: async (sessionData: CreateSessionData) => {
    return await api.post<QuizSession>(API_ENDPOINTS.sessions.create, sessionData);
  },

  /**
   * Récupérer une session par son ID
   */
  getById: async (id: number | string) => {
    return await api.get<QuizSession>(API_ENDPOINTS.sessions.byId(id));
  },

  /**
   * Rejoindre une session
   */
  join: async (id: number | string, playerData: JoinSessionData) => {
    return await api.post<Participant>(API_ENDPOINTS.sessions.join(id), playerData);
  },

  /**
   * Démarrer une session
   */
  start: async (id: number | string) => {
    return await api.post(API_ENDPOINTS.sessions.start(id));
  },

  /**
   * Soumettre une réponse
   */
  submitAnswer: async (id: number | string, answerData: SubmitAnswerData) => {
    return await api.post<SessionAnswer>(API_ENDPOINTS.sessions.submitAnswer(id), answerData);
  },

  /**
   * Récupérer une session par son code
   */
  getByCode: async (code: string) => {
    return await api.get<QuizSession>(`${API_ENDPOINTS.sessions.list}/code/${code}`);
  },

  /**
   * Mettre en pause une session
   */
  pause: async (id: number | string) => {
    return await api.post(`${API_ENDPOINTS.sessions.byId(id)}/pause`);
  },

  /**
   * Reprendre une session
   */
  resume: async (id: number | string) => {
    return await api.post(`${API_ENDPOINTS.sessions.byId(id)}/resume`);
  },

  /**
   * Terminer une session
   */
  end: async (id: number | string) => {
    return await api.post(`${API_ENDPOINTS.sessions.byId(id)}/end`);
  },

  /**
   * Passer à la question suivante
   */
  nextQuestion: async (id: number | string) => {
    return await api.post(`${API_ENDPOINTS.sessions.byId(id)}/next-question`);
  },

  /**
   * Revenir à la question précédente
   */
  previousQuestion: async (id: number | string) => {
    return await api.post(`${API_ENDPOINTS.sessions.byId(id)}/previous-question`);
  },

  /**
   * Aller à une question spécifique
   */
  goToQuestion: async (id: number | string, questionIndex: number) => {
    return await api.post(`${API_ENDPOINTS.sessions.byId(id)}/go-to-question`, {
      question_index: questionIndex
    });
  },

  /**
   * Récupérer les participants d'une session
   */
  getParticipants: async (id: number | string) => {
    return await api.get<Participant[]>(`${API_ENDPOINTS.sessions.byId(id)}/participants`);
  },

  /**
   * Exclure un participant
   */
  kickParticipant: async (sessionId: number | string, participantId: number | string) => {
    return await api.delete(`${API_ENDPOINTS.sessions.byId(sessionId)}/participants/${participantId}`);
  },

  /**
   * Récupérer le classement d'une session
   */
  getLeaderboard: async (id: number | string) => {
    return await api.get<Participant[]>(`${API_ENDPOINTS.sessions.byId(id)}/leaderboard`);
  },

  /**
   * Récupérer les résultats détaillés d'une session
   */
  getResults: async (id: number | string) => {
    return await api.get(`${API_ENDPOINTS.sessions.byId(id)}/results`);
  },

  /**
   * Récupérer les réponses d'un participant
   */
  getParticipantAnswers: async (sessionId: number | string, participantId: number | string) => {
    return await api.get<SessionAnswer[]>(`${API_ENDPOINTS.sessions.byId(sessionId)}/participants/${participantId}/answers`);
  },

  /**
   * Mettre à jour les paramètres d'une session
   */
  updateSettings: async (id: number | string, settings: Partial<SessionSettings>) => {
    return await api.put(`${API_ENDPOINTS.sessions.byId(id)}/settings`, settings);
  },

  /**
   * Supprimer une session
   */
  delete: async (id: number | string) => {
    return await api.delete(API_ENDPOINTS.sessions.byId(id));
  },

  /**
   * Récupérer l'état en temps réel d'une session
   */
  getState: async (id: number | string) => {
    return await api.get(`${API_ENDPOINTS.sessions.byId(id)}/state`);
  },

  /**
   * Envoyer un ping pour maintenir la connexion
   */
  ping: async (sessionId: number | string, participantId: number | string) => {
    return await api.post(`${API_ENDPOINTS.sessions.byId(sessionId)}/participants/${participantId}/ping`);
  },
};

export default sessionService; 