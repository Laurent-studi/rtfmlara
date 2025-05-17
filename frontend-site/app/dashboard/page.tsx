'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Particles } from '@/components/magicui/particles';
import { ShineBorder } from '@/components/magicui/shine-border';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Types pour les données du tableau de bord
interface QuizStats {
  totalQuizzes: number;
  averageScore: number;
  quizzesCompleted: number;
  quizzesCreated: number;
}

interface RecentQuiz {
  id: string;
  title: string;
  date: string;
  score: number;
  totalQuestions: number;
}

interface TopPlayer {
  id: string;
  name: string;
  totalScore: number;
  quizzesPlayed: number;
}

// Composant du tableau de bord utilisateur
export default function UserDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<QuizStats>({
    totalQuizzes: 0,
    averageScore: 0,
    quizzesCompleted: 0,
    quizzesCreated: 0,
  });
  const [recentQuizzes, setRecentQuizzes] = useState<RecentQuiz[]>([]);
  const [topPlayers, setTopPlayers] = useState<TopPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simuler le chargement des données
  useEffect(() => {
    const timer = setTimeout(() => {
      // Données fictives pour l'exemple
      setStats({
        totalQuizzes: 15,
        averageScore: 7.8,
        quizzesCompleted: 12,
        quizzesCreated: 3,
      });
      
      setRecentQuizzes([
        {
          id: '1',
          title: 'Quiz sur l\'histoire de France',
          date: '2023-04-10',
          score: 8,
          totalQuestions: 10,
        },
        {
          id: '2',
          title: 'Quiz de géographie',
          date: '2023-04-05',
          score: 9,
          totalQuestions: 10,
        },
        {
          id: '3',
          title: 'Quiz de culture générale',
          date: '2023-03-28',
          score: 7,
          totalQuestions: 10,
        },
      ]);
      
      setTopPlayers([
        { id: '1', name: 'Alice', totalScore: 2450, quizzesPlayed: 8 },
        { id: '2', name: 'Bob', totalScore: 2180, quizzesPlayed: 7 },
        { id: '3', name: 'Charlie', totalScore: 1950, quizzesPlayed: 6 },
        { id: '4', name: 'David', totalScore: 1820, quizzesPlayed: 5 },
        { id: '5', name: 'Emma', totalScore: 1750, quizzesPlayed: 5 },
      ]);
      
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Animation des cartes
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  // Fonction pour créer un nouveau quiz
  const createNewQuiz = () => {
    router.push('/quiz/create');
  };

  // Fonction pour rejoindre un quiz
  const joinQuiz = () => {
    router.push('/quiz/join');
  };

  return (
    <div className="min-h-screen bg-[#0D111E] relative overflow-hidden">
      <Particles className="absolute inset-0" />
      <Particles className="absolute inset-0" quantity={30} color="#4f46e5" size={0.8} />
      <Particles className="absolute inset-0" quantity={20} color="#7c3aed" size={1.2} />
      <Particles className="absolute inset-0" quantity={15} color="#ec4899" size={1.6} />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Tableau de bord</h1>
            <p className="text-gray-400">Bienvenue sur votre espace de gestion de quiz</p>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="flex space-x-4">
              <button
                onClick={createNewQuiz}
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Créer un quiz
              </button>
              <button
                onClick={joinQuiz}
                className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Rejoindre un quiz
              </button>
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.1 }}
                className="bg-white rounded-lg shadow-lg p-6"
              >
                <h3 className="text-lg font-medium text-gray-500 mb-2">Quiz totaux</h3>
                <p className="text-3xl font-bold">{stats.totalQuizzes}</p>
              </motion.div>
              
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.2 }}
                className="bg-white rounded-lg shadow-lg p-6"
              >
                <h3 className="text-lg font-medium text-gray-500 mb-2">Score moyen</h3>
                <p className="text-3xl font-bold">{stats.averageScore.toFixed(1)}/10</p>
              </motion.div>
              
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.3 }}
                className="bg-white rounded-lg shadow-lg p-6"
              >
                <h3 className="text-lg font-medium text-gray-500 mb-2">Quiz complétés</h3>
                <p className="text-3xl font-bold">{stats.quizzesCompleted}</p>
              </motion.div>
              
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.4 }}
                className="bg-white rounded-lg shadow-lg p-6"
              >
                <h3 className="text-lg font-medium text-gray-500 mb-2">Quiz créés</h3>
                <p className="text-3xl font-bold">{stats.quizzesCreated}</p>
              </motion.div>
            </div>

            {/* Quiz récents */}
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.5 }}
              className="bg-white rounded-lg shadow-lg p-6 mb-8"
            >
              <h2 className="text-xl font-bold mb-4">Quiz récents</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Titre
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Questions
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentQuizzes.map((quiz) => (
                      <tr key={quiz.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{quiz.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {new Date(quiz.date).toLocaleDateString('fr-FR')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{quiz.score}/{quiz.totalQuestions}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{quiz.totalQuestions}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link href={`/quiz/${quiz.id}`} className="text-blue-600 hover:text-blue-900 mr-4">
                            Voir
                          </Link>
                          <Link href={`/quiz/${quiz.id}/results`} className="text-green-600 hover:text-green-900">
                            Résultats
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Actions rapides */}
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.6 }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <h2 className="text-xl font-bold mb-4">Actions rapides</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={createNewQuiz}
                  className="flex items-center justify-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <span className="text-blue-600 font-medium">Créer un nouveau quiz</span>
                </button>
                <button
                  onClick={joinQuiz}
                  className="flex items-center justify-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <span className="text-green-600 font-medium">Rejoindre un quiz</span>
                </button>
                <Link
                  href="/profile"
                  className="flex items-center justify-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <span className="text-purple-600 font-medium">Modifier mon profil</span>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
} 