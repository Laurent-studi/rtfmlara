'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Particles } from '@/components/magicui/particles';
import { ShineBorder } from '@/components/magicui/shine-border';
import { apiService } from '@/lib/api-service';
import UserBadges from '@/components/UserBadges';

interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  avatarUrl?: string;
}

interface UserStats {
  totalQuizzes: number;
  totalQuestions: number;
  totalAnswers: number;
  totalCorrectAnswers: number;
  totalIncorrectAnswers: number;
  totalPoints: number;
}

interface Quiz {
  id: number;
  title: string;
  description: string;
  category: string;
  createdAt: string;
  status: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [createdQuizzes, setCreatedQuizzes] = useState<Quiz[]>([]);
  const [participatedQuizzes, setParticipatedQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [activeTab, setActiveTab] = useState<'info' | 'stats' | 'quizzes'>('info');
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        
        // Récupérer les informations de l'utilisateur
        const userData = await apiService.getCurrentUser();
        setUser(userData);
        
        // Récupérer les statistiques de l'utilisateur
        const userStats = await apiService.getUserStats();
        setStats(userStats);
        
        // Récupérer les quiz créés par l'utilisateur
        const createdQuizzesData = await apiService.getUserQuizzes();
        setCreatedQuizzes(createdQuizzesData);
        
        // Récupérer les participations aux quiz
        const participationsData = await apiService.getUserParticipations();
        setParticipatedQuizzes(participationsData);
      } catch (err: any) {
        setError(err.message || 'Erreur lors du chargement des données utilisateur');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, []);
  
