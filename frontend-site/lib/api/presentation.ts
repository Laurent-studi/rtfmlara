import { API_ENDPOINTS } from './endpoints';
import { api } from './index';
import { Quiz, Question } from './quiz';
import { Participant } from './sessions';

// Types pour les présentations
export interface PresentationSession {
  id: string;
  quiz_id: number;
  quiz?: Quiz;
  presenter_id: number;
  session_code: string;
  status: 'waiting' | 'active' | 'paused' | 'completed';
  current_question_index: number;
  current_question?: Question;
  participants_count: number;
  show_leaderboard: boolean;
  show_correct_answers: boolean;
  question_time_limit?: number;
  auto_advance: boolean;
  started_at?: string;
  ended_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PresentationState {
  session: PresentationSession;
  current_question?: Question;
  participants: Participant[];
  leaderboard: Participant[];
  question_results?: QuestionResults;
  is_question_active: boolean;
  time_remaining?: number;
}

export interface QuestionResults {
  question_id: number;
  total_responses: number;
  correct_responses: number;
  answer_distribution: {
    answer_id: number;
    answer_text: string;
    count: number;
    percentage: number;
    is_correct: boolean;
  }[];
  average_time: number;
  fastest_response: number;
}

export interface CreatePresentationData {
  quiz_id: number;
  show_leaderboard?: boolean;
  show_correct_answers?: boolean;
  question_time_limit?: number;
  auto_advance?: boolean;
}

export interface JoinPresentationData {
  session_code: string;
  username: string;
  user_id?: number;
}

export interface SubmitPresentationAnswerData {
  question_id: number;
  answer_ids: number[];
  time_taken: number;
}

/**
 * Service pour la gestion des présentations de quiz utilisant les endpoints définis
 */
export const presentationService = {
  /**
   * Créer une nouvelle session de présentation
   */
  createSession: async (sessionData: CreatePresentationData) => {
    return await api.post<PresentationSession>(API_ENDPOINTS.presentation.create, sessionData);
  },

  /**
   * Récupérer l'état d'une session de présentation
   */
  getState: async (sessionId: string) => {
    return await api.get<PresentationState>(API_ENDPOINTS.presentation.getState(sessionId));
  },

  /**
   * Démarrer une session de présentation
   */
  start: async (sessionId: string) => {
    return await api.post(API_ENDPOINTS.presentation.start(sessionId));
  },

  /**
   * Passer à la question suivante
   */
  next: async (sessionId: string) => {
    return await api.post(API_ENDPOINTS.presentation.next(sessionId));
  },

  /**
   * Terminer une session de présentation
   */
  end: async (sessionId: string) => {
    return await api.post(API_ENDPOINTS.presentation.end(sessionId));
  },

  /**
   * Récupérer le classement d'une session
   */
  getLeaderboard: async (sessionId: string) => {
    return await api.get<Participant[]>(API_ENDPOINTS.presentation.leaderboard(sessionId));
  },

  /**
   * Rejoindre une session de présentation
   */
  join: async (joinData: JoinPresentationData) => {
    return await api.post<Participant>(API_ENDPOINTS.presentation.join, joinData);
  },

  /**
   * Soumettre une réponse dans une présentation
   */
  submitAnswer: async (sessionId: string, answerData: SubmitPresentationAnswerData) => {
    return await api.post(API_ENDPOINTS.presentation.submitAnswer(sessionId), answerData);
  },

  /**
   * Mettre en pause une session
   */
  pause: async (sessionId: string) => {
    return await api.post(`${API_ENDPOINTS.presentation.getState(sessionId)}/pause`);
  },

  /**
   * Reprendre une session
   */
  resume: async (sessionId: string) => {
    return await api.post(`${API_ENDPOINTS.presentation.getState(sessionId)}/resume`);
  },

  /**
   * Aller à une question spécifique
   */
  goToQuestion: async (sessionId: string, questionIndex: number) => {
    return await api.post(`${API_ENDPOINTS.presentation.getState(sessionId)}/go-to-question`, {
      question_index: questionIndex
    });
  },

  /**
   * Activer/désactiver l'affichage du classement
   */
  toggleLeaderboard: async (sessionId: string, show: boolean) => {
    return await api.post(`${API_ENDPOINTS.presentation.getState(sessionId)}/toggle-leaderboard`, {
      show_leaderboard: show
    });
  },

  /**
   * Activer/désactiver l'affichage des bonnes réponses
   */
  toggleCorrectAnswers: async (sessionId: string, show: boolean) => {
    return await api.post(`${API_ENDPOINTS.presentation.getState(sessionId)}/toggle-correct-answers`, {
      show_correct_answers: show
    });
  },

  /**
   * Mettre à jour le temps limite des questions
   */
  updateTimeLimit: async (sessionId: string, timeLimit?: number) => {
    return await api.post(`${API_ENDPOINTS.presentation.getState(sessionId)}/update-time-limit`, {
      question_time_limit: timeLimit
    });
  },

  /**
   * Récupérer les résultats de la question actuelle
   */
  getQuestionResults: async (sessionId: string) => {
    return await api.get<QuestionResults>(`${API_ENDPOINTS.presentation.getState(sessionId)}/question-results`);
  },

  /**
   * Récupérer les participants connectés
   */
  getParticipants: async (sessionId: string) => {
    return await api.get<Participant[]>(`${API_ENDPOINTS.presentation.getState(sessionId)}/participants`);
  },

  /**
   * Exclure un participant
   */
  kickParticipant: async (sessionId: string, participantId: number | string) => {
    return await api.delete(`${API_ENDPOINTS.presentation.getState(sessionId)}/participants/${participantId}`);
  },

  /**
   * Récupérer les statistiques complètes de la session
   */
  getSessionStats: async (sessionId: string) => {
    return await api.get(`${API_ENDPOINTS.presentation.getState(sessionId)}/stats`);
  },

  /**
   * Exporter les résultats de la session
   */
  exportResults: async (sessionId: string, format: 'csv' | 'xlsx' | 'pdf' = 'csv') => {
    return await api.get(`${API_ENDPOINTS.presentation.getState(sessionId)}/export?format=${format}`);
  },

  /**
   * Récupérer une session par son code
   */
  getByCode: async (code: string) => {
    return await api.get<PresentationSession>(`${API_ENDPOINTS.presentation.create}/code/${code}`);
  },

  /**
   * Vérifier si un code de session existe
   */
  checkCode: async (code: string) => {
    return await api.get(`${API_ENDPOINTS.presentation.create}/check-code/${code}`);
  },

  /**
   * Envoyer un message aux participants
   */
  sendMessage: async (sessionId: string, message: string) => {
    return await api.post(`${API_ENDPOINTS.presentation.getState(sessionId)}/message`, {
      message
    });
  },

  /**
   * Activer/désactiver le mode plein écran
   */
  toggleFullscreen: async (sessionId: string, fullscreen: boolean) => {
    return await api.post(`${API_ENDPOINTS.presentation.getState(sessionId)}/fullscreen`, {
      fullscreen
    });
  },
};

export default presentationService; 