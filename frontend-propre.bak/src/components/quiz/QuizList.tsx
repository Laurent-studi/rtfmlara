'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiService, Quiz } from '../../../lib/api';

export default function QuizList() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const data = await apiService.getQuizzes();
        setQuizzes(data);
      } catch (err: any) {
        setError(err.message || 'Erreur lors du chargement des quiz');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 max-w-3xl mx-auto mt-8">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-200">Tous les Quiz</h1>
        <Link 
          href="/quiz/create" 
          className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg transition-colors"
        >
          Créer un Quiz
        </Link>
      </div>

      {quizzes.length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          <p>Aucun quiz disponible pour le moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <Link href={`/quiz/${quiz.id}`} key={quiz.id}>
              <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-indigo-500/20 transition-all border border-gray-700 hover:border-indigo-500/50">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-semibold text-white truncate">{quiz.title}</h2>
                    <span className="px-2 py-1 text-xs rounded-full bg-gray-700 text-gray-300">
                      {quiz.category}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-3">{quiz.description}</p>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{new Date(quiz.createdAt).toLocaleDateString()}</span>
                    <span>{quiz.status}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
