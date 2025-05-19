'use client';

import { motion } from 'framer-motion';

interface Player {
  id: string;
  name: string;
  score: number;
}

interface LeaderboardProps {
  players: Player[];
  currentPlayerId?: string;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ players, currentPlayerId }) => {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white/10 backdrop-blur-lg rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-white mb-6">Classement</h2>
      <div className="space-y-4">
        {sortedPlayers.map((player, index) => (
          <motion.div
            key={player.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex items-center justify-between p-4 rounded-lg ${
              player.id === currentPlayerId
                ? 'bg-gradient-to-r from-indigo-500/50 to-purple-500/50'
                : 'bg-white/5'
            }`}
          >
            <div className="flex items-center">
              <span className="text-2xl font-bold text-white mr-4">#{index + 1}</span>
              <div>
                <p className="text-white font-semibold">{player.name}</p>
                <p className="text-gray-400 text-sm">
                  {player.score.toLocaleString()} points
                </p>
              </div>
            </div>
            {index < 3 && (
              <div className="text-2xl">
                {index === 0 && '🥇'}
                {index === 1 && '🥈'}
                {index === 2 && '🥉'}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard; 