import { API_ENDPOINTS } from './endpoints';
import { api } from './index';

// Types pour les achievements
export interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  category: string;
  type: 'badge' | 'trophy' | 'milestone';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  requirements: AchievementRequirement[];
  is_hidden: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AchievementRequirement {
  type: 'quiz_completed' | 'score_achieved' | 'streak_reached' | 'time_limit' | 'category_mastery';
  value: number;
  operator: 'eq' | 'gt' | 'gte' | 'lt' | 'lte';
  metadata?: Record<string, any>;
}

export interface UserAchievement {
  id: number;
  user_id: number;
  achievement_id: number;
  achievement: Achievement;
  progress: number;
  max_progress: number;
  is_completed: boolean;
  completed_at?: string;
  awarded_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Badge {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: string;
  requirements: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Trophy {
  id: number;
  name: string;
  description: string;
  icon: string;
  category: string;
  difficulty: 'bronze' | 'silver' | 'gold' | 'platinum';
  points: number;
  requirements: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserBadge {
  id: number;
  user_id: number;
  badge_id: number;
  badge: Badge;
  awarded_at: string;
}

export interface UserTrophy {
  id: number;
  user_id: number;
  trophy_id: number;
  trophy: Trophy;
  awarded_at: string;
}

export interface AchievementProgress {
  achievement_id: number;
  achievement: Achievement;
  current_progress: number;
  max_progress: number;
  percentage: number;
  is_completed: boolean;
  next_milestone?: number;
}

export interface CreateAchievementData {
  name: string;
  description: string;
  icon: string;
  category: string;
  type: 'badge' | 'trophy' | 'milestone';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  requirements: AchievementRequirement[];
  is_hidden?: boolean;
}

/**
 * Service pour la gestion des achievements utilisant les endpoints définis
 */
export const achievementService = {
  /**
   * Récupérer les achievements de l'utilisateur connecté
   */
  getUserAchievements: async () => {
    return await api.get<UserAchievement[]>(API_ENDPOINTS.achievements.userAchievements);
  },

  /**
   * Récupérer les achievements d'un utilisateur spécifique
   */
  getForUser: async (userId: number | string) => {
    return await api.get<UserAchievement[]>(API_ENDPOINTS.achievements.forUser(userId));
  },

  /**
   * Récupérer les achievements non obtenus
   */
  getUnachieved: async () => {
    return await api.get<Achievement[]>(API_ENDPOINTS.achievements.unachieved);
  },

  /**
   * Vérifier les achievements (déclencher la vérification)
   */
  check: async () => {
    return await api.post(API_ENDPOINTS.achievements.check);
  },

  /**
   * Récupérer les achievements récents
   */
  getRecent: async () => {
    return await api.get<UserAchievement[]>(API_ENDPOINTS.achievements.recent);
  },

  /**
   * Récupérer les catégories d'achievements
   */
  getCategories: async () => {
    return await api.get<string[]>(API_ENDPOINTS.achievements.categories);
  },

  /**
   * Récupérer les achievements par catégorie
   */
  getByCategory: async (category: string) => {
    return await api.get<Achievement[]>(API_ENDPOINTS.achievements.byCategory(category));
  },

  /**
   * Récupérer le progrès des achievements
   */
  getProgress: async () => {
    return await api.get<AchievementProgress[]>(`${API_ENDPOINTS.achievements.userAchievements}/progress`);
  },

  /**
   * Récupérer les statistiques d'achievements
   */
  getStats: async () => {
    return await api.get(`${API_ENDPOINTS.achievements.userAchievements}/stats`);
  },

  /**
   * Marquer un achievement comme vu
   */
  markAsSeen: async (achievementId: number | string) => {
    return await api.post(`${API_ENDPOINTS.achievements.userAchievements}/${achievementId}/seen`);
  },

  /**
   * Récupérer tous les achievements disponibles
   */
  getAll: async () => {
    return await api.get<Achievement[]>(`${API_ENDPOINTS.achievements.userAchievements}/all`);
  },

  /**
   * Créer un nouvel achievement (admin)
   */
  create: async (achievementData: CreateAchievementData) => {
    return await api.post<Achievement>(`${API_ENDPOINTS.achievements.userAchievements}/admin`, achievementData);
  },

  /**
   * Mettre à jour un achievement (admin)
   */
  update: async (id: number | string, achievementData: Partial<CreateAchievementData>) => {
    return await api.put<Achievement>(`${API_ENDPOINTS.achievements.userAchievements}/admin/${id}`, achievementData);
  },

  /**
   * Supprimer un achievement (admin)
   */
  delete: async (id: number | string) => {
    return await api.delete(`${API_ENDPOINTS.achievements.userAchievements}/admin/${id}`);
  },

  /**
   * Attribuer manuellement un achievement (admin)
   */
  award: async (userId: number | string, achievementId: number | string) => {
    return await api.post(`${API_ENDPOINTS.achievements.userAchievements}/admin/award`, {
      user_id: userId,
      achievement_id: achievementId
    });
  },

  /**
   * Retirer un achievement (admin)
   */
  revoke: async (userId: number | string, achievementId: number | string) => {
    return await api.post(`${API_ENDPOINTS.achievements.userAchievements}/admin/revoke`, {
      user_id: userId,
      achievement_id: achievementId
    });
  },
};

/**
 * Service pour la gestion des badges utilisant les endpoints définis
 */
export const badgeService = {
  /**
   * Récupérer tous les badges
   */
  getAll: async () => {
    return await api.get<Badge[]>(API_ENDPOINTS.badges.list);
  },

  /**
   * Récupérer un badge par son ID
   */
  getById: async (id: number | string) => {
    return await api.get<Badge>(API_ENDPOINTS.badges.byId(id));
  },

  /**
   * Créer un nouveau badge
   */
  create: async (badgeData: Omit<Badge, 'id' | 'created_at' | 'updated_at'>) => {
    return await api.post<Badge>(API_ENDPOINTS.badges.create, badgeData);
  },

  /**
   * Mettre à jour un badge
   */
  update: async (id: number | string, badgeData: Partial<Badge>) => {
    return await api.put<Badge>(API_ENDPOINTS.badges.update(id), badgeData);
  },

  /**
   * Supprimer un badge
   */
  delete: async (id: number | string) => {
    return await api.delete(API_ENDPOINTS.badges.delete(id));
  },

  /**
   * Attribuer un badge
   */
  award: async (id: number | string, userId: number | string) => {
    return await api.post(API_ENDPOINTS.badges.award(id), { user_id: userId });
  },
};

/**
 * Service pour la gestion des trophées utilisant les endpoints définis
 */
export const trophyService = {
  /**
   * Récupérer tous les trophées
   */
  getAll: async () => {
    return await api.get<Trophy[]>(API_ENDPOINTS.trophies.list);
  },

  /**
   * Récupérer un trophée par son ID
   */
  getById: async (id: number | string) => {
    return await api.get<Trophy>(API_ENDPOINTS.trophies.byId(id));
  },

  /**
   * Créer un nouveau trophée
   */
  create: async (trophyData: Omit<Trophy, 'id' | 'created_at' | 'updated_at'>) => {
    return await api.post<Trophy>(API_ENDPOINTS.trophies.create, trophyData);
  },

  /**
   * Mettre à jour un trophée
   */
  update: async (id: number | string, trophyData: Partial<Trophy>) => {
    return await api.put<Trophy>(API_ENDPOINTS.trophies.update(id), trophyData);
  },

  /**
   * Supprimer un trophée
   */
  delete: async (id: number | string) => {
    return await api.delete(API_ENDPOINTS.trophies.delete(id));
  },

  /**
   * Attribuer un trophée
   */
  award: async (id: number | string, userId: number | string) => {
    return await api.post(API_ENDPOINTS.trophies.award(id), { user_id: userId });
  },

  /**
   * Récupérer les utilisateurs qui ont un trophée
   */
  getUsers: async (id: number | string) => {
    return await api.get<UserTrophy[]>(API_ENDPOINTS.trophies.users(id));
  },
};

export default achievementService; 