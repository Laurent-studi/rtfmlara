'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ExportButton from '@/components/ExportButton';
import { Quiz } from '@/models/Quiz';
import Link from 'next/link';
import QuizDetailModal from '@/components/QuizDetailModal';
import Particles from '@/components/ui/Particles';
import ShineBorder from '@/components/ui/ShineBorder';

// Définition des types de filtres
type FilterType = 'all' | 'created' | 'participated';
type SortType = 'newest' | 'oldest' | 'highest-score' | 'lowest-score' | 'most-participants';

const ExportsPage: React.FC = () => {
  // États pour les contrôles de filtrage et tri
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortType, setSortType] = useState<SortType>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [allQuizzes, setAllQuizzes] = useState<Quiz[]>([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Chargement des données (simulé)
  useEffect(() => {
    const loadQuizzes = async () => {
      setIsLoading(true);
      // Simulons un appel API
      await new Promise(resolve => setTimeout(resolve, 1200));

      // Données de quiz fictives pour la démonstration
      const mockQuizzes: Quiz[] = [
        new Quiz({
          id: '1',
          title: 'Histoire de France',
          description: 'Un quiz sur les événements majeurs de l\'histoire française',
          createdAt: new Date('2023-08-15'),
          category: 'Histoire',
          totalQuestions: 10,
          totalParticipants: 25,
          avgScore: 75,
          creator: { id: 'user1', username: 'Thomas' },
          isCreator: true,
          hasParticipated: false,
          tags: ['France', 'Révolution', 'République'],
          questions: [],
          participants: []
        }),
        new Quiz({
          id: '2',
          title: 'Mathématiques avancées',
          description: 'Testez vos connaissances en trigonométrie et calcul intégral',
          createdAt: new Date('2023-10-05'),
          category: 'Sciences',
          totalQuestions: 15,
          totalParticipants: 18,
          avgScore: 62,
          creator: { id: 'user2', username: 'Marie' },
          isCreator: false,
          hasParticipated: true,
          userScore: 80,
          tags: ['Maths', 'Calcul', 'Algèbre'],
          questions: [],
          participants: []
        }),
        new Quiz({
          id: '3',
          title: 'Culture générale 2023',
          description: 'Actualisez vos connaissances sur les événements de 2023',
          createdAt: new Date('2023-11-20'),
          category: 'Culture générale',
          totalQuestions: 20,
          totalParticipants: 42,
          avgScore: 68,
          creator: { id: 'user3', username: 'Sophie' },
          isCreator: false,
          hasParticipated: true,
          userScore: 75,
          tags: ['Actualité', '2023', 'Monde'],
          questions: [],
          participants: []
        }),
        new Quiz({
          id: '4',
          title: 'Les capitales du monde',
          description: 'Connaissez-vous toutes les capitales des pays du monde?',
          createdAt: new Date('2023-07-10'),
          category: 'Géographie',
          totalQuestions: 30,
          totalParticipants: 60,
          avgScore: 72,
          creator: { id: 'user1', username: 'Thomas' },
          isCreator: true,
          hasParticipated: true,
          userScore: 83,
          tags: ['Géographie', 'Pays', 'Capitales'],
          questions: [],
          participants: []
        }),
        new Quiz({
          id: '5',
          title: 'Cinéma des années 90',
          description: 'Quiz sur les films cultes des années 90',
          createdAt: new Date('2023-09-25'),
          category: 'Divertissement',
          totalQuestions: 12,
          totalParticipants: 35,
          avgScore: 79,
          creator: { id: 'user4', username: 'Lucas' },
          isCreator: false,
          hasParticipated: true,
          userScore: 92,
          tags: ['Cinéma', '90s', 'Films'],
          questions: [],
          participants: []
        }),
      ];

      setAllQuizzes(mockQuizzes);
      setFilteredQuizzes(mockQuizzes);
      setIsLoading(false);
    };

    loadQuizzes();
  }, []);

  // Filtrer et trier les quiz en fonction des sélections de l'utilisateur
  useEffect(() => {
    if (!allQuizzes.length) return;

    let result = [...allQuizzes];

    // Filtrage par type
    if (filterType === 'created') {
      result = result.filter(quiz => quiz.isCreator);
    } else if (filterType === 'participated') {
      result = result.filter(quiz => quiz.hasParticipated);
    }

    // Filtrage par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(quiz => 
        quiz.title.toLowerCase().includes(query) || 
        quiz.description.toLowerCase().includes(query) ||
        quiz.category.toLowerCase().includes(query) ||
        quiz.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Tri
    switch (sortType) {
      case 'newest':
        result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
      case 'oldest':
        result.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        break;
      case 'highest-score':
        result.sort((a, b) => (b.avgScore || 0) - (a.avgScore || 0));
        break;
      case 'lowest-score':
        result.sort((a, b) => (a.avgScore || 0) - (b.avgScore || 0));
        break;
      case 'most-participants':
        result.sort((a, b) => b.totalParticipants - a.totalParticipants);
        break;
      default:
        break;
    }

    setFilteredQuizzes(result);
  }, [allQuizzes, filterType, sortType, searchQuery]);

  // Animation variants pour les cartes
  const staggerAnimation = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemAnimation = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.25, 0, 1]
      }
    }
  };

  const openModal = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#0B1120] to-[#0F172A] text-white">
      <Particles className="absolute inset-0 pointer-events-none" />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="mb-10">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold mb-2"
          >
            Exporter vos quiz
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
            className="text-gray-300 max-w-2xl"
          >
            Exportez vos quiz et leurs résultats au format PDF pour partager et analyser les performances
          </motion.p>
        </div>

        {/* Filtres et recherche */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <ShineBorder>
            <div className="bg-white/5 backdrop-blur-sm p-1 rounded-lg flex">
              <button
                onClick={() => setFilterType('all')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  filterType === 'all' ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:text-white'
                }`}
              >
                Tous
              </button>
              <button
                onClick={() => setFilterType('created')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  filterType === 'created' ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:text-white'
                }`}
              >
                Créés
              </button>
              <button
                onClick={() => setFilterType('participated')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  filterType === 'participated' ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:text-white'
                }`}
              >
                Participés
              </button>
            </div>
          </ShineBorder>

          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Rechercher par titre, catégorie ou tag..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 text-white placeholder-gray-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div className="relative">
            <select
              className="appearance-none bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 text-white"
              value={sortType}
              onChange={(e) => setSortType(e.target.value as SortType)}
            >
              <option value="newest">Plus récents</option>
              <option value="oldest">Plus anciens</option>
              <option value="highest-score">Meilleur score</option>
              <option value="lowest-score">Score plus faible</option>
              <option value="most-participants">Plus de participants</option>
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="h-14 w-14 border-4 border-t-indigo-500 border-r-indigo-300 border-b-indigo-200 border-l-indigo-400 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-300">Chargement des quiz...</p>
          </div>
        ) : filteredQuizzes.length > 0 ? (
          <motion.div
            variants={staggerAnimation}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredQuizzes.map((quiz) => (
              <motion.div
                key={quiz.id}
                variants={itemAnimation}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="relative"
              >
                <ShineBorder>
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
                    <div className={`h-2 w-full ${quiz.getCategoryColor(true)}`}></div>
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-semibold text-white">{quiz.title}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${quiz.getCategoryColor()}`}>
                          {quiz.category}
                        </span>
                      </div>
                      
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{quiz.description}</p>
                      
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-white/5 p-2 rounded-lg">
                          <p className="text-xs text-gray-400">Questions</p>
                          <p className="text-lg font-medium">{quiz.totalQuestions}</p>
                        </div>
                        <div className="bg-white/5 p-2 rounded-lg">
                          <p className="text-xs text-gray-400">Participants</p>
                          <p className="text-lg font-medium">{quiz.totalParticipants}</p>
                        </div>
                        <div className="bg-white/5 p-2 rounded-lg">
                          <p className="text-xs text-gray-400">Score moyen</p>
                          <p className="text-lg font-medium">{quiz.avgScore ? `${Math.round(quiz.avgScore)}%` : 'N/A'}</p>
                        </div>
                        <div className="bg-white/5 p-2 rounded-lg">
                          <p className="text-xs text-gray-400">Date</p>
                          <p className="text-lg font-medium">{quiz.getFormattedDate()}</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <button 
                          onClick={() => openModal(quiz)}
                          className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
                        >
                          Voir détails
                        </button>
                        
                        <ExportButton quiz={quiz} variant="primary" size="sm" />
                      </div>
                    </div>
                  </div>
                </ShineBorder>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="text-xl font-semibold mb-2">Aucun quiz trouvé</h3>
            <p className="text-gray-400 mb-6">Aucun quiz ne correspond à vos critères de recherche ou de filtrage.</p>
            <button
              onClick={() => {
                setFilterType('all');
                setSortType('newest');
                setSearchQuery('');
              }}
              className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors text-white font-medium"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>

      {selectedQuiz && (
        <QuizDetailModal
          quiz={selectedQuiz}
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default ExportsPage; 