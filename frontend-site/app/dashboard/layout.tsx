'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';
import { User, isCreator, isAdmin } from '@/lib/types';

/**
 * Classe DashboardService pour gérer les fonctionnalités du dashboard
 */
class DashboardService {
  /**
   * Génère les éléments de navigation en fonction du rôle
   */
  static getNavigationItems(user: User | null) {
    // Items communs à tous les utilisateurs
    const commonItems = [
      { name: 'Tableau de bord', path: '/dashboard', icon: '🏠' },
      { name: 'Explorer', path: '/quiz/search', icon: '🔍' },
      { name: 'Mes quiz', path: '/quiz/history', icon: '📊' },
      { name: 'Trophées', path: '/profile/badges', icon: '🏆' },
      { name: 'Profil', path: '/profile/settings', icon: '👤' },
    ];
    
    // Items pour les créateurs et administrateurs
    const creatorItems = [
      { name: 'Créer un quiz', path: '/quiz/create', icon: '✏️' },
    ];
    
    // Items exclusifs aux administrateurs
    const adminItems = [
      { name: 'Gestion utilisateurs', path: '/admin/users', icon: '👥' },
      { name: 'Statistiques', path: '/admin/statistics', icon: '📈' },
      { name: 'Thèmes', path: '/admin/themes', icon: '🎨' },
    ];
    
    let navigationItems = [...commonItems];
    
    // Ajouter les éléments en fonction du rôle
    if (user) {
      if (isCreator(user)) {
        navigationItems.splice(1, 0, ...creatorItems);
      }
      
      if (isAdmin(user)) {
        navigationItems = [...navigationItems, ...adminItems];
      }
    }
    
    return navigationItems;
  }
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Vérifier si l'utilisateur est authentifié
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    // Charger les données de l'utilisateur
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('user');
        
        if (response.success && response.data) {
          setUser(response.data);
        }
      } catch (error: any) {
        console.error('Erreur lors du chargement du profil:', error);
        // Si l'erreur est liée à l'authentification, rediriger vers la page de connexion
        if (error.status === 401) {
          localStorage.removeItem('auth_token');
          router.push('/auth/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const navigationItems = DashboardService.getNavigationItems(user);

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <div className="flex min-h-screen bg-black">
      {/* Sidebar à gauche */}
      <div className="w-64 bg-black border-r border-[#1a1a1a]">
        {/* Logo et nom du site */}
        <div className="pt-8 pb-6 px-4">
          <Link href="/dashboard" className="flex items-center">
            <Image
              src="/img/logo4.png"
              alt="RTFM2Win Logo"
              width={40}
              height={40}
              className="rounded"
            />
            <span className="ml-3 text-[#00ffff] text-xl font-bold">
              RTFM2Win
            </span>
          </Link>
        </div>

        {/* Infos utilisateur */}
        {user && (
          <div className="px-6 py-4 text-white">
            <div className="font-medium">{user.username}</div>
            {user.roles && user.roles.length > 0 && (
              <div className="text-[#00ffff] text-sm">
                {user.roles[0].name}
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <nav className="mt-6">
          <ul className="space-y-4">
            {navigationItems.map((item) => (
              <li key={item.path} className="flex items-center">
                <span className="text-[#00ffff] text-xl pl-6 mr-2">•</span>
                <Link 
                  href={item.path}
                  className={`block py-2 ${
                    isActive(item.path)
                      ? 'text-[#00ffff] font-medium'
                      : 'text-gray-400 hover:text-[#00ffff]'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bouton déconnexion */}
        <div className="absolute bottom-8 left-6">
          <button
            onClick={async () => {
              try {
                await api.post('logout', {});
              } catch (error) {
                console.error('Erreur lors de la déconnexion:', error);
              } finally {
                localStorage.removeItem('auth_token');
                router.push('/auth/login');
              }
            }}
            className="flex items-center text-gray-400 hover:text-red-400"
          >
            <span className="mr-2">🚪</span>
            Déconnexion
          </button>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1">
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
} 