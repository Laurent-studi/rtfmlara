import { API_ENDPOINTS } from './endpoints';
import { api } from './index';

// Types pour les quiz
export interface Quiz {
  id: number;
  title: string;
  description?: string;
  category?: string;
  status: 'draft' | 'active' | 'archived';
  code: string;
  questions_count: number;
  creator_id: number;
  creator?: {
    id: number;
    username: string;
    avatar?: string;
  };
  created_at: string;
  updated_at: string;
  questions?: Question[];
  tags?: Tag[];
}

export interface Question {
  id: number;
  quiz_id: number;
  question_text: string;
  question_type: 'single' | 'multiple' | 'text';
  multiple_answers: boolean;
  time_limit?: number;
  points: number;
  order: number;
  answers?: Answer[];
  created_at: string;
  updated_at: string;
}

export interface Answer {
  id: number;
  question_id: number;
  text: string;
  is_correct: boolean;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  color?: string;
}

export interface CreateQuizData {
  title: string;
  description?: string;
  category?: string;
  status?: 'draft' | 'active';
  tags?: number[];
}

export interface UpdateQuizData extends Partial<CreateQuizData> {
  id: number;
}

export interface CreateQuestionData {
  question_text: string;
  question_type: 'single' | 'multiple' | 'text';
  multiple_answers: boolean;
  time_limit?: number;
  points: number;
  answers: {
    text: string;
    is_correct: boolean;
  }[];
}

export interface UpdateQuestionData extends Partial<CreateQuestionData> {
  id: number;
}

/**
 * Service pour la gestion des quiz utilisant les endpoints définis
 */
export const quizService = {
  /**
   * Récupérer tous les quiz
   */
  getAll: async () => {
    return await api.get<Quiz[]>(API_ENDPOINTS.quiz.list);
  },

  /**
   * Récupérer les quiz en vedette
   */
  getFeatured: async () => {
    return await api.get<Quiz[]>(API_ENDPOINTS.quiz.featured);
  },

  /**
   * Récupérer les quiz publics
   */
  getPublic: async () => {
    return await api.get<Quiz[]>(API_ENDPOINTS.quiz.public);
  },

  /**
   * Récupérer les catégories de quiz
   */
  getCategories: async () => {
    return await api.get<string[]>(API_ENDPOINTS.quiz.categories);
  },

  /**
   * Récupérer les quiz récents
   */
  getRecent: async () => {
    return await api.get<Quiz[]>(API_ENDPOINTS.quiz.recent);
  },

  /**
   * Récupérer un quiz aléatoire
   */
  getRandom: async () => {
    return await api.get<Quiz>(API_ENDPOINTS.quiz.random);
  },

  /**
   * Récupérer un quiz par son ID
   */
  getById: async (id: number | string) => {
    return await api.get<Quiz>(API_ENDPOINTS.quiz.byId(id));
  },

  /**
   * Créer un nouveau quiz
   */
  create: async (quizData: CreateQuizData) => {
    return await api.post<Quiz>(API_ENDPOINTS.quiz.create, quizData);
  },

  /**
   * Mettre à jour un quiz
   */
  update: async (id: number | string, quizData: UpdateQuizData) => {
    return await api.put<Quiz>(API_ENDPOINTS.quiz.update(id), quizData);
  },

  /**
   * Supprimer un quiz
   */
  delete: async (id: number | string) => {
    return await api.delete(API_ENDPOINTS.quiz.delete(id));
  },

  /**
   * Récupérer les quiz par tag
   */
  getByTag: async (tagSlug: string) => {
    return await api.get<Quiz[]>(API_ENDPOINTS.quiz.byTag(tagSlug));
  },

  /**
   * Récupérer les questions d'un quiz
   */
  getQuestions: async (quizId: number | string) => {
    return await api.get<Question[]>(API_ENDPOINTS.questions.list(quizId));
  },

  /**
   * Ajouter une question à un quiz
   */
  addQuestion: async (quizId: number | string, questionData: CreateQuestionData) => {
    return await api.post<Question>(API_ENDPOINTS.questions.create(quizId), questionData);
  },

  /**
   * Mettre à jour une question
   */
  updateQuestion: async (id: number | string, questionData: UpdateQuestionData) => {
    return await api.put<Question>(API_ENDPOINTS.questions.update(id), questionData);
  },

  /**
   * Supprimer une question
   */
  deleteQuestion: async (id: number | string) => {
    return await api.delete(API_ENDPOINTS.questions.delete(id));
  },

  /**
   * Récupérer une question par son ID
   */
  getQuestionById: async (id: number | string) => {
    return await api.get<Question>(API_ENDPOINTS.questions.byId(id));
  },

  /**
   * Dupliquer un quiz
   */
  duplicate: async (id: number | string) => {
    return await api.post<Quiz>(`${API_ENDPOINTS.quiz.byId(id)}/duplicate`);
  },

  /**
   * Publier un quiz (changer le statut en actif)
   */
  publish: async (id: number | string) => {
    return await api.post(`${API_ENDPOINTS.quiz.byId(id)}/publish`);
  },

  /**
   * Archiver un quiz
   */
  archive: async (id: number | string) => {
    return await api.post(`${API_ENDPOINTS.quiz.byId(id)}/archive`);
  },

  /**
   * Rechercher des quiz
   */
  search: async (query: string, filters?: {
    category?: string;
    tags?: string[];
    status?: string;
  }) => {
    const params = new URLSearchParams();
    params.append('q', query);
    
    if (filters?.category) {
      params.append('category', filters.category);
    }
    
    if (filters?.tags?.length) {
      filters.tags.forEach(tag => params.append('tags[]', tag));
    }
    
    if (filters?.status) {
      params.append('status', filters.status);
    }

    return await api.get<Quiz[]>(`${API_ENDPOINTS.quiz.list}?${params.toString()}`);
  },
};

// Exportations pour compatibilité avec l'ancien système
export const getUserQuizzes = quizService.getAll;
export const getQuiz = quizService.getById;
export const createQuiz = quizService.create;
export const updateQuiz = quizService.update;
export const deleteQuiz = quizService.delete;
export const getQuizQuestions = quizService.getQuestions;
export const addQuizQuestion = quizService.addQuestion;
export const updateQuestion = quizService.updateQuestion;
export const deleteQuestion = quizService.deleteQuestion;

export default quizService; 