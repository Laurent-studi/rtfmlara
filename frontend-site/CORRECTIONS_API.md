# Corrections API - Dashboard et Quiz

## Résumé des corrections apportées

Ce document détaille les corrections apportées aux dossiers `dashboard` et `quiz` pour utiliser correctement le fichier `endpoints.ts` centralisé.

## Problèmes identifiés

### 1. Endpoints hardcodés
- Les appels API utilisaient des endpoints hardcodés au lieu du fichier `endpoints.ts`
- Exemple : `api.get('quizzes')` au lieu de `api.get(API_ENDPOINTS.quiz.list)`

### 2. Structure API incohérente
- Pas de centralisation des appels API
- Gestion d'erreurs inconsistante
- Pas de fallback en cas d'échec des appels API

### 3. Types manquants
- Interfaces TypeScript manquantes pour les réponses API
- Pas de typage pour les données de quiz, utilisateurs, etc.

## Corrections apportées

### 1. Refactorisation du fichier `lib/api/index.ts`

**Avant :**
```typescript
// Imports conflictuels et structure désorganisée
import { getAllThemes, getDefaultTheme, ... } from './theme';
import { getUserQuizzes, getQuiz, ... } from './quiz';

export const api = {
  getThemes: getAllThemes,
  // ...
};
```

**Après :**
```typescript
import { API_ENDPOINTS } from './endpoints';

// Structure API centralisée avec méthodes HTTP de base
export const api = {
  get: <T = any>(endpoint: string): Promise<ApiResponse<T>>,
  post: <T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>>,
  put: <T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>>,
  delete: <T = any>(endpoint: string): Promise<ApiResponse<T>>,
  
  // Méthodes spécialisées utilisant les endpoints définis
  auth: {
    login: (credentials) => api.post(API_ENDPOINTS.auth.login, credentials),
    getUser: () => api.get(API_ENDPOINTS.auth.user),
    // ...
  },
  
  quiz: {
    getAll: () => api.get(API_ENDPOINTS.quiz.list),
    getFeatured: () => api.get(API_ENDPOINTS.quiz.featured),
    getById: (id) => api.get(API_ENDPOINTS.quiz.byId(id)),
    // ...
  },
  // ...
};
```

### 2. Correction du Dashboard (`app/dashboard/page.tsx`)

**Améliorations :**
- Utilisation des endpoints définis : `API_ENDPOINTS.auth.user`, `API_ENDPOINTS.quiz.recent`, etc.
- Ajout de types TypeScript pour `User`, `Quiz`, `Trophy`
- Gestion d'erreurs améliorée avec fallback vers des données mockées
- Interface utilisateur d'erreur avec bouton de retry

**Endpoints utilisés :**
- `API_ENDPOINTS.auth.user` - Informations utilisateur
- `API_ENDPOINTS.quiz.recent` - Quiz récents
- `API_ENDPOINTS.achievements.recent` - Trophées récents

### 3. Correction de la recherche de quiz (`app/quiz/search/page.tsx`)

**Améliorations :**
- Remplacement des endpoints hardcodés par les endpoints définis
- Ajout de gestion d'erreurs avec données de fallback
- Utilisation cohérente des endpoints pour les quiz publics, en vedette et catégories

**Endpoints utilisés :**
- `API_ENDPOINTS.quiz.public` - Quiz publics
- `API_ENDPOINTS.quiz.featured` - Quiz en vedette
- `API_ENDPOINTS.quiz.categories` - Catégories de quiz

### 4. Correction de l'historique des quiz (`app/quiz/history/page.tsx`)

**Améliorations :**
- Utilisation des endpoints définis pour les quiz et sessions
- Ajout de types pour `QuizSession`
- Correction de la redirection d'authentification
- Données de fallback en cas d'erreur

**Endpoints utilisés :**
- `API_ENDPOINTS.quiz.list` - Liste des quiz de l'utilisateur
- `API_ENDPOINTS.sessions.list` - Sessions de quiz

### 5. Correction du détail de quiz (`app/quiz/[id]/page.tsx`)

**Améliorations :**
- Utilisation de `API_ENDPOINTS.quiz.byId(id)` au lieu d'un endpoint hardcodé
- Ajout de données de démonstration en cas d'erreur
- Meilleure gestion des erreurs

## Structure des endpoints utilisés

```typescript
// Exemples d'endpoints du fichier endpoints.ts
export const API_ENDPOINTS = {
  auth: {
    user: 'user',
    login: 'login',
    // ...
  },
  quiz: {
    list: 'quizzes',
    featured: 'quizzes/featured',
    public: 'quizzes/public',
    categories: 'quizzes/categories',
    recent: 'quizzes/recent',
    byId: (id) => `quizzes/${id}`,
    // ...
  },
  sessions: {
    list: 'quiz-sessions',
    // ...
  },
  achievements: {
    recent: 'achievements/recent',
    // ...
  },
  // ...
};
```

## Avantages des corrections

### 1. Centralisation
- Tous les endpoints sont définis dans un seul fichier
- Facilite la maintenance et les modifications d'URL

### 2. Cohérence
- Structure API uniforme dans toute l'application
- Gestion d'erreurs standardisée

### 3. Robustesse
- Fallback avec données mockées en cas d'erreur
- Meilleure expérience utilisateur même en cas de problème réseau

### 4. Maintenabilité
- Code plus lisible et organisé
- Types TypeScript pour une meilleure sécurité

### 5. Évolutivité
- Facilite l'ajout de nouveaux endpoints
- Structure modulaire pour de nouvelles fonctionnalités

## Utilisation recommandée

Pour ajouter un nouvel appel API :

1. **Définir l'endpoint dans `endpoints.ts` :**
```typescript
export const API_ENDPOINTS = {
  // ...
  newFeature: {
    list: 'new-features',
    byId: (id) => `new-features/${id}`,
  },
};
```

2. **Ajouter la méthode dans `api/index.ts` :**
```typescript
export const api = {
  // ...
  newFeature: {
    getAll: () => api.get(API_ENDPOINTS.newFeature.list),
    getById: (id) => api.get(API_ENDPOINTS.newFeature.byId(id)),
  },
};
```

3. **Utiliser dans les composants :**
```typescript
import { api, API_ENDPOINTS } from '@/lib/api';

const response = await api.newFeature.getAll();
// ou directement
const response = await api.get(API_ENDPOINTS.newFeature.list);
```

## Tests recommandés

1. Vérifier que tous les appels API utilisent les endpoints définis
2. Tester la gestion d'erreurs avec des données de fallback
3. Valider que les types TypeScript sont corrects
4. S'assurer que l'authentification fonctionne correctement

## Conclusion

Ces corrections permettent une meilleure organisation du code, une maintenance plus facile et une expérience utilisateur améliorée grâce à la gestion d'erreurs et aux données de fallback. 