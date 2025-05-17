'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShineBorder } from '@/components/magicui/shine-border';
// Import corrigé - on n'a pas besoin de QuizQuestion
import QuizResults from '@/components/QuizResults';

interface Option {
  id: string;
  text: string;
}

interface Question {
  id: string;
  text: string;
  options: Option[];
  correctOptionId: string;
  timeLimit: number;
}

export interface Answer {
  questionId: string;
  selectedOptionId: string | null;
  isCorrect: boolean;
}

interface QuizComponentProps {
  title: string;
  description: string;
  questions: Question[];
  onComplete?: (answers: Answer[], score: number) => void;
}

const QuizComponent: React.FC<QuizComponentProps> = ({
  title,
  description,
  questions,
  onComplete
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isQuizComplete, setIsQuizComplete] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  // Stockage des index des questions correctes et incorrectes au lieu des questions elles-mêmes
  const [correctAnswersIndices, setCorrectAnswersIndices] = useState<number[]>([]);
  const [incorrectAnswersIndices, setIncorrectAnswersIndices] = useState<number[]>([]);

  // Initialiser le temps pour la première question
  useEffect(() => {
    if (questions.length > 0 && !isQuizComplete) {
      setTimeLeft(questions[currentQuestionIndex].timeLimit);
    }
  }, [questions, currentQuestionIndex, isQuizComplete]);

  // Gérer le décompte du temps
  useEffect(() => {
    if (isQuizComplete || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAnswerSubmit(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isQuizComplete]);

  const handleAnswerSubmit = (selectedOptionId: string | null) => {
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedOptionId === currentQuestion.correctOptionId;

    // Enregistrer la réponse
    const answer: Answer = {
      questionId: currentQuestion.id,
      selectedOptionId,
      isCorrect
    };

    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    // Mettre à jour les statistiques
    if (isCorrect) {
      setScore((prev) => prev + 1);
      setCorrectAnswersIndices((prev) => [...prev, currentQuestionIndex + 1]);
    } else {
      setIncorrectAnswersIndices((prev) => [...prev, currentQuestionIndex + 1]);
    }

    // Passer à la question suivante ou terminer le quiz
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      completeQuiz(newAnswers);
    }
  };

  const completeQuiz = (finalAnswers: Answer[]) => {
    setIsQuizComplete(true);
    
    // Calculer le score final
    const finalScore = finalAnswers.filter(a => a.isCorrect).length;
    
    // Appeler le callback si fourni
    if (onComplete) {
      onComplete(finalAnswers, finalScore);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setScore(0);
    setTimeLeft(questions[0].timeLimit);
    setIsQuizComplete(false);
    setCorrectAnswersIndices([]);
    setIncorrectAnswersIndices([]);
  };

  // Afficher les résultats si le quiz est terminé
  if (isQuizComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl mx-auto p-6"
      >
        <QuizResults 
          score={score} 
          totalQuestions={questions.length}
          correctAnswers={correctAnswersIndices}
          incorrectAnswers={incorrectAnswersIndices}
        />
        
        <motion.button
          onClick={restartQuiz}
          className="mt-8 w-full py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium shadow-lg hover:shadow-indigo-500/25 transition-all duration-200"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Recommencer le quiz
        </motion.button>
      </motion.div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/10 relative mb-6"
      >
        <ShineBorder borderWidth={1} duration={10} shineColor={["#4f46e5", "#7c3aed", "#ec4899"]} />
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-semibold text-white">{title}</h1>
          <div className="text-sm text-gray-400">
            Question {currentQuestionIndex + 1}/{questions.length}
          </div>
        </div>
        
        <div className="mb-8">
          <div className="w-full bg-white/10 rounded-full h-2 mb-2">
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: `${(timeLeft / currentQuestion.timeLimit) * 100}%` }}
              className={`h-full rounded-full ${
                timeLeft > 10 ? 'bg-emerald-500' : timeLeft > 5 ? 'bg-amber-500' : 'bg-red-500'
              }`}
            />
          </div>
          <div className="text-right text-sm text-gray-400">
            {timeLeft} secondes restantes
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-6">
              <h2 className="text-xl text-white font-medium mb-6">{currentQuestion.text}</h2>
              
              <div className="space-y-3">
                {currentQuestion.options.map((option) => (
                  <motion.button
                    key={option.id}
                    onClick={() => handleAnswerSubmit(option.id)}
                    className="w-full text-left px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all duration-200"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    {option.text}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default QuizComponent; 