// Service de données mockées pour le développement
export class MockDataService {
  static themes = [
    { id: 1, name: 'Clair', code: 'light', description: 'Thème clair', is_default: true, is_active: true },
    { id: 2, name: 'Sombre', code: 'dark', description: 'Thème sombre', is_default: false, is_active: true },
    { id: 3, name: 'Néon', code: 'neon', description: 'Thème néon vibrant', is_default: false, is_active: true },
    { id: 4, name: 'Élégant', code: 'elegant', description: 'Thème élégant et minimaliste', is_default: false, is_active: true },
    { id: 5, name: 'Pastel', code: 'pastel', description: 'Thème aux couleurs pastel', is_default: false, is_active: true },
    { id: 6, name: 'Fun', code: 'fun', description: 'Thème amusant et coloré', is_default: false, is_active: true }
  ];

  static user = {
    id: 1,
    username: 'Laurent',
    email: 'laurent@example.com',
    avatar: null,
    trophies_count: 5,
    achievement_points: 250,
    role: 'creator'
  };

  static quizzes = [
    {
      id: 1,
      title: 'Les bases de JavaScript',
      description: 'Quiz sur les fondamentaux de JavaScript',
      created_at: '2023-10-15T10:30:00',
      questions_count: 10,
      category: 'JavaScript'
    },
    {
      id: 2,
      title: 'CSS avancé',
      description: 'Techniques avancées en CSS',
      created_at: '2023-10-10T14:20:00',
      questions_count: 8,
      category: 'CSS'
    },
    {
      id: 3,
      title: 'React pour débutants',
      description: 'Introduction à React',
      created_at: '2023-10-05T09:15:00',
      questions_count: 12,
      category: 'React'
    }
  ];

  static trophies = [
    {
      id: 1,
      name: 'Premier Quiz',
      description: 'Vous avez terminé votre premier quiz',
      icon: '🏆',
      awarded_at: '2023-10-15T10:30:00'
    },
    {
      id: 2,
      name: 'Maître du JavaScript',
      description: 'Score parfait dans un quiz JavaScript',
      icon: '🥇',
      awarded_at: '2023-10-10T14:20:00'
    }
  ];

  // Simule un délai d'API
  static async delay(ms: number = 100): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Méthodes pour simuler les appels API
  static async getThemes() {
    await this.delay();
    return {
      status: 'success',
      data: this.themes
    };
  }

  static async getUser() {
    await this.delay();
    return {
      success: true,
      data: this.user
    };
  }

  static async getRecentQuizzes() {
    await this.delay();
    return {
      success: true,
      data: this.quizzes
    };
  }

  static async getRecentTrophies() {
    await this.delay();
    return {
      success: true,
      data: this.trophies
    };
  }

  static async applyTheme(themeId: number) {
    await this.delay();
    return {
      status: 'success',
      message: 'Thème appliqué avec succès'
    };
  }
} 