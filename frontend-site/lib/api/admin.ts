import { API_ENDPOINTS } from './endpoints';
import { api } from './index';

// Types pour l'administration
export interface AdminUser {
  id: number;
  username: string;
  email: string;
  avatar?: string;
  email_verified_at?: string;
  is_active: boolean;
  is_banned: boolean;
  last_login: string;
  created_at: string;
  updated_at: string;
  roles: Role[];
  stats: UserStats;
}

export interface Role {
  id: number;
  name: string;
  slug: string;
  description?: string;
  permissions: Permission[];
  users_count: number;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: number;
  name: string;
  slug: string;
  description?: string;
  category: string;
}

export interface UserStats {
  total_quizzes: number;
  total_sessions: number;
  total_score: number;
  average_score: number;
  total_time_played: number;
  achievements_count: number;
  friends_count: number;
  reports_count: number;
}

export interface AssignRoleData {
  role_id: number;
}

export interface CreateRoleData {
  name: string;
  description?: string;
  permissions: number[];
}

export interface UpdateUserData {
  username?: string;
  email?: string;
  is_active?: boolean;
  is_banned?: boolean;
}

export interface BanUserData {
  reason: string;
  duration?: number; // en jours, null = permanent
  ban_type: 'temporary' | 'permanent';
}

/**
 * Service pour l'administration utilisant les endpoints définis
 */
export const adminService = {
  /**
   * Récupérer tous les utilisateurs (avec pagination)
   */
  getUsers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: 'active' | 'banned' | 'inactive';
  }) => {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.role) searchParams.append('role', params.role);
    if (params?.status) searchParams.append('status', params.status);

    const url = searchParams.toString() 
      ? `${API_ENDPOINTS.admin.users}?${searchParams.toString()}`
      : API_ENDPOINTS.admin.users;

    return await api.get<{
      data: AdminUser[];
      total: number;
      current_page: number;
      last_page: number;
    }>(url);
  },

  /**
   * Récupérer tous les rôles
   */
  getRoles: async () => {
    return await api.get<Role[]>(API_ENDPOINTS.admin.roles);
  },

  /**
   * Assigner un rôle à un utilisateur
   */
  assignRole: async (userId: number | string, data: AssignRoleData) => {
    return await api.post(API_ENDPOINTS.admin.assignRole(userId), data);
  },

  /**
   * Retirer un rôle d'un utilisateur
   */
  removeRole: async (userId: number | string, roleId: number | string) => {
    return await api.delete(API_ENDPOINTS.admin.removeRole(userId, roleId));
  },

  /**
   * Récupérer un utilisateur par son ID
   */
  getUserById: async (userId: number | string) => {
    return await api.get<AdminUser>(`${API_ENDPOINTS.admin.users}/${userId}`);
  },

  /**
   * Mettre à jour un utilisateur
   */
  updateUser: async (userId: number | string, data: UpdateUserData) => {
    return await api.put<AdminUser>(`${API_ENDPOINTS.admin.users}/${userId}`, data);
  },

  /**
   * Bannir un utilisateur
   */
  banUser: async (userId: number | string, data: BanUserData) => {
    return await api.post(`${API_ENDPOINTS.admin.users}/${userId}/ban`, data);
  },

  /**
   * Débannir un utilisateur
   */
  unbanUser: async (userId: number | string) => {
    return await api.post(`${API_ENDPOINTS.admin.users}/${userId}/unban`);
  },

  /**
   * Supprimer un utilisateur
   */
  deleteUser: async (userId: number | string) => {
    return await api.delete(`${API_ENDPOINTS.admin.users}/${userId}`);
  },

  /**
   * Créer un nouveau rôle
   */
  createRole: async (data: CreateRoleData) => {
    return await api.post<Role>(API_ENDPOINTS.admin.roles, data);
  },

  /**
   * Mettre à jour un rôle
   */
  updateRole: async (roleId: number | string, data: Partial<CreateRoleData>) => {
    return await api.put<Role>(`${API_ENDPOINTS.admin.roles}/${roleId}`, data);
  },

  /**
   * Supprimer un rôle
   */
  deleteRole: async (roleId: number | string) => {
    return await api.delete(`${API_ENDPOINTS.admin.roles}/${roleId}`);
  },

  /**
   * Récupérer toutes les permissions
   */
  getPermissions: async () => {
    return await api.get<Permission[]>(`${API_ENDPOINTS.admin.roles}/permissions`);
  },

  /**
   * Récupérer les statistiques générales
   */
  getStats: async () => {
    return await api.get<{
      total_users: number;
      active_users: number;
      banned_users: number;
      total_quizzes: number;
      total_sessions: number;
      total_questions: number;
      users_growth: { date: string; count: number }[];
      popular_categories: { category: string; count: number }[];
      recent_activity: any[];
    }>(`${API_ENDPOINTS.admin.users}/stats`);
  },

  /**
   * Récupérer les rapports d'utilisateurs
   */
  getReports: async (params?: {
    page?: number;
    limit?: number;
    status?: 'pending' | 'resolved' | 'dismissed';
    type?: string;
  }) => {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.status) searchParams.append('status', params.status);
    if (params?.type) searchParams.append('type', params.type);

    const url = searchParams.toString() 
      ? `${API_ENDPOINTS.admin.users}/reports?${searchParams.toString()}`
      : `${API_ENDPOINTS.admin.users}/reports`;

    return await api.get(url);
  },

  /**
   * Traiter un rapport
   */
  handleReport: async (reportId: number | string, action: 'resolve' | 'dismiss', reason?: string) => {
    return await api.post(`${API_ENDPOINTS.admin.users}/reports/${reportId}/handle`, {
      action,
      reason
    });
  },

  /**
   * Récupérer les logs d'activité
   */
  getActivityLogs: async (params?: {
    page?: number;
    limit?: number;
    user_id?: number;
    action?: string;
    date_from?: string;
    date_to?: string;
  }) => {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.user_id) searchParams.append('user_id', params.user_id.toString());
    if (params?.action) searchParams.append('action', params.action);
    if (params?.date_from) searchParams.append('date_from', params.date_from);
    if (params?.date_to) searchParams.append('date_to', params.date_to);

    const url = searchParams.toString() 
      ? `${API_ENDPOINTS.admin.users}/activity-logs?${searchParams.toString()}`
      : `${API_ENDPOINTS.admin.users}/activity-logs`;

    return await api.get(url);
  },

  /**
   * Envoyer une notification à tous les utilisateurs
   */
  broadcastNotification: async (data: {
    title: string;
    message: string;
    type: string;
    target_users?: 'all' | 'active' | 'role';
    role_id?: number;
  }) => {
    return await api.post(`${API_ENDPOINTS.admin.users}/broadcast-notification`, data);
  },

  /**
   * Exporter les données utilisateurs
   */
  exportUsers: async (format: 'csv' | 'xlsx' = 'csv', filters?: any) => {
    return await api.post(`${API_ENDPOINTS.admin.users}/export`, {
      format,
      filters
    });
  },
};

export default adminService; 