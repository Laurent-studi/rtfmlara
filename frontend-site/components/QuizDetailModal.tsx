'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quiz } from '@/models/Quiz';
import ExportButton from './ExportButton';
import Link from 'next/link';
import Image from 'next/image';

interface QuizDetailModalProps {
  quiz: Quiz;
  isOpen: boolean;
  onClose: () => void;
}

const QuizDetailModal: React.FC<QuizDetailModalProps> = ({
  quiz,
  isOpen,
  onClose
}) => {
  // État pour gérer l'onglet actif
  const [activeTab, setActiveTab] = useState<'details' | 'participants' | 'stats'>('details');
  
  // Animation de fade-in/out
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15 } }
  };
  
  // Animation de l'overlay (fond semi-transparent)
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.15 } }
  };
  
  // Fermeture avec la touche Escape
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);
  
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-[#0D111E] rounded-xl border border-white/10 w-full max-w-3xl max-h-[90vh] overflow-hidden z-10 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header avec image de couverture */}
            <div className="relative h-40 bg-gradient-to-r from-indigo-500 to-purple-500 overflow-hidden">
              {quiz.coverImage && (
                <Image
                  src={quiz.coverImage}
                  alt={quiz.title}
                  fill
                  className="object-cover opacity-50"
                />
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D111E] to-transparent"></div>
              
              <div className="absolute bottom-4 left-6 right-6">
                <h2 className="text-2xl font-bold text-white">{quiz.title}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${quiz.getCategoryColor()}`}>
                    {quiz.category}
                  </span>
                  <span className="text-gray-300 text-xs">
                    Créé le {quiz.formatCreatedDate()}
                  </span>
                </div>
              </div>
              
              {/* Bouton de fermeture */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Tabs de navigation */}
            <div className="flex border-b border-white/10">
              <button
                onClick={() => setActiveTab('details')}
                className={`px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'details' 
                    ? 'text-white border-b-2 border-indigo-500' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Détails
              </button>
              <button
                onClick={() => setActiveTab('participants')}
                className={`px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'participants' 
                    ? 'text-white border-b-2 border-indigo-500' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Participants ({quiz.totalParticipants})
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'stats' 
                    ? 'text-white border-b-2 border-indigo-500' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Statistiques
              </button>
            </div>
            
            {/* Contenu des onglets */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-6rem-4rem)]">
              {activeTab === 'details' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-white font-medium mb-2">Description</h3>
                    <p className="text-gray-300">{quiz.description}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-white font-medium mb-2">Créateur</h3>
                    <p className="text-gray-300">{quiz.creator?.username || 'Utilisateur inconnu'}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-white font-medium mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {quiz.tags.length > 0 ? (
                        quiz.tags.map((tag, index) => (
                          <span key={index} className="bg-white/10 px-2 py-1 rounded-full text-gray-300 text-xs">
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400">Aucun tag</span>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-white font-medium mb-2">Questions ({quiz.totalQuestions})</h3>
                    <div className="space-y-3">
                      {quiz.questions.length > 0 ? (
                        quiz.questions.slice(0, 3).map((question, index) => (
                          <div key={index} className="bg-white/5 rounded-lg p-3">
                            <p className="text-white font-medium">{index + 1}. {question.text}</p>
                            {index === 2 && quiz.questions.length > 3 && (
                              <p className="text-gray-400 text-sm mt-2">
                                Et {quiz.questions.length - 3} autres questions...
                              </p>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="bg-white/5 rounded-lg p-3">
                          <p className="text-gray-400">Questions non disponibles</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'participants' && (
                <div>
                  {quiz.participants.length > 0 ? (
                    <div className="space-y-4">
                      {quiz.participants.map((participant, index) => (
                        <div key={index} className="bg-white/5 rounded-lg p-4 flex justify-between items-center">
                          <div>
                            <p className="text-white font-medium">{participant.username}</p>
                            <p className="text-gray-400 text-sm">
                              {new Date(participant.startedAt).toLocaleDateString('fr-FR')}
                              {participant.finishedAt && ` - terminé`}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className={`px-3 py-1 rounded-full text-sm ${
                              participant.score >= 80 ? 'bg-green-500/20 text-green-400' : 
                              participant.score >= 60 ? 'bg-yellow-500/20 text-yellow-400' : 
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {participant.score}%
                            </div>
                            {participant.completed && (
                              <ExportButton 
                                quiz={quiz} 
                                participantId={participant.id}
                                variant="secondary" 
                                size="sm" 
                                label="Exporter" 
                              />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <h3 className="text-white font-medium mb-2">Pas encore de participants</h3>
                      <p className="text-gray-400">Ce quiz n'a pas encore été complété par des participants.</p>
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === 'stats' && (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-white/5 rounded-lg p-4">
                      <h3 className="text-gray-400 text-sm mb-2">Score moyen</h3>
                      <p className="text-2xl font-bold text-white">
                        {quiz.avgScore !== null ? `${Math.round(quiz.avgScore)}%` : 'N/A'}
                      </p>
                    </div>
                    
                    <div className="bg-white/5 rounded-lg p-4">
                      <h3 className="text-gray-400 text-sm mb-2">Participants</h3>
                      <p className="text-2xl font-bold text-white">{quiz.totalParticipants}</p>
                    </div>
                  </div>
                  
                  {quiz.totalParticipants > 0 ? (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-white font-medium mb-3">Répartition des scores</h3>
                        <div className="bg-white/5 rounded-lg p-4">
                          <div className="flex gap-3 h-32">
                            <div className="flex-1 flex flex-col justify-end">
                              <div className="bg-green-500 h-[60%] rounded-t-lg"></div>
                              <p className="text-center text-xs text-gray-400 mt-2">80-100%</p>
                            </div>
                            <div className="flex-1 flex flex-col justify-end">
                              <div className="bg-yellow-500 h-[40%] rounded-t-lg"></div>
                              <p className="text-center text-xs text-gray-400 mt-2">60-79%</p>
                            </div>
                            <div className="flex-1 flex flex-col justify-end">
                              <div className="bg-orange-500 h-[25%] rounded-t-lg"></div>
                              <p className="text-center text-xs text-gray-400 mt-2">40-59%</p>
                            </div>
                            <div className="flex-1 flex flex-col justify-end">
                              <div className="bg-red-500 h-[15%] rounded-t-lg"></div>
                              <p className="text-center text-xs text-gray-400 mt-2">0-39%</p>
                            </div>
                          </div>
                          <p className="text-gray-400 text-xs text-center mt-4">
                            Note: Graphique indicatif. Exportez les résultats pour des statistiques détaillées.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <h3 className="text-white font-medium mb-2">Pas encore de statistiques</h3>
                      <p className="text-gray-400">Des statistiques seront disponibles une fois que des participants auront complété ce quiz.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Footer avec actions */}
            <div className="px-6 py-4 border-t border-white/10 flex justify-between items-center">
              <div className="flex gap-2">
                <Link href={`/quiz/${quiz.id}`}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="py-2 px-4 text-sm bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
                  >
                    Voir quiz
                  </motion.button>
                </Link>
                
                {activeTab === 'stats' && (
                  <Link href={`/quiz/${quiz.id}/stats`}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="py-2 px-4 text-sm bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
                    >
                      Statistiques détaillées
                    </motion.button>
                  </Link>
                )}
              </div>
              
              <ExportButton quiz={quiz} variant="primary" size="md" />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default QuizDetailModal; 