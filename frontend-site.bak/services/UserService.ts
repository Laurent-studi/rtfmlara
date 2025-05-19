import { User, IUserData, IUserStats } from '../models/User';
import axios from 'axios';

export class UserService {
  private static instance: UserService;
  private readonly apiBaseUrl: string;
  private currentUser: User | null = null;
  
  private constructor() {
    this.apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  }
  
  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }
  
  private getAuthHeader(): { Authorization: string } | {} {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
  
  public async getCurrentUser(): Promise<User | null> {
    try {
      const response = await axios.get(`${this.apiBaseUrl}/users/me`, {
        headers: this.getAuthHeader()
      });
      
      if (response.status === 200) {
        this.currentUser = User.fromAPI(response.data);
        return this.currentUser;
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération du profil utilisateur:', error);
      return null;
    }
  }
  
  public async getUserById(userId: string): Promise<User | null> {
    try {
      const response = await axios.get(`${this.apiBaseUrl}/users/${userId}`, {
        headers: this.getAuthHeader()
      });
      
      if (response.status === 200) {
        return User.fromAPI(response.data);
      }
      return null;
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'utilisateur (ID: ${userId}):`, error);
      return null;
    }
  }
  
  public async updateUserProfile(userData: Partial<IUserData>): Promise<User | null> {
    try {
      const response = await axios.put(`${this.apiBaseUrl}/users/me`, userData, {
        headers: this.getAuthHeader()
      });
      
      if (response.status === 200) {
        this.currentUser = User.fromAPI(response.data);
        return this.currentUser;
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      return null;
    }
  }
  
  public async getUserQuizzes(): Promise<any[]> {
    try {
      const response = await axios.get(`${this.apiBaseUrl}/users/me/quizzes`, {
        headers: this.getAuthHeader()
      });
      
      if (response.status === 200) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Erreur lors de la récupération des quiz créés:', error);
      return [];
    }
  }
  
  public async getUserParticipations(): Promise<any[]> {
    try {
      const response = await axios.get(`${this.apiBaseUrl}/users/me/participations`, {
        headers: this.getAuthHeader()
      });
      
      if (response.status === 200) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Erreur lors de la récupération des participations:', error);
      return [];
    }
  }
  
  public async getUserStats(): Promise<IUserStats | null> {
    try {
      const response = await axios.get(`${this.apiBaseUrl}/users/me/stats`, {
        headers: this.getAuthHeader()
      });
      
      if (response.status === 200 && this.currentUser) {
        this.currentUser.updateStats(response.data);
        return this.currentUser.stats;
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      return null;
    }
  }
  
  public async getSuggestedUsers(limit: number = 5): Promise<User[]> {
    try {
      const response = await axios.get(`${this.apiBaseUrl}/users/suggested?limit=${limit}`, {
        headers: this.getAuthHeader()
      });
      
      if (response.status === 200) {
        return response.data.map((userData: any) => User.fromAPI(userData));
      }
      return [];
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs suggérés:', error);
      return [];
    }
  }
  
  public async register(username: string, email: string, password: string): Promise<{ user: User, token: string } | null> {
    try {
      const response = await axios.post(`${this.apiBaseUrl}/auth/register`, {
        username,
        email,
        password
      });
      
      if (response.status === 201) {
        const { user, token } = response.data;
        this.currentUser = User.fromAPI(user);
        
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('token', token);
        }
        
        return { user: this.currentUser, token };
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      throw error;
    }
  }
  
  public async login(email: string, password: string): Promise<{ user: User, token: string } | null> {
    try {
      const response = await axios.post(`${this.apiBaseUrl}/auth/login`, {
        email,
        password
      });
      
      if (response.status === 200) {
        const { user, token } = response.data;
        this.currentUser = User.fromAPI(user);
        
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('token', token);
        }
        
        return { user: this.currentUser, token };
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      throw error;
    }
  }
  
  public logout(): void {
    this.currentUser = null;
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('token');
    }
  }
} 