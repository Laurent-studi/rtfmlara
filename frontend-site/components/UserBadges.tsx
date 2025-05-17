'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import BadgeCard from './BadgeCard';
import { apiService } from '@/lib/api-service';

interface Badge {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  isEarned: boolean;
  earnedAt?: string;
}

interface UserBadgesProps {
  userId?: string; // Si non fourni, utilise l'utilisateur courant
  limit?: number; // Nombre max de badges à afficher
  showLink?: boolean; // Afficher le lien vers tous les badges
}

const UserBadges: React.FC<UserBadgesProps> = ({
  userId,
  limit = 3,
  showLink = true
}) => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        setIsLoading(true);
        let badgesData;
        
        if (userId) {
          // Cette API n'est pas encore implémentée
          badgesData = await apiService.getUserBadgesById(userId);
        } else {
          badgesData = await apiService.getUserBadges();
        }
        
        setBadges(badgesData.slice(0, limit));
      } catch (err: any) {
        setError(err.message || "Erreur lors du chargement des badges");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBadges();
  }, [userId, limit]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-indigo-500 border-r-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 text-sm py-2">{error}</div>
    );
  }

  if (badges.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-400 text-sm">Aucun badge obtenu pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {badges.map(badge => (
          <BadgeCard
            key={badge.id}
            id={badge.id}
            name={badge.name}
            description={badge.description}
            imageUrl={badge.imageUrl}
            isEarned={true} // Tous les badges affichés ici sont déjà gagnés
            earnedAt={badge.earnedAt}
            showActions={false} // Pas besoin des actions dans ce composant
          />
        ))}
      </div>
      
      {showLink && (
        <div className="text-center pt-2">
          <Link href="/profile/badges">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="py-2 px-4 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-200 text-sm"
            >
              Voir tous mes badges
            </motion.button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default UserBadges; 