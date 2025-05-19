import { apiService } from './api';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface AuthUser {
  username: string;
  email: string;
}

class AuthService {
  private static instance: AuthService;
  private user: AuthUser | null = null;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public getCurrentUser(): AuthUser | null {
    return this.user;
  }

  public setCurrentUser(user: AuthUser): void {
    this.user = user;
  }

  public async checkAuth(): Promise<boolean> {
    const token = apiService.getAuthToken();
    if (!token) {
      return false;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        this.logout();
        return false;
      }

      const userData = await response.json();
      this.setCurrentUser({
        username: userData.username,
        email: userData.email,
      });
      return true;
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'authentification:', error);
      this.logout();
      return false;
    }
  }

  public isAuthenticated(): boolean {
    return !!apiService.getAuthToken();
  }

  public async login(username: string, password: string, email: string): Promise<void> {
    const response = await apiService.login({ username, password, email });
    this.setCurrentUser({
      username: response.username,
      email: response.email,
    });
  }

  public async register(username: string, password: string, email: string): Promise<void> {
    const response = await apiService.register({ username, password, email });
    this.setCurrentUser({
      username: response.username,
      email: response.email,
    });
  }

  public async logout(): Promise<void> {
    if (this.isAuthenticated()) {
      try {
        await apiService.logout();
      } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
      }
    }
    this.user = null;
    apiService.clearToken();
  }
}

export const authService = AuthService.getInstance();

// Hook personnalisé pour gérer l'authentification
export function useAuth() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const isAuth = await authService.checkAuth();
        setIsAuthenticated(isAuth);
        setUser(authService.getCurrentUser());
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification:', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthentication();
  }, []);

  const login = async (username: string, password: string, email: string) => {
    setLoading(true);
    try {
      await authService.login(username, password, email);
      setIsAuthenticated(true);
      setUser(authService.getCurrentUser());
      return true;
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (username: string, password: string, email: string) => {
    setLoading(true);
    try {
      await authService.register(username, password, email);
      setIsAuthenticated(true);
      setUser(authService.getCurrentUser());
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      setIsAuthenticated(false);
      setUser(null);
      router.push('/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      setLoading(false);
    }
  };

  const requireAuth = () => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
      return false;
    }
    return true;
  };

  return { 
    isAuthenticated, 
    user, 
    loading, 
    login, 
    register, 
    logout, 
    requireAuth 
  };
}
