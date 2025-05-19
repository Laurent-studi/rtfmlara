'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Particles } from '@/components/magicui/particles';
import { ShineBorder } from '@/components/magicui/shine-border';
import { apiService } from '@/lib/api-service';
import BadgeCard from '@/components/BadgeCard';

interface Badge {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  isEarned?: boolean;
  earnedAt?: string;
  progress?: number;
  requiredCondition?: string;
}

export default function BadgesPage() {
  const [userBadges, setUserBadges] = useState<Badge[]>([]);
  const [availableBadges, setAvailableBadges] = useState<Badge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'earned' | 'available'>('all');
  
  useEffect(() => {
    const fetchBadges = async () => {
      try {
        setIsLoading(true);
        
        // Récupérer les badges de l'utilisateur
        const userBadgesData = await apiService.getUserBadges();
        setUserBadges(userBadgesData);
        
        // Récupérer tous les badges disponibles
        const allBadgesData = await apiService.getBadges();
        
        // Filtrer pour ne garder que les badges non obtenus
        const notEarnedBadges = allBadgesData.filter(
          badge => !userBadgesData.some(userBadge => userBadge.id === badge.id)
        );
        
        setAvailableBadges(notEarnedBadges);
      } catch (err: any) {
        setError(err.message || 'Erreur lors du chargement des badges');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBadges();
  }, []);
  
  const claimBadge = async (badgeId: number) => {
    try {
      // Cette API n'est pas encore disponible, à implémenter côté backend
      await apiService.claimBadge(badgeId);
      
      // Recharger les badges après réclamation
      const userBadgesData = await apiService.getUserBadges();
      setUserBadges(userBadgesData);
      
      // Mettre à jour les badges disponibles
      setAvailableBadges(prev => prev.filter(badge => badge.id !== badgeId));
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la réclamation du badge');
    }
  };
  
  const getFilteredBadges = () => {
    switch (activeFilter) {
      case 'earned':
        return userBadges;
      case 'available':
        return availableBadges;
      case 'all':
      default:
        return [...userBadges, ...availableBadges];
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0D111E] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500 border-r-2 border-indigo-500 mb-4"></div>
          <p>Chargement des badges...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-[#0D111E] relative overflow-hidden">
      <Particles className="absolute inset-0" />
      <Particles className="absolute inset-0" quantity={30} color="#4f46e5" size={0.8} />
      <Particles className="absolute inset-0" quantity={20} color="#7c3aed" size={1.2} />
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="flex items-center justify-between mb-8">
            <Link href="/profile">
              <div className="flex items-center gap-4">
                <Image
                  src="/img/logo6.png"
                  alt="RTFM2Win Logo"
                  width={40}
                  height={40}
                  className="rounded-lg"
                />
                <span className="text-white">Retour au profil</span>
              </div>
            </Link>
          </div>
          
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/10 mb-8">
            <h1 className="text-3xl font-bold text-white mb-6">Mes badges</h1>
            
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 text-red-400 text-sm">
                {error}
              </div>
            )}
            
            <div className="flex space-x-2 mb-6">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeFilter === 'all'
                    ? 'bg-indigo-500 text-white'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                Tous ({userBadges.length + availableBadges.length})
              </button>
              <button
                onClick={() => setActiveFilter('earned')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeFilter === 'earned'
                    ? 'bg-green-500 text-white'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                Obtenus ({userBadges.length})
              </button>
              <button
                onClick={() => setActiveFilter('available')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeFilter === 'available'
                    ? 'bg-purple-500 text-white'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                À débloquer ({availableBadges.length})
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getFilteredBadges().map((badge) => (
                <BadgeCard
                  key={badge.id}
                  id={badge.id}
                  name={badge.name}
                  description={badge.description}
                  imageUrl={badge.imageUrl}
                  isEarned={badge.isEarned}
                  earnedAt={badge.earnedAt}
                  progress={badge.progress}
                  requiredCondition={badge.requiredCondition}
                  onClaim={claimBadge}
                />
              ))}
            </div>
            
            {getFilteredBadges().length === 0 && (
              <div className="text-center py-12">
                <div className="mb-4 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-white font-medium mb-2">Aucun badge dans cette catégorie</p>
                <p className="text-gray-400 text-sm">
                  {activeFilter === 'earned' ? 
                    "Participez à des quiz pour gagner des badges !" : 
                    "Tous les badges disponibles ont été obtenus."}
                </p>
              </div>
            )}
          </div>
          
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/10">
            <h2 className="text-xl font-bold text-white mb-4">Comment obtenir des badges ?</h2>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Participez à des quiz pour débloquer des badges de participation</span>
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Créez vos propres quiz pour gagner des badges de créateur</span>
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Obtenez des scores parfaits pour débloquer des badges de perfection</span>
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Complétez des séries de quiz dans la même catégorie pour des badges spécialisés</span>
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Partagez des quiz sur les réseaux sociaux pour débloquer des badges sociaux</span>
              </li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 