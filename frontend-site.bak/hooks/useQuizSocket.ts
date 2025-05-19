'use client';

import { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseQuizSocketReturn {
  isConnected: boolean;
  error: Error | null;
  
  // Méthodes d'action
  joinQuiz: (playerName: string) => void;
  leaveQuiz: (playerId: string) => void;
  submitAnswer: (playerId: string, questionId: string, answerIndices: number[]) => void;
  startQuiz: () => void;
  nextQuestion: () => void;
  
  // Méthodes d'écoute pour Battle Royale
  onGameStateUpdated: (callback: (state: any) => void) => void;
  onPlayerJoined: (callback: (player: any) => void) => void;
  onPlayerLeft: (callback: (playerId: any) => void) => void;
  onQuestionReceived: (callback: (question: any) => void) => void;
  onTimerUpdated: (callback: (time: number) => void) => void;
  onLeaderboardUpdated: (callback: (leaderboard: any[]) => void) => void;
}

export const useQuizSocket = (): UseQuizSocketReturn => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Initialisation du socket
    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
      path: '/api/socket',
      autoConnect: true,
    });

    // Gestion des événements de connexion
    socketInstance.on('connect', () => {
      setIsConnected(true);
      setError(null);
    });

    socketInstance.on('connect_error', (err) => {
      setError(new Error(`Erreur de connexion: ${err.message}`));
      setIsConnected(false);
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    setSocket(socketInstance);

    // Nettoyage à la déconnexion
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // Méthodes d'action
  const joinQuiz = useCallback((playerName: string) => {
    if (socket && isConnected) {
      socket.emit('join_quiz', { playerName });
    }
  }, [socket, isConnected]);

  const leaveQuiz = useCallback((playerId: string) => {
    if (socket && isConnected) {
      socket.emit('leave_quiz', { playerId });
    }
  }, [socket, isConnected]);

  const submitAnswer = useCallback((playerId: string, questionId: string, answerIndices: number[]) => {
    if (socket && isConnected) {
      socket.emit('submit_answer', { playerId, questionId, answerIndices });
    }
  }, [socket, isConnected]);

  const startQuiz = useCallback(() => {
    if (socket && isConnected) {
      socket.emit('start_quiz');
    }
  }, [socket, isConnected]);

  const nextQuestion = useCallback(() => {
    if (socket && isConnected) {
      socket.emit('next_question');
    }
  }, [socket, isConnected]);

  // Méthodes d'écoute pour Battle Royale
  const onGameStateUpdated = useCallback((callback: (state: any) => void) => {
    if (socket) {
      socket.on('game_state_updated', callback);
      return () => {
        socket.off('game_state_updated', callback);
      };
    }
  }, [socket]);

  const onPlayerJoined = useCallback((callback: (player: any) => void) => {
    if (socket) {
      socket.on('player_joined', callback);
      return () => {
        socket.off('player_joined', callback);
      };
    }
  }, [socket]);

  const onPlayerLeft = useCallback((callback: (playerId: any) => void) => {
    if (socket) {
      socket.on('player_left', callback);
      return () => {
        socket.off('player_left', callback);
      };
    }
  }, [socket]);

  const onQuestionReceived = useCallback((callback: (question: any) => void) => {
    if (socket) {
      socket.on('question_received', callback);
      return () => {
        socket.off('question_received', callback);
      };
    }
  }, [socket]);

  const onTimerUpdated = useCallback((callback: (time: number) => void) => {
    if (socket) {
      socket.on('timer_updated', callback);
      return () => {
        socket.off('timer_updated', callback);
      };
    }
  }, [socket]);

  const onLeaderboardUpdated = useCallback((callback: (leaderboard: any[]) => void) => {
    if (socket) {
      socket.on('leaderboard_updated', callback);
      return () => {
        socket.off('leaderboard_updated', callback);
      };
    }
  }, [socket]);

  return {
    isConnected,
    error,
    joinQuiz,
    leaveQuiz,
    submitAnswer,
    startQuiz,
    nextQuestion,
    onGameStateUpdated,
    onPlayerJoined,
    onPlayerLeft,
    onQuestionReceived,
    onTimerUpdated,
    onLeaderboardUpdated
  };
}; 