// Types pour les utilisateurs et l'authentification
export interface Role {
  id: number;
  name: string;
  description?: string;
  permissions?: string[];
}

export interface User {
  id: number;
  username: string;
  email: string;
  avatar: string | null;
  roles?: Role[];
  trophies_count?: number;
  achievement_points?: number;
}

// Fonction utilitaire pour vérifier les rôles
export function hasRole(user: User | null, roleName: string): boolean {
  if (!user || !user.roles) {
    return false;
  }
  
  return user.roles.some(role => role.name === roleName);
}

export function isCreator(user: User | null): boolean {
  return hasRole(user, 'creator') || hasRole(user, 'admin') || hasRole(user, 'super_admin');
}

export function isAdmin(user: User | null): boolean {
  return hasRole(user, 'admin') || hasRole(user, 'super_admin');
}

export function isSuperAdmin(user: User | null): boolean {
  return hasRole(user, 'super_admin');
}

// Types pour les quiz et questions
export interface Quiz {
  id: number;
  name: string;
  description?: string;
  creator_id: number;
  creator?: User;
  questions_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Question {
  id: number;
  quiz_id: number;
  text: string;
  points?: number;
  time_limit?: number;
  type?: string; // 'single_choice', 'multiple_choice', etc.
}

export interface Answer {
  id: number;
  question_id: number;
  text: string;
  is_correct: boolean;
}

// Types pour les réalisations
export interface Achievement {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  type: 'badge' | 'trophy';
  criteria?: any;
  earned_at?: string;
}

// Types pour les notifications
export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
} 