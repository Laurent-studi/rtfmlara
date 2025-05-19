'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Particles } from '@/components/magicui/particles';
import { ShineBorder } from '@/components/magicui/shine-border';
import { api } from '@/lib/api';

interface User {
  id: number;
  username: string;
  email: string;
  avatar: string | null;
  trophies_count?: number;
  achievement_points?: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [recentQuizzes, setRecentQuizzes] = useState<any[]>([]);
  const [recentTrophies, setRecentTrophies] = useState<any[]>([]);

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
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
        
        // Configurer l'utilisateur avec les données du profil
        if (response.success && response.data) {
          setUser(response.data);
          
          // Charger les quiz récents
          try {
            const quizzesResponse = await api.get('quizzes/recent');
            if (quizzesResponse.success) {
              setRecentQuizzes(quizzesResponse.data.quizzes || []);
            }
          } catch (error) {
            console.error('Erreur lors du chargement des quiz récents:', error);
          }
          
          // Charger les trophées récents
          try {
            const trophiesResponse = await api.get('achievements/recent');
            if (trophiesResponse.success) {
              setRecentTrophies(trophiesResponse.data.achievements || []);
            }
          } catch (error) {
            console.error('Erreur lors du chargement des trophées récents:', error);
          }
        }
      } catch (error: any) {
        setError('Erreur de chargement du profil: ' + (error.message || 'Veuillez vous reconnecter'));
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
      localStorage.removeItem('auth_token');
      router.push('/auth');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D111E] relative overflow-hidden">
      <Particles className="absolute inset-0" />
      <Particles className="absolute inset-0" quantity={30} color="#4f46e5" size={0.8} />
      <Particles className="absolute inset-0" quantity={20} color="#7c3aed" size={1.2} />
      <Particles className="absolute inset-0" quantity={15} color="#ec4899" size={1.6} />
      
      {/* Header / Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[#0D111E]/70 border-b border-white/10">
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
          
          <div className="flex items-center gap-4">
            {user && (
              <>
                <div className="hidden md:flex items-center gap-2">
                  <div className="flex flex-col items-end">
                    <span className="text-white font-medium">{user.username}</span>
                    <span className="text-sm text-gray-400">{user.email}</span>
                  </div>
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
                </div>
                
                <motion.button
                  onClick={handleLogout}
                  className="px-3 py-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-all duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm1 2h10v10H4V5zm4 4a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1zm0 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </motion.button>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 pt-24 pb-16 relative z-10">
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-500/20 border border-red-500/50 text-white p-4 rounded-lg mb-6">
            {error}
          </div>
        ) : user ? (
          <>
            {/* Bannière de bienvenue */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/10 mb-8 relative overflow-hidden"
            >
              <ShineBorder borderWidth={1} duration={14} shineColor={["#4f46e5", "#7c3aed", "#ec4899"]} />
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    Bienvenue, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">{user.username}</span> !
                  </h1>
                  <p className="text-gray-300">
                    Que souhaitez-vous faire aujourd'hui ?
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <motion.button
                    onClick={() => router.push('/quiz/create')}
                    className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl text-white font-medium"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Créer un quiz
                  </motion.button>
                  <motion.button
                    onClick={() => router.push('/quiz/search')}
                    className="px-4 py-2 bg-white/10 rounded-xl text-white font-medium"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Rejoindre un quiz
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Statistiques */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
            >
              {[
                {
                  title: "Quiz créés",
                  value: "0",
                  icon: "📊",
                  color: "from-indigo-500 to-blue-500"
                },
                {
                  title: "Trophées",
                  value: user.trophies_count?.toString() || "0",
                  icon: "🏆",
                  color: "from-yellow-500 to-amber-500"
                },
                {
                  title: "Points",
                  value: user.achievement_points?.toString() || "0",
                  icon: "⭐",
                  color: "from-purple-500 to-pink-500"
                }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10 relative overflow-hidden"
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="absolute -right-6 -top-6 text-5xl opacity-20">{stat.icon}</div>
                  <h3 className="text-gray-400 font-medium mb-1">{stat.title}</h3>
                  <p className={`text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${stat.color}`}>
                    {stat.value}
                  </p>
                </motion.div>
              ))}
            </motion.div>

            {/* Quiz récents et réalisations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Quiz récents */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/10 relative"
              >
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-indigo-400">→</span> Quiz récents
                </h2>
                
                {recentQuizzes.length === 0 ? (
                  <p className="text-gray-400 text-center py-6">
                    Aucun quiz récent. C'est le moment d'en créer un !
                  </p>
                ) : (
                  <div className="space-y-3">
                    {recentQuizzes.map((quiz) => (
                      <motion.div
                        key={quiz.id}
                        className="bg-white/5 rounded-xl p-3 border border-white/10 flex justify-between items-center"
                        whileHover={{ x: 5 }}
                      >
                        <div>
                          <h3 className="text-white font-medium">{quiz.title}</h3>
                          <p className="text-sm text-gray-400">{new Date(quiz.created_at).toLocaleDateString()}</p>
                        </div>
                        <motion.button
                          onClick={() => router.push(`/quiz/${quiz.id}`)}
                          className="text-indigo-400 hover:text-indigo-300"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>
                )}
                
                <div className="mt-4 text-center">
                  <motion.button
                    onClick={() => router.push('/quiz/history')}
                    className="text-indigo-400 hover:text-indigo-300 text-sm"
                    whileHover={{ scale: 1.05 }}
                  >
                    Voir tous mes quiz
                  </motion.button>
                </div>
              </motion.div>
              
              {/* Trophées récents */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/10 relative"
              >
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-purple-400">→</span> Trophées récents
                </h2>
                
                {recentTrophies.length === 0 ? (
                  <p className="text-gray-400 text-center py-6">
                    Aucun trophée obtenu. Participez à des quiz pour en gagner !
                  </p>
                ) : (
                  <div className="space-y-3">
                    {recentTrophies.map((trophy) => (
                      <motion.div
                        key={trophy.id}
                        className="bg-white/5 rounded-xl p-3 border border-white/10 flex items-center gap-3"
                        whileHover={{ x: 5 }}
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 flex items-center justify-center text-2xl">
                          🏆
                        </div>
                        <div>
                          <h3 className="text-white font-medium">{trophy.name}</h3>
                          <p className="text-sm text-gray-400">{trophy.description}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
                
                <div className="mt-4 text-center">
                  <motion.button
                    onClick={() => router.push('/profile/badges')}
                    className="text-purple-400 hover:text-purple-300 text-sm"
                    whileHover={{ scale: 1.05 }}
                  >
                    Voir tous mes trophées
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </>
        ) : (
          <div className="text-center py-10">
            <p className="text-white">Session expirée, veuillez vous reconnecter.</p>
            <button
              onClick={() => router.push('/auth')}
              className="mt-4 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg text-white"
            >
              Se connecter
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 