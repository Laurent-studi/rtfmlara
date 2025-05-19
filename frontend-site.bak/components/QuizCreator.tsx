'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShineBorder } from '@/components/magicui/shine-border';

interface Question {
  id: string;
  text: string;
  options: string[];
  correctOptionIndex: number;
  timeLimit: number;
}

interface QuizCreatorProps {
  onSave: (questions: Question[]) => void;
  initialQuestions?: Question[];
}

export class QuizQuestion {
  id: string;
  text: string;
  options: string[];
  correctOptionIndex: number;
  timeLimit: number;

  constructor(text: string = '', options: string[] = ['', '', '', ''], correctOptionIndex: number = 0, timeLimit: number = 30) {
    this.id = Date.now().toString();
    this.text = text;
    this.options = options;
    this.correctOptionIndex = correctOptionIndex;
    this.timeLimit = timeLimit;
  }
}

const QuizCreator: React.FC<QuizCreatorProps> = ({ onSave, initialQuestions = [] }) => {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [currentQuestion, setCurrentQuestion] = useState<Question>(new QuizQuestion());
  const [editMode, setEditMode] = useState<boolean>(false);

  const handleQuestionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentQuestion({ ...currentQuestion, [name]: value });
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  const handleCorrectOptionChange = (index: number) => {
    setCurrentQuestion({ ...currentQuestion, correctOptionIndex: index });
  };

  const validateQuestion = (): boolean => {
    if (!currentQuestion.text.trim()) {
      alert('Veuillez saisir le texte de la question.');
      return false;
    }

    if (currentQuestion.options.some(opt => !opt.trim())) {
      alert('Toutes les options doivent être remplies.');
      return false;
    }

    if (currentQuestion.timeLimit < 5 || currentQuestion.timeLimit > 300) {
      alert('Le temps limite doit être entre 5 et 300 secondes.');
      return false;
    }

    return true;
  };

  const handleAddQuestion = () => {
    if (!validateQuestion()) return;

    setQuestions([...questions, { ...currentQuestion, id: Date.now().toString() }]);
    resetCurrentQuestion();
  };

  const handleUpdateQuestion = () => {
    if (!validateQuestion()) return;

    const updatedQuestions = questions.map(q => 
      q.id === currentQuestion.id ? currentQuestion : q
    );
    
    setQuestions(updatedQuestions);
    resetCurrentQuestion();
    setEditMode(false);
  };

  const resetCurrentQuestion = () => {
    setCurrentQuestion(new QuizQuestion());
  };

  const handleEditQuestion = (question: Question) => {
    setCurrentQuestion(question);
    setEditMode(true);
  };

  const handleRemoveQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleSave = () => {
    if (questions.length === 0) {
      alert('Veuillez ajouter au moins une question.');
      return;
    }
    
    onSave(questions);
  };

  const handleCancel = () => {
    if (editMode) {
      resetCurrentQuestion();
      setEditMode(false);
    }
  };

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/10 relative mb-6"
      >
        <ShineBorder borderWidth={1} duration={10} shineColor={["#4f46e5", "#7c3aed", "#ec4899"]} />
        
        <h2 className="text-xl font-semibold text-white mb-4">
          {editMode ? 'Modifier la question' : 'Ajouter une question'}
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Question</label>
            <input
              type="text"
              name="text"
              value={currentQuestion.text}
              onChange={handleQuestionChange}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Saisissez votre question ici"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Temps limite (secondes)</label>
            <input
              type="number"
              name="timeLimit"
              value={currentQuestion.timeLimit}
              onChange={handleQuestionChange}
              min={5}
              max={300}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Options de réponse</label>
            <div className="space-y-3">
              {currentQuestion.options.map((option, idx) => (
                <div key={idx} className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="correctOption"
                    checked={currentQuestion.correctOptionIndex === idx}
                    onChange={() => handleCorrectOptionChange(idx)}
                    className="h-5 w-5 border-white/10 bg-white/5 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0"
                  />
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder={`Option ${idx + 1}`}
                  />
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">Sélectionnez le bouton radio à côté de la réponse correcte</p>
          </div>

          <div className="flex space-x-3 pt-2">
            {editMode ? (
              <>
                <motion.button
                  type="button"
                  onClick={handleUpdateQuestion}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium shadow-lg hover:shadow-indigo-500/25 transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Mettre à jour
                </motion.button>
                <motion.button
                  type="button"
                  onClick={handleCancel}
                  className="py-3 px-4 bg-transparent border border-white/20 text-white rounded-xl font-medium transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Annuler
                </motion.button>
              </>
            ) : (
              <motion.button
                type="button"
                onClick={handleAddQuestion}
                className="w-full py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium shadow-lg hover:shadow-indigo-500/25 transition-all duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Ajouter cette question
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>

      {questions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/10 relative mb-6"
        >
          <h2 className="text-xl font-semibold text-white mb-4">Questions ({questions.length})</h2>
          
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            {questions.map((question, idx) => (
              <motion.div 
                key={question.id} 
                className="bg-white/5 border border-white/10 rounded-xl p-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-white">{idx + 1}. {question.text}</p>
                    <p className="text-sm text-gray-400 mt-1">Temps: {question.timeLimit}s • {question.options.length} options</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditQuestion(question)}
                      className="text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleRemoveQuestion(question.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
                <div className="mt-2 pl-4 border-l-2 border-indigo-500/30">
                  {question.options.map((option, optIdx) => (
                    <p key={optIdx} className={`text-sm ${optIdx === question.correctOptionIndex ? 'text-green-400' : 'text-gray-400'}`}>
                      {optIdx === question.correctOptionIndex ? '✓ ' : ''}
                      {option}
                    </p>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-6">
            <motion.button
              onClick={handleSave}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium shadow-lg hover:shadow-indigo-500/25 transition-all duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Enregistrer toutes les questions
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default QuizCreator; 