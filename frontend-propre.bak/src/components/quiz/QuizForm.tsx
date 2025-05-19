'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiService, Quiz } from '../../../lib/api';

interface QuizFormProps {
  quizId?: number; // Si présent, on est en mode édition
}

export default function QuizForm({ quizId }: QuizFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<Partial<Quiz>>({
    title: '',
    description: '',
    category: '',
    timePerQuestion: 30,
    multipleAnswers: false,
    status: 'draft'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [loadingQuiz, setLoadingQuiz] = useState(!!quizId);

  const isEditMode = !!quizId;

  useEffect(() => {
    // Charger les catégories disponibles
    const fetchCategories = async () => {
      try {
        // Idéalement, vous auriez un endpoint API pour récupérer les catégories
        // Ici, on utilise des catégories statiques pour l'exemple
        setCategories(['Programmation', 'Mathématiques', 'Science', 'Histoire', 'Géographie', 'Langues', 'Autre']);
      } catch (error) {
        console.error('Erreur lors du chargement des catégories', error);
      }
    };

    // Si on est en mode édition, charger les données du quiz
    const fetchQuizData = async () => {
      if (!quizId) return;
      
      try {
        const quizData = await apiService.getQuiz(quizId);
        setFormData({
          title: quizData.title,
          description: quizData.description,
          category: quizData.category,
          timePerQuestion: quizData.timePerQuestion,
          multipleAnswers: quizData.multipleAnswers,
          status: quizData.status
        });
      } catch (err: any) {
        setError(err.message || 'Erreur lors du chargement du quiz');
      } finally {
        setLoadingQuiz(false);
      }
    };

    fetchCategories();
    if (isEditMode) {
      fetchQuizData();
    }
  }, [quizId, isEditMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData({
      ...formData,
      [name]: val
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isEditMode && quizId) {
        await apiService.updateQuiz(quizId, formData);
        router.push(`/quiz/${quizId}`);
      } else {
        const createdQuiz = await apiService.createQuiz(formData);
        router.push(`/quiz/${createdQuiz.id}`);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'enregistrement du quiz');
      setLoading(false);
    }
  };

  if (loadingQuiz) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-200 mb-8">
        {isEditMode ? 'Modifier le quiz' : 'Créer un nouveau quiz'}
      </h1>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
              Titre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              required
            ></textarea>
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
              Catégorie <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              required
            >
              <option value="">Sélectionner une catégorie</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="timePerQuestion" className="block text-sm font-medium text-gray-300 mb-2">
              Temps par question (en secondes)
            </label>
            <input
              type="number"
              id="timePerQuestion"
              name="timePerQuestion"
              value={formData.timePerQuestion}
              onChange={handleChange}
              min="5"
              max="300"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="multipleAnswers"
              name="multipleAnswers"
              checked={formData.multipleAnswers}
              onChange={handleChange}
              className="h-5 w-5 text-indigo-600 border-gray-500 rounded focus:ring-indigo-500"
            />
            <label htmlFor="multipleAnswers" className="ml-2 block text-sm text-gray-300">
              Autoriser plusieurs réponses par question
            </label>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-2">
              Statut
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            >
              <option value="draft">Brouillon</option>
              <option value="published">Publié</option>
              <option value="archived">Archivé</option>
            </select>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Enregistrement...' : isEditMode ? 'Mettre à jour' : 'Créer'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
