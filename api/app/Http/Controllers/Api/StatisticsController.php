<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LearningStats;
use App\Models\User;
use App\Models\Quiz;
use App\Models\Question;
use App\Models\Participant;
use App\Models\QuizSession;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class StatisticsController extends Controller
{
    /**
     * Récupère les statistiques globales de l'utilisateur courant.
     *
     * @return \Illuminate\Http\Response
     */
    public function getUserStats()
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Utilisateur non authentifié'
            ], Response::HTTP_UNAUTHORIZED);
        }

        // Nombre total de quiz complétés
        $completedQuizzes = Participant::where('user_id', $user->id)
            ->distinct('session_id')
            ->count();

        // Score total cumulé
        $totalScore = Participant::where('user_id', $user->id)
            ->sum('score');

        // Nombre total de questions répondues correctement
        $correctAnswers = DB::table('participant_answers')
            ->join('participants', 'participant_answers.participant_id', '=', 'participants.id')
            ->join('answers', 'participant_answers.answer_id', '=', 'answers.id')
            ->where('participants.user_id', $user->id)
            ->where('answers.is_correct', true)
            ->count();

        // Taux de réussite moyen
        $successRates = LearningStats::where('user_id', $user->id)
            ->get()
            ->map(function($stat) {
                return $stat->getSuccessRateAttribute();
            });
        
        $averageSuccessRate = $successRates->count() > 0 
            ? $successRates->avg() 
            : 0;

        // Badges gagnés
        $badgesCount = $user->user_achievements()
            ->whereNotNull('badge_id')
            ->count();

        // Dernière activité
        $lastActivity = Participant::where('user_id', $user->id)
            ->orderBy('joined_at', 'desc')
            ->first();

        return response()->json([
            'status' => 'success',
            'data' => [
                'user_id' => $user->id,
                'username' => $user->username,
                'completed_quizzes' => $completedQuizzes,
                'total_score' => $totalScore,
                'correct_answers' => $correctAnswers,
                'average_success_rate' => round($averageSuccessRate, 2),
                'badges_count' => $badgesCount,
                'last_activity' => $lastActivity ? $lastActivity->joined_at : null
            ]
        ]);
    }

    /**
     * Récupère les statistiques d'apprentissage pour un quiz spécifique.
     *
     * @param  int  $quizId
     * @return \Illuminate\Http\Response
     */
    public function getQuizStats($quizId)
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Utilisateur non authentifié'
            ], Response::HTTP_UNAUTHORIZED);
        }

        $quiz = Quiz::find($quizId);
        
        if (!$quiz) {
            return response()->json([
                'status' => 'error',
                'message' => 'Quiz non trouvé'
            ], Response::HTTP_NOT_FOUND);
        }

        // Statistiques d'apprentissage pour toutes les questions du quiz
        $learningStats = LearningStats::where('user_id', $user->id)
            ->where('quiz_id', $quizId)
            ->with('question')
            ->get();

        // Sessions complétées pour ce quiz
        $completedSessions = DB::table('participants')
            ->join('quiz_sessions', 'participants.session_id', '=', 'quiz_sessions.id')
            ->where('participants.user_id', $user->id)
            ->where('quiz_sessions.quiz_id', $quizId)
            ->count();

        // Meilleur score pour ce quiz
        $bestScore = Participant::whereHas('quiz_session', function($query) use ($quizId) {
                $query->where('quiz_id', $quizId);
            })
            ->where('user_id', $user->id)
            ->max('score');

        // Questions les plus difficiles (taux de réussite le plus bas)
        $difficultQuestions = $learningStats
            ->sortBy(function($stat) {
                return $stat->getSuccessRateAttribute();
            })
            ->take(3)
            ->map(function($stat) {
                return [
                    'question_id' => $stat->question_id,
                    'question_text' => $stat->question->question_text,
                    'success_rate' => $stat->getSuccessRateAttribute(),
                    'attempts' => $stat->correct_count + $stat->incorrect_count
                ];
            })
            ->values();

        // Progression globale sur le quiz
        $totalQuestions = Question::where('quiz_id', $quizId)->count();
        $answeredQuestions = $learningStats->count();
        $progressPercentage = $totalQuestions > 0 
            ? round(($answeredQuestions / $totalQuestions) * 100, 2) 
            : 0;

        return response()->json([
            'status' => 'success',
            'data' => [
                'quiz_id' => $quizId,
                'quiz_name' => $quiz->name,
                'completed_sessions' => $completedSessions,
                'best_score' => $bestScore ?? 0,
                'progress_percentage' => $progressPercentage,
                'questions_count' => $totalQuestions,
                'answered_questions' => $answeredQuestions,
                'difficult_questions' => $difficultQuestions,
                'learning_stats' => $learningStats
            ]
        ]);
    }

    /**
     * Récupère les statistiques d'une question spécifique pour l'utilisateur courant.
     *
     * @param  int  $questionId
     * @return \Illuminate\Http\Response
     */
    public function getQuestionStats($questionId)
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Utilisateur non authentifié'
            ], Response::HTTP_UNAUTHORIZED);
        }

        $question = Question::with('answers')->find($questionId);
        
        if (!$question) {
            return response()->json([
                'status' => 'error',
                'message' => 'Question non trouvée'
            ], Response::HTTP_NOT_FOUND);
        }

        // Statistiques d'apprentissage pour cette question
        $learningStats = LearningStats::where('user_id', $user->id)
            ->where('question_id', $questionId)
            ->first();

        if (!$learningStats) {
            $learningStats = new LearningStats([
                'user_id' => $user->id,
                'quiz_id' => $question->quiz_id,
                'question_id' => $questionId,
                'correct_count' => 0,
                'incorrect_count' => 0,
                'average_time' => 0
            ]);
        }

        // Historique des réponses à cette question
        $answerHistory = DB::table('participant_answers')
            ->join('participants', 'participant_answers.participant_id', '=', 'participants.id')
            ->join('quiz_sessions', 'participants.session_id', '=', 'quiz_sessions.id')
            ->join('answers', 'participant_answers.answer_id', '=', 'answers.id')
            ->where('participants.user_id', $user->id)
            ->where('participant_answers.question_id', $questionId)
            ->select(
                'participant_answers.id',
                'answers.answer_text',
                'answers.is_correct',
                'participant_answers.response_time',
                'participant_answers.points_earned',
                'quiz_sessions.started_at'
            )
            ->orderBy('quiz_sessions.started_at', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => [
                'question_id' => $questionId,
                'question_text' => $question->question_text,
                'quiz_id' => $question->quiz_id,
                'stats' => [
                    'correct_count' => $learningStats->correct_count,
                    'incorrect_count' => $learningStats->incorrect_count,
                    'total_attempts' => $learningStats->correct_count + $learningStats->incorrect_count,
                    'success_rate' => $learningStats->getSuccessRateAttribute(),
                    'average_time' => $learningStats->average_time,
                    'last_reviewed' => $learningStats->last_reviewed_at,
                    'next_review' => $learningStats->next_review_date
                ],
                'answer_history' => $answerHistory
            ]
        ]);
    }

    /**
     * Récupère les statistiques globales de la plateforme (admin uniquement).
     *
     * @return \Illuminate\Http\Response
     */
    public function getPlatformStats()
    {
        $user = Auth::user();
        
        // Vérifier si l'utilisateur est admin
        if (!$user || !$user->roles()->where('name', 'admin')->exists()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Accès refusé. Privilèges administrateur requis.'
            ], Response::HTTP_FORBIDDEN);
        }

        // Utilisateurs actifs sur les 30 derniers jours
        $thirtyDaysAgo = Carbon::now()->subDays(30);
        $activeUsers = Participant::where('joined_at', '>=', $thirtyDaysAgo)
            ->distinct('user_id')
            ->count();

        // Nombre total d'utilisateurs
        $totalUsers = User::count();

        // Nombre total de quiz
        $totalQuizzes = Quiz::count();

        // Nombre total de sessions
        $totalSessions = QuizSession::count();

        // Sessions par jour (30 derniers jours)
        $sessionsByDay = QuizSession::where('created_at', '>=', $thirtyDaysAgo)
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Quiz les plus populaires
        $popularQuizzes = QuizSession::select('quiz_id', DB::raw('count(*) as session_count'))
            ->groupBy('quiz_id')
            ->orderBy('session_count', 'desc')
            ->limit(5)
            ->with('quiz')
            ->get()
            ->map(function($session) {
                return [
                    'quiz_id' => $session->quiz_id,
                    'quiz_name' => $session->quiz->name ?? 'Quiz inconnu',
                    'session_count' => $session->session_count
                ];
            });

        return response()->json([
            'status' => 'success',
            'data' => [
                'total_users' => $totalUsers,
                'active_users_30_days' => $activeUsers,
                'total_quizzes' => $totalQuizzes,
                'total_sessions' => $totalSessions,
                'sessions_by_day' => $sessionsByDay,
                'popular_quizzes' => $popularQuizzes
            ]
        ]);
    }
}
