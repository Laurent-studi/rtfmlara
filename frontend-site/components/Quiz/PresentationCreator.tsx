'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShineBorder } from '@/components/magicui/shine-border';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface PresentationCreatorProps {
  quiz: any;
  onCancel?: () => void;
}

export default function PresentationCreator({ quiz, onCancel }: PresentationCreatorProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Options de présentation
  const [showTimer, setShowTimer] = useState(true);
  const [showLeaderboardBetweenQuestions, setShowLeaderboardBetweenQuestions] = useState(true);
  const [pointsMultiplier, setPointsMultiplier] = useState(1.0);
  
  const startPresentation = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.post('presentation/sessions', {
        quiz_id: quiz.id,
        session_settings: {
          show_timer: showTimer,
          show_leaderboard_between: showLeaderboardBetweenQuestions,
          points_multiplier: pointsMultiplier
        }
      });
      
      console.log('🔍 Réponse complète:', response);
      
      if (response.success && response.data) {
        const sessionId = response.data.session?.id || response.data.id;
        console.log('🎯 Session ID extrait:', sessionId);
        
        if (sessionId) {
          // Rediriger vers la page de présentation
          const url = `/quiz/present/${sessionId}`;
          console.log('🚀 Navigation vers:', url);
          router.push(url);
        } else {
          setError('ID de session manquant dans la réponse');
        }
      } else {
        setError(response.message || 'Une erreur est survenue lors de la création de la session');
      }
    } catch (err: any) {
      console.error('❌ Erreur lors de la création de la session:', err);
      setError(err.message || 'Une erreur est survenue lors de la création de la session');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/10 max-w-2xl mx-auto relative overflow-hidden"
    >
      <ShineBorder borderWidth={1} duration={14} shineColor={["#4f46e5", "#7c3aed", "#ec4899"]} />
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Présenter ce quiz</h1>
        <p className="text-gray-300">
          Vous êtes sur le point de démarrer une session de présentation pour le quiz «&nbsp;{quiz.title}&nbsp;»
        </p>
      </div>
      
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-white p-4 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      <div className="space-y-6">
        <div className="bg-white/10 rounded-xl p-4 border border-white/20">
          <h2 className="text-xl font-semibold text-white mb-3">Détails du quiz</h2>
          
          <div className="grid grid-cols-2 gap-4 text-gray-300">
            <div>
              <p className="text-gray-400 text-sm">Titre</p>
              <p className="font-medium">{quiz.title}</p>
            </div>
            
            <div>
              <p className="text-gray-400 text-sm">Catégorie</p>
              <p className="font-medium">{quiz.category || 'Non catégorisé'}</p>
            </div>
            
            <div>
              <p className="text-gray-400 text-sm">Questions</p>
              <p className="font-medium">{quiz.questions?.length || 0} questions</p>
            </div>
            
            <div>
              <p className="text-gray-400 text-sm">Temps par question</p>
              <p className="font-medium">{quiz.time_per_question || 30} secondes</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/10 rounded-xl p-4 border border-white/20">
          <h2 className="text-xl font-semibold text-white mb-3">Options de présentation</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-gray-300">Afficher le chronomètre</label>
              <div className="relative inline-flex">
                <input
                  type="checkbox"
                  checked={showTimer}
                  onChange={(e) => setShowTimer(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-gray-300">Afficher le classement entre les questions</label>
              <div className="relative inline-flex">
                <input
                  type="checkbox"
                  checked={showLeaderboardBetweenQuestions}
                  onChange={(e) => setShowLeaderboardBetweenQuestions(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </div>
            </div>
            
            <div>
              <label className="text-gray-300 block mb-2">Multiplicateur de points</label>
              <select
                value={pointsMultiplier}
                onChange={(e) => setPointsMultiplier(parseFloat(e.target.value))}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={0.5}>×0.5 (Plus facile)</option>
                <option value={1.0}>×1.0 (Normal)</option>
                <option value={1.5}>×1.5 (Plus difficile)</option>
                <option value={2.0}>×2.0 (Expert)</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-white/10 text-white font-medium rounded-xl shadow-lg hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all flex-1"
          >
            Annuler
          </button>
          
          <button
            type="button"
            onClick={startPresentation}
            disabled={isLoading}
            className={`flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl shadow-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all ${
              isLoading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Création de la session...
              </span>
            ) : (
              "Démarrer la présentation"
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}