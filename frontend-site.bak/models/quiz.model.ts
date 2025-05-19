export enum QuizStatus {
  WAITING = 'waiting',
  STARTED = 'started',
  FINISHED = 'finished'
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  code: string;
  status: QuizStatus;
  isPublic: boolean;
  isRealtime: boolean;
  isOwner?: boolean;
  creator?: {
    id: string;
    username: string;
  };
  questions?: any[];
  categories?: {
    id: string;
    name: string;
  }[];
  progress?: number;
  currentQuestionIndex?: number;
} 