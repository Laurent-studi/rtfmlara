'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Types pour les étapes du quiz
type QuizStep = 'welcome' | 'question' | 'results';

// Composant de la page d'exemple de transitions
export default function TransitionExample() {
  const [currentStep, setCurrentStep] = useState<QuizStep>('welcome');
  const [score, setScore] = useState(0);

  // Fonction pour passer à l'étape suivante
  const goToNextStep = () => {
    if (currentStep === 'welcome') {
      setCurrentStep('question');
    } else if (currentStep === 'question') {
      setScore(Math.floor(Math.random() * 10)); // Score aléatoire pour l'exemple
      setCurrentStep('results');
    }
  };

  // Fonction pour recommencer le quiz
  const restartQuiz = () => {
    setCurrentStep('welcome');
    setScore(0);
  };

  // Variantes d'animation pour les transitions
  const pageVariants = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <AnimatePresence mode="wait">
          {currentStep === 'welcome' && (
            <motion.div
              key="welcome"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg shadow-lg p-8 text-center"
            >
              <h1 className="text-3xl font-bold mb-6">Bienvenue au Quiz</h1>
              <p className="text-gray-600 mb-8">
                Testez vos connaissances avec ce quiz interactif.
              </p>
              <button
                onClick={goToNextStep}
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Commencer
              </button>
            </motion.div>
          )}

          {currentStep === 'question' && (
            <motion.div
              key="question"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg shadow-lg p-8"
            >
              <h2 className="text-2xl font-bold mb-6">Question 1</h2>
              <p className="text-lg mb-6">
                Quelle est la capitale de la France?
              </p>
              <div className="space-y-4">
                {['Paris', 'Londres', 'Berlin', 'Madrid'].map((option, index) => (
                  <button
                    key={index}
                    className="w-full p-4 text-left border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                    onClick={goToNextStep}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {currentStep === 'results' && (
            <motion.div
              key="results"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg shadow-lg p-8 text-center"
            >
              <h2 className="text-3xl font-bold mb-6">Résultats</h2>
              <div className="text-5xl font-bold text-blue-500 mb-6">
                {score}/10
              </div>
              <p className="text-gray-600 mb-8">
                {score >= 7
                  ? 'Félicitations! Vous avez bien réussi!'
                  : 'Continuez à vous entraîner pour améliorer votre score.'}
              </p>
              <button
                onClick={restartQuiz}
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Recommencer
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 