import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Définition des interfaces
interface ThemeData {
  name: string;
  code: string;
  filename: string;
  description?: string | null;
  is_default?: boolean;
  is_active?: boolean;
  is_premium?: boolean;
}

/**
 * Récupère tous les thèmes actifs
 */
export const getAllThemes = async () => {
  try {
    const response = await axios.get(`${API_URL}/themes`);
    return response.data.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des thèmes', error);
    throw error;
  }
};

/**
 * Récupère le thème par défaut
 */
export const getDefaultTheme = async () => {
  try {
    const response = await axios.get(`${API_URL}/themes/default`);
    return response.data.data;
  } catch (error) {
    console.error('Erreur lors de la récupération du thème par défaut', error);
    throw error;
  }
};

/**
 * Récupère le thème actuel de l'utilisateur
 */
export const getCurrentUserTheme = async () => {
  try {
    const response = await axios.get(`${API_URL}/themes/current`);
    return response.data.data;
  } catch (error) {
    console.error('Erreur lors de la récupération du thème de l\'utilisateur', error);
    throw error;
  }
};

/**
 * Applique un thème à l'utilisateur connecté
 */
export const applyTheme = async (themeId: number) => {
  try {
    const response = await axios.post(`${API_URL}/themes/apply`, { theme_id: themeId });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de l\'application du thème', error);
    throw error;
  }
};

/**
 * Réinitialise le thème de l'utilisateur au thème par défaut
 */
export const resetTheme = async () => {
  try {
    const response = await axios.post(`${API_URL}/themes/reset`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la réinitialisation du thème', error);
    throw error;
  }
};

/**
 * Crée un nouveau thème (admin uniquement)
 */
export const createTheme = async (themeData: ThemeData) => {
  try {
    const response = await axios.post(`${API_URL}/themes`, themeData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création du thème', error);
    throw error;
  }
};

/**
 * Met à jour un thème existant (admin uniquement)
 */
export const updateTheme = async (themeId: number, themeData: Partial<ThemeData>) => {
  try {
    const response = await axios.put(`${API_URL}/themes/${themeId}`, themeData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du thème', error);
    throw error;
  }
};

/**
 * Supprime un thème (admin uniquement)
 */
export const deleteTheme = async (themeId: number) => {
  try {
    const response = await axios.delete(`${API_URL}/themes/${themeId}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la suppression du thème', error);
    throw error;
  }
};

/**
 * Définit un thème comme thème par défaut (admin uniquement)
 */
export const setDefaultTheme = async (themeId: number) => {
  try {
    const response = await axios.post(`${API_URL}/themes/${themeId}/set-default`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la définition du thème par défaut', error);
    throw error;
  }
}; 