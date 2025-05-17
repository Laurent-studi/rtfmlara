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

export default function QuizPage({ params }: { params: { code: string } }) {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showAnswers, setShowAnswers] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [lastAnswerTime, setLastAnswerTime] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [isQuizFinished, setIsQuizFinished] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const answersTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const currentQuestion = sampleQuestions[currentQuestionIndex];
  
  // Fonction pour démarrer le décompte
  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    setTimeRemaining(currentQuestion.timeLimit);
    setLastAnswerTime(Date.now());
    
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
    if (!isAnswerSubmitted) {
      setIsAnswerSubmitted(true);
      // Logique pour gérer le temps écoulé sans réponse
    }
  };
  
  // Fonction pour gérer la sélection d'une réponse
  const handleAnswerSelect = (answerId: string) => {
    if (isAnswerSubmitted) return;
    
    setSelectedAnswer(answerId);
    setIsAnswerSubmitted(true);
    
    if (timerRef.current) clearInterval(timerRef.current);
    
    const timeTaken = Date.now() - (lastAnswerTime || Date.now());
    const timeInSeconds = Math.floor(timeTaken / 1000);
    
    // Calcul du score basé sur la rapidité (plus c'est rapide, plus le score est élevé)
    const answer = currentQuestion.answers.find(a => a.id === answerId);
    if (answer?.isCorrect) {
      const maxScore = 1000;
      const timeBonus = Math.max(0, currentQuestion.timeLimit - timeInSeconds);
      const questionScore = Math.floor(maxScore * (timeBonus / currentQuestion.timeLimit));
      setScore(prev => prev + questionScore);
    }
  };
  
  // Fonction pour passer à la question suivante
  const handleNextQuestion = () => {
    if (currentQuestionIndex < sampleQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowAnswers(false);
      setSelectedAnswer(null);
      setIsAnswerSubmitted(false);
      showAnswersAfterDelay();
    } else {
      setIsQuizFinished(true);
    }
  };
  
  // Fonction pour quitter le quiz
  const handleExitQuiz = () => {
    router.push('/');
  };
  
  // Effet pour initialiser le quiz
  useEffect(() => {
    showAnswersAfterDelay();
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (answersTimerRef.current) clearTimeout(answersTimerRef.current);
    };
  }, []);
  
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
  
  return (
    <div className="min-h-screen bg-[#0D111E] relative overflow-hidden">
      <Particles className="absolute inset-0" />
      <Particles className="absolute inset-0" quantity={30} color="#4f46e5" size={0.8} />
      <Particles className="absolute inset-0" quantity={20} color="#7c3aed" size={1.2} />
      <Particles className="absolute inset-0" quantity={15} color="#ec4899" size={1.6} />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* En-tête avec code du quiz et score */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-white">
            <span className="text-gray-400">Code du quiz:</span> {params.code}
          </div>
          <div className="text-white">
            <span className="text-gray-400">Score:</span> {score}
          </div>
        </div>
        
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
        {showAnswers && !isAnswerSubmitted && (
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
                const isSelected = selectedAnswer === answer.id;
                const isCorrect = answer.isCorrect;
                const showResult = isAnswerSubmitted;
                
                let bgColor = 'bg-white/5';
                let borderColor = 'border-white/10';
                let textColor = 'text-white';
                
                if (showResult) {
                  if (isSelected) {
                    if (isCorrect) {
                      bgColor = 'bg-green-500/20';
                      borderColor = 'border-green-500/50';
                      textColor = 'text-green-400';
                    } else {
                      bgColor = 'bg-red-500/20';
                      borderColor = 'border-red-500/50';
                      textColor = 'text-red-400';
                    }
                  } else if (isCorrect) {
                    bgColor = 'bg-green-500/20';
                    borderColor = 'border-green-500/50';
                    textColor = 'text-green-400';
                  }
                }
                
                return (
                  <motion.button
                    key={answer.id}
                    className={`${bgColor} ${borderColor} ${textColor} backdrop-blur-xl rounded-xl p-4 border text-left transition-all duration-300 relative overflow-hidden`}
                    onClick={() => handleAnswerSelect(answer.id)}
                    disabled={isAnswerSubmitted}
                    whileHover={!isAnswerSubmitted ? { scale: 1.02 } : {}}
                    whileTap={!isAnswerSubmitted ? { scale: 0.98 } : {}}
                  >
                    <ShineBorder borderWidth={1} duration={14} shineColor={["#4f46e5", "#7c3aed", "#ec4899"]} />
                    <div className="flex items-center">
                      <span className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 mr-3">
                        {answer.id.toUpperCase()}
                      </span>
                      <span className="font-medium">{answer.text}</span>
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Bouton suivant ou quitter */}
        <div className="flex justify-center">
          {isAnswerSubmitted && !isQuizFinished && (
            <motion.button
              onClick={handleNextQuestion}
              className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-indigo-500/25 transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Question suivante
            </motion.button>
          )}
          
          {isQuizFinished && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h2 className="text-3xl font-bold text-white mb-4">Quiz terminé !</h2>
              <p className="text-xl text-white mb-8">Votre score final : {score}</p>
              <motion.button
                onClick={handleExitQuiz}
                className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-indigo-500/25 transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Retour à l'accueil
              </motion.button>
            </motion.div>
          )}
          
          {!isAnswerSubmitted && !isQuizFinished && (
            <motion.button
              onClick={handleExitQuiz}
              className="px-8 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Quitter le quiz
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
} 