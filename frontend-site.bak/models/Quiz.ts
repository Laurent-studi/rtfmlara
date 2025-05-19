import { User } from './User';

export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  TRUE_FALSE = 'true_false',
  SHORT_ANSWER = 'short_answer',
  MATCHING = 'matching'
}

export interface IAnswer {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface IQuestion {
  id: string;
  quizId: string;
  text: string;
  type: QuestionType;
  points: number;
  timeLimit?: number; // en secondes
  explanation?: string;
  answers: IAnswer[];
  image?: string;
}

export interface IParticipant {
  id: string;
  userId: string;
  username: string;
  score: number;
  completed: boolean;
  startedAt: Date;
  finishedAt?: Date;
}

export interface IQuizData {
  id: string;
  title: string;
  description: string;
  coverImage?: string;
  creatorId: string;
  createdAt: Date;
  updatedAt?: Date;
  isPublic: boolean;
  category: string;
  tags: string[];
  timeLimit?: number; // en minutes
  passingScore?: number; // pourcentage requis pour réussir
  shuffleQuestions: boolean;
  totalQuestions: number;
  totalParticipants: number;
  avgScore?: number;
}

export class Quiz {
  private _id: string;
  private _title: string;
  private _description: string;
  private _coverImage: string;
  private _creator: User | null;
  private _creatorId: string;
  private _createdAt: Date;
  private _updatedAt: Date | null;
  private _isPublic: boolean;
  private _category: string;
  private _tags: string[];
  private _timeLimit: number | null;
  private _passingScore: number | null;
  private _shuffleQuestions: boolean;
  private _questions: IQuestion[];
  private _participants: IParticipant[];
  private _totalQuestions: number;
  private _totalParticipants: number;
  private _avgScore: number | null;

  constructor(quizData: IQuizData, creator?: User, questions: IQuestion[] = [], participants: IParticipant[] = []) {
    this._id = quizData.id;
    this._title = quizData.title;
    this._description = quizData.description;
    this._coverImage = quizData.coverImage || '/images/default-quiz-cover.jpg';
    this._creator = creator || null;
    this._creatorId = quizData.creatorId;
    this._createdAt = quizData.createdAt;
    this._updatedAt = quizData.updatedAt || null;
    this._isPublic = quizData.isPublic;
    this._category = quizData.category;
    this._tags = quizData.tags;
    this._timeLimit = quizData.timeLimit || null;
    this._passingScore = quizData.passingScore || null;
    this._shuffleQuestions = quizData.shuffleQuestions;
    this._questions = questions;
    this._participants = participants;
    this._totalQuestions = quizData.totalQuestions;
    this._totalParticipants = quizData.totalParticipants;
    this._avgScore = quizData.avgScore || null;
  }

  // Getters
  get id(): string { return this._id; }
  get title(): string { return this._title; }
  get description(): string { return this._description; }
  get coverImage(): string { return this._coverImage; }
  get creator(): User | null { return this._creator; }
  get creatorId(): string { return this._creatorId; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date | null { return this._updatedAt; }
  get isPublic(): boolean { return this._isPublic; }
  get category(): string { return this._category; }
  get tags(): string[] { return [...this._tags]; }
  get timeLimit(): number | null { return this._timeLimit; }
  get passingScore(): number | null { return this._passingScore; }
  get shuffleQuestions(): boolean { return this._shuffleQuestions; }
  get questions(): IQuestion[] { return [...this._questions]; }
  get participants(): IParticipant[] { return [...this._participants]; }
  get totalQuestions(): number { return this._totalQuestions; }
  get totalParticipants(): number { return this._totalParticipants; }
  get avgScore(): number | null { return this._avgScore; }

  // Setters
  set questions(questions: IQuestion[]) { this._questions = [...questions]; }
  set participants(participants: IParticipant[]) { this._participants = [...participants]; }

  // Méthodes
  public hasTimeLimit(): boolean {
    return this._timeLimit !== null && this._timeLimit > 0;
  }

  public formatCreatedDate(): string {
    return this._createdAt.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  public addQuestion(question: IQuestion): void {
    this._questions.push(question);
    this._totalQuestions = this._questions.length;
  }

  public removeQuestion(questionId: string): void {
    this._questions = this._questions.filter(q => q.id !== questionId);
    this._totalQuestions = this._questions.length;
  }

  public addParticipant(participant: IParticipant): void {
    this._participants.push(participant);
    this._totalParticipants = this._participants.length;
    this._updateAvgScore();
  }

  private _updateAvgScore(): void {
    const completedParticipants = this._participants.filter(p => p.completed);
    if (completedParticipants.length === 0) {
      this._avgScore = null;
      return;
    }
    
    const totalScore = completedParticipants.reduce((sum, p) => sum + p.score, 0);
    this._avgScore = totalScore / completedParticipants.length;
  }

  public getShuffledQuestions(): IQuestion[] {
    if (!this._shuffleQuestions) return [...this._questions];
    
    return [...this._questions].sort(() => Math.random() - 0.5);
  }

  public getCategoryColor(): string {
    const categories: Record<string, string> = {
      'Mathématiques': 'bg-blue-200 text-blue-800',
      'Sciences': 'bg-green-200 text-green-800',
      'Histoire': 'bg-yellow-200 text-yellow-800',
      'Géographie': 'bg-purple-200 text-purple-800',
      'Langues': 'bg-pink-200 text-pink-800',
      'Informatique': 'bg-indigo-200 text-indigo-800',
      'Divers': 'bg-gray-200 text-gray-800'
    };
    
    return categories[this._category] || 'bg-gray-200 text-gray-800';
  }

  public isPassingScore(score: number): boolean {
    if (this._passingScore === null) return true;
    return (score / this._totalQuestions) * 100 >= this._passingScore;
  }

  public toJSON(): any {
    return {
      id: this._id,
      title: this._title,
      description: this._description,
      coverImage: this._coverImage,
      creatorId: this._creatorId,
      creator: this._creator ? this._creator.toJSON() : null,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      isPublic: this._isPublic,
      category: this._category,
      tags: this._tags,
      timeLimit: this._timeLimit,
      passingScore: this._passingScore,
      shuffleQuestions: this._shuffleQuestions,
      questions: this._questions,
      participants: this._participants,
      totalQuestions: this._totalQuestions,
      totalParticipants: this._totalParticipants,
      avgScore: this._avgScore
    };
  }

  // Méthode statique pour créer un quiz à partir des données de l'API
  public static fromAPI(data: any, creator?: User): Quiz {
    const quizData: IQuizData = {
      id: data.id,
      title: data.title,
      description: data.description,
      coverImage: data.coverImage || data.cover_image,
      creatorId: data.creatorId || data.creator_id,
      createdAt: new Date(data.createdAt || data.created_at),
      updatedAt: data.updatedAt || data.updated_at ? new Date(data.updatedAt || data.updated_at) : undefined,
      isPublic: data.isPublic || data.is_public || false,
      category: data.category,
      tags: data.tags || [],
      timeLimit: data.timeLimit || data.time_limit,
      passingScore: data.passingScore || data.passing_score,
      shuffleQuestions: data.shuffleQuestions || data.shuffle_questions || false,
      totalQuestions: data.totalQuestions || data.total_questions || 0,
      totalParticipants: data.totalParticipants || data.total_participants || 0,
      avgScore: data.avgScore || data.avg_score
    };

    const questions = Array.isArray(data.questions) ? data.questions : [];
    const participants = Array.isArray(data.participants) ? data.participants : [];
    
    return new Quiz(quizData, creator, questions, participants);
  }
} 