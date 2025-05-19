'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiService, Answer } from '../../../lib/api';

interface AnswerFormProps {
  questionId: number;
  answerId?: number; // Si présent, on est en mode édition
  quizId: number; // Pour la redirection
}

export default function AnswerForm({ questionId, answerId, quizId }: AnswerFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<Partial<Answer>>({
    questionId,
    answerText: '',
    isCorrect: false
  });
  const [loading, setLoading] = useState(false);
  const [loadingAnswer, setLoadingAnswer] = useState(!!answerId);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = !!answerId;

  useEffect(() => {
    // Si on est en mode édition, charger les données de la réponse
    const fetchAnswerData = async () => {
      if (!answerId) return;
      
      try {
        // Ici, il faudrait un endpoint pour récupérer une réponse par son ID
        // Pour le moment, on récupère toutes les réponses de la question et on filtre
        const answers = await apiService.getQuestionAnswers(questionId);
        const answer = answers.find(a => a.id === answerId);
        
        if (answer) {
          setFormData({
            questionId: answer.questionId,
            answerText: answer.answerText,
            isCorrect: answer.isCorrect
          });
        } else {
          setError('Réponse non trouvée');
        }
      } catch (err: any) {
        setError(err.message || 'Erreur lors du chargement de la réponse');
      } finally {
        setLoadingAnswer(false);
      }
    };

    if (isEditMode) {
      fetchAnswerData();
    }
  }, [questionId, answerId, isEditMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    const val = type === 'checkbox' ? checked : value;
    
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
      if (isEditMode && answerId) {
        // Cette fonctionnalité nécessiterait un endpoint dédié à la mise à jour d'une réponse
        // Comme ce n'est pas implémenté, on montre comment cela pourrait être fait
        console.log('Mise à jour de la réponse:', formData);
        // await apiService.updateAnswer(answerId, formData);
        router.push(`/quiz/${quizId}/question/${questionId}`);
      } else {
        await apiService.createAnswer(questionId, formData);
        router.push(`/quiz/${quizId}/question/${questionId}`);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'enregistrement de la réponse');
      setLoading(false);
    }
  };

  if (loadingAnswer) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-200 mb-8">
        {isEditMode ? 'Modifier la réponse' : 'Ajouter une réponse'}
      </h1>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="space-y-6">
          <div>
            <label htmlFor="answerText" className="form-label">
              Réponse <span className="text-red-500">*</span>
            </label>
            <textarea
              id="answerText"
              name="answerText"
              value={formData.answerText}
              onChange={handleChange}
              rows={3}
              className="form-input"
              required
            ></textarea>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isCorrect"
              name="isCorrect"
              checked={formData.isCorrect}
              onChange={handleChange}
              className="h-5 w-5 text-indigo-600 border-gray-500 rounded focus:ring-indigo-500"
            />
            <label htmlFor="isCorrect" className="ml-2 block text-sm text-gray-300">
              Réponse correcte
            </label>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => router.push(`/quiz/${quizId}/question/${questionId}`)}
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Enregistrement...' : isEditMode ? 'Mettre à jour' : 'Ajouter'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
