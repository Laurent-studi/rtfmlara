'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

interface User {
  id: number;
  username: string;
  email: string;
  avatar: string | null;
  trophies_count?: number;
  achievement_points?: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [recentQuizzes, setRecentQuizzes] = useState<any[]>([]);
  const [recentTrophies, setRecentTrophies] = useState<any[]>([]);

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    // Charger les données de l'utilisateur
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('user');
        
        // Configurer l'utilisateur avec les données du profil
        if (response.success && response.data) {
          setUser(response.data);
          
          // Charger les quiz récents
          try {
            const quizzesResponse = await api.get('quizzes/recent');
            if (quizzesResponse.success) {
              setRecentQuizzes(quizzesResponse.data.quizzes || []);
            }
          } catch (error) {
            console.error('Erreur lors du chargement des quiz récents:', error);
          }
          
          // Charger les trophées récents
          try {
            const trophiesResponse = await api.get('achievements/recent');
            if (trophiesResponse.success) {
              setRecentTrophies(trophiesResponse.data.achievements || []);
            }
          } catch (error) {
            console.error('Erreur lors du chargement des trophées récents:', error);
          }
        }
      } catch (error: any) {
        setError('Erreur de chargement du profil: ' + (error.message || 'Veuillez vous reconnecter'));
        // Si l'erreur est liée à l'authentification, rediriger vers la page de connexion
        if (error.status === 401) {
          localStorage.removeItem('auth_token');
          router.push('/auth/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00ffff]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/20 text-white p-4 rounded-lg">
        {error}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-10">
        <p className="text-white">Session expirée, veuillez vous reconnecter.</p>
        <button
          onClick={() => router.push('/auth/login')}
          className="mt-4 px-4 py-2 bg-[#00ffff] text-black rounded"
        >
          Se connecter
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Titre principal */}
      <h1 className="text-[#00ffff] text-3xl font-bold mb-3">Bienvenue, Laurent !</h1>
      
      <p className="text-gray-400 mb-8">Que souhaitez-vous faire aujourd'hui ?</p>
      
      {/* Boutons d'action */}
      <div className="mb-12">
        <button 
          onClick={() => router.push('/quiz/create')}
          className="border border-[#00ffff] text-[#00ffff] hover:bg-[#00ffff]/10 px-4 py-2 mr-4 rounded"
        >
          Créer un quiz
        </button>
        <button 
          onClick={() => router.push('/quiz/search')}
          className="border border-[#00ffff] text-[#00ffff] hover:bg-[#00ffff]/10 px-4 py-2 rounded"
        >
          Rejoindre un quiz
        </button>
      </div>
      
      {/* Statistiques */}
      <div className="mb-12">
        <div className="mb-5">
          <h2 className="text-gray-300 text-lg mb-1">Quiz créés</h2>
          <p className="text-[#00ffff] text-2xl">0</p>
        </div>
        
        <div className="mb-5">
          <h2 className="text-gray-300 text-lg mb-1">🏆 Trophées</h2>
          <p className="text-[#00ffff] text-2xl">0</p>
        </div>
        
        <div className="mb-5">
          <h2 className="text-gray-300 text-lg mb-1">⭐ Points</h2>
          <p className="text-[#00ffff] text-2xl">0</p>
        </div>
      </div>
      
      {/* Quiz récents */}
      <div className="mb-10">
        <h2 className="text-[#00ffff] text-xl mb-4">→ Quiz récents</h2>
        
        {recentQuizzes.length === 0 ? (
          <p className="text-gray-500">
            Aucun quiz récent. C'est le moment d'en créer un !
          </p>
        ) : (
          <div>
            {recentQuizzes.map((quiz) => (
              <div key={quiz.id} className="mb-2">
                <h3 className="text-gray-200">{quiz.title}</h3>
                <p className="text-gray-500 text-sm">{new Date(quiz.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
        
        <button
          onClick={() => router.push('/quiz/history')}
          className="text-[#00ffff] mt-3 hover:underline"
        >
          Voir tous mes quiz
        </button>
      </div>
      
      {/* Trophées récents */}
      <div>
        <h2 className="text-[#00ffff] text-xl mb-4">→ Trophées récents</h2>
        
        {recentTrophies.length === 0 ? (
          <p className="text-gray-500">
            Aucun trophée obtenu. Participez à des quiz pour en gagner !
          </p>
        ) : (
          <div>
            {recentTrophies.map((trophy) => (
              <div key={trophy.id} className="mb-2 flex items-center">
                <span className="mr-2 text-xl">🏆</span>
                <div>
                  <h3 className="text-gray-200">{trophy.name}</h3>
                  <p className="text-gray-500 text-sm">{trophy.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <button
          onClick={() => router.push('/profile/badges')}
          className="text-[#00ffff] mt-3 hover:underline"
        >
          Voir tous mes trophées
        </button>
      </div>
    </div>
  );
} 