'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Particles } from '@/components/magicui/particles';
import { api } from '@/lib/api';
import UserRoleBadge from '@/components/Profile/UserRoleBadge';
import { User, isCreator, isAdmin } from '@/lib/types';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Vérifier si l'utilisateur est authentifié
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/auth');
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
          router.push('/auth');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handleLogout = async () => {
    try {
      await api.post('logout', {});
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      localStorage.removeItem('auth_token');
      router.push('/auth');
    }
  };

  // Générer les éléments de navigation en fonction du rôle de l'utilisateur
  const getNavigationItems = () => {
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
    ];
    
    let navigationItems = [...commonItems];
    
    // Ajouter les éléments en fonction du rôle
    if (user) {
      if (isCreator(user)) {
        navigationItems.splice(1, 0, ...creatorItems); // Ajouter après le tableau de bord
      }
      
      if (isAdmin(user)) {
        navigationItems = [...navigationItems, ...adminItems]; // Ajouter à la fin
      }
    }
    
    return navigationItems;
  };

  const navigationItems = getNavigationItems();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <div className="min-h-screen bg-[#0D111E] relative overflow-hidden">
      <Particles className="absolute inset-0" />
      <Particles className="absolute inset-0" quantity={30} color="#4f46e5" size={0.8} />
      <Particles className="absolute inset-0" quantity={20} color="#7c3aed" size={1.2} />
      <Particles className="absolute inset-0" quantity={15} color="#ec4899" size={1.6} />
      
      {/* Header mobile */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[#0D111E]/70 border-b border-white/10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Image
              src="/img/logo4.png"
              alt="RTFM2Win Logo"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              RTFM2Win
            </span>
          </div>
          
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg bg-white/10 text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* Menu mobile */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="md:hidden fixed inset-0 z-50 bg-[#0D111E]/95 backdrop-blur-xl"
          >
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center p-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <Image
                    src="/img/logo4.png"
                    alt="RTFM2Win Logo"
                    width={40}
                    height={40}
                    className="rounded-lg"
                  />
                  <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                    RTFM2Win
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg bg-white/10 text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {user && (
                <div className="flex flex-col gap-2 p-4 border-b border-white/10">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {user.avatar ? (
                        <Image
                          src={user.avatar}
                          alt={user.username}
                          width={40}
                          height={40}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        user.username.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{user.username}</h3>
                      <p className="text-sm text-gray-400">{user.email}</p>
                    </div>
                  </div>
                  
                  {/* Afficher les badges de rôle */}
                  {user.roles && user.roles.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {user.roles.map(role => (
                        <UserRoleBadge key={role.id} role={role} size="sm" />
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              <nav className="flex-1 overflow-y-auto p-4">
                <ul className="space-y-2">
                  {navigationItems.map((item) => (
                    <li key={item.path}>
                      <Link href={item.path} passHref>
                        <span
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                            isActive(item.path)
                              ? 'bg-white/20 text-white'
                              : 'text-gray-400 hover:bg-white/10 hover:text-white'
                          }`}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <span className="text-xl">{item.icon}</span>
                          <span>{item.name}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
              
              <div className="p-4 border-t border-white/10">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <span className="text-xl">🚪</span>
                  <span>Déconnexion</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-64 bg-[#0D111E]/80 backdrop-blur-xl border-r border-white/10 z-20">
        <div className="p-4 flex items-center gap-3 border-b border-white/10">
          <Image
            src="/img/logo4.png"
            alt="RTFM2Win Logo"
            width={40}
            height={40}
            className="rounded-lg"
          />
          <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            RTFM2Win
          </span>
        </div>
        
        {user && (
          <div className="p-4 flex flex-col gap-2 border-b border-white/10">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                {user.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user.username}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                  />
                ) : (
                  user.username.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <h3 className="text-white font-medium truncate max-w-[150px]">{user.username}</h3>
                <p className="text-xs text-gray-400 truncate max-w-[150px]">{user.email}</p>
              </div>
            </div>
            
            {/* Afficher les badges de rôle */}
            {user.roles && user.roles.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {user.roles.map(role => (
                  <UserRoleBadge key={role.id} role={role} size="sm" />
                ))}
              </div>
            )}
          </div>
        )}
        
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {navigationItems.map((item) => (
              <li key={item.path}>
                <Link href={item.path} passHref>
                  <span
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive(item.path)
                        ? 'bg-white/20 text-white'
                        : 'text-gray-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span>{item.name}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
          >
            <span className="text-xl">🚪</span>
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Contenu principal */}
      <main className="md:pl-64 pt-16 md:pt-0">
        <div className="container mx-auto px-4 py-6">
          {children}
        </div>
      </main>
    </div>
  );
} 