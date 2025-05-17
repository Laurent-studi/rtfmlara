import axios from 'axios';

// Configuration de base pour axios
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Types
export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswers: number[];
  timeLimit: number;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  code: string;
}

export interface Player {
  id: string;
  name: string;
  score: number;
  isHost: boolean;
}

// API pour les quiz
export const quizApi = {
  // Créer un nouveau quiz
  createQuiz: async (quiz: Omit<Quiz, 'id' | 'createdAt' | 'updatedAt' | 'code'>) => {
    const response = await api.post<Quiz>('/quizzes', quiz);
    return response.data;
  },

  // Récupérer un quiz par son code
  getQuizByCode: async (code: string) => {
    const response = await api.get<Quiz>(`/quizzes/code/${code}`);
    return response.data;
  },

  // Mettre à jour un quiz
  updateQuiz: async (id: string, quiz: Partial<Quiz>) => {
    const response = await api.put<Quiz>(`/quizzes/${id}`, quiz);
    return response.data;
  },

  // Supprimer un quiz
  deleteQuiz: async (id: string) => {
    await api.delete(`/quizzes/${id}`);
  },

  // Lancer un quiz
  startQuiz: async (code: string) => {
    const response = await api.post<{ success: boolean }>(`/quizzes/${code}/start`);
    return response.data;
  },

  // Récupérer la question actuelle
  getCurrentQuestion: async (code: string) => {
    const response = await api.get<Question>(`/quizzes/${code}/current-question`);
    return response.data;
  },

  // Passer à la question suivante
  nextQuestion: async (code: string) => {
    const response = await api.post<{ success: boolean }>(`/quizzes/${code}/next-question`);
    return response.data;
  },

  // Soumettre une réponse
  submitAnswer: async (code: string, playerId: string, questionId: string, answerIndices: number[]) => {
    const response = await api.post<{ success: boolean, score: number }>(
      `/quizzes/${code}/submit-answer`,
      { playerId, questionId, answerIndices }
    );
    return response.data;
  },

  // Récupérer le classement
  getLeaderboard: async (code: string) => {
    const response = await api.get<Player[]>(`/quizzes/${code}/leaderboard`);
    return response.data;
  },

  // Rejoindre un quiz
  joinQuiz: async (code: string, playerName: string) => {
    const response = await api.post<Player>(`/quizzes/${code}/join`, { playerName });
    return response.data;
  },

  // Quitter un quiz
  leaveQuiz: async (code: string, playerId: string) => {
    await api.post(`/quizzes/${code}/leave`, { playerId });
  },
};

export default quizApi; 