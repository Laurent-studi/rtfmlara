// Types pour les utilisateurs
export interface User {
  id: number;
  username: string;
  email: string;
  avatar?: string | null;
  roles?: Role[];
}

export interface Role {
  id: number;
  name: string;
}

// Helpers pour vérifier les rôles
export function isCreator(user: User | null): boolean {
  if (!user || !user.roles) return false;
  return user.roles.some(role => role.name === 'creator' || role.name === 'admin');
}

export function isAdmin(user: User | null): boolean {
  if (!user || !user.roles) return false;
  return user.roles.some(role => role.name === 'admin');
}

// Types pour les quiz
export interface Quiz {
  id: number;
  title: string;
  description?: string;
  creator_id: number;
  created_at?: string;
  updated_at?: string;
  category?: string;
  time_per_question?: number;
  status?: string;
  code?: string;
  questions?: Question[];
}

// Types pour les questions
export interface Question {
  id?: number;
  quiz_id: number;
  question_text: string;
  points?: number;
  time_limit?: number;
  multiple_answers?: boolean;
  order_index?: number;
  created_at?: string;
  updated_at?: string;
  answers?: Answer[];
}

// Types pour les réponses
export interface Answer {
  id?: number;
  question_id?: number;
  answer_text: string;
  is_correct: boolean;
  explanation?: string | null;
  order_index?: number;
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