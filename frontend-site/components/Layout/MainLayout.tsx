'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { User, isCreator, isAdmin } from '@/lib/types';
import ThemeSwitcher from '@/components/ThemeSwitcher';

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

/**
 * Service pour gérer la navigation et les permissions
 */
class NavigationService {
  /**
   * Génère les éléments de navigation en fonction du rôle utilisateur
   */
  static getNavigationItems(user: User | null) {
    // Items communs à tous les utilisateurs connectés
    const commonItems = [
      { name: 'Tableau de bord', path: '/dashboard', icon: '🏠', roles: ['user', 'creator', 'admin', 'super_admin'] },
      { name: 'Explorer', path: '/quiz/search', icon: '🔍', roles: ['user', 'creator', 'admin', 'super_admin'] },
      { name: 'Mes quiz', path: '/quiz/history', icon: '📊', roles: ['user', 'creator', 'admin', 'super_admin'] },
      { name: 'Battle Royale', path: '/battle-royale', icon: '⚔️', roles: ['user', 'creator', 'admin', 'super_admin'] },
      { name: 'Tournois', path: '/tournaments', icon: '🏆', roles: ['user', 'creator', 'admin', 'super_admin'] },
      { name: 'Ligues', path: '/leagues', icon: '🏅', roles: ['user', 'creator', 'admin', 'super_admin'] },
      { name: 'Classements', path: '/leaderboards', icon: '📈', roles: ['user', 'creator', 'admin', 'super_admin'] },
      { name: 'Achievements', path: '/achievements', icon: '🎖️', roles: ['user', 'creator', 'admin', 'super_admin'] },
      { name: 'Amis', path: '/friends', icon: '👥', roles: ['user', 'creator', 'admin', 'super_admin'] },
      { name: 'Notifications', path: '/notifications', icon: '🔔', roles: ['user', 'creator', 'admin', 'super_admin'] },
      { name: 'Sons', path: '/sounds', icon: '🔊', roles: ['user', 'creator', 'admin', 'super_admin'] },
      { name: 'Thèmes', path: '/themes', icon: '🎨', roles: ['user', 'creator', 'admin', 'super_admin'] },
      { name: 'Exports', path: '/exports', icon: '📤', roles: ['user', 'creator', 'admin', 'super_admin'] },
      { name: 'Profil', path: '/profile/settings', icon: '👤', roles: ['user', 'creator', 'admin', 'super_admin'] },
    ];
    
    // Items pour les créateurs
    const creatorItems = [
      { name: 'Créer un quiz', path: '/quiz/create', icon: '✏️', roles: ['creator', 'admin', 'super_admin'] },
    ];
    
    // Items pour les administrateurs
    const adminItems = [
      { name: 'Admin Utilisateurs', path: '/admin/users', icon: '👥', roles: ['admin', 'super_admin'] },
      { name: 'Admin Thèmes', path: '/admin/themes', icon: '🎨', roles: ['admin', 'super_admin'] },
    ];
    
    // Construire la liste des éléments de navigation
    let navigationItems = [...commonItems];
    
    if (user) {
      // Ajouter les éléments créateur après "Mes quiz"
      if (isCreator(user)) {
        const mesQuizIndex = navigationItems.findIndex(item => item.path === '/quiz/history');
        navigationItems.splice(mesQuizIndex + 1, 0, ...creatorItems);
      }
      
      // Ajouter les éléments admin à la fin
      if (isAdmin(user)) {
        navigationItems = [...navigationItems, ...adminItems];
      }
    }
    
    // Filtrer les éléments selon les rôles de l'utilisateur
    if (user && user.roles) {
      const userRoles = user.roles.map(role => role.name);
      navigationItems = navigationItems.filter(item => 
        item.roles.some(role => userRoles.includes(role))
      );
    }
    
    return navigationItems;
  }

  /**
   * Vérifie si l'utilisateur a accès à une route
   */
  static hasAccess(user: User | null, path: string): boolean {
    if (!user) return false;
    
    const navigationItems = this.getNavigationItems(user);
    return navigationItems.some(item => item.path === path);
  }
}

export default function MainLayout({ 
  children, 
  title = "RTFM2WIN", 
  description = "Plateforme de quiz interactive pour développeurs" 
}: MainLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    // Vérifier l'authentification
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    // Simuler un utilisateur connecté (à remplacer par l'appel API réel)
    const mockUser = {
      id: 1,
      username: 'Laurent',
      email: 'laurent@example.com',
      avatar: null,
      roles: [{ id: 2, name: 'super_admin' }],
      trophies_count: 5,
      achievement_points: 250
    };
    
    setUser(mockUser);
    setIsLoading(false);
  }, [router]);

  const navigationItems = NavigationService.getNavigationItems(user);

  const isActive = (path: string) => {
    return pathname === path;
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    router.push('/auth/login');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden w-full bg-background text-foreground">
      {/* Sidebar à gauche */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-card border-r border-border transition-all duration-300 flex flex-col`}>
        {/* Header Sidebar */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <h1 className="text-xl font-bold text-primary">RTFM2WIN</h1>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              title={sidebarOpen ? 'Réduire la sidebar' : 'Étendre la sidebar'}
            >
              {sidebarOpen ? '←' : '→'}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center p-3 rounded-lg transition-colors ${
                isActive(item.path)
                  ? 'bg-primary/20 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
              title={!sidebarOpen ? item.name : undefined}
            >
              <span className="text-lg mr-3">{item.icon}</span>
              {sidebarOpen && <span>{item.name}</span>}
            </Link>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-border">
          {user && (
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-primary font-bold">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              </div>
              {sidebarOpen && (
                <div className="flex-1">
                  <p className="font-medium">{user.username}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  {user.roles && user.roles.length > 0 && (
                    <p className="text-xs text-primary">
                      {user.roles[0].name.replace('_', ' ').toUpperCase()}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
          
          {sidebarOpen && (
            <div className="space-y-2">
              <ThemeSwitcher />
              <button
                onClick={handleLogout}
                className="w-full p-2 text-left text-destructive hover:bg-destructive/10 rounded-lg transition-colors flex items-center"
              >
                <span className="mr-2">🚪</span>
                Déconnexion
              </button>
            </div>
          )}
          
          {!sidebarOpen && (
            <div className="space-y-2">
              <div className="flex justify-center">
                <ThemeSwitcher />
              </div>
              <button
                onClick={handleLogout}
                className="w-full p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors flex justify-center"
                title="Déconnexion"
              >
                🚪
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{title}</h2>
              <p className="text-muted-foreground">{description}</p>
            </div>
            
            <div className="flex items-center space-x-4">
              {user && (
                <>
                  <div className="text-right">
                    <p className="font-medium">{user.username}</p>
                    <p className="text-sm text-muted-foreground">
                      🏆 {(user as any).trophies_count || 0} • ⭐ {(user as any).achievement_points || 0}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-primary font-bold">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}