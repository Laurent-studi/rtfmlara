'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShineBorder } from '@/components/magicui/shine-border';
import { api } from '@/lib/api';

interface CreateQuizFormProps {
  onSuccess?: (quiz: any) => void;
}

export default function CreateQuizForm({ onSuccess }: CreateQuizFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [quizType, setQuizType] = useState<'manual' | 'random'>('manual');
  
  // État pour le formulaire de quiz standard
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [timePerQuestion, setTimePerQuestion] = useState(30);
  const [code, setCode] = useState('');
  
  // État supplémentaire pour le quiz aléatoire
  const [numberOfQuestions, setNumberOfQuestions] = useState(10);
  const [pointsPerQuestion, setPointsPerQuestion] = useState(3000);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [difficultyLevel, setDifficultyLevel] = useState<number | null>(null);
  
  // Catégories disponibles (normalement chargées depuis l'API)
  const categories = [
    { id: 1, name: 'Technologie' },
    { id: 2, name: 'Science' },
    { id: 3, name: 'Histoire' },
    { id: 4, name: 'Géographie' },
    { id: 5, name: 'Sport' },
    { id: 6, name: 'Culture générale' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      let response;
      
      if (quizType === 'manual') {
        // Créer un quiz standard
        response = await api.post('quizzes', {
          title,
          description,
          category,
          time_per_question: timePerQuestion,
          code: code || undefined
        });
      } else {
        // Créer un quiz aléatoire
        response = await api.post('quizzes/random', {
          title,
          description,
          category,
          time_per_question: timePerQuestion,
          number_of_questions: numberOfQuestions,
          points_per_question: pointsPerQuestion,
          categories: selectedCategories.length > 0 ? selectedCategories : undefined,
          difficulty_level: difficultyLevel,
          code: code || undefined
        });
      }
      
      if (response.success && response.data) {
        setSuccess('Quiz créé avec succès!');
        
        // Reset form
        setTitle('');
        setDescription('');
        setCategory('');
        setTimePerQuestion(30);
        setNumberOfQuestions(10);
        
        // Callback de succès
        if (onSuccess) {
          onSuccess(response.data);
        }
      } else {
        setError(response.message || 'Une erreur est survenue');
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de la création du quiz');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryToggle = (categoryName: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryName)) {
        return prev.filter(cat => cat !== categoryName);
      } else {
        return [...prev, categoryName];
      }
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/10 mb-8 relative overflow-hidden"
    >
      <ShineBorder borderWidth={1} duration={14} shineColor={["#4f46e5", "#7c3aed", "#ec4899"]} />
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Créer un nouveau quiz</h1>
        <p className="text-gray-300">
          Créez votre propre quiz pour défier vos amis et la communauté
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
      
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            type="button"
            onClick={() => setQuizType('manual')}
            className={`px-4 py-3 rounded-xl flex-1 font-medium transition-colors ${
              quizType === 'manual'
                ? 'bg-indigo-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            Création manuelle
          </button>
          <button
            type="button"
            onClick={() => setQuizType('random')}
            className={`px-4 py-3 rounded-xl flex-1 font-medium transition-colors ${
              quizType === 'random'
                ? 'bg-indigo-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            Création aléatoire
          </button>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Champs communs aux deux types de quiz */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-white mb-2">
                Titre du quiz <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Donnez un titre accrocheur à votre quiz"
              />
            </div>
            
            <div>
              <label htmlFor="code" className="block text-white mb-2">
                Code du quiz
              </label>
              <input
                type="text"
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Code unique (optionnel, généré automatiquement si vide)"
                maxLength={6}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="category" className="block text-white mb-2">
                Catégorie principale
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Sélectionnez une catégorie</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label htmlFor="description" className="block text-white mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Décrivez votre quiz en quelques mots"
              rows={3}
            />
          </div>
          
          <div>
            <label htmlFor="timePerQuestion" className="block text-white mb-2">
              Temps par question (secondes)
            </label>
            <input
              type="number"
              id="timePerQuestion"
              value={timePerQuestion}
              onChange={(e) => setTimePerQuestion(parseInt(e.target.value))}
              min={5}
              max={300}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          {/* Champs spécifiques au quiz aléatoire */}
          {quizType === 'random' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6 border-t border-white/10 pt-6"
            >
              <h2 className="text-xl font-semibold text-white">Options pour le quiz aléatoire</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="numberOfQuestions" className="block text-white mb-2">
                    Nombre de questions <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    id="numberOfQuestions"
                    value={numberOfQuestions}
                    onChange={(e) => setNumberOfQuestions(parseInt(e.target.value))}
                    min={1}
                    max={50}
                    required
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="pointsPerQuestion" className="block text-white mb-2">
                    Points par question
                  </label>
                  <input
                    type="number"
                    id="pointsPerQuestion"
                    value={pointsPerQuestion}
                    onChange={(e) => setPointsPerQuestion(parseInt(e.target.value))}
                    min={100}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-white mb-2">
                  Catégories à inclure (optionnel)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {categories.map((cat) => (
                    <label
                      key={cat.id}
                      className="inline-flex items-center p-2 rounded-lg bg-white/10 hover:bg-white/20 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat.name)}
                        onChange={() => handleCategoryToggle(cat.name)}
                        className="hidden"
                      />
                      <div className={`w-4 h-4 rounded mr-2 flex items-center justify-center ${
                        selectedCategories.includes(cat.name) ? 'bg-indigo-600' : 'bg-white/20'
                      }`}>
                        {selectedCategories.includes(cat.name) && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span className="text-white text-sm">{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label htmlFor="difficultyLevel" className="block text-white mb-2">
                  Niveau de difficulté (optionnel)
                </label>
                <select
                  id="difficultyLevel"
                  value={difficultyLevel || ''}
                  onChange={(e) => setDifficultyLevel(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Toutes difficultés</option>
                  <option value="1">Facile (1)</option>
                  <option value="2">Moyen (2)</option>
                  <option value="3">Difficile (3)</option>
                  <option value="4">Expert (4)</option>
                  <option value="5">Maître (5)</option>
                </select>
              </div>
            </motion.div>
          )}
          
          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl shadow-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all ${
                isLoading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Création en cours...
                </span>
              ) : (
                <span>
                  {quizType === 'manual' ? 'Créer mon quiz' : 'Générer un quiz aléatoire'}
                </span>
              )}
            </button>
          </div>
        </div>
      </form>
    </motion.div>
  );
} 