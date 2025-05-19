import React from 'react';
import { useQuizSocket } from '@/hooks/useQuizSocket';

export const QuizConnectionStatus: React.FC = () => {
  const { isConnected, error } = useQuizSocket();

  return (
    <div className="fixed top-4 right-4 p-4 rounded-lg shadow-lg bg-white">
      <div className="flex items-center space-x-2">
        <div
          className={`w-3 h-3 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`}
        />
        <span className="text-sm font-medium">
          {isConnected ? 'Connecté' : 'Déconnecté'}
        </span>
      </div>
      {error && (
        <div className="mt-2 text-sm text-red-600">
          Erreur: {error.message}
        </div>
      )}
    </div>
  );
}; 