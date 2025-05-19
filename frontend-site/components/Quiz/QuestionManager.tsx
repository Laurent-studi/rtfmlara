'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShineBorder } from '@/components/magicui/shine-border';
import { api } from '@/lib/api';

interface Question {
  id: number;
  question_text: string;
  points: number;
  order_index: number;
  multiple_answers: boolean;
  answers: Answer[];
}

interface Answer {
  id?: number;
  answer_text: string;
  is_correct: boolean;
  explanation?: string;
}

interface QuestionManagerProps {
  quiz: any;
  onFinish?: () => void;
}

export default function QuestionManager({ quiz, onFinish }: QuestionManagerProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // État pour le formulaire de création de question
  const [questionText, setQuestionText] = useState('');
  const [points, setPoints] = useState(3000);
  const [multipleAnswers, setMultipleAnswers] = useState(false);
  const [answers, setAnswers] = useState<Answer[]>([
    { answer_text: '', is_correct: true, explanation: '' },
    { answer_text: '', is_correct: false, explanation: '' },
    { answer_text: '', is_correct: false, explanation: '' },
    { answer_text: '', is_correct: false, explanation: '' }
  ]);
  
  useEffect(() => {
    // Charger les questions du quiz si elles existent déjà
    const fetchQuestions = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`quizzes/${quiz.id}`);
        
        if (response.success && response.data) {
          setQuestions(response.data.questions || []);
        }
      } catch (err: any) {
        setError(err.message || 'Erreur lors du chargement des questions');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchQuestions();
  }, [quiz.id]);
  
  const handleAnswerChange = (index: number, field: keyof Answer, value: string | boolean) => {
    const newAnswers = [...answers];
    newAnswers[index] = { ...newAnswers[index], [field]: value };
    
    // Si on change une réponse à "correcte", mettre les autres à "incorrecte" si la question n'autorise pas les réponses multiples
    if (field === 'is_correct' && value === true && !multipleAnswers) {
      newAnswers.forEach((answer, i) => {
        if (i !== index) {
          newAnswers[i] = { ...answer, is_correct: false };
        }
      });
    }
    
    setAnswers(newAnswers);
  };
  
  const addAnswer = () => {
    if (answers.length < 8) {
      setAnswers([...answers, { answer_text: '', is_correct: false, explanation: '' }]);
    }
  };
  
  const removeAnswer = (index: number) => {
    if (answers.length > 2) {
      const newAnswers = answers.filter((_, i) => i !== index);
      setAnswers(newAnswers);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    // Vérifier qu'au moins une réponse est correcte
    if (!answers.some(answer => answer.is_correct)) {
      setError('Au moins une réponse doit être correcte');
      return;
    }
    
    // Vérifier que toutes les réponses ont un texte
    if (answers.some(answer => !answer.answer_text.trim())) {
      setError('Toutes les réponses doivent avoir un texte');
      return;
    }
    
    try {
      setIsLoading(true);
      
      const response = await api.post('questions', {
        quiz_id: quiz.id,
        question_text: questionText,
        points,
        multiple_answers: multipleAnswers,
        answers: answers.map(a => ({
          answer_text: a.answer_text,
          is_correct: a.is_correct,
          explanation: a.explanation
        }))
      });
      
      if (response.success && response.data) {
        setSuccess('Question ajoutée avec succès');
        setQuestions(prev => [...prev, response.data]);
        
        // Réinitialiser le formulaire
        setQuestionText('');
        setPoints(3000);
        setMultipleAnswers(false);
        setAnswers([
          { answer_text: '', is_correct: true, explanation: '' },
          { answer_text: '', is_correct: false, explanation: '' },
          { answer_text: '', is_correct: false, explanation: '' },
          { answer_text: '', is_correct: false, explanation: '' }
        ]);
      } else {
        setError(response.message || 'Erreur lors de l\'ajout de la question');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'ajout de la question');
    } finally {
      setIsLoading(false);
    }
  };
  
  const deleteQuestion = async (questionId: number) => {
    try {
      setIsLoading(true);
      
      const response = await api.delete(`questions/${questionId}`);
      
      if (response.success) {
        setQuestions(prev => prev.filter(q => q.id !== questionId));
        setSuccess('Question supprimée avec succès');
      } else {
        setError(response.message || 'Erreur lors de la suppression de la question');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression de la question');
    } finally {
      setIsLoading(false);
    }
  };
  
  const finishQuiz = () => {
    if (questions.length === 0) {
      setError('Vous devez ajouter au moins une question pour terminer le quiz');
      return;
    }
    
    if (onFinish) {
      onFinish();
    }
  };
  
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/10 relative overflow-hidden"
      >
        <ShineBorder borderWidth={1} duration={14} shineColor={["#4f46e5", "#7c3aed", "#ec4899"]} />
        
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Gestion des questions</h1>
          <p className="text-gray-300">
            Quiz: <span className="font-semibold">{quiz.title}</span>
          </p>
          <p className="text-gray-300">
            {questions.length} question{questions.length !== 1 ? 's' : ''} ajoutée{questions.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-white p-4 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-500/20 border border-green-500/50 text-white p-4 rounded-lg mb-6">
            {success}
          </div>
        )}
        
        {/* Liste des questions existantes */}
        {questions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Questions existantes</h2>
            
            <div className="space-y-4">
              {questions.map((question, index) => (
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/10 rounded-xl p-4 border border-white/20"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-white">
                        Question {index + 1}: {question.question_text}
                      </h3>
                      <p className="text-gray-400 text-sm mt-1">
                        {question.points} points · {question.answers.filter(a => a.is_correct).length} réponse(s) correcte(s)
                      </p>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => deleteQuestion(question.id)}
                      className="text-red-400 hover:text-red-500 transition-colors p-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {question.answers.map((answer, aIndex) => (
                      <div
                        key={answer.id || aIndex}
                        className={`px-3 py-2 rounded-lg ${
                          answer.is_correct
                            ? 'bg-green-500/20 border border-green-500/30'
                            : 'bg-white/5 border border-white/10'
                        }`}
                      >
                        <p className="text-white text-sm">{answer.answer_text}</p>
                        {answer.explanation && (
                          <p className="text-gray-400 text-xs mt-1">
                            Explication: {answer.explanation}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
        
        {/* Formulaire d'ajout de question */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <label htmlFor="questionText" className="block text-white mb-2">
                Texte de la question <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                id="questionText"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                required
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Entrez votre question ici"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="points" className="block text-white mb-2">
                  Points (maximum) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  id="points"
                  value={points}
                  onChange={(e) => setPoints(parseInt(e.target.value))}
                  min={100}
                  required
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="mt-1 text-sm text-gray-400">
                  Le joueur perdra 10 points par 0,1 seconde écoulée (100 points par seconde)
                </p>
              </div>
              
              <div className="flex items-center h-full">
                <label className="inline-flex items-center cursor-pointer mt-6">
                  <input
                    type="checkbox"
                    checked={multipleAnswers}
                    onChange={(e) => setMultipleAnswers(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="relative w-11 h-6 bg-white/10 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  <span className="ml-3 text-white">Question à choix multiples</span>
                </label>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-white">
                  Réponses <span className="text-red-400">*</span>
                </label>
                
                <button
                  type="button"
                  onClick={addAnswer}
                  disabled={answers.length >= 8}
                  className={`text-indigo-400 hover:text-indigo-300 transition-colors ${
                    answers.length >= 8 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  + Ajouter une réponse
                </button>
              </div>
              
              <div className="space-y-4">
                <AnimatePresence>
                  {answers.map((answer, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="bg-white/10 rounded-xl p-4 border border-white/20"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <label className="inline-flex items-center">
                          <input
                            type="checkbox"
                            checked={answer.is_correct}
                            onChange={(e) => handleAnswerChange(index, 'is_correct', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="relative w-11 h-6 bg-white/10 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                          <span className="ml-3 text-white">Correcte</span>
                        </label>
                        
                        {answers.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeAnswer(index)}
                            className="text-red-400 hover:text-red-500 transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <input
                            type="text"
                            value={answer.answer_text}
                            onChange={(e) => handleAnswerChange(index, 'answer_text', e.target.value)}
                            required
                            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Texte de la réponse"
                          />
                        </div>
                        
                        <div>
                          <input
                            type="text"
                            value={answer.explanation || ''}
                            onChange={(e) => handleAnswerChange(index, 'explanation', e.target.value)}
                            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Explication (optionnelle)"
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              
              {!multipleAnswers && (
                <p className="mt-2 text-sm text-gray-400">
                  Cette question n'autorise qu'une seule réponse correcte.
                </p>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className={`px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl shadow-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all ${
                  isLoading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? "Ajout en cours..." : "Ajouter la question"}
              </button>
              
              <button
                type="button"
                onClick={finishQuiz}
                className="px-6 py-3 bg-white/10 text-white font-medium rounded-xl shadow-lg hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
              >
                Terminer le quiz
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
} 