import React, { useState } from 'react';
import { useQuizSocket } from '@/hooks/useQuizSocket';

interface QuizQuestionProps {
  question: {
    id: string;
    text: string;
    options: string[];
  };
  timeLeft: number;
}

export const QuizQuestion: React.FC<QuizQuestionProps> = ({ question, timeLeft }) => {
  const { submitAnswer } = useQuizSocket();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
    submitAnswer(question.id, option);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <div className="text-2xl font-bold mb-4">{question.text}</div>
        <div className="text-sm text-gray-500">
          Temps restant: {timeLeft} secondes
        </div>
      </div>

      <div className="space-y-4">
        {question.options.map((option, index) => (
          <button
            key={index}
            className={`w-full p-4 text-left rounded-lg border transition-colors ${
              selectedOption === option
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
            onClick={() => handleOptionSelect(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}; 