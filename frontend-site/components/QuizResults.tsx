'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface QuizResultsProps {
  score: number;
  totalQuestions: number;
  correctAnswers: number[];
  incorrectAnswers: number[];
}

const QuizResults: React.FC<QuizResultsProps> = ({
  score,
  totalQuestions,
  correctAnswers,
  incorrectAnswers,
}) => {
  const percentage = Math.round((score / totalQuestions) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-md mx-auto"
    >
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-gray-100">
        Résultats du Quiz
      </h2>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <h3 className="text-green-600 dark:text-green-400 font-medium mb-2">
            Réponses Correctes
          </h3>
          <div className="text-3xl font-bold text-green-700 dark:text-green-300">
            {correctAnswers.length}
          </div>
          <div className="text-sm text-green-600 dark:text-green-400">
            Questions: {correctAnswers.join(', ')}
          </div>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <h3 className="text-red-600 dark:text-red-400 font-medium mb-2">
            Réponses Incorrectes
          </h3>
          <div className="text-3xl font-bold text-red-700 dark:text-red-300">
            {incorrectAnswers.length}
          </div>
          <div className="text-sm text-red-600 dark:text-red-400">
            Questions: {incorrectAnswers.join(', ')}
          </div>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center mb-4">
        <h3 className="text-blue-600 dark:text-blue-400 font-medium mb-2">
          Taux de Réussite
        </h3>
        <div className="text-4xl font-bold text-blue-700 dark:text-blue-300">
          {percentage}%
        </div>
      </div>

      <div className="mt-4 text-center text-gray-600 dark:text-gray-300">
        {percentage >= 80 ? (
          'Félicitations! Excellent travail!'
        ) : percentage >= 60 ? (
          'Bien joué! Vous pouvez encore vous améliorer.'
        ) : (
          'Continuez à pratiquer pour améliorer vos résultats.'
        )}
      </div>
    </motion.div>
  );
};

export default QuizResults; 