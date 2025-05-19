import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

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
  multipleAnswers: boolean;
}

export interface Participant {
  id: number;
  sessionId: number;
  userId: number | null;
  pseudo: string;
  score: number;
  joinedAt: string;
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

export interface Badge {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
}

export interface Trophy {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  rarity: string;
}

export interface LeaderboardEntry {
  userId: number;
  username: string;
  score: number;
  rank: number;
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

  // Méthodes d'authentification
  public async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_URL}/register`, data, {
        headers: this.getHeaders(),
      });
      this.setToken(response.data.token);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  public async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_URL}/login`, data, {
        headers: this.getHeaders(),
      });
      this.setToken(response.data.token);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  public async logout(): Promise<void> {
    try {
      await axios.post(`${API_URL}/logout`, {}, {
        headers: this.getHeaders(),
      });
      this.clearToken();
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Quiz
  public async getQuizzes(): Promise<Quiz[]> {
    try {
      const response = await axios.get(`${API_URL}/quizzes`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  public async getQuiz(id: number): Promise<Quiz> {
    try {
      const response = await axios.get(`${API_URL}/quizzes/${id}`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  public async createQuiz(quiz: Partial<Quiz>): Promise<Quiz> {
    try {
      const response = await axios.post(`${API_URL}/quizzes`, quiz, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  public async updateQuiz(id: number, quiz: Partial<Quiz>): Promise<Quiz> {
    try {
      const response = await axios.put(`${API_URL}/quizzes/${id}`, quiz, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  public async deleteQuiz(id: number): Promise<void> {
    try {
      await axios.delete(`${API_URL}/quizzes/${id}`, {
        headers: this.getHeaders(),
      });
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Questions
  public async getQuizQuestions(quizId: number): Promise<Question[]> {
    try {
      const response = await axios.get(`${API_URL}/quizzes/${quizId}/questions`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  public async createQuestion(quizId: number, question: Partial<Question>): Promise<Question> {
    try {
      const response = await axios.post(`${API_URL}/quizzes/${quizId}/questions`, question, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Réponses
  public async getQuestionAnswers(questionId: number): Promise<Answer[]> {
    try {
      const response = await axios.get(`${API_URL}/questions/${questionId}/answers`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  public async createAnswer(questionId: number, answer: Partial<Answer>): Promise<Answer> {
    try {
      const response = await axios.post(`${API_URL}/questions/${questionId}/answers`, answer, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Sessions
  public async createQuizSession(quizId: number): Promise<QuizSession> {
    try {
      const response = await axios.post(`${API_URL}/quiz-sessions`, { quizId }, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  public async getQuizSession(sessionId: number): Promise<QuizSession> {
    try {
      const response = await axios.get(`${API_URL}/quiz-sessions/${sessionId}`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  public async joinQuizSession(sessionId: number, data: { pseudo: string }): Promise<Participant> {
    try {
      const response = await axios.post(`${API_URL}/quiz-sessions/${sessionId}/join`, data, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  public async startQuizSession(sessionId: number): Promise<QuizSession> {
    try {
      const response = await axios.post(`${API_URL}/quiz-sessions/${sessionId}/start`, {}, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Notifications
  public async getNotifications(): Promise<Notification[]> {
    try {
      const response = await axios.get(`${API_URL}/notifications`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  public async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      await axios.put(`${API_URL}/notifications/${notificationId}`, { isRead: true }, {
        headers: this.getHeaders(),
      });
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Badges
  public async getBadges(): Promise<Badge[]> {
    try {
      const response = await axios.get(`${API_URL}/badges`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Trophées
  public async getTrophies(): Promise<Trophy[]> {
    try {
      const response = await axios.get(`${API_URL}/trophies`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Classements
  public async getLeaderboard(): Promise<LeaderboardEntry[]> {
    try {
      const response = await axios.get(`${API_URL}/leaderboards`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  public async getLeaderboardByCategory(category: string): Promise<LeaderboardEntry[]> {
    try {
      const response = await axios.get(`${API_URL}/leaderboards/categories/${category}`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  public async getLeaderboardByQuiz(quizId: number): Promise<LeaderboardEntry[]> {
    try {
      const response = await axios.get(`${API_URL}/leaderboards/quizzes/${quizId}`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }
}

export const apiService = ApiService.getInstance();
