import { io, Socket } from 'socket.io-client';
import { apiService } from '../api-service';

// Types
export interface QuizEvent {
  type: string;
  payload: any;
}

export interface QuizSocketOptions {
  quizCode: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
  onQuizStarted?: () => void;
  onQuestionReceived?: (question: any) => void;
  onAnswerSubmitted?: (result: any) => void;
  onLeaderboardUpdated?: (leaderboard: any[]) => void;
  onPlayerJoined?: (player: any) => void;
  onPlayerLeft?: (playerId: string) => void;
}

class QuizSocketService {
  private socket: Socket | null = null;
  private options: QuizSocketOptions | null = null;

  // Connecter au serveur WebSocket
  connect(options: QuizSocketOptions) {
    this.options = options;
    
    // Récupérer le token d'authentification
    const token = apiService.getAuthToken ? apiService.getAuthToken() : localStorage.getItem('auth_token');
    
    // Créer la connexion WebSocket
    this.socket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8080', {
      auth: {
        token,
      },
      query: {
        quizCode: options.quizCode,
      },
    });

    // Gérer les événements de connexion
    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      if (options.onConnect) {
        options.onConnect();
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      if (options.onDisconnect) {
        options.onDisconnect();
      }
    });

    this.socket.on('error', (error: Error) => {
      console.error('WebSocket error:', error);
      if (options.onError) {
        options.onError(error);
      }
    });

    // Gérer les événements spécifiques au quiz
    this.socket.on('quiz:started', () => {
      console.log('Quiz started');
      if (options.onQuizStarted) {
        options.onQuizStarted();
      }
    });

    this.socket.on('quiz:question', (question) => {
      console.log('Question received:', question);
      if (options.onQuestionReceived) {
        options.onQuestionReceived(question);
      }
    });

    this.socket.on('quiz:answer_submitted', (result) => {
      console.log('Answer submitted:', result);
      if (options.onAnswerSubmitted) {
        options.onAnswerSubmitted(result);
      }
    });

    this.socket.on('quiz:leaderboard', (leaderboard) => {
      console.log('Leaderboard updated:', leaderboard);
      if (options.onLeaderboardUpdated) {
        options.onLeaderboardUpdated(leaderboard);
      }
    });

    this.socket.on('quiz:player_joined', (player) => {
      console.log('Player joined:', player);
      if (options.onPlayerJoined) {
        options.onPlayerJoined(player);
      }
    });

    this.socket.on('quiz:player_left', (playerId) => {
      console.log('Player left:', playerId);
      if (options.onPlayerLeft) {
        options.onPlayerLeft(playerId);
      }
    });
  }

  // Déconnecter du serveur WebSocket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Envoyer un événement au serveur
  emit(event: string, data: any) {
    if (this.socket) {
      this.socket.emit(event, data);
    } else {
      console.error('Socket not connected');
    }
  }

  // Rejoindre un quiz
  joinQuiz(playerName: string) {
    this.emit('quiz:join', { playerName });
  }

  // Quitter un quiz
  leaveQuiz(playerId: string) {
    this.emit('quiz:leave', { playerId });
  }

  // Soumettre une réponse
  submitAnswer(playerId: string, questionId: string, answerIndices: number[]) {
    this.emit('quiz:submit_answer', { playerId, questionId, answerIndices });
  }

  // Lancer un quiz (hôte uniquement)
  startQuiz() {
    this.emit('quiz:start', {});
  }

  // Passer à la question suivante (hôte uniquement)
  nextQuestion() {
    this.emit('quiz:next_question', {});
  }
}

// Exporter une instance unique du service
const quizSocketService = new QuizSocketService();
export default quizSocketService; 