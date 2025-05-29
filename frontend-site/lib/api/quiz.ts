// Implémentation des fonctions d'API pour les quiz et les questions
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

/**
 * Obtient les données d'authentification pour les requêtes
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

/**
 * Récupère la liste des quiz de l'utilisateur
 */
export const getUserQuizzes = async () => {
  try {
    const response = await fetch(`${API_URL}/quizzes`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des quiz:', error);
    throw error;
  }
};

/**
 * Récupère les détails d'un quiz spécifique
 */
export const getQuiz = async (id: number) => {
  try {
    const response = await fetch(`${API_URL}/quizzes/${id}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération du quiz ${id}:`, error);
    throw error;
  }
};

/**
 * Crée un nouveau quiz
 */
export const createQuiz = async (quizData: any) => {
  try {
    const response = await fetch(`${API_URL}/quizzes`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(quizData)
    });
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Erreur lors de la création du quiz:', error);
    throw error;
  }
};

/**
 * Met à jour un quiz existant
 */
export const updateQuiz = async (id: number, quizData: any) => {
  try {
    const response = await fetch(`${API_URL}/quizzes/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(quizData)
    });
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du quiz ${id}:`, error);
    throw error;
  }
};

/**
 * Supprime un quiz
 */
export const deleteQuiz = async (id: number) => {
  try {
    const response = await fetch(`${API_URL}/quizzes/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Erreur lors de la suppression du quiz ${id}:`, error);
    throw error;
  }
};

/**
 * Récupère les questions d'un quiz
 */
export const getQuizQuestions = async (quizId: number) => {
  try {
    const response = await fetch(`${API_URL}/quizzes/${quizId}/questions`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `Erreur lors de la récupération des questions`);
    }
    
    return data.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération des questions du quiz ${quizId}:`, error);
    throw error;
  }
};

/**
 * Ajoute une question à un quiz
 */
export const addQuizQuestion = async (quizId: number, questionData: any) => {
  try {
    const response = await fetch(`${API_URL}/quizzes/${quizId}/questions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        ...questionData,
        quiz_id: quizId
      })
    });
    
    const responseText = await response.text();
    let data;
    
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      throw new Error(`Réponse non-JSON: ${responseText}`);
    }
    
    if (!response.ok) {
      throw new Error(data.message || `Erreur ${response.status}`);
    }
    
    return data.data;
  } catch (error) {
    console.error(`Erreur lors de l'ajout d'une question au quiz ${quizId}:`, error);
    throw error;
  }
};

/**
 * Met à jour une question existante
 */
export const updateQuestion = async (questionId: number, questionData: any) => {
  try {
    const response = await fetch(`${API_URL}/questions/${questionId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(questionData)
    });
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de la question ${questionId}:`, error);
    throw error;
  }
};

/**
 * Supprime une question
 */
export const deleteQuestion = async (questionId: number) => {
  try {
    const response = await fetch(`${API_URL}/questions/${questionId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Erreur lors de la suppression de la question ${questionId}:`, error);
    throw error;
  }
}; 