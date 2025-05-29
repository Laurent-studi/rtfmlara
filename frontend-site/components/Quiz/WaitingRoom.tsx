'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Users, Crown, Clock, Zap, Trophy, Star } from 'lucide-react';
import QRDisplay from './QRDisplay';

interface Player {
  id: string;
  name: string;
  isHost: boolean;
  joinedAt?: string;
  avatar?: string;
  level?: number;
  badges?: string[];
}

interface WaitingRoomProps {
  players: Player[];
  quizUrl: string;
  quizCode: string;
  isHost: boolean;
  onStartQuiz: () => void;
  quizTitle?: string;
  estimatedDuration?: number;
  totalQuestions?: number;
}

const WaitingRoom: React.FC<WaitingRoomProps> = ({
  players,
  quizUrl,
  quizCode,
  isHost,
  onStartQuiz,
  quizTitle = "Quiz Interactif",
  estimatedDuration = 15,
  totalQuestions = 10,
}) => {
  const [timeWaiting, setTimeWaiting] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeWaiting(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (players.length >= 2 && !showConfetti) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [players.length]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPlayerAvatar = (player: Player) => {
    if (player.avatar) return player.avatar;
    const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500'];
    const colorIndex = player.name.charCodeAt(0) % colors.length;
    return colors[colorIndex];
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Confetti Effect */}
      <AnimatePresence>
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 rounded-full"
                style={{
                  backgroundColor: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'][i % 5],
                  left: `${Math.random() * 100}%`,
                  top: '-10px',
                }}
                initial={{ y: -10, opacity: 1, rotate: 0 }}
                animate={{ 
                  y: window.innerHeight + 10, 
                  opacity: 0, 
                  rotate: 360,
                  x: Math.random() * 200 - 100
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 3, ease: "easeOut" }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          variants={itemVariants}
        >
          <motion.h1 
            className="text-4xl md:text-6xl font-bold text-white mb-4"
            animate={{ 
              textShadow: [
                "0 0 20px rgba(255,255,255,0.5)",
                "0 0 30px rgba(255,255,255,0.8)",
                "0 0 20px rgba(255,255,255,0.5)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {quizTitle}
          </motion.h1>
          <motion.p 
            className="text-xl text-purple-200"
            variants={itemVariants}
          >
            Préparez-vous pour une expérience quiz extraordinaire !
          </motion.p>
        </motion.div>

        {/* Stats Bar */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          variants={itemVariants}
        >
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-center">
            <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{players.length}</div>
            <div className="text-sm text-gray-300">Participants</div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-center">
            <Clock className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{formatTime(timeWaiting)}</div>
            <div className="text-sm text-gray-300">Temps d'attente</div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-center">
            <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{totalQuestions}</div>
            <div className="text-sm text-gray-300">Questions</div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-center">
            <Trophy className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{estimatedDuration}min</div>
            <div className="text-sm text-gray-300">Durée estimée</div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Players Section */}
          <motion.div variants={itemVariants}>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <Users className="w-6 h-6 mr-2" />
                  Participants ({players.length})
                </h2>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full"
                />
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                <AnimatePresence>
                  {players.map((player, index) => (
                    <motion.div
                      key={player.id}
                      initial={{ opacity: 0, x: -50, scale: 0.8 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: 50, scale: 0.8 }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 100,
                        delay: index * 0.1 
                      }}
                      className={`relative overflow-hidden rounded-xl p-4 ${
                        player.isHost 
                          ? 'bg-gradient-to-r from-yellow-500/30 to-orange-500/30 border-2 border-yellow-400/50' 
                          : 'bg-white/5 border border-white/10'
                      } hover:bg-white/10 transition-all duration-300`}
                    >
                      <div className="flex items-center space-x-4">
                        {/* Avatar */}
                        <div className={`relative w-12 h-12 rounded-full ${getPlayerAvatar(player)} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                          {player.name.charAt(0).toUpperCase()}
                          {player.isHost && (
                            <Crown className="absolute -top-1 -right-1 w-5 h-5 text-yellow-400" />
                          )}
                        </div>

                        {/* Player Info */}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-white font-semibold text-lg">{player.name}</span>
                            {player.isHost && (
                              <span className="px-2 py-1 text-xs bg-yellow-500 text-black rounded-full font-bold">
                                HÔTE
                              </span>
                            )}
                            {player.level && (
                              <span className="px-2 py-1 text-xs bg-blue-500 text-white rounded-full">
                                Niv. {player.level}
                              </span>
                            )}
                          </div>
                          {player.joinedAt && (
                            <p className="text-sm text-gray-300">
                              Rejoint il y a {Math.floor((Date.now() - new Date(player.joinedAt).getTime()) / 1000)}s
                            </p>
                          )}
                        </div>

                        {/* Badges */}
                        <div className="flex space-x-1">
                          {player.badges?.map((badge, i) => (
                            <Star key={i} className="w-4 h-4 text-yellow-400" />
                          ))}
                        </div>
                      </div>

                      {/* Animated border for host */}
                      {player.isHost && (
                        <motion.div
                          className="absolute inset-0 rounded-xl border-2 border-yellow-400"
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {players.length === 0 && (
                  <motion.div 
                    className="text-center py-12"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">En attente de participants...</p>
                    <p className="text-gray-500 text-sm mt-2">Partagez le code ou scannez le QR code</p>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>

          {/* QR Code Section */}
          <motion.div variants={itemVariants}>
            <QRDisplay quizUrl={quizUrl} quizCode={quizCode} />
            
            {/* Additional Info */}
            <motion.div 
              className="mt-6 bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20"
              variants={itemVariants}
            >
              <h3 className="text-lg font-semibold text-white mb-3">Comment rejoindre ?</h3>
              <div className="space-y-2 text-sm text-gray-300">
                <p>• Scannez le QR code avec votre téléphone</p>
                <p>• Ou rendez-vous sur le site et entrez le code</p>
                <p>• Partagez le lien direct avec vos amis</p>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Start Button */}
        <AnimatePresence>
          {isHost && players.length >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.8 }}
              className="mt-8 text-center"
            >
              <motion.button
                onClick={onStartQuiz}
                className="relative px-12 py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-2xl font-bold text-xl shadow-2xl overflow-hidden group"
                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}
                whileTap={{ scale: 0.95 }}
                animate={{
                  boxShadow: [
                    "0 0 20px rgba(34, 197, 94, 0.5)",
                    "0 0 30px rgba(34, 197, 94, 0.8)",
                    "0 0 20px rgba(34, 197, 94, 0.5)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />
                <span className="relative z-10 flex items-center justify-center">
                  <Zap className="w-6 h-6 mr-2" />
                  Lancer le Quiz !
                </span>
              </motion.button>
              <motion.p 
                className="mt-3 text-gray-300"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {players.length} participant{players.length > 1 ? 's' : ''} prêt{players.length > 1 ? 's' : ''}
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Waiting Message for Host */}
        {isHost && players.length < 2 && (
          <motion.div 
            className="mt-8 text-center"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <p className="text-gray-300 text-lg">
              En attente d'au moins 2 participants pour commencer...
            </p>
          </motion.div>
        )}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </motion.div>
  );
};

export default WaitingRoom;