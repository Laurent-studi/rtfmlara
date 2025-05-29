/**
 * Configuration centralisée des endpoints de l'API
 * Ce fichier contient tous les endpoints utilisés dans l'application
 */

export const API_ENDPOINTS = {
  // Authentification
  auth: {
    login: 'login',
    register: 'register',
    logout: 'logout',
    user: 'user',
    forgotPassword: 'auth/forgot-password',
    resetPassword: 'auth/reset-password',
  },

  // Quiz
  quiz: {
    list: 'quizzes',
    featured: 'quizzes/featured',
    public: 'quizzes/public',
    categories: 'quizzes/categories',
    recent: 'quizzes/recent',
    create: 'quizzes',
    random: 'quizzes/random',
    byId: (id: number | string) => `quizzes/${id}`,
    update: (id: number | string) => `quizzes/${id}`,
    delete: (id: number | string) => `quizzes/${id}`,
    byTag: (tagSlug: string) => `tags/${tagSlug}/quizzes`,
  },

  // Questions
  questions: {
    list: (quizId: number | string) => `quizzes/${quizId}/questions`,
    create: (quizId: number | string) => `quizzes/${quizId}/questions`,
    byId: (id: number | string) => `questions/${id}`,
    update: (id: number | string) => `questions/${id}`,
    delete: (id: number | string) => `questions/${id}`,
  },

  // Réponses
  answers: {
    list: (questionId: number | string) => `questions/${questionId}/answers`,
    create: (questionId: number | string) => `questions/${questionId}/answers`,
    byId: (id: number | string) => `answers/${id}`,
    update: (id: number | string) => `answers/${id}`,
    delete: (id: number | string) => `answers/${id}`,
  },

  // Sessions de quiz
  sessions: {
    list: 'quiz-sessions',
    create: 'quiz-sessions',
    byId: (id: number | string) => `quiz-sessions/${id}`,
    join: (id: number | string) => `quiz-sessions/${id}/join`,
    start: (id: number | string) => `quiz-sessions/${id}/start`,
    submitAnswer: (id: number | string) => `quiz-sessions/${id}/submit-answer`,
  },

  // Présentation
  presentation: {
    create: 'presentation/sessions',
    getState: (sessionId: string) => `presentation/sessions/${sessionId}`,
    start: (sessionId: string) => `presentation/sessions/${sessionId}/start`,
    next: (sessionId: string) => `presentation/sessions/${sessionId}/next`,
    end: (sessionId: string) => `presentation/sessions/${sessionId}/end`,
    leaderboard: (sessionId: string) => `presentation/sessions/${sessionId}/leaderboard`,
    join: 'presentation/join',
    submitAnswer: (sessionId: string) => `presentation/sessions/${sessionId}/answer`,
  },

  // Thèmes
  themes: {
    list: 'themes',
    default: 'themes/default',
    current: 'themes/current',
    userTheme: 'themes/current', // Utiliser l'endpoint correct du ThemeController
    setUserTheme: 'themes/apply',
    apply: 'themes/apply',
    reset: 'themes/reset',
    create: 'themes',
    byId: (id: number | string) => `themes/${id}`,
    update: (id: number | string) => `themes/${id}`,
    delete: (id: number | string) => `themes/${id}`,
    setDefault: (id: number | string) => `themes/${id}/set-default`,
  },

  // Tags
  tags: {
    list: 'tags',
    create: 'tags',
    byId: (id: number | string) => `tags/${id}`,
    update: (id: number | string) => `tags/${id}`,
    delete: (id: number | string) => `tags/${id}`,
    attachToQuiz: (quizId: number | string) => `quizzes/${quizId}/tags`,
    detachFromQuiz: (quizId: number | string, tagId: number | string) => `quizzes/${quizId}/tags/${tagId}`,
  },

  // Badges et trophées
  badges: {
    list: 'badges',
    byId: (id: number | string) => `badges/${id}`,
    create: 'badges',
    update: (id: number | string) => `badges/${id}`,
    delete: (id: number | string) => `badges/${id}`,
    award: (id: number | string) => `badges/${id}/award`,
  },

  trophies: {
    list: 'trophies',
    byId: (id: number | string) => `trophies/${id}`,
    create: 'trophies',
    update: (id: number | string) => `trophies/${id}`,
    delete: (id: number | string) => `trophies/${id}`,
    award: (id: number | string) => `trophies/${id}/award`,
    users: (id: number | string) => `trophies/${id}/users`,
  },

  // Achievements
  achievements: {
    userAchievements: 'achievements',
    forUser: (userId: number | string) => `achievements/users/${userId}`,
    unachieved: 'achievements/unachieved',
    check: 'achievements/check',
    recent: 'achievements/recent',
    categories: 'achievements/categories',
    byCategory: (category: string) => `achievements/categories/${category}`,
  },

  // Notifications
  notifications: {
    list: 'notifications',
    unread: 'notifications/unread',
    markAllRead: 'notifications/mark-all-read',
    update: (id: number | string) => `notifications/${id}`,
    delete: (id: number | string) => `notifications/${id}`,
  },

  // Classements
  leaderboards: {
    list: 'leaderboards',
    byCategory: (category: string) => `leaderboards/categories/${category}`,
    byQuiz: (quizId: number | string) => `leaderboards/quizzes/${quizId}`,
    friends: 'leaderboards/friends',
    userStats: 'leaderboards/user-stats',
  },

  // Amis
  friends: {
    list: 'friends',
    sendRequest: 'friends/send-request',
    acceptRequest: 'friends/accept-request',
    rejectRequest: 'friends/reject-request',
    remove: (friendId: number | string) => `friends/${friendId}`,
    block: 'friends/block',
    unblock: (userId: number | string) => `friends/unblock/${userId}`,
    search: 'friends/search',
  },

  // Administration
  admin: {
    users: 'admin/users',
    roles: 'admin/roles',
    assignRole: (userId: number | string) => `admin/users/${userId}/roles`,
    removeRole: (userId: number | string, roleId: number | string) => `admin/users/${userId}/roles/${roleId}`,
  },

  // Statistiques
  statistics: {
    general: 'statistics',
  },

  // Intérêts
  interests: {
    list: 'interests',
    addUser: 'interests/user',
    removeUser: (interestId: number | string) => `interests/user/${interestId}`,
  },

  // Ligues
  leagues: {
    list: 'leagues',
    current: 'leagues/current',
  },

  // Battle Royale
  battleRoyale: {
    list: 'battle-royale',
    byId: (id: number | string) => `battle-royale/${id}`,
    create: 'battle-royale',
    join: (id: number | string) => `battle-royale/${id}/join`,
    start: (id: number | string) => `battle-royale/${id}/start`,
    submitAnswer: (id: number | string) => `battle-royale/${id}/submit-answer`,
    eliminate: (id: number | string) => `battle-royale/${id}/eliminate`,
  },

  // Tournois
  tournaments: {
    list: 'tournaments',
    byId: (id: number | string) => `tournaments/${id}`,
    create: 'tournaments',
    update: (id: number | string) => `tournaments/${id}`,
    delete: (id: number | string) => `tournaments/${id}`,
    register: (id: number | string) => `tournaments/${id}/register`,
  },

  // Sessions hors ligne
  offlineSessions: {
    list: 'offline-sessions',
    create: 'offline-sessions',
    byId: (id: number | string) => `offline-sessions/${id}`,
    submitAnswer: (id: number | string) => `offline-sessions/${id}/submit-answer`,
    complete: (id: number | string) => `offline-sessions/${id}/complete`,
    synchronize: (id: number | string) => `offline-sessions/${id}/synchronize`,
    delete: (id: number | string) => `offline-sessions/${id}`,
  },

  // Exports PDF
  exports: {
    list: 'exports',
    results: 'exports/results',
    certificate: 'exports/certificate',
    progressReport: 'exports/progress-report',
    download: (id: number | string) => `exports/download/${id}`,
    delete: (id: number | string) => `exports/${id}`,
  },

  // Effets sonores
  sounds: {
    list: 'sounds',
    categories: 'sounds/categories',
    byEvent: (event: string) => `sounds/events/${event}`,
    create: 'sounds',
    byId: (id: number | string) => `sounds/${id}`,
    update: (id: number | string) => `sounds/${id}`,
    delete: (id: number | string) => `sounds/${id}`,
    preferences: 'sounds/preferences',
    updatePreferences: 'sounds/preferences',
  },
};

export default API_ENDPOINTS; 