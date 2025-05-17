'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuizSocket } from '@/hooks/useQuizSocket';
import { QuizQuestion } from './QuizQuestion';
import QuizResults from './QuizResults';
import ShineBorder from '@/components/magicui/Shine-border';

// Définition des interfaces
interface Player {
  id: string;
  name: string;
  score: number;
  isActive: boolean;
}

interface Question {
  id: string;
  text: string;
  options: string[];
  correctOptionIndexes: number[];
  timeLimit: number;
}

interface GameState {
  status: 'waiting' | 'active' | 'finished';
  players: Player[];
  currentRound: number;
  totalRounds: number;
}

export interface BattleRoyaleProps {
  quizCode: string;
  playerName?: string;
  isHost?: boolean;
}

export default function BattleRoyale({ quizCode, playerName, isHost = false }: BattleRoyaleProps) {
  // Socket et état du jeu
  const quizSocket = useQuizSocket();
  const [gameState, setGameState] = useState<GameState>({
    status: 'waiting',
    players: [],
    currentRound: 0,
    totalRounds: 10
  });
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [playerId, setPlayerId] = useState<string>('');
  const [leaderboard, setLeaderboard] = useState<Player[]>([]);
  const [correctAnswers, setCorrectAnswers] = useState<number[]>([]);
  const [incorrectAnswers, setIncorrectAnswers] = useState<number[]>([]);
  
  // Connecter au quiz en tant que joueur ou hôte
  useEffect(() => {
    if (quizSocket.isConnected && playerName) {
      quizSocket.joinQuiz(playerName);
    }
  }, [quizSocket.isConnected, playerName]);

  // Écouter les événements de jeu
  useEffect(() => {
    if (!quizSocket.isConnected) return;

    // Définir les fonctions de gestion des événements
    function handleGameStateUpdate(state: GameState) {
      setGameState(state);
    }

    function handlePlayerJoined(player: Player) {
      setGameState(prev => ({
        ...prev,
        players: [...prev.players, player]
      }));
    }

    function handlePlayerLeft(playerId: string) {
      setGameState(prev => ({
        ...prev,
        players: prev.players.filter(p => p.id !== playerId)
      }));
    }

    function handleQuestionReceived(question: Question) {
      setCurrentQuestion(question);
      setTimeLeft(question.timeLimit);
    }

    function handleTimerUpdated(time: number) {
      setTimeLeft(time);
    }

    function handleLeaderboardUpdated(leaderboard: Player[]) {
      setLeaderboard(leaderboard);
      
      // Calculer les réponses correctes/incorrectes pour les résultats
      if (gameState.status === 'finished') {
        // Dans un cas réel, ces données viendraient du serveur
        setCorrectAnswers([0, 1]); // Indices des questions correctes
        setIncorrectAnswers([2]); // Indices des questions incorrectes
      }
    }

    // S'abonner aux événements
    quizSocket.onGameStateUpdated(handleGameStateUpdate);
    quizSocket.onPlayerJoined(handlePlayerJoined);
    quizSocket.onPlayerLeft(handlePlayerLeft);
    quizSocket.onQuestionReceived(handleQuestionReceived);
    quizSocket.onTimerUpdated(handleTimerUpdated);
    quizSocket.onLeaderboardUpdated(handleLeaderboardUpdated);

    // Nettoyer les abonnements
    return () => {
      quizSocket.offGameStateUpdated(handleGameStateUpdate);
      quizSocket.offPlayerJoined(handlePlayerJoined);
      quizSocket.offPlayerLeft(handlePlayerLeft);
      quizSocket.offQuestionReceived(handleQuestionReceived);
      quizSocket.offTimerUpdated(handleTimerUpdated);
      quizSocket.offLeaderboardUpdated(handleLeaderboardUpdated);
    };
  }, [quizSocket, gameState.status]);

  // Gérer la soumission des réponses
  const handleAnswerSubmit = (answerIndices: number[]) => {
    if (currentQuestion && playerId) {
      quizSocket.submitAnswer(playerId, currentQuestion.id, answerIndices);
    }
  };

  // Démarrer le quiz (pour l'hôte)
  const handleStartGame = () => {
    if (isHost) {
      quizSocket.startQuiz();
    }
  };

  // Passer à la question suivante (pour l'hôte)
  const handleNextQuestion = () => {
    if (isHost) {
      quizSocket.nextQuestion();
    }
  };

  // Rendu selon l'état du jeu
  const renderGameContent = () => {
    switch (gameState.status) {
      case 'waiting':
        return renderWaitingRoom();
      case 'active':
        return renderActiveGame();
      case 'finished':
        return renderGameResults();
      default:
        return <div>État du jeu inconnu</div>;
    }
  };

  // Rendu de la salle d'attente
  const renderWaitingRoom = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-gray-800 rounded-lg p-6 max-w-3xl mx-auto"
    >
      <h2 className="text-2xl font-bold text-white mb-4">Salle d'attente - Battle Royale</h2>
      <p className="text-gray-300 mb-6">Code de la partie: <span className="font-bold text-indigo-400">{quizCode}</span></p>
      
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-white mb-2">Joueurs ({gameState.players.length})</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {gameState.players.map(player => (
            <div key={player.id} className="bg-gray-700 rounded p-2 text-white">
              {player.name}
            </div>
          ))}
        </div>
      </div>
      
      {isHost && (
        <ShineBorder>
          <button
            onClick={handleStartGame}
            disabled={gameState.players.length < 1}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-md transition-colors duration-300 disabled:opacity-50"
          >
            {gameState.players.length < 1 
              ? "En attente de joueurs..." 
              : "Démarrer la partie"}
          </button>
        </ShineBorder>
      )}
      
      {!isHost && (
        <p className="text-center text-gray-400 italic">En attente du démarrage par l'hôte...</p>
      )}
    </motion.div>
  );

  // Rendu du jeu actif
  const renderActiveGame = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="mb-4 flex justify-between items-center">
        <div className="text-white">
          <span className="font-bold">Round:</span> {gameState.currentRound}/{gameState.totalRounds}
        </div>
        <div className="bg-gray-800 px-4 py-2 rounded-full text-white">
          <span className="font-bold">Temps:</span> {timeLeft}s
        </div>
      </div>
      
      {currentQuestion ? (
        <QuizQuestion 
          question={{
            id: currentQuestion.id,
            text: currentQuestion.text,
            options: currentQuestion.options
          }}
          timeLeft={timeLeft}
          onAnswerSubmit={handleAnswerSubmit}
        />
      ) : (
        <div className="text-center text-white p-10">Chargement de la question...</div>
      )}
      
      <div className="mt-6 bg-gray-800 rounded-lg p-4">
        <h3 className="text-xl font-bold text-white mb-2">Classement en temps réel</h3>
        <div className="overflow-y-auto max-h-60">
          {leaderboard.slice(0, 10).map((player, index) => (
            <div 
              key={player.id}
              className={`flex justify-between items-center p-2 mb-1 rounded ${
                player.id === playerId ? 'bg-indigo-700' : 'bg-gray-700'
              }`}
            >
              <div className="flex items-center">
                <span className="w-8 text-center font-bold text-gray-400">#{index + 1}</span>
                <span className="text-white">{player.name}</span>
              </div>
              <span className="font-bold text-yellow-400">{player.score} pts</span>
            </div>
          ))}
        </div>
      </div>
      
      {isHost && (
        <div className="mt-4">
          <button
            onClick={handleNextQuestion}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
          >
            Question suivante
          </button>
        </div>
      )}
    </motion.div>
  );

  // Rendu des résultats du jeu
  const renderGameResults = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-4xl mx-auto"
    >
      <h2 className="text-3xl font-bold text-center text-white mb-8">
        Résultats du Battle Royale
      </h2>
      
      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <h3 className="text-2xl font-bold text-white mb-4">Podium</h3>
        <div className="flex flex-wrap justify-center gap-4">
          {leaderboard.slice(0, 3).map((player, index) => (
            <div 
              key={player.id} 
              className={`text-center p-4 rounded-lg ${
                index === 0 ? 'bg-yellow-600' : 
                index === 1 ? 'bg-gray-500' : 
                'bg-amber-700'
              } ${player.id === playerId ? 'ring-2 ring-white' : ''}`}
            >
              <div className="text-2xl font-bold mb-1">#{index + 1}</div>
              <div className="font-bold text-white">{player.name}</div>
              <div className="text-yellow-200 font-semibold">{player.score} points</div>
            </div>
          ))}
        </div>
      </div>
      
      {playerId && (
        <QuizResults
          score={leaderboard.find(p => p.id === playerId)?.score || 0}
          totalQuestions={gameState.totalRounds}
          correctAnswers={correctAnswers}
          incorrectAnswers={incorrectAnswers}
        />
      )}
      
      <div className="mt-8 text-center">
        <ShineBorder>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-md transition-colors"
          >
            Retour au tableau de bord
          </button>
        </ShineBorder>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen p-4">
      <AnimatePresence mode="wait">
        {renderGameContent()}
      </AnimatePresence>
    </div>
  );
} 