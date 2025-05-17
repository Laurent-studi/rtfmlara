'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AnswerOption from './AnswerOption';

interface QuizQuestionProps {
  question: {
    id: string;
    text: string;
    options: string[];
    correctAnswers: number[];
    timeLimit: number;
  };
  onAnswer: (selectedAnswers: number[]) => void;
  isActive: boolean;
}

const QuizQuestion: React.FC<QuizQuestionProps> = ({ question, onAnswer, isActive }) => {
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(question.timeLimit);

  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          onAnswer(selectedAnswers);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, selectedAnswers, onAnswer]);

  const handleAnswerSelect = (index: number) => {
    setSelectedAnswers((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index);
      }
      return [...prev, index];
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-2xl mx-auto p-6 bg-white/10 backdrop-blur-lg rounded-xl shadow-lg"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-4">{question.text}</h2>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2.5 rounded-full transition-all duration-1000"
            style={{ width: `${(timeLeft / question.timeLimit) * 100}%` }}
          />
        </div>
        <p className="text-right text-sm text-gray-300 mt-2">{timeLeft}s</p>
      </div>

      <div className="space-y-4">
        {question.options.map((option, index) => (
          <AnswerOption
            key={index}
            text={option}
            isSelected={selectedAnswers.includes(index)}
            onClick={() => handleAnswerSelect(index)}
            disabled={!isActive}
          />
        ))}
      </div>

      {isActive && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="mt-6 w-full py-3 px-6 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-semibold shadow-lg"
          onClick={() => onAnswer(selectedAnswers)}
        >
          Valider
        </motion.button>
      )}
    </motion.div>
  );
};

export default QuizQuestion; 