'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Particles } from '@/components/magicui/particles';
import { ShineBorder } from '@/components/magicui/shine-border';
import Link from 'next/link';

// Types pour les données du dashboard créateur
interface CreatorStats {
  totalQuizzes: number;
  activeQuizzes: number;
  totalParticipants: number;
  averageCompletionRate: number;
  totalQuestions: number;
}

interface CreatorQuiz {
  id: string;
  title: string;
  date: string;
  participants: number;
  completionRate: number;
  status: 'active' | 'draft' | 'completed';
  questions: number;
}

interface QuizPerformance {
  id: string;
  title: string;
  averageScore: number;
  bestScore: number;
  worstScore: number;
  averageTime: number;
}

export default function CreatorDashboardPage() {
  // États pour les données du dashboard créateur
  const [stats, setStats] = useState<CreatorStats>({
    totalQuizzes: 0,
    activeQuizzes: 0,
    totalParticipants: 0,
    averageCompletionRate: 0,
    totalQuestions: 0,
  });
  
  const [myQuizzes, setMyQuizzes] = useState<CreatorQuiz[]>([]);
  const [quizPerformance, setQuizPerformance] = useState<QuizPerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'draft'>('all');
  
  // Simuler le chargement des données
  useEffect(() => {
    // Simuler un délai de chargement
    const timer = setTimeout(() => {
      // Données de test
      setStats({
        totalQuizzes: 12,
        activeQuizzes: 3,
        totalParticipants: 245,
        averageCompletionRate: 78.5,
        totalQuestions: 156,
      });
      
      setMyQuizzes([
        { id: '1', title: 'Quiz sur l\'histoire de France', date: '2023-06-15', participants: 32, completionRate: 82.3, status: 'active', questions: 15 },
        { id: '2', title: 'Quiz sur la géographie mondiale', date: '2023-06-10', participants: 28, completionRate: 75.6, status: 'active', questions: 20 },
        { id: '3', title: 'Quiz sur les sciences', date: '2023-06-05', participants: 45, completionRate: 68.9, status: 'completed', questions: 18 },
        { id: '4', title: 'Quiz sur la littérature', date: '2023-05-28', participants: 19, completionRate: 71.2, status: 'completed', questions: 12 },
        { id: '5', title: 'Quiz sur le cinéma', date: '2023-05-20', participants: 37, completionRate: 85.7, status: 'completed', questions: 15 },
        { id: '6', title: 'Quiz sur la musique', date: '2023-05-15', participants: 0, completionRate: 0, status: 'draft', questions: 10 },
        { id: '7', title: 'Quiz sur l\'art', date: '2023-05-10', participants: 0, completionRate: 0, status: 'draft', questions: 8 },
        { id: '8', title: 'Quiz sur la technologie', date: '2023-05-05', participants: 0, completionRate: 0, status: 'draft', questions: 14 },
      ]);
      
      setQuizPerformance([
        { id: '1', title: 'Quiz sur l\'histoire de France', averageScore: 72.5, bestScore: 95, worstScore: 35, averageTime: 18 },
        { id: '2', title: 'Quiz sur la géographie mondiale', averageScore: 68.3, bestScore: 90, worstScore: 40, averageTime: 22 },
        { id: '3', title: 'Quiz sur les sciences', averageScore: 65.8, bestScore: 85, worstScore: 30, averageTime: 20 },
        { id: '4', title: 'Quiz sur la littérature', averageScore: 70.2, bestScore: 92, worstScore: 38, averageTime: 15 },
        { id: '5', title: 'Quiz sur le cinéma', averageScore: 75.6, bestScore: 98, worstScore: 42, averageTime: 17 },
      ]);
      
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Filtrer les quiz en fonction de l'onglet actif
  const filteredQuizzes = myQuizzes.filter(quiz => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return quiz.status === 'active';
    if (activeTab === 'draft') return quiz.status === 'draft';
    return true;
  });
  
  // Animation pour les cartes
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };
  
  return (
    <div className="min-h-screen bg-[#0D111E] relative overflow-hidden">
      <Particles className="absolute inset-0" />
      <Particles className="absolute inset-0" quantity={30} color="#4f46e5" size={0.8} />
      <Particles className="absolute inset-0" quantity={20} color="#7c3aed" size={1.2} />
      <Particles className="absolute inset-0" quantity={15} color="#ec4899" size={1.6} />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* En-tête du dashboard créateur */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Tableau de bord créateur</h1>
            <p className="text-gray-400">Gérez vos quiz et suivez leurs performances</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link href="/quiz/create">
              <motion.button
                className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-indigo-500/25 transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Créer un nouveau quiz
              </motion.button>
            </Link>
          </div>
        </div>
        
        {/* Indicateurs de chargement */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <>
            {/* Statistiques générales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.1 }}
                className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/10 relative"
              >
                <ShineBorder borderWidth={1} duration={14} shineColor={["#4f46e5", "#7c3aed", "#ec4899"]} />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total des quiz</p>
                    <h3 className="text-2xl font-bold text-white mt-1">{stats.totalQuizzes}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.2 }}
                className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/10 relative"
              >
                <ShineBorder borderWidth={1} duration={14} shineColor={["#7c3aed", "#ec4899", "#4f46e5"]} />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Quiz actifs</p>
                    <h3 className="text-2xl font-bold text-white mt-1">{stats.activeQuizzes}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.3 }}
                className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/10 relative"
              >
                <ShineBorder borderWidth={1} duration={14} shineColor={["#ec4899", "#4f46e5", "#7c3aed"]} />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Participants</p>
                    <h3 className="text-2xl font-bold text-white mt-1">{stats.totalParticipants}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-pink-500/20 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.4 }}
                className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/10 relative"
              >
                <ShineBorder borderWidth={1} duration={14} shineColor={["#4f46e5", "#7c3aed", "#ec4899"]} />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Taux de complétion</p>
                    <h3 className="text-2xl font-bold text-white mt-1">{stats.averageCompletionRate}%</h3>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.5 }}
                className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/10 relative"
              >
                <ShineBorder borderWidth={1} duration={14} shineColor={["#7c3aed", "#ec4899", "#4f46e5"]} />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Questions totales</p>
                    <h3 className="text-2xl font-bold text-white mt-1">{stats.totalQuestions}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </motion.div>
            </div>
            
            {/* Onglets pour filtrer les quiz */}
            <div className="flex space-x-2 mb-6">
              <button 
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'all' 
                    ? 'bg-indigo-500 text-white' 
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                Tous les quiz
              </button>
              <button 
                onClick={() => setActiveTab('active')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'active' 
                    ? 'bg-indigo-500 text-white' 
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                Quiz actifs
              </button>
              <button 
                onClick={() => setActiveTab('draft')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'draft' 
                    ? 'bg-indigo-500 text-white' 
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                Brouillons
              </button>
            </div>
            
            {/* Mes quiz */}
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.6 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/10 relative mb-8"
            >
              <ShineBorder borderWidth={1} duration={14} shineColor={["#4f46e5", "#7c3aed", "#ec4899"]} />
              <h2 className="text-xl font-bold text-white mb-4">Mes quiz</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 text-gray-400 font-medium">Titre</th>
                      <th className="text-left py-3 text-gray-400 font-medium">Date</th>
                      <th className="text-center py-3 text-gray-400 font-medium">Questions</th>
                      <th className="text-center py-3 text-gray-400 font-medium">Participants</th>
                      <th className="text-center py-3 text-gray-400 font-medium">Taux de complétion</th>
                      <th className="text-center py-3 text-gray-400 font-medium">Statut</th>
                      <th className="text-right py-3 text-gray-400 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredQuizzes.map((quiz) => (
                      <tr key={quiz.id} className="border-b border-white/5">
                        <td className="py-3 text-white">{quiz.title}</td>
                        <td className="py-3 text-gray-400">{new Date(quiz.date).toLocaleDateString()}</td>
                        <td className="py-3 text-center text-white">{quiz.questions}</td>
                        <td className="py-3 text-center text-white">{quiz.participants}</td>
                        <td className="py-3 text-center text-white">{quiz.completionRate}%</td>
                        <td className="py-3 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            quiz.status === 'active' ? 'bg-green-500/20 text-green-400' : 
                            quiz.status === 'completed' ? 'bg-blue-500/20 text-blue-400' : 
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {quiz.status === 'active' ? 'Actif' : 
                             quiz.status === 'completed' ? 'Terminé' : 
                             'Brouillon'}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex justify-end space-x-2">
                            {quiz.status === 'draft' ? (
                              <Link href={`/quiz/${quiz.id}/edit`}>
                                <span className="text-indigo-400 hover:text-indigo-300 cursor-pointer">Éditer</span>
                              </Link>
                            ) : (
                              <Link href={`/quiz/${quiz.id}/results`}>
                                <span className="text-indigo-400 hover:text-indigo-300 cursor-pointer">Résultats</span>
                              </Link>
                            )}
                            <Link href={`/quiz/${quiz.id}/host`}>
                              <span className="text-indigo-400 hover:text-indigo-300 cursor-pointer">Présenter</span>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {filteredQuizzes.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  Aucun quiz trouvé pour ce filtre.
                </div>
              )}
            </motion.div>
            
            {/* Performance des quiz */}
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.7 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/10 relative mb-8"
            >
              <ShineBorder borderWidth={1} duration={14} shineColor={["#7c3aed", "#ec4899", "#4f46e5"]} />
              <h2 className="text-xl font-bold text-white mb-4">Performance des quiz</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 text-gray-400 font-medium">Titre</th>
                      <th className="text-center py-3 text-gray-400 font-medium">Score moyen</th>
                      <th className="text-center py-3 text-gray-400 font-medium">Meilleur score</th>
                      <th className="text-center py-3 text-gray-400 font-medium">Score le plus bas</th>
                      <th className="text-center py-3 text-gray-400 font-medium">Temps moyen (s)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quizPerformance.map((quiz) => (
                      <tr key={quiz.id} className="border-b border-white/5">
                        <td className="py-3 text-white">{quiz.title}</td>
                        <td className="py-3 text-center text-white">{quiz.averageScore}%</td>
                        <td className="py-3 text-center text-green-400">{quiz.bestScore}%</td>
                        <td className="py-3 text-center text-red-400">{quiz.worstScore}%</td>
                        <td className="py-3 text-center text-white">{quiz.averageTime}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
            
            {/* Graphique de progression des participants */}
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.8 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/10 relative"
            >
              <ShineBorder borderWidth={1} duration={14} shineColor={["#ec4899", "#4f46e5", "#7c3aed"]} />
              <h2 className="text-xl font-bold text-white mb-4">Progression des participants</h2>
              
              <div className="h-64 flex items-end justify-between">
                {[30, 45, 60, 75, 90, 85, 95, 80, 70, 65, 75, 85].map((value, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div 
                      className="w-6 rounded-t-lg"
                      style={{
                        height: `${value}%`,
                        background: "linear-gradient(to top, #4f46e5, #7c3aed)",
                        boxShadow: "inset -2px -2px 5px rgba(0, 0, 0, 0.3), 2px 2px 5px rgba(0, 0, 0, 0.3)"
                      }}
                    ></div>
                    <div className="text-gray-400 text-xs mt-2">{index + 1}</div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 text-center text-gray-400 text-sm">
                Nombre de participants par mois
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
} 