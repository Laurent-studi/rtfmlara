'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ShineBorder } from '@/components/magicui/shine-border';
import { apiService } from '@/lib/api-service';

export interface BadgeProps {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  isEarned?: boolean;
  earnedAt?: string;
  progress?: number;
  requiredCondition?: string;
  showActions?: boolean;
  onClaim?: (badgeId: number) => Promise<void>;
}

const BadgeCard: React.FC<BadgeProps> = ({
  id,
  name,
  description,
  imageUrl,
  isEarned = false,
  earnedAt,
  progress,
  requiredCondition,
  showActions = true,
  onClaim
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleClaim = async () => {
    if (!onClaim) return;
    
    try {
      setIsLoading(true);
      setError('');
      await onClaim(id);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la réclamation du badge');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className={`bg-white/10 backdrop-blur-md rounded-xl p-4 border ${
        isEarned ? 'border-green-500/30' : 'border-white/10'
      }`}
    >
      <div className="flex flex-col items-center">
        <div className="relative w-20 h-20 mb-3">
          <div className={`absolute inset-0 rounded-full ${isEarned ? 'bg-gradient-to-r from-green-400 to-green-600' : 'bg-gradient-to-r from-gray-600 to-gray-800'} opacity-20`}></div>
          <Image
            src={imageUrl || '/img/default-badge.png'}
            alt={name}
            width={80}
            height={80}
            className={`rounded-full object-cover ${!isEarned && 'grayscale opacity-70'}`}
          />
          {isEarned && (
            <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
        
        <h3 className="text-white font-semibold text-center text-sm">{name}</h3>
        <p className="text-gray-400 text-xs text-center mt-1 mb-3 line-clamp-2">{description}</p>
        
        {error && <p className="text-red-400 text-xs mt-1 mb-2">{error}</p>}
        
        {showActions && (
          <>
            {isEarned ? (
              <div className="text-green-400 text-xs mt-2">
                {earnedAt && `Obtenu le ${new Date(earnedAt).toLocaleDateString('fr-FR')}`}
              </div>
            ) : progress ? (
              <div className="w-full mt-2">
                <div className="w-full bg-white/10 rounded-full h-2 mb-1">
                  <div
                    className="bg-purple-500 h-2 rounded-full"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>{progress}%</span>
                  <span>{requiredCondition}</span>
                </div>
              </div>
            ) : onClaim ? (
              <ShineBorder className="w-full">
                <motion.button
                  onClick={handleClaim}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isLoading}
                  className="w-full py-1.5 px-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg text-xs font-medium disabled:opacity-50"
                >
                  {isLoading ? 'Chargement...' : 'Réclamer'}
                </motion.button>
              </ShineBorder>
            ) : (
              <div className="text-gray-400 text-xs italic">
                {requiredCondition || 'Continuez à jouer pour débloquer'}
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
};

export default BadgeCard; 