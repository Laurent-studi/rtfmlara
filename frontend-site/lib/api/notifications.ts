import { API_ENDPOINTS } from './endpoints';
import { api } from './index';

// Types pour les notifications
export interface Notification {
  id: number;
  user_id: number;
  type: 'achievement' | 'quiz_invitation' | 'quiz_result' | 'friend_request' | 'system' | 'reminder';
  title: string;
  message: string;
  data?: Record<string, any>;
  is_read: boolean;
  is_important: boolean;
  action_url?: string;
  action_text?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
  read_at?: string;
}

export interface CreateNotificationData {
  user_id: number;
  type: 'achievement' | 'quiz_invitation' | 'quiz_result' | 'friend_request' | 'system' | 'reminder';
  title: string;
  message: string;
  data?: Record<string, any>;
  is_important?: boolean;
  action_url?: string;
  action_text?: string;
  expires_at?: string;
}

export interface UpdateNotificationData {
  title?: string;
  message?: string;
  is_read?: boolean;
  is_important?: boolean;
  action_url?: string;
  action_text?: string;
}

export interface NotificationPreferences {
  email_notifications: boolean;
  push_notifications: boolean;
  achievement_notifications: boolean;
  quiz_invitation_notifications: boolean;
  quiz_result_notifications: boolean;
  friend_request_notifications: boolean;
  system_notifications: boolean;
  reminder_notifications: boolean;
  notification_frequency: 'immediate' | 'daily' | 'weekly' | 'never';
  quiet_hours_start?: string;
  quiet_hours_end?: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  by_type: Record<string, number>;
  recent_count: number;
}

/**
 * Service pour la gestion des notifications utilisant les endpoints définis
 */
