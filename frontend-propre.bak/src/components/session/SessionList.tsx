'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiService, QuizSession } from '../../../lib/api';

export default function SessionList() {
  const router = useRouter();
  const [sessions, setSessions] = useState<QuizSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        // Ici, il faudrait un endpoint pour récupérer toutes les sessions
        // Pour le moment, on simule avec un tableau vide
        setSessions([]);
        // Quand l'API sera prête:
        // const data = await apiService.getQuizSessions();
        // setSessions(data);
      } catch (err: any) {
        setError(err.message || 'Erreur lors du chargement des sessions');
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const createSession = async (quizId: number) => {
    try {
      const session = await apiService.createQuizSession(quizId);
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-200">Sessions</h1>
        <Link href="/quiz" className="btn-primary">
          Nouveau quiz
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 max-w-3xl mx-auto mb-8">
          <p>{error}</p>
        </div>
      )}

      {sessions.length === 0 ? (
        <div className="text-center text-gray-400 py-16 bg-gray-800 rounded-lg border border-gray-700">
          <p className="text-xl mb-4">Vous n'avez aucune session en cours</p>
          <p className="mb-8">Sélectionnez un quiz pour commencer une nouvelle session.</p>
          <Link href="/quiz" className="btn-primary">
            Parcourir les quiz
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session) => (
            <div key={session.id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg border border-gray-700">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold text-white">Session #{session.id}</h2>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    session.status === 'active' 
                      ? 'bg-green-500/20 text-green-400' 
                      : session.status === 'completed'
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {session.status}
                  </span>
                </div>
                
                <p className="text-gray-400 text-sm mb-4">
                  {session.status === 'active' 
                    ? 'Session en cours' 
                    : session.status === 'completed'
                    ? 'Session terminée'
                    : 'Session en attente'}
                </p>
                
                <div className="text-sm text-gray-500 mb-4">
                  <p>Démarré le: {new Date(session.startedAt).toLocaleString()}</p>
                  {session.endedAt && (
                    <p>Terminé le: {new Date(session.endedAt).toLocaleString()}</p>
                  )}
                </div>
                
                <div className="flex justify-end">
                  <Link 
                    href={`/session/${session.id}`}
                    className="btn-primary"
                  >
                    {session.status === 'pending' 
                      ? 'Démarrer' 
                      : session.status === 'active'
                      ? 'Rejoindre'
                      : 'Voir résultats'}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
