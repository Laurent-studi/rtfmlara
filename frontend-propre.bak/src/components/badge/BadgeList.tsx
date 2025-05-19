'use client';

import { useState, useEffect } from 'react';
import { apiService, Badge } from '../../../lib/api';

export default function BadgeList() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const data = await apiService.getBadges();
        setBadges(data);
      } catch (err: any) {
        setError(err.message || 'Erreur lors du chargement des badges');
      } finally {
        setLoading(false);
      }
    };

    fetchBadges();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 text-red-400 text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg border border-gray-700">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold text-white">Mes badges</h2>
      </div>

      {badges.length === 0 ? (
        <div className="p-6 text-center text-gray-400">
          <p>Vous n'avez pas encore de badges</p>
          <p className="text-sm mt-2">Participez à des quiz pour en obtenir !</p>
        </div>
      ) : (
        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {badges.map(badge => (
            <div key={badge.id} className="text-center">
              <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                {badge.imageUrl ? (
                  <img 
                    src={badge.imageUrl} 
                    alt={badge.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl">🏆</span>
                )}
              </div>
              <h3 className="text-white font-medium text-sm">{badge.name}</h3>
              <p className="text-gray-400 text-xs mt-1">{badge.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 