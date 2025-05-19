'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Participant {
  participant_id: number;
  name: string;
  score: number;
  user_id?: number;
}

interface ThreeDLeaderboardProps {
  participants: Participant[];
  showReflection?: boolean;
  onPlayerClick?: (participant: Participant) => void;
  title?: string;
  maxParticipants?: number;
  currentParticipantId?: number;
  animate?: boolean;
}

const ThreeDLeaderboard: React.FC<ThreeDLeaderboardProps> = ({
  participants,
  showReflection = false,
  onPlayerClick,
  title = "Classement",
  maxParticipants = 10,
  currentParticipantId,
  animate = true
}) => {
  const [sortedParticipants, setSortedParticipants] = useState<Participant[]>([]);
  const [maxScore, setMaxScore] = useState(0);
  
  useEffect(() => {
    const sorted = [...participants].sort((a, b) => b.score - a.score);
    setSortedParticipants(sorted.slice(0, maxParticipants));
    
    if (sorted.length > 0) {
      setMaxScore(sorted[0].score);
    }
  }, [participants, maxParticipants]);
  
  const getBarHeight = (score: number) => {
    if (maxScore === 0) return 0;
    // Calcul de la hauteur en pourcentage avec un minimum de 5%
    return Math.max(5, (score / maxScore) * 100);
  };
  
  // Styles pour la réflection
  const reflectionStyle = showReflection ? {
    WebkitBoxReflect: 'below 3px linear-gradient(transparent, transparent 45%, rgba(255, 255, 255, 0.25))',
    marginBottom: '60px'
  } : {};
  
  // Styles pour le conteneur
  const containerStyle = {
    ...reflectionStyle
  };
  
  return (
    <div className="relative w-full max-w-4xl mx-auto p-6">
      {title && <h2 className="text-3xl font-bold text-white mb-6 text-center">{title}</h2>}
      
      <div 
        className="w-full relative" 
        style={containerStyle}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end">
          {sortedParticipants.map((participant, index) => {
            const barHeight = getBarHeight(participant.score);
            const isCurrentParticipant = participant.participant_id === currentParticipantId;
            
            // Détermination des couleurs en fonction de la position
            let colors = {
              barBg: "bg-indigo-600/80",
              barBorder: "border-indigo-400",
              podiumBg: "bg-indigo-700/50",
              podiumBorder: "border-indigo-500/50",
              textColor: "text-white",
              shadowColor: "rgba(79, 70, 229, 0.5)"
            };
            
            if (index === 0) {
              colors = {
                barBg: "bg-yellow-500/80",
                barBorder: "border-yellow-400",
                podiumBg: "bg-yellow-700/50",
                podiumBorder: "border-yellow-500/50",
                textColor: "text-white",
                shadowColor: "rgba(234, 179, 8, 0.5)"
              };
            } else if (index === 1) {
              colors = {
                barBg: "bg-gray-300/80",
                barBorder: "border-gray-200",
                podiumBg: "bg-gray-500/50",
                podiumBorder: "border-gray-400/50",
                textColor: "text-white",
                shadowColor: "rgba(156, 163, 175, 0.5)"
              };
            } else if (index === 2) {
              colors = {
                barBg: "bg-amber-600/80",
                barBorder: "border-amber-500",
                podiumBg: "bg-amber-800/50",
                podiumBorder: "border-amber-600/50",
                textColor: "text-white",
                shadowColor: "rgba(217, 119, 6, 0.5)"
              };
            }
            
            // Classe additionnelle si c'est le participant actuel
            const highlightClass = isCurrentParticipant ? "ring-2 ring-white ring-offset-2 ring-offset-transparent" : "";
            
            return (
              <AnimatePresence key={participant.participant_id}>
                <motion.div
                  initial={animate ? { opacity: 0, y: 50 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="flex flex-col items-center"
                  onClick={() => onPlayerClick && onPlayerClick(participant)}
                >
                  {/* Barre 3D avec effet de profondeur */}
                  <motion.div 
                    className={`w-full relative ${highlightClass}`}
                    style={{ height: `${Math.max(20, barHeight)}px` }}
                    initial={animate ? { height: 0 } : false}
                    animate={{ height: `${Math.max(20, barHeight)}px` }}
                    transition={{ delay: index * 0.1 + 0.3, duration: 0.7 }}
                  >
                    <div 
                      className={`absolute inset-0 rounded-t-lg ${colors.barBg} border ${colors.barBorder}`}
                      style={{
                        boxShadow: `
                          inset -5px -5px 10px rgba(0, 0, 0, 0.3),
                          5px 5px 10px ${colors.shadowColor}
                        `,
                        transform: 'skewY(-5deg)',
                        transformOrigin: 'bottom',
                      }}
                    ></div>
                    
                    {/* Score */}
                    <div className="absolute top-0 left-0 right-0 -mt-8 text-center">
                      <span className={`${colors.textColor} font-bold text-xl`}>
                        {participant.score}
                      </span>
                    </div>
                  </motion.div>
                  
                  {/* Podium avec position et nom */}
                  <div 
                    className={`w-full py-3 px-2 ${colors.podiumBg} border ${colors.podiumBorder} rounded-b-lg text-center mt-1`}
                    style={{
                      boxShadow: `
                        inset -3px -3px 6px rgba(0, 0, 0, 0.2),
                        3px 3px 6px ${colors.shadowColor}
                      `,
                    }}
                  >
                    <div className="flex items-center justify-center mb-1">
                      <span className={`${colors.textColor} font-bold text-lg`}>
                        #{index + 1}
                      </span>
                    </div>
                    <div className="truncate">
                      <span className={`${colors.textColor} font-medium text-sm`}>
                        {participant.name}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ThreeDLeaderboard;