import { API_ENDPOINTS } from './endpoints';
import { api } from './index';

// Types pour les effets sonores
export interface Sound {
  id: number;
  name: string;
  description?: string;
  file_path: string;
  file_url: string;
  file_size: number;
  duration: number;
  category: string;
  event_type: SoundEventType;
  is_active: boolean;
  is_default: boolean;
  volume: number;
  created_at: string;
  updated_at: string;
}

export type SoundEventType = 
  | 'correct_answer'
  | 'wrong_answer'
  | 'question_start'
  | 'question_end'
  | 'quiz_start'
  | 'quiz_end'
  | 'time_warning'
  | 'achievement_unlocked'
  | 'level_up'
  | 'notification'
  | 'button_click'
  | 'page_transition';

export interface SoundCategory {
  name: string;
  description?: string;
  sounds_count: number;
}

export interface UserSoundPreferences {
  id: number;
  user_id: number;
  master_volume: number;
  effects_enabled: boolean;
  music_enabled: boolean;
  notification_sounds: boolean;
  event_sounds: Record<SoundEventType, {
    enabled: boolean;
    sound_id?: number;
    volume: number;
  }>;
  created_at: string;
  updated_at: string;
}

export interface CreateSoundData {
  name: string;
  description?: string;
  category: string;
  event_type: SoundEventType;
  file: File;
  volume?: number;
}

export interface UpdateSoundData {
  name?: string;
  description?: string;
  category?: string;
  event_type?: SoundEventType;
  volume?: number;
  is_active?: boolean;
}

export interface UpdateSoundPreferencesData {
  master_volume?: number;
  effects_enabled?: boolean;
  music_enabled?: boolean;
  notification_sounds?: boolean;
  event_sounds?: Partial<Record<SoundEventType, {
    enabled: boolean;
    sound_id?: number;
    volume: number;
  }>>;
}

/**
 * Service pour la gestion des effets sonores utilisant les endpoints définis
 */
export const soundService = {
  /**
   * Récupérer tous les sons
   */
  getAll: async (params?: {
    category?: string;
    event_type?: SoundEventType;
    is_active?: boolean;
  }) => {
    const searchParams = new URLSearchParams();
    
    if (params?.category) searchParams.append('category', params.category);
    if (params?.event_type) searchParams.append('event_type', params.event_type);
    if (params?.is_active !== undefined) searchParams.append('is_active', params.is_active.toString());

    const url = searchParams.toString() 
      ? `${API_ENDPOINTS.sounds.list}?${searchParams.toString()}`
      : API_ENDPOINTS.sounds.list;

    return await api.get<Sound[]>(url);
  },

  /**
   * Récupérer les catégories de sons
   */
  getCategories: async () => {
    return await api.get<SoundCategory[]>(API_ENDPOINTS.sounds.categories);
  },

  /**
   * Récupérer les sons par événement
   */
  getByEvent: async (event: SoundEventType) => {
    return await api.get<Sound[]>(API_ENDPOINTS.sounds.byEvent(event));
  },

  /**
   * Créer un nouveau son
   */
  create: async (soundData: CreateSoundData) => {
    const formData = new FormData();
    formData.append('name', soundData.name);
    if (soundData.description) formData.append('description', soundData.description);
    formData.append('category', soundData.category);
    formData.append('event_type', soundData.event_type);
    formData.append('file', soundData.file);
    if (soundData.volume !== undefined) formData.append('volume', soundData.volume.toString());

    return await api.post<Sound>(API_ENDPOINTS.sounds.create, formData);
  },

  /**
   * Récupérer un son par son ID
   */
  getById: async (id: number | string) => {
    return await api.get<Sound>(API_ENDPOINTS.sounds.byId(id));
  },

  /**
   * Mettre à jour un son
   */
  update: async (id: number | string, soundData: UpdateSoundData) => {
    return await api.put<Sound>(API_ENDPOINTS.sounds.update(id), soundData);
  },

  /**
   * Supprimer un son
   */
  delete: async (id: number | string) => {
    return await api.delete(API_ENDPOINTS.sounds.delete(id));
  },

  /**
   * Récupérer les préférences sonores de l'utilisateur
   */
  getPreferences: async () => {
    return await api.get<UserSoundPreferences>(API_ENDPOINTS.sounds.preferences);
  },

  /**
   * Mettre à jour les préférences sonores
   */
  updatePreferences: async (preferences: UpdateSoundPreferencesData) => {
    return await api.put<UserSoundPreferences>(API_ENDPOINTS.sounds.updatePreferences, preferences);
  },

  /**
   * Jouer un son (pour test)
   */
  play: async (id: number | string) => {
    return await api.post(`${API_ENDPOINTS.sounds.byId(id)}/play`);
  },

  /**
   * Récupérer le son par défaut pour un événement
   */
  getDefaultForEvent: async (event: SoundEventType) => {
    return await api.get<Sound>(`${API_ENDPOINTS.sounds.byEvent(event)}/default`);
  },

  /**
   * Définir un son comme défaut pour un événement
   */
  setDefaultForEvent: async (soundId: number | string, event: SoundEventType) => {
    return await api.post(`${API_ENDPOINTS.sounds.byId(soundId)}/set-default`, {
      event_type: event
    });
  },

  /**
   * Télécharger un son
   */
  download: async (id: number | string) => {
    const response = await fetch(`${API_ENDPOINTS.sounds.byId(id)}/download`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Erreur lors du téléchargement du son');
    }

    return response.blob();
  },

  /**
   * Récupérer les sons populaires
   */
  getPopular: async (limit: number = 10) => {
    return await api.get<Sound[]>(`${API_ENDPOINTS.sounds.list}/popular?limit=${limit}`);
  },

  /**
   * Rechercher des sons
   */
  search: async (query: string) => {
    return await api.get<Sound[]>(`${API_ENDPOINTS.sounds.list}/search?q=${encodeURIComponent(query)}`);
  },

  /**
   * Récupérer les statistiques d'utilisation des sons
   */
  getStats: async () => {
    return await api.get<{
      total_sounds: number;
      sounds_by_category: Record<string, number>;
      sounds_by_event: Record<SoundEventType, number>;
      most_used_sounds: Sound[];
      total_downloads: number;
    }>(`${API_ENDPOINTS.sounds.list}/stats`);
  },

  /**
   * Importer des sons en lot
   */
  bulkImport: async (files: File[], category: string) => {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`files[${index}]`, file);
    });
    formData.append('category', category);

    return await api.post<Sound[]>(`${API_ENDPOINTS.sounds.create}/bulk`, formData);
  },

  /**
   * Réinitialiser les préférences aux valeurs par défaut
   */
  resetPreferences: async () => {
    return await api.post<UserSoundPreferences>(`${API_ENDPOINTS.sounds.preferences}/reset`);
  },

  /**
   * Tester tous les sons d'événement
   */
  testAllEvents: async () => {
    return await api.post(`${API_ENDPOINTS.sounds.list}/test-all-events`);
  },

  /**
   * Activer/désactiver tous les sons
   */
  toggleAllSounds: async (enabled: boolean) => {
    return await api.post(`${API_ENDPOINTS.sounds.preferences}/toggle-all`, {
      enabled
    });
  },
};

export default soundService; 