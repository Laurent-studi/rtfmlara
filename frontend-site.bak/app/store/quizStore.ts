import { create } from 'zustand';

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswers: number[];
  timeLimit: number;
}

interface Player {
  id: string;
  name: string;
  score: number;
  isHost: boolean;
}

interface QuizState {
  // État du quiz
  currentQuestion: Question | null;
  questions: Question[];
  currentQuestionIndex: number;
  isQuizActive: boolean;
  isWaitingRoom: boolean;
  quizCode: string;
  quizUrl: string;

  // État des joueurs
  players: Player[];
  currentPlayer: Player | null;

  // Actions
  setCurrentQuestion: (question: Question | null) => void;
  setQuestions: (questions: Question[]) => void;
  setCurrentQuestionIndex: (index: number) => void;
  setIsQuizActive: (isActive: boolean) => void;
  setIsWaitingRoom: (isWaiting: boolean) => void;
  setQuizCode: (code: string) => void;
  setQuizUrl: (url: string) => void;
  addPlayer: (player: Player) => void;
  removePlayer: (playerId: string) => void;
  updatePlayerScore: (playerId: string, score: number) => void;
  setCurrentPlayer: (player: Player | null) => void;
  resetQuiz: () => void;
}

const useQuizStore = create<QuizState>((set) => ({
  // État initial
  currentQuestion: null,
  questions: [],
  currentQuestionIndex: 0,
  isQuizActive: false,
  isWaitingRoom: true,
  quizCode: '',
  quizUrl: '',
  players: [],
  currentPlayer: null,

  // Actions
  setCurrentQuestion: (question) => set({ currentQuestion: question }),
  setQuestions: (questions) => set({ questions }),
  setCurrentQuestionIndex: (index) => set({ currentQuestionIndex: index }),
  setIsQuizActive: (isActive) => set({ isQuizActive: isActive }),
  setIsWaitingRoom: (isWaiting) => set({ isWaitingRoom: isWaiting }),
  setQuizCode: (code) => set({ quizCode: code }),
  setQuizUrl: (url) => set({ quizUrl: url }),
  addPlayer: (player) =>
    set((state) => ({
      players: [...state.players, player],
    })),
  removePlayer: (playerId) =>
    set((state) => ({
      players: state.players.filter((p) => p.id !== playerId),
    })),
  updatePlayerScore: (playerId, score) =>
    set((state) => ({
      players: state.players.map((p) =>
        p.id === playerId ? { ...p, score } : p
      ),
    })),
  setCurrentPlayer: (player) => set({ currentPlayer: player }),
  resetQuiz: () =>
    set({
      currentQuestion: null,
      questions: [],
      currentQuestionIndex: 0,
      isQuizActive: false,
      isWaitingRoom: true,
      players: [],
      currentPlayer: null,
    }),
}));

export default useQuizStore; 