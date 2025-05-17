<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AchievementCollection;
use App\Http\Resources\BadgeResource;
use App\Http\Resources\TrophyResource;
use App\Http\Resources\UserAchievementResource;
use App\Models\AchievementService;
use App\Models\Badge;
use App\Models\Trophy;
use App\Models\User;
use App\Models\UserAchievement;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AchievementController extends Controller
{
    /**
     * Le service d'achievements.
     */
    protected AchievementService $achievementService;
    
    /**
     * Constructeur.
     */
    public function __construct(AchievementService $achievementService)
    {
        $this->achievementService = $achievementService;
    }
    
    /**
     * Récupérer tous les achievements d'un utilisateur.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getUserAchievements(Request $request): JsonResponse
    {
        $user = $request->user();
        
        return response()->json([
            'badges' => BadgeResource::collection($user->badges),
            'trophies' => TrophyResource::collection($user->trophies),
            'points' => $user->getAchievementPoints(),
            'total_count' => $user->badges->count() + $user->trophies->count(),
        ]);
    }
    
    /**
     * Récupérer tous les achievements d'un utilisateur spécifique.
     *
     * @param User $user
     * @return JsonResponse
     */
    public function getAchievementsForUser(User $user): JsonResponse
    {
        $this->authorize('viewAchievements', $user);
        
        return response()->json([
            'badges' => BadgeResource::collection($user->badges),
            'trophies' => TrophyResource::collection($user->trophies),
            'points' => $user->getAchievementPoints(),
            'total_count' => $user->badges->count() + $user->trophies->count(),
        ]);
    }
    
    /**
     * Récupérer les achievements non obtenus par l'utilisateur.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getUnachievedAchievements(Request $request): JsonResponse
    {
        $user = $request->user();
        
        return response()->json([
            'badges' => BadgeResource::collection($user->getUnachievedBadges()),
            'trophies' => TrophyResource::collection($user->getUnachievedTrophies()),
        ]);
    }
    
    /**
     * Vérifier si l'utilisateur a obtenu de nouveaux achievements.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function checkForNewAchievements(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $newBadges = $this->achievementService->checkAndAwardBadges($user);
        $newTrophies = $this->achievementService->checkAndAwardTrophies($user);
        
        return response()->json([
            'new_badges' => BadgeResource::collection($newBadges),
            'new_trophies' => TrophyResource::collection($newTrophies),
            'total_new' => count($newBadges) + count($newTrophies),
        ]);
    }
    
    /**
     * Récupérer les derniers achievements obtenus par l'utilisateur.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getRecentAchievements(Request $request): JsonResponse
    {
        $user = $request->user();
        $limit = $request->input('limit', 5);
        
        $recentAchievements = UserAchievement::where('user_id', $user->id)
            ->orderBy('earned_at', 'desc')
            ->limit($limit)
            ->get();
        
        return response()->json([
            'achievements' => UserAchievementResource::collection($recentAchievements),
        ]);
    }
    
    /**
     * Récupérer les achievements par catégorie.
     *
     * @param Request $request
     * @param string $category
     * @return JsonResponse
     */
    public function getAchievementsByCategory(Request $request, string $category): JsonResponse
    {
        $user = $request->user();
        
        // Récupérer les badges de cette catégorie
        $badges = Badge::where('category', $category)
            ->where('is_active', true)
            ->get();
        
        // Marquer les badges déjà obtenus
        foreach ($badges as $badge) {
            $badge->is_earned = $user->hasBadge($badge->id);
            if ($badge->is_earned) {
                $achievement = UserAchievement::where('user_id', $user->id)
                    ->where('achievable_type', Badge::class)
                    ->where('achievable_id', $badge->id)
                    ->first();
                $badge->earned_at = $achievement ? $achievement->earned_at : null;
            }
        }
        
        // Récupérer les trophées liés à cette catégorie
        $trophies = Trophy::where('category', $category)
            ->where('is_active', true)
            ->get();
        
        // Marquer les trophées déjà obtenus
        foreach ($trophies as $trophy) {
            $trophy->is_earned = $user->hasTrophy($trophy->id);
            if ($trophy->is_earned) {
                $achievement = UserAchievement::where('user_id', $user->id)
                    ->where('achievable_type', Trophy::class)
                    ->where('achievable_id', $trophy->id)
                    ->first();
                $trophy->earned_at = $achievement ? $achievement->earned_at : null;
            }
        }
        
        return response()->json([
            'category' => $category,
            'badges' => BadgeResource::collection($badges),
            'trophies' => TrophyResource::collection($trophies),
        ]);
    }
    
    /**
     * Récupérer les catégories d'achievements disponibles.
     *
     * @return JsonResponse
     */
    public function getCategories(): JsonResponse
    {
        // Récupérer toutes les catégories uniques de badges et trophées
        $badgeCategories = Badge::where('is_active', true)
            ->distinct()
            ->pluck('category');
            
        $trophyCategories = Trophy::where('is_active', true)
            ->distinct()
            ->pluck('category');
            
        $categories = $badgeCategories->merge($trophyCategories)->unique()->values();
        
        return response()->json([
            'categories' => $categories,
        ]);
    }
} 