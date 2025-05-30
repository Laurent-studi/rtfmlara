<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\QuizController;
use App\Http\Controllers\Api\QuestionController;
use App\Http\Controllers\Api\AnswerController;
use App\Http\Controllers\Api\QuizSessionController;
use App\Http\Controllers\Api\BadgeController;
use App\Http\Controllers\Api\TrophyController;
use App\Http\Controllers\Api\BattleRoyaleController;
use App\Http\Controllers\Api\TournamentController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\StatisticsController;
use App\Http\Controllers\Api\FriendController;
use App\Http\Controllers\Api\InterestController;
use App\Http\Controllers\Api\LeagueController;
use App\Http\Controllers\Api\LeaderboardController;
use App\Http\Controllers\Api\LearningStatsController;
use App\Http\Controllers\Api\OfflineSessionController;
use App\Http\Controllers\Api\PdfExportController;
use App\Http\Controllers\Api\SeasonalThemeController;
use App\Http\Controllers\Api\SoundEffectController;
use App\Http\Controllers\Api\TagController;

// Routes publiques
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Route publique pour les quiz actifs
Route::get('/quizzes/public', [QuizController::class, 'public']);
Route::get('/quizzes/featured', [QuizController::class, 'featured']);
Route::get('/quizzes/categories', [QuizController::class, 'categories']);

// Thème saisonnier actif (public)
Route::get('/themes/current', [SeasonalThemeController::class, 'getCurrentTheme']);

// Routes pour les tags (publiques)
Route::get('/tags', [TagController::class, 'index']);
Route::get('/tags/{id}', [TagController::class, 'show']);
Route::get('/tags/{tagSlug}/quizzes', [QuizController::class, 'findByTag']);

