 'use client';

import { motion } from 'framer-motion';
import QRDisplay from './QRDisplay';

interface Player {
  id: string;
  name: string;
  isHost: boolean;
}

interface WaitingRoomProps {
  players: Player[];
  quizUrl: string;
  quizCode: string;
  isHost: boolean;
  onStartQuiz: () => void;
}

const WaitingRoom: React.FC<WaitingRoomProps> = ({
  players,
  quizUrl,
  quizCode,
  isHost,
  onStartQuiz,
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl shadow-lg p-6"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Salle d'attente</h2>
            <div className="space-y-4">
              {players.map((player) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    player.isHost ? 'bg-gradient-to-r from-indigo-500/50 to-purple-500/50' : 'bg-white/5'
                  }`}
                >
                  <div className="flex items-center">
                    <span className="text-white font-semibold">{player.name}</span>
                    {player.isHost && (
                      <span className="ml-2 px-2 py-1 text-xs bg-indigo-500 text-white rounded-full">
                        Hôte
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}

              {players.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  En attente de participants...
                </div>
              )}
            </div>
          </motion.div>
        </div>

        <div>
          <QRDisplay quizUrl={quizUrl} quizCode={quizCode} />
        </div>
      </div>

      {isHost && players.length >= 2 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 text-center"
        >
          <button
            onClick={onStartQuiz}
            className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Lancer le Quiz
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default WaitingRoom;