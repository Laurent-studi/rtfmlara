'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ShineBorder } from '@/components/magicui/shine-border';
import { apiService } from '@/lib/api-service';

interface Question {
  id: string;
  text: string;
  options: string[];
  correctOptionIndex: number;
  timeLimit: number;
}

interface QuizFormData {
  title: string;
  description: string;
  category: string;
  isPublic: boolean;
  questions: Question[];
}

interface Category {
  value: string;
  label: string;
}

const CreateQuiz: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [currentStep, setCurrentStep] = useState<'info' | 'questions'>('info');
  const [error, setError] = useState<string>('');
  const [formData, setFormData] = useState<QuizFormData>({
    title: '',
    description: '',
    category: '',
    isPublic: true,
    questions: [],
  });

  // État pour la question en cours d'édition
  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    id: '',
    text: '',
    options: ['', '', '', ''],
    correctOptionIndex: 0,
    timeLimit: 30,
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true);
        // Idéalement, appeler l'API pour récupérer les catégories
        // const categoryList = await apiService.getQuizCategories();
        
        // Pour l'instant, on utilise des catégories prédéfinies
        const defaultCategories = [
          { value: 'culture', label: 'Culture Générale' },
          { value: 'science', label: 'Science' },
          { value: 'histoire', label: 'Histoire' },
          { value: 'geographie', label: 'Géographie' },
          { value: 'sport', label: 'Sport' },
          { value: 'divertissement', label: 'Divertissement' },
          { value: 'technologie', label: 'Technologie' },
          { value: 'autre', label: 'Autre' }
        ];
        
        setCategories(defaultCategories);
        if (defaultCategories.length > 0) {
          setFormData(prev => ({ ...prev, category: defaultCategories[0].value }));
        }
      } catch (err) {
        console.error('Erreur lors du chargement des catégories:', err);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError('');
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({ ...formData, [name]: checked });
  };

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

  const handleAddQuestion = () => {
    // Validation
    if (!currentQuestion.text.trim()) {
      setError('Le texte de la question est obligatoire.');
      return;
    }

    if (currentQuestion.options.some((opt, idx) => idx < 2 && !opt.trim())) {
      setError('Les deux premières options sont obligatoires.');
      return;
    }

    // Filtrer les options vides à la fin (mais garder au moins 2)
    let validOptions = currentQuestion.options.filter(opt => opt.trim() !== '');
    if (validOptions.length < 2) {
      setError('Au moins deux options sont requises.');
      return;
    }

    const newQuestionId = Date.now().toString();
    const newQuestion = { 
      ...currentQuestion, 
      id: newQuestionId,
      options: validOptions,
      // Si l'option correcte a été supprimée, utiliser la première
      correctOptionIndex: currentQuestion.correctOptionIndex >= validOptions.length 
        ? 0 
        : currentQuestion.correctOptionIndex
    };
    
    setFormData({
      ...formData,
      questions: [...formData.questions, newQuestion],
    });

    setError('');

    // Réinitialiser le formulaire de question
    setCurrentQuestion({
      id: '',
      text: '',
      options: ['', '', '', ''],
      correctOptionIndex: 0,
      timeLimit: 30,
    });
  };

  const handleRemoveQuestion = (id: string) => {
    setFormData({
      ...formData,
      questions: formData.questions.filter(q => q.id !== id),
    });
  };

  const handleEditQuestion = (question: Question) => {
    setCurrentQuestion(question);
    // Supprimer la question de la liste pour éviter les doublons
    handleRemoveQuestion(question.id);
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setError('Le titre du quiz est obligatoire.');
      return false;
    }

    if (!formData.description.trim()) {
      setError('La description du quiz est obligatoire.');
      return false;
    }

    if (!formData.category) {
      setError('Veuillez sélectionner une catégorie.');
      return false;
    }

    if (formData.questions.length < 1) {
      setError('Veuillez ajouter au moins une question.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);

    try {
      // Dans une application réelle, on appellerait le service API
      // const response = await apiService.createQuiz(formData);
      
      // Simulation d'un appel API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Rediriger vers le tableau de bord après la création
      router.push('/dashboard');
    } catch (error) {
      console.error('Erreur lors de la création du quiz:', error);
      setError('Une erreur est survenue lors de la création du quiz.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (!formData.title.trim() || !formData.description.trim() || !formData.category) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    setCurrentStep('questions');
    setError('');
  };

  const handleBack = () => {
    setCurrentStep('info');
    setError('');
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      {currentStep === 'info' ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-slate-900/50 backdrop-blur-xl rounded-xl shadow-xl overflow-hidden"
        >
          <ShineBorder className="p-6">
            <h2 className="text-2xl font-bold mb-6 text-white">Informations du Quiz</h2>
            {error && <div className="p-4 mb-4 text-sm text-red-400 bg-red-900/20 rounded-lg">{error}</div>}
            
            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium text-gray-200 mb-1">
                Titre du Quiz *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full p-3 bg-slate-800 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
                placeholder="Entrez le titre du quiz"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-200 mb-1">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full p-3 bg-slate-800 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white min-h-[100px]"
                placeholder="Décrivez votre quiz"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="category" className="block text-sm font-medium text-gray-200 mb-1">
                Catégorie *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full p-3 bg-slate-800 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
                required
                disabled={isLoadingCategories}
              >
                {isLoadingCategories ? (
                  <option>Chargement des catégories...</option>
                ) : (
                  categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="mb-6 flex items-center">
              <input
                type="checkbox"
                id="isPublic"
                name="isPublic"
                checked={formData.isPublic}
                onChange={handleCheckboxChange}
                className="w-4 h-4 bg-slate-800 border-gray-700 rounded focus:ring-blue-500"
              />
              <label htmlFor="isPublic" className="ml-2 text-sm font-medium text-gray-200">
                Quiz public
              </label>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg text-white font-medium transition-all"
              >
                Suivant
              </button>
            </div>
          </ShineBorder>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-slate-900/50 backdrop-blur-xl rounded-xl shadow-xl overflow-hidden"
        >
          <ShineBorder className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Questions du Quiz</h2>
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2 border border-gray-600 hover:bg-slate-800 rounded-lg text-gray-200 text-sm transition-all"
              >
                Retour
              </button>
            </div>
            
            {error && <div className="p-4 mb-4 text-sm text-red-400 bg-red-900/20 rounded-lg">{error}</div>}
            
            <div className="mb-6 bg-slate-800/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3 text-gray-200">Ajouter une nouvelle question</h3>
              
              <div className="mb-4">
                <label htmlFor="questionText" className="block text-sm font-medium text-gray-300 mb-1">
                  Question *
                </label>
                <input
                  type="text"
                  id="text"
                  name="text"
                  value={currentQuestion.text}
                  onChange={handleQuestionChange}
                  className="w-full p-3 bg-slate-700/50 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
                  placeholder="Entrez votre question"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Options (minimum 2) *
                </label>
                {currentQuestion.options.map((option, idx) => (
                  <div key={idx} className="flex items-center mb-2">
                    <input
                      type="radio"
                      name="correctOption"
                      checked={currentQuestion.correctOptionIndex === idx}
                      onChange={() => handleCorrectOptionChange(idx)}
                      className="mr-2 w-4 h-4"
                    />
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      className="w-full p-2 bg-slate-700/50 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
                      placeholder={`Option ${idx + 1}`}
                    />
                  </div>
                ))}
                <p className="text-xs text-gray-400 mt-1">Sélectionnez la réponse correcte</p>
              </div>
              
              <div className="mb-4">
                <label htmlFor="timeLimit" className="block text-sm font-medium text-gray-300 mb-1">
                  Temps limite (secondes)
                </label>
                <input
                  type="number"
                  id="timeLimit"
                  name="timeLimit"
                  value={currentQuestion.timeLimit}
                  onChange={handleQuestionChange}
                  min="5"
                  max="120"
                  className="w-full p-2 bg-slate-700/50 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
                />
              </div>
              
              <button
                type="button"
                onClick={handleAddQuestion}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-all"
              >
                Ajouter la question
              </button>
            </div>
            
            {formData.questions.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-gray-200">Questions ajoutées ({formData.questions.length})</h3>
                <div className="space-y-3">
                  {formData.questions.map((question, idx) => (
                    <div key={question.id} className="p-3 bg-slate-800/50 border border-gray-700 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-sm font-semibold text-blue-400">Question {idx + 1}</span>
                          <p className="text-white">{question.text}</p>
                          <div className="mt-1 space-y-1">
                            {question.options.map((opt, optIdx) => (
                              <div key={optIdx} className="text-sm flex items-center">
                                <span 
                                  className={`w-2 h-2 rounded-full mr-2 ${
                                    optIdx === question.correctOptionIndex 
                                      ? 'bg-green-500' 
                                      : 'bg-gray-500'
                                  }`}
                                ></span>
                                <span className={optIdx === question.correctOptionIndex ? 'text-green-400' : 'text-gray-300'}>
                                  {opt}
                                </span>
                              </div>
                            ))}
                          </div>
                          <span className="text-xs text-gray-400 mt-1 block">
                            Temps: {question.timeLimit} secondes
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            type="button"
                            onClick={() => handleEditQuestion(question)}
                            className="p-1 text-blue-400 hover:text-blue-300"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestion(question.id)}
                            className="p-1 text-red-400 hover:text-red-300"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg text-white font-medium transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Création en cours...
                </span>
              ) : (
                'Créer le Quiz'
              )}
            </button>
          </ShineBorder>
        </motion.div>
      )}
    </div>
  );
};

export default CreateQuiz; 