export const notificationService = {
  /**
   * Récupérer toutes les notifications de l'utilisateur
   */
  getAll: async (params?: {
    page?: number;
    limit?: number;
    type?: string;
    is_read?: boolean;
  }) => {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.type) searchParams.append('type', params.type);
    if (params?.is_read !== undefined) searchParams.append('is_read', params.is_read.toString());

    const url = searchParams.toString() 
      ? `${API_ENDPOINTS.notifications.list}?${searchParams.toString()}`
      : API_ENDPOINTS.notifications.list;

    return await api.get<{
      data: Notification[];
      total: number;
      current_page: number;
      last_page: number;
    }>(url);
  },

  /**
   * Récupérer les notifications non lues
   */
  getUnread: async () => {
    return await api.get<Notification[]>(API_ENDPOINTS.notifications.unread);
  },

  /**
   * Marquer toutes les notifications comme lues
   */
  markAllRead: async () => {
    return await api.post(API_ENDPOINTS.notifications.markAllRead);
  },

  /**
   * Mettre à jour une notification
   */
  update: async (id: number | string, data: UpdateNotificationData) => {
    return await api.put<Notification>(API_ENDPOINTS.notifications.update(id), data);
  },

  /**
   * Supprimer une notification
   */
  delete: async (id: number | string) => {
    return await api.delete(API_ENDPOINTS.notifications.delete(id));
  },

  /**
   * Marquer une notification comme lue
   */
  markAsRead: async (id: number | string) => {
    return await api.put<Notification>(API_ENDPOINTS.notifications.update(id), {
      is_read: true
    });
  },

  /**
   * Marquer une notification comme non lue
   */
  markAsUnread: async (id: number | string) => {
    return await api.put<Notification>(API_ENDPOINTS.notifications.update(id), {
      is_read: false
    });
  },

  /**
   * Récupérer une notification par son ID
   */
  getById: async (id: number | string) => {
    return await api.get<Notification>(`${API_ENDPOINTS.notifications.list}/${id}`);
  },

  /**
   * Créer une nouvelle notification (admin)
   */
  create: async (notificationData: CreateNotificationData) => {
    return await api.post<Notification>(`${API_ENDPOINTS.notifications.list}/admin`, notificationData);
  },

  /**
   * Envoyer une notification à plusieurs utilisateurs (admin)
   */
  broadcast: async (data: {
    user_ids: number[];
    type: string;
    title: string;
    message: string;
    data?: Record<string, any>;
    is_important?: boolean;
    action_url?: string;
    action_text?: string;
  }) => {
    return await api.post(`${API_ENDPOINTS.notifications.list}/admin/broadcast`, data);
  },

  /**
   * Récupérer les statistiques des notifications
   */
  getStats: async () => {
    return await api.get<NotificationStats>(`${API_ENDPOINTS.notifications.list}/stats`);
  },

  /**
   * Récupérer les préférences de notification
   */
  getPreferences: async () => {
    return await api.get<NotificationPreferences>(`${API_ENDPOINTS.notifications.list}/preferences`);
  },

  /**
   * Mettre à jour les préférences de notification
   */
  updatePreferences: async (preferences: Partial<NotificationPreferences>) => {
    return await api.put<NotificationPreferences>(`${API_ENDPOINTS.notifications.list}/preferences`, preferences);
  },

  /**
   * Supprimer toutes les notifications lues
   */
  deleteAllRead: async () => {
    return await api.delete(`${API_ENDPOINTS.notifications.list}/read`);
  },

  /**
   * Supprimer toutes les notifications
   */
  deleteAll: async () => {
    return await api.delete(`${API_ENDPOINTS.notifications.list}/all`);
  },

  /**
   * Récupérer les notifications par type
   */
  getByType: async (type: string) => {
    return await api.get<Notification[]>(`${API_ENDPOINTS.notifications.list}/type/${type}`);
  },

  /**
   * Marquer les notifications d'un type comme lues
   */
  markTypeAsRead: async (type: string) => {
    return await api.post(`${API_ENDPOINTS.notifications.list}/type/${type}/mark-read`);
  },

  /**
   * Récupérer les notifications récentes (dernières 24h)
   */
  getRecent: async () => {
    return await api.get<Notification[]>(`${API_ENDPOINTS.notifications.list}/recent`);
  },

  /**
   * Récupérer les notifications importantes
   */
  getImportant: async () => {
    return await api.get<Notification[]>(`${API_ENDPOINTS.notifications.list}/important`);
  },

  /**
   * Tester l'envoi d'une notification
   */
  test: async (type: string) => {
    return await api.post(`${API_ENDPOINTS.notifications.list}/test`, { type });
  },

  /**
   * S'abonner aux notifications push
   */
  subscribePush: async (subscription: PushSubscription) => {
    return await api.post(`${API_ENDPOINTS.notifications.list}/push/subscribe`, {
      subscription: subscription.toJSON()
    });
  },

  /**
   * Se désabonner des notifications push
   */
  unsubscribePush: async () => {
    return await api.post(`${API_ENDPOINTS.notifications.list}/push/unsubscribe`);
  },

  /**
   * Vérifier le statut des notifications push
   */
  getPushStatus: async () => {
    return await api.get(`${API_ENDPOINTS.notifications.list}/push/status`);
  },

  /**
   * Archiver une notification
   */
  archive: async (id: number | string) => {
    return await api.post(`${API_ENDPOINTS.notifications.list}/${id}/archive`);
  },

  /**
   * Désarchiver une notification
   */
  unarchive: async (id: number | string) => {
    return await api.post(`${API_ENDPOINTS.notifications.list}/${id}/unarchive`);
  },

  /**
   * Récupérer les notifications archivées
   */
  getArchived: async () => {
    return await api.get<Notification[]>(`${API_ENDPOINTS.notifications.list}/archived`);
  },

  /**
   * Programmer une notification (admin)
   */
  schedule: async (data: CreateNotificationData & {
    scheduled_at: string;
  }) => {
    return await api.post(`${API_ENDPOINTS.notifications.list}/admin/schedule`, data);
  },

  /**
   * Récupérer les notifications programmées (admin)
   */
  getScheduled: async () => {
    return await api.get(`${API_ENDPOINTS.notifications.list}/admin/scheduled`);
  },

  /**
   * Annuler une notification programmée (admin)
   */
  cancelScheduled: async (id: number | string) => {
    return await api.delete(`${API_ENDPOINTS.notifications.list}/admin/scheduled/${id}`);
  },
};

export default notificationService; 