  const handleLogout = () => {
    apiService.clearToken();
    router.push('/auth/login');
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0D111E] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500 border-r-2 border-indigo-500 mb-4"></div>
          <p>Chargement du profil...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-[#0D111E] relative overflow-hidden">
      <Particles className="absolute inset-0" />
      <Particles className="absolute inset-0" quantity={30} color="#4f46e5" size={0.8} />
      <Particles className="absolute inset-0" quantity={20} color="#7c3aed" size={1.2} />
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="flex items-center justify-between mb-8">
            <Link href="/dashboard">
              <div className="flex items-center gap-4">
                <Image
                  src="/img/logo6.png"
                  alt="RTFM2Win Logo"
                  width={40}
                  height={40}
                  className="rounded-lg"
                />
                <span className="text-white">Retour au tableau de bord</span>
              </div>
            </Link>
            
            <motion.button
              onClick={handleLogout}
              className="py-2 px-4 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Se déconnecter
            </motion.button>
          </div>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 text-red-400 text-sm">
              {error}
            </div>
          )}
          
          {user && (
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/10 mb-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold">
                  {user.avatarUrl ? (
                    <Image 
                      src={user.avatarUrl} 
                      alt={user.username} 
                      width={96} 
                      height={96} 
                      className="rounded-full object-cover"
                    />
                  ) : (
                    user.username.charAt(0).toUpperCase()
                  )}
                </div>
                
                <div className="text-center md:text-left">
                  <h1 className="text-2xl font-bold text-white mb-1">{user.username}</h1>
                  <p className="text-gray-400 mb-2">{user.email}</p>
                  <p className="text-gray-500 text-sm">
                    Membre depuis {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                
                <div className="ml-auto hidden md:block">
                  <div className="flex space-x-2">
                    <Link href="/profile/edit">
                      <motion.button
                        className="py-2 px-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-indigo-500/25 transition-all duration-200"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Modifier le profil
                      </motion.button>
                    </Link>
                    <Link href="/profile/settings">
                      <motion.button
                        className="py-2 px-4 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-200"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Paramètres
                      </motion.button>
                    </Link>
                  </div>
                </div>
              </div>
              
              <div className="flex md:hidden justify-center mt-4">
                <div className="flex space-x-2">
                  <Link href="/profile/edit">
                    <motion.button
                      className="py-2 px-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-indigo-500/25 transition-all duration-200"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Modifier le profil
                    </motion.button>
                  </Link>
                  <Link href="/profile/settings">
                    <motion.button
                      className="py-2 px-4 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-200"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Paramètres
                    </motion.button>
                  </Link>
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 mb-8 overflow-hidden">
            <div className="flex border-b border-white/10">
              <button
                className={`flex-1 py-4 px-6 text-center font-medium transition-all duration-200 ${
                  activeTab === 'info' 
                    ? 'bg-white/10 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                onClick={() => setActiveTab('info')}
              >
                Informations
              </button>
              <button
                className={`flex-1 py-4 px-6 text-center font-medium transition-all duration-200 ${
                  activeTab === 'stats' 
                    ? 'bg-white/10 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                onClick={() => setActiveTab('stats')}
              >
                Statistiques
              </button>
              <button
                className={`flex-1 py-4 px-6 text-center font-medium transition-all duration-200 ${
                  activeTab === 'quizzes' 
                    ? 'bg-white/10 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                onClick={() => setActiveTab('quizzes')}
              >
                Quiz
              </button>
            </div>
            
            <div className="p-6">
              {activeTab === 'info' && user && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-gray-400 text-sm mb-1">Nom d'utilisateur</h3>
                    <p className="text-white">{user.username}</p>
                  </div>
                  <div>
                    <h3 className="text-gray-400 text-sm mb-1">Email</h3>
                    <p className="text-white">{user.email}</p>
                  </div>
                  <div>
                    <h3 className="text-gray-400 text-sm mb-1">Date d'inscription</h3>
                    <p className="text-white">{new Date(user.createdAt).toLocaleDateString('fr-FR')}</p>
                  </div>
                  
                  <div className="pt-4">
                    <Link href="/profile/badges">
                      <motion.button
                        className="w-full md:w-auto py-2 px-4 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-200 text-sm"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Voir mes badges
                      </motion.button>
                    </Link>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-gray-400 text-sm mb-3">Mes badges récents</h3>
                    <UserBadges limit={3} showLink={false} />
                  </div>
                </div>
              )}
              
              {activeTab === 'stats' && stats && (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white/5 rounded-xl p-4 text-center">
                      <div className="text-3xl font-bold text-indigo-400 mb-1">{stats.totalQuizzes}</div>
                      <div className="text-gray-400 text-sm">Quiz créés</div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 text-center">
                      <div className="text-3xl font-bold text-purple-400 mb-1">{stats.totalAnswers}</div>
                      <div className="text-gray-400 text-sm">Réponses données</div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 text-center">
                      <div className="text-3xl font-bold text-pink-400 mb-1">{stats.totalPoints}</div>
                      <div className="text-gray-400 text-sm">Points gagnés</div>
                    </div>
                  </div>
                  
                  <div className="bg-white/5 rounded-xl p-6">
                    <h3 className="text-white font-medium mb-4">Performance</h3>
                    <div className="flex mb-4">
                      <div className="flex-1 pr-4">
                        <div className="h-4 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-green-500 to-green-400"
                            style={{ width: `${(stats.totalCorrectAnswers / stats.totalAnswers) * 100}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-green-400 text-xs">{stats.totalCorrectAnswers} correctes</span>
                          <span className="text-gray-400 text-xs">{Math.round((stats.totalCorrectAnswers / stats.totalAnswers) * 100)}%</span>
                        </div>
                      </div>
                      <div className="flex-1 pl-4">
                        <div className="h-4 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-red-500 to-red-400"
                            style={{ width: `${(stats.totalIncorrectAnswers / stats.totalAnswers) * 100}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-red-400 text-xs">{stats.totalIncorrectAnswers} incorrectes</span>
                          <span className="text-gray-400 text-xs">{Math.round((stats.totalIncorrectAnswers / stats.totalAnswers) * 100)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 text-center">
                    <Link href="/profile/stats">
                      <motion.button
                        className="py-2 px-6 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-200 text-sm"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Voir toutes les statistiques
                      </motion.button>
                    </Link>
                  </div>
                </div>
              )}
              
              {activeTab === 'quizzes' && (
                <div>
                  <div className="mb-6">
                    <h3 className="text-white font-medium mb-4">Quiz créés ({createdQuizzes.length})</h3>
                    {createdQuizzes.length === 0 ? (
                      <div className="text-center py-6 bg-white/5 rounded-xl">
                        <p className="text-gray-400">Vous n'avez pas encore créé de quiz.</p>
                        <motion.div 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="mt-4"
                        >
                          <Link 
                            href="/quiz/create"
                            className="py-2 px-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium shadow-lg hover:shadow-indigo-500/25 transition-all duration-200 text-sm"
                          >
                            Créer un quiz
                          </Link>
                        </motion.div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {createdQuizzes.slice(0, 3).map((quiz) => (
                          <motion.div
                            key={quiz.id}
                            whileHover={{ x: 5 }}
                            className="bg-white/5 rounded-xl p-4 border border-white/10 flex justify-between items-center"
                          >
                            <div>
                              <Link href={`/quiz/${quiz.id}`}>
                                <h4 className="text-white font-medium hover:text-indigo-400 transition-colors">
                                  {quiz.title}
                                </h4>
                              </Link>
                              <p className="text-gray-500 text-xs mt-1">
                                {quiz.category} • {new Date(quiz.createdAt).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Link href={`/quiz/${quiz.id}/edit`}>
                                <button className="p-2 text-indigo-400 hover:text-indigo-300 transition-colors">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                              </Link>
                              <button className="p-2 text-pink-400 hover:text-pink-300 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </button>
                            </div>
                          </motion.div>
                        ))}
                        
                        {createdQuizzes.length > 3 && (
                          <div className="text-center pt-2">
                            <Link 
                              href="/profile/quizzes"
                              className="inline-block text-indigo-400 hover:text-indigo-300 transition-colors text-sm"
                            >
                              Voir tous vos quiz ({createdQuizzes.length})
                            </Link>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-white font-medium mb-4">Participations récentes ({participatedQuizzes.length})</h3>
                    {participatedQuizzes.length === 0 ? (
                      <div className="text-center py-6 bg-white/5 rounded-xl">
                        <p className="text-gray-400">Vous n'avez pas encore participé à de quiz.</p>
                        <motion.div 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="mt-4"
                        >
                          <Link 
                            href="/quiz/featured"
                            className="py-2 px-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium shadow-lg hover:shadow-indigo-500/25 transition-all duration-200 text-sm"
                          >
                            Découvrir des quiz
                          </Link>
                        </motion.div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {participatedQuizzes.slice(0, 3).map((quiz) => (
                          <motion.div
                            key={quiz.id}
                            whileHover={{ x: 5 }}
                            className="bg-white/5 rounded-xl p-4 border border-white/10"
                          >
                            <Link href={`/quiz/${quiz.id}`}>
                              <h4 className="text-white font-medium hover:text-indigo-400 transition-colors">
                                {quiz.title}
                              </h4>
                              <p className="text-gray-500 text-xs mt-1">
                                {quiz.category}
                              </p>
                            </Link>
                          </motion.div>
                        ))}
                        
                        {participatedQuizzes.length > 3 && (
                          <div className="text-center pt-2">
                            <Link 
                              href="/profile/participations"
                              className="inline-block text-indigo-400 hover:text-indigo-300 transition-colors text-sm"
                            >
                              Voir toutes vos participations ({participatedQuizzes.length})
                            </Link>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 