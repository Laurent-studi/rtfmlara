# Services API - Documentation

Ce dossier contient tous les services API organisés selon les endpoints définis dans `endpoints.ts`. Chaque service correspond à une section spécifique de l'application et utilise les endpoints centralisés.

## Structure des fichiers

### 📁 Fichiers principaux

- **`endpoints.ts`** - Configuration centralisée de tous les endpoints API
- **`index.ts`** - Service API principal avec méthodes HTTP de base et services spécialisés
- **`auth.ts`** - Service d'authentification (login, register, logout, etc.)
- **`quiz.ts`** - Service de gestion des quiz et questions
- **`sessions.ts`** - Service de gestion des sessions de quiz
- **`presentation.ts`** - Service de gestion des présentations de quiz
- **`theme.ts`** - Service de gestion des thèmes et personnalisation
- **`achievements.ts`** - Service de gestion des achievements, badges et trophées
- **`notifications.ts`** - Service de gestion des notifications
- **`leaderboards.ts`** - Service de gestion des classements et statistiques
- **`exports.ts`** - Service de gestion des exports PDF et autres formats

## 🚀 Utilisation

### Import des services

```typescript
// Import du service principal
import { api } from '@/lib/api';

// Import des services spécialisés
import { authService } from '@/lib/api/auth';
import { quizService } from '@/lib/api/quiz';
import { sessionService } from '@/lib/api/sessions';
import { presentationService } from '@/lib/api/presentation';
import { themeService } from '@/lib/api/theme';
import { achievementService } from '@/lib/api/achievements';
import { notificationService } from '@/lib/api/notifications';
import { leaderboardService } from '@/lib/api/leaderboards';
import { exportService } from '@/lib/api/exports';

// Import des endpoints
import { API_ENDPOINTS } from '@/lib/api/endpoints';
```

### Exemples d'utilisation

#### Authentification
```typescript
// Connexion
const response = await authService.login({
  email: 'user@example.com',
  password: 'password'
});

// Récupérer l'utilisateur connecté
const user = await authService.getUser();

// Vérifier si connecté
const isAuth = authService.isAuthenticated();
```

#### Quiz
```typescript
// Récupérer tous les quiz
const quizzes = await quizService.getAll();

// Récupérer un quiz par ID
const quiz = await quizService.getById(1);

// Créer un nouveau quiz
const newQuiz = await quizService.create({
  title: 'Mon Quiz',
  description: 'Description du quiz',
  category: 'Général'
});

// Récupérer les questions d'un quiz
const questions = await quizService.getQuestions(1);
```

#### Sessions
```typescript
// Créer une session
const session = await sessionService.create({
  quiz_id: 1,
  max_participants: 50
});

// Rejoindre une session
const participant = await sessionService.join(session.id, {
  username: 'MonNom'
});

// Démarrer une session
await sessionService.start(session.id);
```

#### Présentations
```typescript
// Créer une présentation
const presentation = await presentationService.createSession({
  quiz_id: 1,
  show_leaderboard: true,
  question_time_limit: 30
});

// Récupérer l'état de la présentation
const state = await presentationService.getState(presentation.id);

// Passer à la question suivante
await presentationService.next(presentation.id);
```

#### Thèmes
```typescript
// Récupérer tous les thèmes
const themes = await themeService.getAll();

// Appliquer un thème
await themeService.setUserTheme({
  theme_id: 1,
  dark_mode: true
});

// Créer un thème personnalisé
const customTheme = await themeService.create({
  name: 'Mon Thème',
  colors: {
    primary: '#ff0000',
    secondary: '#00ff00',
    // ...
  }
});
```

#### Achievements
```typescript
// Récupérer les achievements de l'utilisateur
const achievements = await achievementService.getUserAchievements();

// Vérifier les nouveaux achievements
await achievementService.check();

// Récupérer les achievements récents
const recent = await achievementService.getRecent();
```

#### Notifications
```typescript
// Récupérer toutes les notifications
const notifications = await notificationService.getAll();

// Marquer comme lues
await notificationService.markAllRead();

// Récupérer les préférences
const prefs = await notificationService.getPreferences();
```

#### Classements
```typescript
// Récupérer le classement global
const leaderboard = await leaderboardService.getGlobal({
  period: 'weekly',
  limit: 10
});

// Récupérer les statistiques utilisateur
const stats = await leaderboardService.getUserStats();

// Comparer avec un autre utilisateur
const comparison = await leaderboardService.compareWith(userId);
```

