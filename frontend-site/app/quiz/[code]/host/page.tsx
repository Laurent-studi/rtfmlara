'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Particles } from '@/components/magicui/particles';
import { ShineBorder } from '@/components/magicui/shine-border';

// Types pour les questions et réponses
interface Answer {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  text: string;
  answers: Answer[];
  timeLimit: number; // en secondes
}

// Données de test (à remplacer par des données réelles)
const sampleQuestions: Question[] = [
  {
    id: '1',
    text: 'Quelle est la capitale de la France ?',
    answers: [
      { id: 'a', text: 'Paris', isCorrect: true },
      { id: 'b', text: 'Londres', isCorrect: false },
      { id: 'c', text: 'Berlin', isCorrect: false },
      { id: 'd', text: 'Madrid', isCorrect: false },
    ],
    timeLimit: 30,
  },
  {
    id: '2',
    text: 'Quel est le plus grand océan du monde ?',
    answers: [
      { id: 'a', text: 'Atlantique', isCorrect: false },
      { id: 'b', text: 'Indien', isCorrect: false },
      { id: 'c', text: 'Pacifique', isCorrect: true },
      { id: 'd', text: 'Arctique', isCorrect: false },
    ],
    timeLimit: 30,
  },
  {
    id: '3',
    text: 'Qui a peint la Joconde ?',
    answers: [
      { id: 'a', text: 'Van Gogh', isCorrect: false },
      { id: 'b', text: 'Picasso', isCorrect: false },
      { id: 'c', text: 'Leonard de Vinci', isCorrect: true },
      { id: 'd', text: 'Rembrandt', isCorrect: false },
    ],
    timeLimit: 30,
  },
];

