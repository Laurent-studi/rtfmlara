// Exporter toutes les fonctions de l'API thème

import {
  getAllThemes,
  getDefaultTheme,
  getCurrentUserTheme,
  applyTheme,
  resetTheme,
  createTheme,
  updateTheme,
  deleteTheme,
  setDefaultTheme
} from './theme';

import {
  getUserQuizzes,
  getQuiz,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getQuizQuestions,
  addQuizQuestion,
  updateQuestion,
  deleteQuestion
} from './quiz';

// Structure API centralisée
export const api = {
  // Fonctions liées aux thèmes
  getThemes: getAllThemes,
  getDefaultTheme,
  getCurrentUserTheme,
  applyTheme,
  resetTheme,
  saveUserTheme: applyTheme, // Alias pour la compatibilité avec le ThemeProvider
  
  // Fonctions admin pour les thèmes
  createTheme,
  updateTheme,
  deleteTheme,
  setDefaultTheme,

  // Fonctions liées aux quiz
  getUserQuizzes,
  getQuiz,
  createQuiz,
  updateQuiz,
  deleteQuiz,

  // Fonctions liées aux questions
  getQuizQuestions,
  addQuizQuestion,
  updateQuestion,
  deleteQuestion,
};

// Exportation individuelle des fonctions
export {
  // Theme exports
  getAllThemes,
  getDefaultTheme,
  getCurrentUserTheme,
  applyTheme,
  resetTheme,
  createTheme,
  updateTheme,
  deleteTheme,
  setDefaultTheme,
  
  // Quiz exports
  getUserQuizzes,
  getQuiz,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  
  // Question exports
  getQuizQuestions,
  addQuizQuestion,
  updateQuestion,
  deleteQuestion
};

// Exportation par défaut
export default api; 