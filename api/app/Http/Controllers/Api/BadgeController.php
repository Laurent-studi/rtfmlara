<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\BadgeResource;
use App\Models\Badge;
use App\Models\AchievementService;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Validator;

class BadgeController extends Controller
{
    protected AchievementService $achievementService;
    
    /**
     * Constructeur.
     */
    public function __construct(AchievementService $achievementService)
    {
        $this->achievementService = $achievementService;
        $this->authorizeResource(Badge::class, 'badge', [
            'except' => ['index', 'show']
        ]);
    }
    
    /**
     * Affiche la liste de tous les badges.
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $query = Badge::query();
        
        // Filtrer par catégorie si fournie
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }
        
        // Inclure seulement les badges actifs par défaut
        if (!$request->has('include_inactive') || !$request->include_inactive) {
            $query->where('is_active', true);
        }
        
        // Filtrer par recherche
        if ($request->has('search')) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%')
                  ->orWhere('code', 'like', '%' . $request->search . '%');
            });
        }
        
        // Trier
        $sortBy = $request->input('sort_by', 'name');
        $sortOrder = $request->input('sort_order', 'asc');
        $query->orderBy($sortBy, $sortOrder);
        
        // Paginer les résultats
        $perPage = $request->input('per_page', 15);
        $badges = $query->paginate($perPage);
        
        // Si l'utilisateur est authentifié, marquer les badges qu'il possède
        if ($request->user()) {
            $user = $request->user();
            $userBadgeIds = $user->badges()->pluck('id')->toArray();
            
            foreach ($badges as $badge) {
                $badge->is_earned = in_array($badge->id, $userBadgeIds);
                
                if ($badge->is_earned) {
                    $achievement = $user->badges()
                        ->where('id', $badge->id)
                        ->first();
                    
                    if ($achievement && $achievement->pivot) {
                        $badge->earned_at = $achievement->pivot->earned_at;
                    }
                }
            }
        }
        
        return BadgeResource::collection($badges);
    }

    /**
     * Crée un nouveau badge.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:badges',
            'description' => 'nullable|string',
            'icon' => 'nullable|string',
            'category' => 'required|string',
            'criteria' => 'nullable|array',
            'code' => 'nullable|string|unique:badges',
            'image_url' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation échouée',
                'errors' => $validator->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $badge = Badge::create($request->all());

        return new BadgeResource($badge);
    }

    /**
     * Affiche un badge spécifique.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show(Request $request, $id)
    {
        $badge = Badge::findOrFail($id);
        
        // Si l'utilisateur est authentifié, vérifier s'il possède ce badge
        if ($request->user()) {
            $user = $request->user();
            $badge->is_earned = $user->hasBadge($badge->id);
            
            if ($badge->is_earned) {
                $achievement = $user->badges()
                    ->where('id', $badge->id)
                    ->first();
                
                if ($achievement && $achievement->pivot) {
                    $badge->earned_at = $achievement->pivot->earned_at;
                }
            }
        }

        return new BadgeResource($badge);
    }

    /**
     * Met à jour un badge spécifique.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  Badge  $badge
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Badge $badge)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255|unique:badges,name,' . $badge->id,
            'description' => 'nullable|string',
            'icon' => 'nullable|string',
            'category' => 'sometimes|required|string',
            'criteria' => 'nullable|array',
            'code' => 'nullable|string|unique:badges,code,' . $badge->id,
            'image_url' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation échouée',
                'errors' => $validator->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $badge->update($request->all());

        return new BadgeResource($badge);
    }

    /**
     * Supprime un badge spécifique.
     *
     * @param  Badge  $badge
     * @return \Illuminate\Http\Response
     */
    public function destroy(Badge $badge)
    {
        $badge->delete();

        return response()->json([
            'message' => 'Badge supprimé avec succès'
        ]);
    }
    
    /**
     * Attribue manuellement un badge à un utilisateur.
     *
     * @param  Request  $request
     * @param  Badge  $badge
     * @return \Illuminate\Http\Response
     */
    public function award(Request $request, Badge $badge)
    {
        $this->authorize('award', $badge);
        
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'data' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation échouée',
                'errors' => $validator->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }
        
        $user = User::findOrFail($request->user_id);
        $data = $request->input('data', []);
        
        $achievement = $this->achievementService->awardBadge($user, $badge, $data);
        
        return response()->json([
            'message' => 'Badge attribué avec succès',
            'achievement' => new UserAchievementResource($achievement)
        ]);
    }
}
