import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// Types
export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
}

export interface LoginRequest {
  username: string;
  password: string;
  email: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface AuthResponse {
  username: string;
  email: string;
  token: string;
}

export interface Quiz {
  id: number;
  title: string;
  description: string;
  category: string;
  timePerQuestion: number;
  multipleAnswers: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
  creatorId: number;
}

export interface Question {
  id: number;
  quizId: number;
  questionText: string;
  points: number;
  orderIndex: number;
  createdAt: string;
}

export interface Answer {
  id: number;
  questionId: number;
  answerText: string;
  isCorrect: boolean;
  createdAt: string;
}

export interface QuizSession {
  id: number;
  quizId: number;
  startedAt: string;
  endedAt: string | null;
  status: string;
}

export interface Participant {
  id: number;
  sessionId: number;
  userId: number | null;
  pseudo: string;
  score: number;
  joinedAt: string;
}

export interface ParticipantAnswer {
  id: number;
  participantId: number;
  questionId: number;
  answerId: number;
  responseTime: number;
  pointsEarned: number;
  createdAt: string;
}

export interface Badge {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
}

export interface Theme {
  id: number;
  name: string;
  description: string;
}

export interface UserStats {
  totalQuizzes: number;
  totalQuestions: number;
  totalAnswers: number;
  totalCorrectAnswers: number;
  totalIncorrectAnswers: number;
  totalPoints: number;
}

export interface QuizStats {
  totalParticipants: number;
  totalCorrectAnswers: number;
  totalIncorrectAnswers: number;
  totalPoints: number;
}

export interface SessionResults {
  totalParticipants: number;
  totalCorrectAnswers: number;
  totalIncorrectAnswers: number;
  totalPoints: number;
}

export interface LeaderboardEntry {
  participantId: number;
  pseudo: string;
  score: number;
  rank: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
  link?: string;
}

// Service API
class ApiService {
  private static instance: ApiService;
  private token: string | null = null;

  private constructor() {}

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  // Configuration des headers
  private getHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  // Gestion des erreurs
  private handleError(error: any): never {
    if (error.response) {
      throw new Error(error.response.data.message || 'Une erreur est survenue');
    }
    throw error;
  }