export default function HostPage({ params }: { params: { code: string } }) {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showAnswers, setShowAnswers] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [isQuizFinished, setIsQuizFinished] = useState(false);
  const [players, setPlayers] = useState<{ id: string; name: string; score: number }[]>([]);
  const [showScores, setShowScores] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const answersTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const currentQuestion = sampleQuestions[currentQuestionIndex];
  
  // Simuler la récupération des joueurs (à remplacer par une API réelle)
  useEffect(() => {
    setPlayers([
      { id: '2', name: 'Alice', score: 0 },
      { id: '3', name: 'Bob', score: 0 },
      { id: '4', name: 'Charlie', score: 0 },
    ]);
  }, []);
  
  // Fonction pour démarrer le décompte
  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    setTimeRemaining(currentQuestion.timeLimit);
    
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  // Fonction pour afficher les réponses après 5 secondes
  const showAnswersAfterDelay = () => {
    if (answersTimerRef.current) clearTimeout(answersTimerRef.current);
    
    answersTimerRef.current = setTimeout(() => {
      setShowAnswers(true);
      startTimer();
    }, 5000);
  };
  
  // Fonction appelée quand le temps est écoulé
  const handleTimeUp = () => {
    // Logique pour gérer le temps écoulé
    // Simuler la réception des réponses des joueurs
    simulatePlayerAnswers();
  };
  
  // Simuler les réponses des joueurs (à remplacer par une API réelle)
  const simulatePlayerAnswers = () => {
    const updatedPlayers = players.map(player => {
      // Simuler des réponses aléatoires
      const isCorrect = Math.random() > 0.5;
      const timeBonus = Math.floor(Math.random() * currentQuestion.timeLimit);
      const questionScore = isCorrect ? Math.floor(1000 * (timeBonus / currentQuestion.timeLimit)) : 0;
      
      return {
        ...player,
        score: player.score + questionScore
      };
    });
    
    setPlayers(updatedPlayers);
  };
  
  // Fonction pour passer à la question suivante
  const handleNextQuestion = () => {
    if (currentQuestionIndex < sampleQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowAnswers(false);
      showAnswersAfterDelay();
    } else {
      setIsQuizFinished(true);
    }
  };
  
  // Fonction pour démarrer le quiz
  const handleStartQuiz = () => {
    setIsQuizActive(true);
    showAnswersAfterDelay();
  };
  
  // Fonction pour quitter le quiz
  const handleExitQuiz = () => {
    router.push('/');
  };
  
  // Fonction pour obtenir la couleur du décompte en fonction du temps restant
  const getTimerColor = () => {
    const percentage = timeRemaining / currentQuestion.timeLimit;
    if (percentage > 0.6) return '#4f46e5'; // Indigo
    if (percentage > 0.3) return '#7c3aed'; // Violet
    return '#ec4899'; // Rose
  };
  
  // Fonction pour obtenir la largeur de la barre de progression
  const getTimerWidth = () => {
    return `${(timeRemaining / currentQuestion.timeLimit) * 100}%`;
  };
  
  // Fonction pour afficher les scores
  const handleShowScores = () => {
    setShowScores(true);
  };
  
  // Fonction pour revenir au quiz
  const handleBackToQuiz = () => {
    setShowScores(false);
    handleNextQuestion();
  };
  
  return (
    <div className="min-h-screen bg-[#0D111E] relative overflow-hidden">
      <Particles className="absolute inset-0" />
      <Particles className="absolute inset-0" quantity={30} color="#4f46e5" size={0.8} />
      <Particles className="absolute inset-0" quantity={20} color="#7c3aed" size={1.2} />
      <Particles className="absolute inset-0" quantity={15} color="#ec4899" size={1.6} />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* En-tête avec code du quiz */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-white">
            <span className="text-gray-400">Code du quiz:</span> {params.code}
          </div>
          <div className="text-white">
            <span className="text-gray-400">Question:</span> {currentQuestionIndex + 1}/{sampleQuestions.length}
          </div>
        </div>
        
        {/* Écran de démarrage */}
        {!isQuizActive && !isQuizFinished && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/10 relative mb-8 text-center"
          >
            <ShineBorder borderWidth={1} duration={14} shineColor={["#4f46e5", "#7c3aed", "#ec4899"]} />
            <h2 className="text-3xl font-bold text-white mb-6">Prêt à démarrer le quiz ?</h2>
            <p className="text-xl text-gray-300 mb-8">
              Partagez votre écran pour que les participants puissent voir les questions.
            </p>
            <motion.button
              onClick={handleStartQuiz}
              className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-indigo-500/25 transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Démarrer le quiz
            </motion.button>
          </motion.div>
        )}
        
        {/* Question active */}
        {isQuizActive && !isQuizFinished && !showScores && (
          <>
            {/* Question */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/10 relative mb-8"
            >
              <ShineBorder borderWidth={1} duration={14} shineColor={["#4f46e5", "#7c3aed", "#ec4899"]} />
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Question {currentQuestionIndex + 1}/{sampleQuestions.length}
              </h2>
              <p className="text-xl text-white">{currentQuestion.text}</p>
            </motion.div>
            
            {/* Décompte */}
            {showAnswers && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-8"
              >
                <div className="h-4 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ 
                      backgroundColor: getTimerColor(),
                      width: getTimerWidth()
                    }}
                    initial={{ width: '100%' }}
                    animate={{ width: getTimerWidth() }}
                    transition={{ duration: 1, ease: 'linear' }}
                  />
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-white">{timeRemaining}s</span>
                  <span className="text-white" style={{ color: getTimerColor() }}>
                    {timeRemaining <= 5 ? 'Dépêchez-vous !' : ''}
                  </span>
                </div>
              </motion.div>
            )}
            
            {/* Message d'attente pour les réponses */}
            {!showAnswers && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="text-4xl text-white mb-4">⏳</div>
                <p className="text-xl text-white">Les réponses apparaîtront dans quelques secondes...</p>
              </motion.div>
            )}
            
            {/* Réponses */}
            <AnimatePresence>
              {showAnswers && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
                >
                  {currentQuestion.answers.map((answer) => {
                    const isCorrect = answer.isCorrect;
                    
                    return (
                      <motion.div
                        key={answer.id}
                        className={`${
                          isCorrect ? 'bg-green-500/20 border-green-500/50' : 'bg-white/5 border-white/10'
                        } backdrop-blur-xl rounded-xl p-4 border text-left transition-all duration-300 relative overflow-hidden`}
                      >
                        <ShineBorder borderWidth={1} duration={14} shineColor={["#4f46e5", "#7c3aed", "#ec4899"]} />
                        <div className="flex items-center">
                          <span className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 mr-3">
                            {answer.id.toUpperCase()}
                          </span>
                          <span className="font-medium text-white">{answer.text}</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Bouton suivant et afficher les scores */}
            {showAnswers && timeRemaining === 0 && (
              <div className="flex justify-center space-x-4">
                <motion.button
                  onClick={handleShowScores}
                  className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-indigo-500/25 transition-all duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Afficher les scores
                </motion.button>
                <motion.button
                  onClick={handleNextQuestion}
                  className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-purple-500/25 transition-all duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Question suivante
                </motion.button>
              </div>
            )}
          </>
        )}
        
        {/* Écran des scores */}
        {isQuizActive && !isQuizFinished && showScores && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/10 relative mb-8"
          >
            <ShineBorder borderWidth={1} duration={14} shineColor={["#4f46e5", "#7c3aed", "#ec4899"]} />
            <h2 className="text-3xl font-bold text-white mb-6 text-center">Classement actuel</h2>
            
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-white mb-4">Top 10</h3>
              
              {/* Tableau des scores avec effet de réflexion */}
              <div className="column" style={{ 
                "--aspect-ratio": "4 / 3",
                margin: "0 auto 100px",
                WebkitBoxReflect: "below 3px -webkit-gradient(linear, left top, left bottom, from(transparent), color-stop(10%, transparent), to(rgba(255, 255, 255, 0.25)))"
              } as React.CSSProperties}>
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left text-white/70 pb-4">Rang</th>
                      <th className="text-left text-white/70 pb-4">Joueur</th>
                      <th className="text-right text-white/70 pb-4">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {players
                      .sort((a, b) => b.score - a.score)
                      .slice(0, 10)
                      .map((player, index) => (
                        <tr key={player.id} className="border-t border-white/10">
                          <td className="py-4">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{
                              background: index === 0 ? "linear-gradient(to bottom, #4f46e5, #7c3aed)" : 
                                         index === 1 ? "linear-gradient(to bottom, #7c3aed, #ec4899)" : 
                                         index === 2 ? "linear-gradient(to bottom, #ec4899, #f43f5e)" : 
                                         "linear-gradient(to bottom, #64748b, #94a3b8)",
                              boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.5)"
                            }}>
                              <span className="text-white font-bold">{index + 1}</span>
                            </div>
                          </td>
                          <td className="py-4">
                            <span className="text-white font-medium">{player.name}</span>
                          </td>
                          <td className="py-4 text-right">
                            <div className="inline-block px-4 py-2 rounded-lg" style={{
                              marginInlineStart: "10px",
                              marginInlineEnd: "20px",
                              boxShadow: `
                                1px -1px 1px rgba(255, 255, 255, 0.2),
                                2px -2px 1px rgba(255, 255, 255, 0.2),
                                3px -3px 1px rgba(255, 255, 255, 0.2),
                                4px -4px 1px rgba(255, 255, 255, 0.2),
                                5px -5px 1px rgba(255, 255, 255, 0.2),
                                6px -6px 1px rgba(255, 255, 255, 0.2),
                                7px -7px 1px rgba(255, 255, 255, 0.2),
                                8px -8px 1px rgba(255, 255, 255, 0.2),
                                9px -9px 1px rgba(255, 255, 255, 0.2),
                                10px -10px 1px rgba(255, 255, 255, 0.2)
                              `,
                              background: index === 0 ? "linear-gradient(to bottom, #4f46e5, #7c3aed)" : 
                                         index === 1 ? "linear-gradient(to bottom, #7c3aed, #ec4899)" : 
                                         index === 2 ? "linear-gradient(to bottom, #ec4899, #f43f5e)" : 
                                         "linear-gradient(to bottom, #64748b, #94a3b8)"
                            }}>
                              <span className="text-white font-bold">{player.score} pts</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              
              {/* Barres de progression 3D verticales */}
              <div className="mt-8 flex justify-between items-end h-64">
                {players
                  .sort((a, b) => b.score - a.score)
                  .slice(0, 5)
                  .map((player, index) => {
                    const maxScore = Math.max(...players.map(p => p.score));
                    const percentage = (player.score / maxScore) * 100;
                    
                    return (
                      <div key={player.id} className="flex flex-col items-center w-16">
                        <div className="w-full h-full bg-white/10 rounded-lg overflow-hidden relative" style={{
                          boxShadow: "inset -2px -2px 5px rgba(0, 0, 0, 0.3), 2px 2px 5px rgba(0, 0, 0, 0.3)"
                        }}>
                          <div 
                            className="absolute bottom-0 w-full rounded-lg"
                            style={{
                              height: `${percentage}%`,
                              background: index === 0 ? "linear-gradient(to top, #4f46e5, #7c3aed)" : 
                                         index === 1 ? "linear-gradient(to top, #7c3aed, #ec4899)" : 
                                         index === 2 ? "linear-gradient(to top, #ec4899, #f43f5e)" : 
                                         "linear-gradient(to top, #64748b, #94a3b8)",
                              boxShadow: "inset -2px -2px 5px rgba(0, 0, 0, 0.3), 2px 2px 5px rgba(0, 0, 0, 0.3)",
                              transition: "height 1s ease-in-out"
                            }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
            
            <div className="flex justify-center">
              <motion.button
                onClick={handleBackToQuiz}
                className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-indigo-500/25 transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Retour au quiz
              </motion.button>
            </div>
          </motion.div>
        )}
        
        {/* Écran de fin de quiz */}
        {isQuizFinished && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/10 relative mb-8"
          >
            <ShineBorder borderWidth={1} duration={14} shineColor={["#4f46e5", "#7c3aed", "#ec4899"]} />
            <h2 className="text-3xl font-bold text-white mb-6 text-center">Quiz terminé !</h2>
            
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-white mb-4">Classement final</h3>
              <div className="space-y-3">
                {players
                  .sort((a, b) => b.score - a.score)
                  .map((player, index) => (
                    <div
                      key={player.id}
                      className="flex items-center p-3 rounded-lg bg-white/5 border border-white/10"
                    >
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mr-3">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">{player.name}</p>
                      </div>
                      <div className="text-white font-bold">{player.score} pts</div>
                    </div>
                  ))}
              </div>
            </div>
            
            <div className="flex justify-center">
              <motion.button
                onClick={handleExitQuiz}
                className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-indigo-500/25 transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Retour à l'accueil
              </motion.button>
            </div>
          </motion.div>
        )}
        
        {/* Classement en direct */}
        {!showScores && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/10 relative"
          >
            <ShineBorder borderWidth={1} duration={14} shineColor={["#7c3aed", "#ec4899", "#4f46e5"]} />
            <h2 className="text-xl font-bold text-white mb-4">Classement en direct</h2>
            
            <div className="space-y-2">
              {players
                .sort((a, b) => b.score - a.score)
                .map((player, index) => (
                  <div
                    key={player.id}
                    className="flex items-center p-2 rounded-lg bg-white/5 border border-white/10"
                  >
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center mr-2 text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm">{player.name}</p>
                    </div>
                    <div className="text-white text-sm font-bold">{player.score} pts</div>
                  </div>
                ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
} 