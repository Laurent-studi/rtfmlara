'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { authService } from '../../../lib/auth';

export default function Header() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = await authService.checkAuth();
      setIsAuthenticated(isAuth);
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    await authService.logout();
    setIsAuthenticated(false);
    router.push('/');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-gray-800 border-b border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              RTFM2Win
            </Link>
          </div>

          {/* Navigation pour desktop */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/quiz" className={`text-sm ${router.pathname.startsWith('/quiz') ? 'text-white font-medium' : 'text-gray-300 hover:text-white'} transition-colors`}>
              Quiz
            </Link>
            <Link href="/session" className={`text-sm ${router.pathname.startsWith('/session') ? 'text-white font-medium' : 'text-gray-300 hover:text-white'} transition-colors`}>
              Sessions
            </Link>
            <Link href="/leaderboard" className={`text-sm ${router.pathname.startsWith('/leaderboard') ? 'text-white font-medium' : 'text-gray-300 hover:text-white'} transition-colors`}>
              Classement
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link href="/notifications" className={`text-sm ${router.pathname.startsWith('/notifications') ? 'text-white font-medium' : 'text-gray-300 hover:text-white'} transition-colors`}>
                  Notifications
                </Link>
                <div className="relative group">
                  <button className={`text-sm ${router.pathname.startsWith('/profile') ? 'text-white font-medium' : 'text-gray-300 hover:text-white'} transition-colors`}>
                    Mon profil
                  </button>
                  <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-1">
                      <Link href="/profile" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-600 hover:text-white transition-colors">
                        Mon compte
                      </Link>
                      <Link href="/profile/badges" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-600 hover:text-white transition-colors">
                        Mes badges
                      </Link>
                      <Link href="/profile/settings" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-600 hover:text-white transition-colors">
                        Paramètres
                      </Link>
                      <button 
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-600 hover:text-red-300 transition-colors"
                      >
                        Déconnexion
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Connexion
                </Link>
                <Link href="/auth/register" className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-lg transition-colors">
                  S'inscrire
                </Link>
              </>
            )}
          </nav>

          {/* Bouton mobile */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-gray-300 hover:text-white focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-gray-800 border-t border-gray-700">
          <div className="px-2 pt-2 pb-4 space-y-1">
            <Link 
              href="/quiz"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-md ${router.pathname.startsWith('/quiz') ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'} transition-colors`}
            >
              Quiz
            </Link>
            <Link 
              href="/session"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-md ${router.pathname.startsWith('/session') ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'} transition-colors`}
            >
              Sessions
            </Link>
            <Link 
              href="/leaderboard"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-md ${router.pathname.startsWith('/leaderboard') ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'} transition-colors`}
            >
              Classement
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link 
                  href="/notifications"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md ${router.pathname.startsWith('/notifications') ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'} transition-colors`}
                >
                  Notifications
                </Link>
                <Link 
                  href="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md ${router.pathname.startsWith('/profile') ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'} transition-colors`}
                >
                  Mon profil
                </Link>
                <Link 
                  href="/profile/badges"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                >
                  Mes badges
                </Link>
                <Link 
                  href="/profile/settings"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                >
                  Paramètres
                </Link>
                <button 
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-red-400 hover:bg-gray-700 hover:text-red-300 transition-colors"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/auth/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                >
                  Connexion
                </Link>
                <Link 
                  href="/auth/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                >
                  S'inscrire
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
} 