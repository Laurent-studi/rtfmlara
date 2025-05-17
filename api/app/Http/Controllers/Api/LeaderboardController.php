<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Quiz;
use App\Models\QuizSession;
use App\Models\LearningStat;
use App\Models\League;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Cache;

class LeaderboardController extends Controller
{
    /**
     * Récupérer le classement global des utilisateurs
     * Optionnellement filtrable par période (jour, semaine, mois, année, tous)
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'period' => 'nullable|string|in:day,week,month,year,all',
                'limit' => 'nullable|integer|min:1|max:100',
                'page' => 'nullable|integer|min:1',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Erreur de validation',
                    'errors' => $validator->errors()
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            $period = $request->period ?? 'week';
            $limit = $request->limit ?? 20;
            $page = $request->page ?? 1;
            $cacheKey = "leaderboard_global_{$period}_{$limit}_{$page}";
            $cacheDuration = 30; // Cache pendant 30 minutes

            // Utiliser le cache pour améliorer les performances
            return Cache::remember($cacheKey, $cacheDuration, function () use ($period, $limit, $page) {
                $query = DB::table('quiz_sessions')
                    ->join('users', 'quiz_sessions.user_id', '=', 'users.id')
                    ->select(
                        'users.id',
                        'users.username',
                        'users.avatar',
                        DB::raw('AVG(quiz_sessions.score) as average_score'),
                        DB::raw('SUM(quiz_sessions.score) as total_score'),
                        DB::raw('COUNT(quiz_sessions.id) as sessions_count')
                    )
                    ->where('quiz_sessions.completed', true)
                    ->groupBy('users.id', 'users.username', 'users.avatar');

                // Filtrer par période
                if ($period !== 'all') {
                    $dateColumn = 'quiz_sessions.completed_at';
                    switch ($period) {
                        case 'day':
                            $query->whereDate($dateColumn, '=', now()->toDateString());
                            break;
                        case 'week':
                            $query->whereBetween($dateColumn, [now()->startOfWeek(), now()->endOfWeek()]);
                            break;
                        case 'month':
                            $query->whereMonth($dateColumn, '=', now()->month)
                                ->whereYear($dateColumn, '=', now()->year);
                            break;
                        case 'year':
                            $query->whereYear($dateColumn, '=', now()->year);
                            break;
                    }
                }

                $leaderboard = $query->orderBy('total_score', 'desc')
                    ->orderBy('average_score', 'desc')
                    ->paginate($limit, ['*'], 'page', $page);

                // Ajouter le classement à chaque entrée
                $rank = ($page - 1) * $limit + 1;
                foreach ($leaderboard->items() as $item) {
                    $item->rank = $rank++;
                }

                return response()->json([
                    'success' => true,
                    'data' => $leaderboard
                ]);
            });
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Une erreur s\'est produite lors de la récupération du classement',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Récupérer le classement pour une catégorie spécifique
     *
     * @param Request $request
     * @param string $category
     * @return \Illuminate\Http\JsonResponse
     */
    public function byCategory(Request $request, string $category)
    {
        try {
            $validator = Validator::make($request->all(), [
                'period' => 'nullable|string|in:day,week,month,year,all',
                'limit' => 'nullable|integer|min:1|max:100',
                'page' => 'nullable|integer|min:1',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Erreur de validation',
                    'errors' => $validator->errors()
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            $period = $request->period ?? 'week';
            $limit = $request->limit ?? 20;
            $page = $request->page ?? 1;
            $cacheKey = "leaderboard_category_{$category}_{$period}_{$limit}_{$page}";
            $cacheDuration = 30; // 30 minutes

            return Cache::remember($cacheKey, $cacheDuration, function () use ($category, $period, $limit, $page) {
                $query = DB::table('quiz_sessions')
                    ->join('users', 'quiz_sessions.user_id', '=', 'users.id')
                    ->join('quizzes', 'quiz_sessions.quiz_id', '=', 'quizzes.id')
                    ->select(
                        'users.id',
                        'users.username',
                        'users.avatar',
                        DB::raw('AVG(quiz_sessions.score) as average_score'),
                        DB::raw('SUM(quiz_sessions.score) as total_score'),
                        DB::raw('COUNT(quiz_sessions.id) as sessions_count')
                    )
                    ->where('quiz_sessions.completed', true)
                    ->where('quizzes.category', $category)
                    ->groupBy('users.id', 'users.username', 'users.avatar');

                // Filtrer par période
                if ($period !== 'all') {
                    $dateColumn = 'quiz_sessions.completed_at';
                    switch ($period) {
                        case 'day':
                            $query->whereDate($dateColumn, '=', now()->toDateString());
                            break;
                        case 'week':
                            $query->whereBetween($dateColumn, [now()->startOfWeek(), now()->endOfWeek()]);
                            break;
                        case 'month':
                            $query->whereMonth($dateColumn, '=', now()->month)
                                ->whereYear($dateColumn, '=', now()->year);
                            break;
                        case 'year':
                            $query->whereYear($dateColumn, '=', now()->year);
                            break;
                    }
                }

                $leaderboard = $query->orderBy('total_score', 'desc')
                    ->orderBy('average_score', 'desc')
                    ->paginate($limit, ['*'], 'page', $page);

                // Ajouter le classement à chaque entrée
                $rank = ($page - 1) * $limit + 1;
                foreach ($leaderboard->items() as $item) {
                    $item->rank = $rank++;
                }

                return response()->json([
                    'success' => true,
                    'data' => $leaderboard
                ]);
            });
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Une erreur s\'est produite lors de la récupération du classement par catégorie',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Récupérer le classement pour un quiz spécifique
     *
     * @param Request $request
     * @param int $quizId
     * @return \Illuminate\Http\JsonResponse
     */
    public function byQuiz(Request $request, $quizId)
    {
        try {
            // Vérifier si le quiz existe
            $quiz = Quiz::findOrFail($quizId);

            $validator = Validator::make($request->all(), [
                'limit' => 'nullable|integer|min:1|max:100',
                'page' => 'nullable|integer|min:1',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Erreur de validation',
                    'errors' => $validator->errors()
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            $limit = $request->limit ?? 20;
            $page = $request->page ?? 1;
            $cacheKey = "leaderboard_quiz_{$quizId}_{$limit}_{$page}";
            $cacheDuration = 30; // 30 minutes

            return Cache::remember($cacheKey, $cacheDuration, function () use ($quizId, $limit, $page) {
                $leaderboard = DB::table('quiz_sessions')
                    ->join('users', 'quiz_sessions.user_id', '=', 'users.id')
                    ->select(
                        'users.id',
                        'users.username',
                        'users.avatar',
                        'quiz_sessions.score',
                        'quiz_sessions.duration',
                        'quiz_sessions.completed_at',
                        DB::raw('(quiz_sessions.correct_answers / (quiz_sessions.correct_answers + quiz_sessions.wrong_answers)) * 100 as accuracy')
                    )
                    ->where('quiz_sessions.completed', true)
                    ->where('quiz_sessions.quiz_id', $quizId)
                    ->orderBy('quiz_sessions.score', 'desc')
                    ->orderBy('quiz_sessions.duration', 'asc') // Plus rapide en cas d'égalité
                    ->orderBy('quiz_sessions.completed_at', 'desc') // Plus récent en cas d'égalité
                    ->paginate($limit, ['*'], 'page', $page);

                // Ajouter le classement à chaque entrée
                $rank = ($page - 1) * $limit + 1;
                foreach ($leaderboard->items() as $item) {
                    $item->rank = $rank++;
                }

                return response()->json([
                    'success' => true,
                    'data' => $leaderboard
                ]);
            });
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Une erreur s\'est produite lors de la récupération du classement par quiz',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Récupérer le classement des amis de l'utilisateur
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function friends(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non authentifié'
                ], Response::HTTP_UNAUTHORIZED);
            }

            $validator = Validator::make($request->all(), [
                'period' => 'nullable|string|in:day,week,month,year,all',
                'limit' => 'nullable|integer|min:1|max:100',
                'page' => 'nullable|integer|min:1',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Erreur de validation',
                    'errors' => $validator->errors()
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            $period = $request->period ?? 'week';
            $limit = $request->limit ?? 20;
            $page = $request->page ?? 1;

            // Supposons qu'il existe une relation d'amitié entre utilisateurs
            // Ici, vous devriez adapter cette requête selon votre modèle d'amitié
            $friendIds = DB::table('user_friends')
                ->where('user_id', $user->id)
                ->where('status', 'accepted')
                ->pluck('friend_id')
                ->toArray();

            // Ajouter l'utilisateur lui-même pour qu'il puisse voir sa position parmi ses amis
            $friendIds[] = $user->id;

            $query = DB::table('quiz_sessions')
                ->join('users', 'quiz_sessions.user_id', '=', 'users.id')
                ->select(
                    'users.id',
                    'users.username',
                    'users.avatar',
                    DB::raw('AVG(quiz_sessions.score) as average_score'),
                    DB::raw('SUM(quiz_sessions.score) as total_score'),
                    DB::raw('COUNT(quiz_sessions.id) as sessions_count')
                )
                ->where('quiz_sessions.completed', true)
                ->whereIn('users.id', $friendIds)
                ->groupBy('users.id', 'users.username', 'users.avatar');

            // Filtrer par période
            if ($period !== 'all') {
                $dateColumn = 'quiz_sessions.completed_at';
                switch ($period) {
                    case 'day':
                        $query->whereDate($dateColumn, '=', now()->toDateString());
                        break;
                    case 'week':
                        $query->whereBetween($dateColumn, [now()->startOfWeek(), now()->endOfWeek()]);
                        break;
                    case 'month':
                        $query->whereMonth($dateColumn, '=', now()->month)
                            ->whereYear($dateColumn, '=', now()->year);
                        break;
                    case 'year':
                        $query->whereYear($dateColumn, '=', now()->year);
                        break;
                }
            }

            $leaderboard = $query->orderBy('total_score', 'desc')
                ->orderBy('average_score', 'desc')
                ->paginate($limit, ['*'], 'page', $page);

            // Ajouter le classement à chaque entrée
            $rank = ($page - 1) * $limit + 1;
            foreach ($leaderboard->items() as $item) {
                $item->rank = $rank++;
                $item->is_current_user = ($item->id == $user->id);
            }

            return response()->json([
                'success' => true,
                'data' => $leaderboard
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Une erreur s\'est produite lors de la récupération du classement des amis',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Récupérer les statistiques et le classement de l'utilisateur actuel
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function userStats(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non authentifié'
                ], Response::HTTP_UNAUTHORIZED);
            }

            // Récupérer les statistiques de base
            $stats = [
                'quiz_completion' => [
                    'total' => QuizSession::where('user_id', $user->id)->where('completed', true)->count(),
                    'this_week' => QuizSession::where('user_id', $user->id)
                        ->where('completed', true)
                        ->whereBetween('completed_at', [now()->startOfWeek(), now()->endOfWeek()])
                        ->count(),
                ],
                'avg_score' => QuizSession::where('user_id', $user->id)
                    ->where('completed', true)
                    ->avg('score') ?? 0,
                'total_score' => QuizSession::where('user_id', $user->id)
                    ->where('completed', true)
                    ->sum('score'),
                'accuracy' => QuizSession::where('user_id', $user->id)
                    ->where('completed', true)
                    ->select(DB::raw('SUM(correct_answers) / (SUM(correct_answers) + SUM(wrong_answers)) * 100 as accuracy'))
                    ->first()->accuracy ?? 0,
            ];

            // Récupérer la position de l'utilisateur dans différents classements
            $globalRank = DB::table('quiz_sessions')
                ->join('users', 'quiz_sessions.user_id', '=', 'users.id')
                ->select(
                    'users.id',
                    DB::raw('SUM(quiz_sessions.score) as total_score')
                )
                ->where('quiz_sessions.completed', true)
                ->groupBy('users.id')
                ->orderBy('total_score', 'desc')
                ->get()
                ->search(function($item) use ($user) {
                    return $item->id == $user->id;
                });

            $stats['rankings'] = [
                'global' => $globalRank !== false ? $globalRank + 1 : null,
                'league' => null, // À implémenter selon votre logique de ligues
            ];

            // Récupérer la ligue de l'utilisateur
            $league = League::join('user_leagues', 'leagues.id', '=', 'user_leagues.league_id')
                ->where('user_leagues.user_id', $user->id)
                ->where('user_leagues.active', true)
                ->first();

            if ($league) {
                $stats['league'] = [
                    'id' => $league->id,
                    'name' => $league->name,
                    'icon' => $league->icon,
                    'color' => $league->color,
                    'level' => $league->level,
                ];
            }

            // Récupérer les meilleures catégories de l'utilisateur
            $topCategories = DB::table('quiz_sessions')
                ->join('quizzes', 'quiz_sessions.quiz_id', '=', 'quizzes.id')
                ->select(
                    'quizzes.category',
                    DB::raw('COUNT(*) as count'),
                    DB::raw('AVG(quiz_sessions.score) as avg_score')
                )
                ->where('quiz_sessions.user_id', $user->id)
                ->where('quiz_sessions.completed', true)
                ->whereNotNull('quizzes.category')
                ->groupBy('quizzes.category')
                ->orderBy('avg_score', 'desc')
                ->limit(3)
                ->get();

            $stats['top_categories'] = $topCategories;

            // Récupérer l'évolution des performances sur les 7 derniers jours
            $lastWeekPerformance = DB::table('quiz_sessions')
                ->select(
                    DB::raw('DATE(completed_at) as date'),
                    DB::raw('AVG(score) as avg_score'),
                    DB::raw('COUNT(*) as count')
                )
                ->where('user_id', $user->id)
                ->where('completed', true)
                ->whereBetween('completed_at', [now()->subDays(6), now()])
                ->groupBy('date')
                ->orderBy('date', 'asc')
                ->get();

            $stats['performance_trend'] = $lastWeekPerformance;

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Une erreur s\'est produite lors de la récupération des statistiques utilisateur',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
} 