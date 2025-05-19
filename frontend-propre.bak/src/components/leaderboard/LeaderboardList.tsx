'use client';

import { useState, useEffect } from 'react';
import { apiService, LeaderboardEntry } from '../../../lib/api';
import { authService } from '../../../lib/auth';
import Link from 'next/link';

export default function LeaderboardList() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState('all');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = await authService.checkAuth();
      setIsAuthenticated(isAuth);
    };
    
    checkAuth();
  }, []);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        if (!isAuthenticated) {
          // Si l'utilisateur n'est pas authentifié, on ne fait pas d'appel API
          setError("Vous devez être connecté pour accéder aux classements");
          setLoading(false);
          return;
        }
        
        let data;
        if (category === 'all') {
          data = await apiService.getLeaderboard();
        } else {
          data = await apiService.getLeaderboardByCategory(category);
        }
        setLeaderboard(data);
        setError(null);
      } catch (err: any) {
        if (err.message && err.message.includes('401')) {
          setError('Vous devez être connecté pour accéder aux classements');
        } else if (err.message && err.message.includes('404')) {
          setError('Ce classement n\'est pas encore disponible');
        } else {
          setError(err.message || 'Erreur lors du chargement du classement');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [category, isAuthenticated]);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategory(e.target.value);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg border border-gray-700">
      <div className="p-4 border-b border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-lg font-semibold text-white">Classement</h2>
        <div>
          <select
            value={category}
            onChange={handleCategoryChange}
            className="bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Tous les quiz</option>
            <option value="weekly">Cette semaine</option>
            <option value="monthly">Ce mois</option>
            <option value="programming">Programmation</option>
            <option value="science">Science</option>
            <option value="history">Histoire</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="p-6 text-center">
          <p className="text-red-400 mb-4">{error}</p>
          {error.includes('connecté') && (
            <Link href="/auth/login" className="btn-primary">
              Se connecter
            </Link>
          )}
        </div>
      )}

      {!error && leaderboard.length === 0 && (
        <div className="p-6 text-center text-gray-400">
          <p>Aucune donnée de classement disponible</p>
        </div>
      )}

      {!error && leaderboard.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="p-3 text-left text-sm font-semibold text-gray-300">Rang</th>
                <th className="p-3 text-left text-sm font-semibold text-gray-300">Utilisateur</th>
                <th className="p-3 text-right text-sm font-semibold text-gray-300">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {leaderboard.map((entry) => (
                <tr 
                  key={entry.userId} 
                  className="hover:bg-gray-700/30 transition-colors"
                >
                  <td className="p-3 text-gray-300 whitespace-nowrap">
                    <div className="flex items-center">
                      {entry.rank === 1 && <span className="text-xl mr-2">🥇</span>}
                      {entry.rank === 2 && <span className="text-xl mr-2">🥈</span>}
                      {entry.rank === 3 && <span className="text-xl mr-2">🥉</span>}
                      {entry.rank > 3 && <span className="text-gray-500 font-medium mr-2">{entry.rank}</span>}
                    </div>
                  </td>
                  <td className="p-3 text-white">{entry.username}</td>
                  <td className="p-3 text-right text-indigo-400 font-medium">{entry.score} pts</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 