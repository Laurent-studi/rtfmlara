'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiService, Quiz, Question, Answer } from '../../../lib/api';

interface QuizDetailProps {
  quizId: number;
}

export default function QuizDetail({ quizId }: QuizDetailProps) {
  const router = useRouter();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    const fetchQuizDetails = async () => {
      try {
        const quizData = await apiService.getQuiz(quizId);
        setQuiz(quizData);
        
        const questionsData = await apiService.getQuizQuestions(quizId);
        setQuestions(questionsData);
      } catch (err: any) {
        setError(err.message || 'Erreur lors du chargement du quiz');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizDetails();
  }, [quizId]);

  const handleDeleteQuiz = async () => {
    if (!quiz) return;
    
    try {
      await apiService.deleteQuiz(quiz.id);
      router.push('/quiz');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression du quiz');
    }
  };

  const startQuizSession = async () => {
    if (!quiz) return;
    
    try {
      const session = await apiService.createQuizSession(quiz.id);
      router.push(`/session/${session.id}`);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création de la session');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 max-w-3xl mx-auto mt-8">
        <p>{error || 'Quiz non trouvé'}</p>
        <Link href="/quiz" className="text-indigo-400 hover:underline block mt-4">
          Retour à la liste
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-200">{quiz.title}</h1>
        <div className="flex space-x-4">
          <Link 
            href={`/quiz/edit/${quiz.id}`}
            className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg transition-colors"
          >
            Modifier
          </Link>
          <button 
            onClick={() => setDeleteConfirmOpen(true)}
            className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
          >
            Supprimer
          </button>
          <button
            onClick={startQuizSession}
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
          >
            Démarrer une session
          </button>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="px-3 py-1 text-sm rounded-full bg-gray-700 text-gray-300 inline-block mb-2">
              {quiz.category}
            </span>
            <p className="text-gray-400 mb-4">{quiz.description}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-500 text-sm">Créé le {new Date(quiz.createdAt).toLocaleDateString()}</p>
            <p className="text-gray-500 text-sm">Statut: {quiz.status}</p>
          </div>
        </div>
        <div className="flex space-x-4 text-sm">
          <p className="text-gray-400">Temps par question: {quiz.timePerQuestion}s</p>
          <p className="text-gray-400">Réponses multiples: {quiz.multipleAnswers ? 'Oui' : 'Non'}</p>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-200">Questions ({questions.length})</h2>
          <Link 
            href={`/quiz/${quiz.id}/question/create`}
            className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg transition-colors"
          >
            Ajouter une question
          </Link>
        </div>

        {questions.length === 0 ? (
          <div className="text-center text-gray-400 py-8 bg-gray-800 rounded-lg border border-gray-700">
            <p>Aucune question pour ce quiz. Commencez par en ajouter une.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((question, index) => (
              <div key={question.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-medium text-white">
                    {index + 1}. {question.questionText}
                  </h3>
                  <span className="text-gray-400 text-sm">{question.points} points</span>
                </div>
                {/* Ici, on pourrait afficher les réponses si elles sont disponibles */}
              </div>
            ))}
          </div>
        )}
      </div>

      {deleteConfirmOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">Confirmer la suppression</h3>
            <p className="text-gray-400 mb-6">
              Êtes-vous sûr de vouloir supprimer ce quiz? Cette action est irréversible.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setDeleteConfirmOpen(false)}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteQuiz}
                className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
