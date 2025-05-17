export interface IUserStats {
  totalQuizzes: number;
  averageScore: number;
  quizzesCompleted: number;
  quizzesCreated: number;
  rank: string;
  level: number;
  points: number;
  badgesCount: number;
}

export interface IUserData {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  joinDate: Date;
  role: 'user' | 'creator' | 'admin';
  createdAt: Date;
  quizzesCreated?: number;
  quizzesParticipated?: number;
  averageScore?: number;
  totalPoints?: number;
  preferences?: {
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
    language: string;
  };
}

export class User {
  private data: IUserData;
  private _stats: IUserStats | null = null;

  constructor(userData: IUserData) {
    this.data = {
      ...userData,
      createdAt: userData.createdAt instanceof Date ? userData.createdAt : new Date(userData.createdAt),
      preferences: userData.preferences || {
        theme: 'system',
        notifications: true,
        language: 'fr'
      }
    };
  }

  get id(): string {
    return this.data.id;
  }

  get username(): string {
    return this.data.username;
  }

  get email(): string {
    return this.data.email;
  }

  get avatar(): string {
    return this.data.avatar || this.generateDefaultAvatar();
  }

  get role(): 'user' | 'creator' | 'admin' {
    return this.data.role;
  }

  get createdAt(): Date {
    return this.data.createdAt;
  }

  get quizzesCreated(): number {
    return this.data.quizzesCreated || 0;
  }

  get quizzesParticipated(): number {
    return this.data.quizzesParticipated || 0;
  }

  get averageScore(): number {
    return this.data.averageScore || 0;
  }

  get totalPoints(): number {
    return this.data.totalPoints || 0;
  }

  get preferences(): { theme: 'light' | 'dark' | 'system'; notifications: boolean; language: string } {
    return this.data.preferences || {
      theme: 'system',
      notifications: true,
      language: 'fr'
    };
  }

  get stats(): IUserStats | null {
    return this._stats;
  }

  updateStats(stats: IUserStats): User {
    this._stats = stats;
    return this;
  }

  private generateDefaultAvatar(): string {
    // Génère un avatar à partir des initiales
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(this.username)}&background=random`;
  }

  isAdmin(): boolean {
    return this.data.role === 'admin';
  }

  isCreator(): boolean {
    return this.data.role === 'creator' || this.data.role === 'admin';
  }

  canCreateQuiz(): boolean {
    return this.isCreator();
  }

  updateProfile(updatedData: Partial<Omit<IUserData, 'id' | 'role' | 'createdAt'>>): User {
    this.data = {
      ...this.data,
      ...updatedData
    };
    return this;
  }

  updatePreferences(preferences: Partial<Required<IUserData>['preferences']>): User {
    this.data.preferences = {
      ...this.preferences,
      ...preferences
    };
    return this;
  }

  toJSON(): IUserData {
    return { ...this.data };
  }

  static fromAPI(apiData: any): User {
    // Transformer les données API en instance User
    return new User({
      id: apiData.id,
      username: apiData.username,
      email: apiData.email,
      avatar: apiData.avatar,
      bio: apiData.bio,
      joinDate: apiData.joinDate ? new Date(apiData.joinDate) : new Date(),
      role: apiData.role || 'user',
      createdAt: new Date(apiData.createdAt),
      quizzesCreated: apiData.quizzesCreated,
      quizzesParticipated: apiData.quizzesParticipated,
      averageScore: apiData.averageScore,
      totalPoints: apiData.totalPoints,
      preferences: apiData.preferences
    });
  }
} 