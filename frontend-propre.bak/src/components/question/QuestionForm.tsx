'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiService, Question } from '../../../lib/api';

interface QuestionFormProps {
  quizId: number;
  questionId?: number; // Si présent, on est en mode édition
}

export default function QuestionForm({ quizId, questionId }: QuestionFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<Partial<Question>>({
    quizId,
    questionText: '',
    points: 10,
    orderIndex: 0
  });
  const [loading, setLoading] = useState(false);
  const [loadingQuestion, setLoadingQuestion] = useState(!!questionId);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = !!questionId;

  useEffect(() => {
    // Si on est en mode édition, charger les données de la question
    const fetchQuestionData = async () => {
      if (!questionId) return;
      
      try {
        // Ici, il faudrait un endpoint pour récupérer une question par son ID
        // Pour le moment, on récupère toutes les questions du quiz et on filtre
        const questions = await apiService.getQuizQuestions(quizId);
        const question = questions.find(q => q.id === questionId);
        
        if (question) {
          setFormData({
            quizId: question.quizId,
            questionText: question.questionText,
            points: question.points,
            orderIndex: question.orderIndex
          });
        } else {
          setError('Question non trouvée');
        }
      } catch (err: any) {
        setError(err.message || 'Erreur lors du chargement de la question');
      } finally {
        setLoadingQuestion(false);
      }
    };

    if (isEditMode) {
      fetchQuestionData();
    }
  }, [quizId, questionId, isEditMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'number' ? parseInt(value) : value;
    
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
      if (isEditMode && questionId) {
        // Cette fonctionnalité nécessiterait un endpoint dédié à la mise à jour d'une question
        // Comme ce n'est pas implémenté, on montre comment cela pourrait être fait
        console.log('Mise à jour de la question:', formData);
        // await apiService.updateQuestion(questionId, formData);
        router.push(`/quiz/${quizId}`);
      } else {
        await apiService.createQuestion(quizId, formData);
        router.push(`/quiz/${quizId}`);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'enregistrement de la question');
      setLoading(false);
    }
  };

  if (loadingQuestion) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-200 mb-8">
        {isEditMode ? 'Modifier la question' : 'Ajouter une question'}
      </h1>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="space-y-6">
          <div>
            <label htmlFor="questionText" className="form-label">
              Question <span className="text-red-500">*</span>
            </label>
            <textarea
              id="questionText"
              name="questionText"
              value={formData.questionText}
              onChange={handleChange}
              rows={4}
              className="form-input"
              required
            ></textarea>
          </div>

          <div>
            <label htmlFor="points" className="form-label">
              Points
            </label>
            <input
              type="number"
              id="points"
              name="points"
              value={formData.points}
              onChange={handleChange}
              min="1"
              max="100"
              className="form-input"
            />
          </div>

          <div>
            <label htmlFor="orderIndex" className="form-label">
              Ordre d'affichage
            </label>
            <input
              type="number"
              id="orderIndex"
              name="orderIndex"
              value={formData.orderIndex}
              onChange={handleChange}
              min="0"
              className="form-input"
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => router.push(`/quiz/${quizId}`)}
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
