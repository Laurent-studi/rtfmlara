import { API_ENDPOINTS } from './endpoints';
import { api } from './index';

// Types pour les thèmes
export interface Theme {
  id: number;
  name: string;
  description?: string;
  colors: ThemeColors;
  fonts: ThemeFonts;
  spacing: ThemeSpacing;
  effects: ThemeEffects;
  is_default: boolean;
  is_active: boolean;
  is_public: boolean;
  creator_id?: number;
  created_at: string;
  updated_at: string;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text_primary: string;
  text_secondary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface ThemeFonts {
  primary_family: string;
  secondary_family: string;
  heading_size: string;
  body_size: string;
  small_size: string;
  line_height: string;
  letter_spacing: string;
}

export interface ThemeSpacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  xxl: string;
}

export interface ThemeEffects {
  border_radius: string;
  shadow_sm: string;
  shadow_md: string;
  shadow_lg: string;
  transition_duration: string;
  animation_duration: string;
}

export interface UserThemePreferences {
  theme_id: number;
  dark_mode: boolean;
  custom_colors?: Partial<ThemeColors>;
  custom_fonts?: Partial<ThemeFonts>;
  animations_enabled: boolean;
  high_contrast: boolean;
  reduced_motion: boolean;
}

export interface CreateThemeData {
  name: string;
  description?: string;
  colors: ThemeColors;
  fonts?: Partial<ThemeFonts>;
  spacing?: Partial<ThemeSpacing>;
  effects?: Partial<ThemeEffects>;
  is_public?: boolean;
}

/**
 * Service pour la gestion des thèmes utilisant les endpoints définis
 */
export const themeService = {
  /**
   * Récupérer tous les thèmes
   */
  getAll: async () => {
    return await api.get<Theme[]>(API_ENDPOINTS.themes.list);
  },

  /**
   * Récupérer le thème par défaut
   */
  getDefault: async () => {
    return await api.get<Theme>(API_ENDPOINTS.themes.default);
  },

  /**
   * Récupérer le thème actuel
   */
  getCurrent: async () => {
    return await api.get<Theme>(API_ENDPOINTS.themes.current);
  },

  /**
   * Récupérer les préférences de thème de l'utilisateur
   */
  getUserTheme: async () => {
    return await api.get<UserThemePreferences>(API_ENDPOINTS.themes.userTheme);
  },

  /**
   * Définir les préférences de thème de l'utilisateur
   */
  setUserTheme: async (preferences: Partial<UserThemePreferences>) => {
    return await api.post<UserThemePreferences>(API_ENDPOINTS.themes.setUserTheme, preferences);
  },

  /**
   * Appliquer un thème
   */
  apply: async (themeId: number | string) => {
    return await api.post(API_ENDPOINTS.themes.apply, { theme_id: themeId });
  },

  /**
   * Réinitialiser au thème par défaut
   */
  reset: async () => {
    return await api.post(API_ENDPOINTS.themes.reset);
  },

  /**
   * Créer un nouveau thème
   */
  create: async (themeData: CreateThemeData) => {
    return await api.post<Theme>(API_ENDPOINTS.themes.create, themeData);
  },

  /**
   * Récupérer un thème par son ID
   */
  getById: async (id: number | string) => {
    return await api.get<Theme>(API_ENDPOINTS.themes.byId(id));
  },

  /**
   * Mettre à jour un thème
   */
  update: async (id: number | string, themeData: Partial<CreateThemeData>) => {
    return await api.put<Theme>(API_ENDPOINTS.themes.update(id), themeData);
  },

  /**
   * Supprimer un thème
   */
  delete: async (id: number | string) => {
    return await api.delete(API_ENDPOINTS.themes.delete(id));
  },

  /**
   * Définir un thème comme défaut (admin)
   */
  setDefault: async (id: number | string) => {
    return await api.post(API_ENDPOINTS.themes.setDefault(id));
  },

  /**
   * Dupliquer un thème
   */
  duplicate: async (id: number | string, name: string) => {
    return await api.post<Theme>(`${API_ENDPOINTS.themes.byId(id)}/duplicate`, { name });
  },

  /**
   * Exporter un thème
   */
  export: async (id: number | string) => {
    return await api.get(`${API_ENDPOINTS.themes.byId(id)}/export`);
  },

  /**
   * Importer un thème
   */
  import: async (themeData: any) => {
    return await api.post<Theme>(`${API_ENDPOINTS.themes.create}/import`, themeData);
  },

  /**
   * Prévisualiser un thème
   */
  preview: async (themeData: Partial<CreateThemeData>) => {
    return await api.post(`${API_ENDPOINTS.themes.list}/preview`, themeData);
  },

  /**
   * Récupérer les thèmes populaires
   */
  getPopular: async () => {
    return await api.get<Theme[]>(`${API_ENDPOINTS.themes.list}/popular`);
  },

  /**
   * Récupérer les thèmes récents
   */
  getRecent: async () => {
    return await api.get<Theme[]>(`${API_ENDPOINTS.themes.list}/recent`);
  },

  /**
   * Rechercher des thèmes
   */
  search: async (query: string) => {
    return await api.get<Theme[]>(`${API_ENDPOINTS.themes.list}/search?q=${encodeURIComponent(query)}`);
  },
};

export default themeService; 