  // Authentification
  public setToken(token: string) {
    this.token = token;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  public getAuthToken(): string | null {
    // Récupérer d'abord depuis la mémoire, puis depuis localStorage si nécessaire
    if (this.token) {
      return this.token;
    }
    
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    
    return null;
  }

  public clearToken() {
    this.token = null;
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  // Routes d'authentification
  public async register(data: RegisterRequest): Promise<void> {
    try {
      await axios.post(`${API_URL}/auth/register`, data, { headers: this.getHeaders() });
    } catch (error) {
      this.handleError(error);
    }
  }

  public async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, data, { headers: this.getHeaders() });
      this.setToken(response.data.token);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  public async forgotPassword(data: ForgotPasswordRequest): Promise<void> {
    try {
      await axios.post(`${API_URL}/auth/forgot-password`, data, { headers: this.getHeaders() });
    } catch (error) {
      this.handleError(error);
    }
  }

  public async resetPassword(data: ResetPasswordRequest): Promise<void> {
    try {
      await axios.post(`${API_URL}/auth/reset-password`, data, { headers: this.getHeaders() });
    } catch (error) {
      this.handleError(error);
    }
  }

  // Routes de quiz
  public async createQuiz(quiz: Partial<Quiz>): Promise<Quiz> {
    try {
      const response = await axios.post(`${API_URL}/quizzes`, quiz, { headers: this.getHeaders() });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  public async getQuiz(id: number): Promise<Quiz> {
    try {
      const response = await axios.get(`${API_URL}/quizzes/${id}`, { headers: this.getHeaders() });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  public async searchQuizzes(queryString: string): Promise<Quiz[]> {
    try {
      const response = await axios.get(`${API_URL}/quizzes/search?${queryString}`, { headers: this.getHeaders() });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  public async getFeaturedQuizzes(): Promise<Quiz[]> {
    try {
      const response = await axios.get(`${API_URL}/quizzes/featured`, { headers: this.getHeaders() });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  public async getTrendingQuizzes(): Promise<Quiz[]> {
    try {
      const response = await axios.get(`${API_URL}/stats/trending-quizzes`, { headers: this.getHeaders() });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  public async getRecommendedQuizzes(): Promise<Quiz[]> {
    try {
      const response = await axios.get(`${API_URL}/quizzes/recommended`, { headers: this.getHeaders() });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  public async getQuizCategories(): Promise<string[]> {
    try {
      const response = await axios.get(`${API_URL}/quizzes/categories`, { headers: this.getHeaders() });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  public async updateQuiz(id: number, quiz: Partial<Quiz>): Promise<Quiz> {
    try {
      const response = await axios.put(`${API_URL}/quizzes/${id}`, quiz, { headers: this.getHeaders() });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  public async deleteQuiz(id: number): Promise<void> {
    try {
      await axios.delete(`${API_URL}/quizzes/${id}`, { headers: this.getHeaders() });
    } catch (error) {
      this.handleError(error);
    }
  }

  // Routes de questions
  public async createQuestion(question: Partial<Question>): Promise<Question> {
    try {
      const response = await axios.post(`${API_URL}/questions`, question, { headers: this.getHeaders() });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  public async getQuizQuestions(quizId: number): Promise<Question[]> {
    try {
      const response = await axios.get(`${API_URL}/quizzes/${quizId}/questions`, { headers: this.getHeaders() });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  public async deleteQuestion(questionId: number): Promise<void> {
    try {
      await axios.delete(`${API_URL}/questions/${questionId}`, { headers: this.getHeaders() });
    } catch (error) {
      this.handleError(error);
    }
  }

  // Routes de réponses
  public async createAnswer(answer: Partial<Answer>): Promise<Answer> {
    try {
      const response = await axios.post(`${API_URL}/answers`, answer, { headers: this.getHeaders() });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  public async getQuestionAnswers(questionId: number): Promise<Answer[]> {
    try {
      const response = await axios.get(`${API_URL}/questions/${questionId}/answers`, { headers: this.getHeaders() });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Routes de sessions
  public async createQuizSession(quizId: number): Promise<QuizSession> {
    try {
      const response = await axios.post(`${API_URL}/quiz-sessions`, { quizId }, { headers: this.getHeaders() });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  public async getQuizSession(sessionId: number): Promise<QuizSession> {
    try {
      const response = await axios.get(`${API_URL}/quiz-sessions/${sessionId}`, { headers: this.getHeaders() });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Routes de participants
  public async joinQuizSession(sessionId: number, data: { pseudo: string }): Promise<Participant> {
    try {
      const response = await axios.post(`${API_URL}/quiz-sessions/${sessionId}/join`, data, { headers: this.getHeaders() });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  public async submitAnswer(participantAnswer: Partial<ParticipantAnswer>): Promise<ParticipantAnswer> {
    try {
      const response = await axios.post(`${API_URL}/participant-answers`, participantAnswer, { headers: this.getHeaders() });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Routes de badges
  public async getBadges(): Promise<Badge[]> {
    try {
      const response = await axios.get(`${API_URL}/badges`, { headers: this.getHeaders() });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  public async getUserBadges(): Promise<Badge[]> {
    try {
      const response = await axios.get(`${API_URL}/users/me/badges`, { headers: this.getHeaders() });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  public async getUserBadgesById(userId: string): Promise<Badge[]> {
    try {
      const response = await axios.get(`${API_URL}/users/${userId}/badges`, { headers: this.getHeaders() });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  public async claimBadge(badgeId: number): Promise<void> {
    try {
      await axios.post(`${API_URL}/users/me/badges/${badgeId}/claim`, {}, { headers: this.getHeaders() });
    } catch (error) {
      this.handleError(error);
    }
  }

  // Routes de thèmes
  public async getThemes(): Promise<Theme[]> {
    try {
      const response = await axios.get(`${API_URL}/themes`, { headers: this.getHeaders() });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  public async getAvatars(): Promise<string[]> {
    try {
      const response = await axios.get(`${API_URL}/avatars`, { headers: this.getHeaders() });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  public async uploadAvatar(file: File): Promise<void> {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      await axios.post(`${API_URL}/users/me/avatar`, formData, {
        headers: {
          ...this.getHeaders(),
          'Content-Type': 'multipart/form-data'
        }
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  public async getSeasonalThemes(): Promise<Theme[]> {
    try {
      const response = await axios.get(`${API_URL}/themes/seasonal`, { headers: this.getHeaders() });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Routes de statistiques
  public async getUserStats(): Promise<UserStats> {
    try {
      const response = await axios.get(`${API_URL}/users/me/stats`, { headers: this.getHeaders() });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  public async getQuizStats(quizId: number): Promise<QuizStats> {
    try {
      const response = await axios.get(`${API_URL}/quizzes/${quizId}/stats`, { headers: this.getHeaders() });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Routes de sessions de quiz
  public async startQuizSession(sessionId: number): Promise<QuizSession> {
    try {
      const response = await axios.put(`${API_URL}/quiz-sessions/${sessionId}/start`, {}, { headers: this.getHeaders() });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  public async endQuizSession(sessionId: number): Promise<QuizSession> {
    try {
      const response = await axios.put(`${API_URL}/quiz-sessions/${sessionId}/end`, {}, { headers: this.getHeaders() });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  public async getSessionParticipants(sessionId: number): Promise<Participant[]> {
    try {
      const response = await axios.get(`${API_URL}/quiz-sessions/${sessionId}/participants`, { headers: this.getHeaders() });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  public async getSessionResults(sessionId: number): Promise<SessionResults> {
    try {
      const response = await axios.get(`${API_URL}/quiz-sessions/${sessionId}/results`, { headers: this.getHeaders() });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  public async getSessionLeaderboard(sessionId: number): Promise<LeaderboardEntry[]> {
    try {
      const response = await axios.get(`${API_URL}/quiz-sessions/${sessionId}/leaderboard`, { headers: this.getHeaders() });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Routes de gestion des participants
  public async getParticipantAnswers(participantId: number): Promise<ParticipantAnswer[]> {
    try {
      const response = await axios.get(`${API_URL}/participants/${participantId}/answers`, { headers: this.getHeaders() });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  public async getParticipantScore(participantId: number): Promise<{ score: number }> {
    try {
      const response = await axios.get(`${API_URL}/participants/${participantId}/score`, { headers: this.getHeaders() });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  public async kickParticipant(participantId: number): Promise<void> {
    try {
      await axios.put(`${API_URL}/participants/${participantId}/kick`, {}, { headers: this.getHeaders() });
    } catch (error) {
      this.handleError(error);
    }
  }

  // Routes utilisateur
  public async getCurrentUser(): Promise<any> {
    try {
      const response = await axios.get(`${API_URL}/users/me`, { headers: this.getHeaders() });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  public async getUserQuizzes(): Promise<Quiz[]> {
    try {
      const response = await axios.get(`${API_URL}/users/me/quizzes`, { headers: this.getHeaders() });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  public async getUserParticipations(): Promise<Quiz[]> {
    try {
      const response = await axios.get(`${API_URL}/users/me/participations`, { headers: this.getHeaders() });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  public async getSuggestedUsers(): Promise<any[]> {
    try {
      const response = await axios.get(`${API_URL}/users/suggested`, { headers: this.getHeaders() });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  public async updateUserProfile(userData: Partial<any>): Promise<any> {
    try {
      const response = await axios.put(`${API_URL}/users/me`, userData, { headers: this.getHeaders() });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Routes de notifications
  public async getNotifications(): Promise<Notification[]> {
    try {
      const response = await axios.get(`${API_URL}/notifications`, { headers: this.getHeaders() });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  public async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      await axios.put(`${API_URL}/notifications/${notificationId}/read`, {}, { headers: this.getHeaders() });
    } catch (error) {
      this.handleError(error);
    }
  }

  public async markAllNotificationsAsRead(): Promise<void> {
    try {
      await axios.put(`${API_URL}/notifications/read-all`, {}, { headers: this.getHeaders() });
    } catch (error) {
      this.handleError(error);
    }
  }

  public async deleteNotification(notificationId: string): Promise<void> {
    try {
      await axios.delete(`${API_URL}/notifications/${notificationId}`, { headers: this.getHeaders() });
    } catch (error) {
      this.handleError(error);
    }
  }
}

export const apiService = ApiService.getInstance(); 