#### Exports
```typescript
// Exporter les résultats d'un quiz
const exportJob = await exportService.exportResults({
  quiz_id: 1,
  format: 'pdf',
  include_details: true
});

// Télécharger un export
const blob = await exportService.download(exportJob.id);

// Exporter un certificat
const certificate = await exportService.exportCertificate({
  quiz_id: 1,
  session_id: 123,
  include_score: true
});
```

## 🔧 Configuration

### Variables d'environnement

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### Headers d'authentification

Les services gèrent automatiquement les headers d'authentification en utilisant le token stocké dans `localStorage`.

## 📝 Types TypeScript

Chaque service exporte ses propres types TypeScript pour une meilleure sécurité de type :

```typescript
// Types d'authentification
import type { User, LoginCredentials, RegisterData } from '@/lib/api/auth';

// Types de quiz
import type { Quiz, Question, Answer, CreateQuizData } from '@/lib/api/quiz';

// Types de sessions
import type { QuizSession, Participant, SessionSettings } from '@/lib/api/sessions';

// Types de présentations
import type { PresentationSession, PresentationState } from '@/lib/api/presentation';

// Types de thèmes
import type { Theme, ThemeColors, UserThemePreferences } from '@/lib/api/theme';

// Types d'achievements
import type { Achievement, Badge, Trophy, UserAchievement } from '@/lib/api/achievements';

// Types de notifications
import type { Notification, NotificationPreferences } from '@/lib/api/notifications';

// Types de classements
import type { LeaderboardEntry, UserStats, GlobalLeaderboard } from '@/lib/api/leaderboards';

// Types d'exports
import type { ExportJob, ExportResultsData, ExportCertificateData } from '@/lib/api/exports';
```

## 🛠️ Gestion d'erreurs

Tous les services utilisent une gestion d'erreurs standardisée :

```typescript
try {
  const response = await quizService.getById(1);
  if (response.success) {
    console.log('Quiz:', response.data);
  } else {
    console.error('Erreur:', response.message);
  }
} catch (error) {
  console.error('Erreur réseau:', error);
}
```

## 🔄 Compatibilité

Pour maintenir la compatibilité avec l'ancien système, chaque service exporte également des fonctions individuelles :

```typescript
// Nouvelle syntaxe (recommandée)
import { quizService } from '@/lib/api/quiz';
await quizService.getAll();

// Ancienne syntaxe (compatible)
import { getUserQuizzes } from '@/lib/api/quiz';
await getUserQuizzes();
```

## 📊 Endpoints disponibles

Consultez le fichier `endpoints.ts` pour voir tous les endpoints disponibles organisés par catégorie :

- **auth** - Authentification
- **quiz** - Quiz et questions
- **sessions** - Sessions de quiz
- **presentation** - Présentations
- **themes** - Thèmes
- **achievements** - Achievements, badges, trophées
- **notifications** - Notifications
- **leaderboards** - Classements
- **exports** - Exports PDF/CSV/Excel
- **friends** - Gestion des amis
- **admin** - Administration
- **statistics** - Statistiques
- **interests** - Intérêts
- **leagues** - Ligues
- **battleRoyale** - Battle Royale
- **tournaments** - Tournois
- **offlineSessions** - Sessions hors ligne
- **sounds** - Effets sonores

## 🚀 Développement

### Ajouter un nouveau service

1. Créer le fichier dans `lib/api/`
2. Définir les types TypeScript
3. Importer les endpoints depuis `endpoints.ts`
4. Créer le service avec les méthodes nécessaires
5. Exporter le service et les types
6. Mettre à jour ce README

### Ajouter un nouvel endpoint

1. Ajouter l'endpoint dans `endpoints.ts`
2. Mettre à jour le service correspondant
3. Ajouter les types si nécessaire
4. Tester les nouvelles fonctionnalités

## 📚 Ressources

- [Documentation API Backend](../../../api/README.md)
- [Guide des endpoints](./endpoints.ts)
- [Types TypeScript](./types/)
- [Tests API](../../../tests/api/)

---

*Cette documentation est maintenue automatiquement. Pour toute question, consultez l'équipe de développement.* 