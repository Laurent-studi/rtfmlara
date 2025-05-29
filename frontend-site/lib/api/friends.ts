import { API_ENDPOINTS } from './endpoints';
import { api } from './index';

// Types pour les amis
export interface Friend {
  id: number;
  user_id: number;
  friend_id: number;
  friend: FriendUser;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: string;
  updated_at: string;
  accepted_at?: string;
}

export interface FriendUser {
  id: number;
  username: string;
  email?: string;
  avatar?: string;
  is_online: boolean;
  last_activity: string;
  total_score: number;
  global_rank: number;
  badges_count: number;
  trophies_count: number;
}

export interface FriendRequest {
  id: number;
  sender_id: number;
  receiver_id: number;
  sender: FriendUser;
  receiver: FriendUser;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface SendFriendRequestData {
  user_id: number;
  message?: string;
}

export interface AcceptFriendRequestData {
  request_id: number;
}

export interface RejectFriendRequestData {
  request_id: number;
  reason?: string;
}

export interface BlockUserData {
  user_id: number;
  reason?: string;
}

export interface FriendSearchResult {
  id: number;
  username: string;
  avatar?: string;
  is_friend: boolean;
  is_blocked: boolean;
  has_pending_request: boolean;
  mutual_friends_count: number;
}

/**
 * Service pour la gestion des amis utilisant les endpoints définis
 */
export const friendService = {
  /**
   * Récupérer la liste des amis
   */
  getAll: async () => {
    return await api.get<Friend[]>(API_ENDPOINTS.friends.list);
  },

  /**
   * Envoyer une demande d'ami
   */
  sendRequest: async (data: SendFriendRequestData) => {
    return await api.post<FriendRequest>(API_ENDPOINTS.friends.sendRequest, data);
  },

  /**
   * Accepter une demande d'ami
   */
  acceptRequest: async (data: AcceptFriendRequestData) => {
    return await api.post<Friend>(API_ENDPOINTS.friends.acceptRequest, data);
  },

  /**
   * Rejeter une demande d'ami
   */
  rejectRequest: async (data: RejectFriendRequestData) => {
    return await api.post(API_ENDPOINTS.friends.rejectRequest, data);
  },

  /**
   * Supprimer un ami
   */
  remove: async (friendId: number | string) => {
    return await api.delete(API_ENDPOINTS.friends.remove(friendId));
  },

  /**
   * Bloquer un utilisateur
   */
  block: async (data: BlockUserData) => {
    return await api.post(API_ENDPOINTS.friends.block, data);
  },

  /**
   * Débloquer un utilisateur
   */
  unblock: async (userId: number | string) => {
    return await api.delete(API_ENDPOINTS.friends.unblock(userId));
  },

  /**
   * Rechercher des utilisateurs
   */
  search: async (query: string) => {
    return await api.get<FriendSearchResult[]>(`${API_ENDPOINTS.friends.search}?q=${encodeURIComponent(query)}`);
  },

  /**
   * Récupérer les demandes d'amis en attente (reçues)
   */
  getPendingRequests: async () => {
    return await api.get<FriendRequest[]>(`${API_ENDPOINTS.friends.list}/requests/pending`);
  },

  /**
   * Récupérer les demandes d'amis envoyées
   */
  getSentRequests: async () => {
    return await api.get<FriendRequest[]>(`${API_ENDPOINTS.friends.list}/requests/sent`);
  },

  /**
   * Récupérer les utilisateurs bloqués
   */
  getBlocked: async () => {
    return await api.get<FriendUser[]>(`${API_ENDPOINTS.friends.list}/blocked`);
  },

  /**
   * Récupérer les amis en ligne
   */
  getOnline: async () => {
    return await api.get<Friend[]>(`${API_ENDPOINTS.friends.list}/online`);
  },

  /**
   * Récupérer les suggestions d'amis
   */
  getSuggestions: async () => {
    return await api.get<FriendSearchResult[]>(`${API_ENDPOINTS.friends.list}/suggestions`);
  },

  /**
   * Récupérer les amis mutuels avec un utilisateur
   */
  getMutualFriends: async (userId: number | string) => {
    return await api.get<Friend[]>(`${API_ENDPOINTS.friends.list}/mutual/${userId}`);
  },

  /**
   * Récupérer les statistiques d'amitié
   */
  getStats: async () => {
    return await api.get<{
      total_friends: number;
      online_friends: number;
      pending_requests: number;
      sent_requests: number;
      blocked_users: number;
      mutual_friends_avg: number;
    }>(`${API_ENDPOINTS.friends.list}/stats`);
  },

  /**
   * Inviter un ami à un quiz
   */
  inviteToQuiz: async (friendId: number | string, quizId: number | string, message?: string) => {
    return await api.post(`${API_ENDPOINTS.friends.list}/${friendId}/invite-quiz`, {
      quiz_id: quizId,
      message
    });
  },

  /**
   * Défier un ami
   */
  challenge: async (friendId: number | string, quizId: number | string, message?: string) => {
    return await api.post(`${API_ENDPOINTS.friends.list}/${friendId}/challenge`, {
      quiz_id: quizId,
      message
    });
  },

  /**
   * Partager un score avec des amis
   */
  shareScore: async (friendIds: number[], sessionId: number | string, message?: string) => {
    return await api.post(`${API_ENDPOINTS.friends.list}/share-score`, {
      friend_ids: friendIds,
      session_id: sessionId,
      message
    });
  },

  /**
   * Récupérer l'activité récente des amis
   */
  getActivity: async () => {
    return await api.get(`${API_ENDPOINTS.friends.list}/activity`);
  },

  /**
   * Marquer l'activité comme vue
   */
  markActivityAsSeen: async (activityId: number | string) => {
    return await api.post(`${API_ENDPOINTS.friends.list}/activity/${activityId}/seen`);
  },
};

export default friendService; 