// Routes protégées par authentification
Route::middleware('auth:sanctum')->group(function () {
    // Utilisateur
    Route::get('/user', [UserController::class, 'show']);
    Route::put('/user', [UserController::class, 'update']);
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Quiz
    Route::apiResource('quizzes', QuizController::class);
    
    // Questions et réponses
    Route::apiResource('quizzes.questions', QuestionController::class)->shallow();
    Route::apiResource('questions.answers', AnswerController::class)->shallow();
    
    // Tags (protégés)
    Route::post('/tags', [TagController::class, 'store']);
    Route::put('/tags/{id}', [TagController::class, 'update']);
    Route::delete('/tags/{id}', [TagController::class, 'destroy']);
    
    // Association de tags aux quiz
    Route::post('/quizzes/{id}/tags', [QuizController::class, 'attachTags']);
    Route::delete('/quizzes/{quizId}/tags/{tagId}', [QuizController::class, 'detachTag']);
    
    // Sessions de quiz
    Route::apiResource('quiz-sessions', QuizSessionController::class);
    Route::post('/quiz-sessions/{session}/join', [QuizSessionController::class, 'join']);
    Route::post('/quiz-sessions/{session}/start', [QuizSessionController::class, 'start']);
    Route::post('/quiz-sessions/{session}/submit-answer', [QuizSessionController::class, 'submitAnswer']);
    
    // Battle Royale
    Route::get('/battle-royale', [BattleRoyaleController::class, 'index']);
    Route::get('/battle-royale/{id}', [BattleRoyaleController::class, 'show']);
    Route::post('/battle-royale', [BattleRoyaleController::class, 'store']);
    Route::post('/battle-royale/{id}/join', [BattleRoyaleController::class, 'join']);
    Route::post('/battle-royale/{id}/start', [BattleRoyaleController::class, 'start']);
    Route::post('/battle-royale/{id}/submit-answer', [BattleRoyaleController::class, 'submitAnswer']);
    Route::post('/battle-royale/{id}/eliminate', [BattleRoyaleController::class, 'eliminate']);
    
    // Tournois
    Route::apiResource('tournaments', TournamentController::class);
    Route::post('/tournaments/{tournament}/register', [TournamentController::class, 'register']);
    
    // Badges et trophées
    Route::get('/badges', [BadgeController::class, 'index']);
    Route::get('/trophies', [TrophyController::class, 'index']);
    
    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread', [NotificationController::class, 'unread']);
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
    Route::put('/notifications/{notification}', [NotificationController::class, 'update']);
    Route::delete('/notifications/{notification}', [NotificationController::class, 'destroy']);
    
    // Intérêts
    Route::get('/interests', [InterestController::class, 'index']);
    Route::post('/interests/user', [InterestController::class, 'addUserInterest']);
    Route::delete('/interests/user/{interest}', [InterestController::class, 'removeUserInterest']);
    
    // Ligues
    Route::get('/leagues', [LeagueController::class, 'index']);
    Route::get('/leagues/current', [LeagueController::class, 'getCurrentUserLeague']);
    
    // Statistiques d'apprentissage
    Route::get('/learning-stats', [LearningStatsController::class, 'index']);
    Route::get('/learning-stats/quiz/{quiz}', [LearningStatsController::class, 'getByQuiz']);
    
    // Statistiques générales
    Route::get('/statistics', [StatisticsController::class, 'index']);

    // Sessions hors ligne
    Route::get('/offline-sessions', [OfflineSessionController::class, 'index']);
    Route::post('/offline-sessions', [OfflineSessionController::class, 'store']);
    Route::get('/offline-sessions/{id}', [OfflineSessionController::class, 'show']);
    Route::post('/offline-sessions/{id}/submit-answer', [OfflineSessionController::class, 'submitAnswer']);
    Route::post('/offline-sessions/{id}/complete', [OfflineSessionController::class, 'complete']);
    Route::post('/offline-sessions/{id}/synchronize', [OfflineSessionController::class, 'synchronize']);
    Route::delete('/offline-sessions/{id}', [OfflineSessionController::class, 'destroy']);
    
    // Exports PDF
    Route::get('/exports', [PdfExportController::class, 'index']);
    Route::post('/exports/results', [PdfExportController::class, 'generateResults']);
    Route::post('/exports/certificate', [PdfExportController::class, 'generateCertificate']);
    Route::post('/exports/progress-report', [PdfExportController::class, 'generateProgressReport']);
    Route::get('/exports/download/{id}', [PdfExportController::class, 'download']);
    Route::delete('/exports/{id}', [PdfExportController::class, 'destroy']);
    
    // Thèmes saisonniers
    Route::get('/themes', [SeasonalThemeController::class, 'index']);
    Route::post('/themes', [SeasonalThemeController::class, 'store']);
    Route::get('/themes/{id}', [SeasonalThemeController::class, 'show']);
    Route::put('/themes/{id}', [SeasonalThemeController::class, 'update']);
    Route::delete('/themes/{id}', [SeasonalThemeController::class, 'destroy']);
    Route::post('/themes/{id}/activate', [SeasonalThemeController::class, 'activate']);
    
    // Effets sonores
    Route::get('/sounds', [SoundEffectController::class, 'index']);
    Route::get('/sounds/categories', [SoundEffectController::class, 'getByCategory']);
    Route::get('/sounds/events/{event}', [SoundEffectController::class, 'getForEvent']);
    Route::post('/sounds', [SoundEffectController::class, 'store']);
    Route::get('/sounds/{id}', [SoundEffectController::class, 'show']);
    Route::put('/sounds/{id}', [SoundEffectController::class, 'update']);
    Route::delete('/sounds/{id}', [SoundEffectController::class, 'destroy']);
    
    // Préférences sonores des utilisateurs
    Route::get('/sounds/preferences', [SoundEffectController::class, 'getUserPreferences']);
    Route::put('/sounds/preferences', [SoundEffectController::class, 'updateUserPreferences']);
    
    // Classements (leaderboards)
    Route::get('/leaderboards', [LeaderboardController::class, 'index']);
    Route::get('/leaderboards/categories/{category}', [LeaderboardController::class, 'byCategory']);
    Route::get('/leaderboards/quizzes/{quizId}', [LeaderboardController::class, 'byQuiz']);
    Route::get('/leaderboards/friends', [LeaderboardController::class, 'friends']);
    Route::get('/leaderboards/user-stats', [LeaderboardController::class, 'userStats']);
    
    // Amis
    Route::get('/friends', [FriendController::class, 'index']);
    Route::post('/friends/send-request', [FriendController::class, 'sendRequest']);
    Route::post('/friends/accept-request', [FriendController::class, 'acceptRequest']);
    Route::post('/friends/reject-request', [FriendController::class, 'rejectRequest']);
    Route::delete('/friends/{friendId}', [FriendController::class, 'removeFriend']);
    Route::post('/friends/block', [FriendController::class, 'blockUser']);
    Route::delete('/friends/unblock/{userId}', [FriendController::class, 'unblockUser']);
    Route::get('/friends/search', [FriendController::class, 'searchUsers']);
});

// Routes pour les quiz accessibles publiquement
Route::get('/quizzes', [QuizController::class, 'index']);
Route::get('/quizzes/{id}', [QuizController::class, 'show']);

// Routes pour les quiz nécessitant une authentification
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/quizzes', [QuizController::class, 'store']);
    Route::put('/quizzes/{id}', [QuizController::class, 'update']);
    Route::delete('/quizzes/{id}', [QuizController::class, 'destroy']);
});