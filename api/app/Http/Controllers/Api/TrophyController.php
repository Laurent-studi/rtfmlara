<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TrophyResource;
use App\Http\Resources\UserAchievementResource;
use App\Models\Trophy;
use App\Models\User;
use App\Models\AchievementService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class TrophyController extends Controller
{
    protected AchievementService $achievementService;
    
    /**
     * Constructeur.
     */
    public function __construct(AchievementService $achievementService)
    {
        $this->achievementService = $achievementService;
        $this->authorizeResource(Trophy::class, 'trophy', [
            'except' => ['index', 'show']
        ]);
    }
    
    /**
     * Affiche la liste des trophées.
     * Possibilité de filtrer par niveau.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $query = Trophy::query();
        
        // Filtre par niveau (bronze, argent, or, platine)
        if ($request->has('level')) {
            $query->where('level', $request->level);
        }
        
        // Filtrer par catégorie si fournie
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }
        
        // Inclure seulement les trophées actifs par défaut
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
        
        // Tri par niveau
        if ($request->input('sort_by', 'level') === 'level') {
            $levelOrder = "CASE 
                WHEN level = 'bronze' THEN 1 
                WHEN level = 'silver' THEN 2 
                WHEN level = 'gold' THEN 3 
                WHEN level = 'platinum' THEN 4 
                ELSE 5 END";
            
            $sortOrder = $request->input('sort_order', 'asc');
            $query->orderByRaw($levelOrder . ' ' . strtoupper($sortOrder));
        } else {
            // Trier par un autre champ
            $sortBy = $request->input('sort_by', 'level');
            $sortOrder = $request->input('sort_order', 'asc');
            $query->orderBy($sortBy, $sortOrder);
        }
        
        // Paginer les résultats
        $perPage = $request->input('per_page', 15);
        $trophies = $query->paginate($perPage);
        
        // Si l'utilisateur est authentifié, marquer les trophées qu'il possède
        if ($request->user()) {
            $user = $request->user();
            $userTrophyIds = $user->trophies()->pluck('id')->toArray();
            
            foreach ($trophies as $trophy) {
                $trophy->is_earned = in_array($trophy->id, $userTrophyIds);
                
                if ($trophy->is_earned) {
                    $achievement = $user->trophies()
                        ->where('id', $trophy->id)
                        ->first();
                    
                    if ($achievement && $achievement->pivot) {
                        $trophy->earned_at = $achievement->pivot->earned_at;
                    }
                }
            }
        }
        
        return TrophyResource::collection($trophies);
    }

    /**
     * Crée un nouveau trophée.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:trophies',
            'description' => 'nullable|string',
            'icon' => 'nullable|string',
            'level' => 'required|string|in:bronze,silver,gold,platinum',
            'category' => 'required|string',
            'criteria' => 'nullable|array',
            'code' => 'nullable|string|unique:trophies',
            'image_url' => 'nullable|string',
            'points' => 'required|integer|min:0',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation échouée',
                'errors' => $validator->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $trophy = Trophy::create($request->all());

        return new TrophyResource($trophy);
    }

    /**
     * Affiche un trophée spécifique.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show(Request $request, $id)
    {
        $trophy = Trophy::findOrFail($id);
        
        // Si l'utilisateur est authentifié, vérifier s'il possède ce trophée
        if ($request->user()) {
            $user = $request->user();
            $trophy->is_earned = $user->hasTrophy($trophy->id);
            
            if ($trophy->is_earned) {
                $achievement = $user->trophies()
                    ->where('id', $trophy->id)
                    ->first();
                
                if ($achievement && $achievement->pivot) {
                    $trophy->earned_at = $achievement->pivot->earned_at;
                }
            }
        }

        return new TrophyResource($trophy);
    }

    /**
     * Met à jour un trophée spécifique.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  Trophy  $trophy
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Trophy $trophy)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255|unique:trophies,name,' . $trophy->id,
            'description' => 'nullable|string',
            'icon' => 'nullable|string',
            'level' => 'sometimes|required|string|in:bronze,silver,gold,platinum',
            'category' => 'sometimes|required|string',
            'criteria' => 'nullable|array',
            'code' => 'nullable|string|unique:trophies,code,' . $trophy->id,
            'image_url' => 'nullable|string',
            'points' => 'sometimes|required|integer|min:0',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation échouée',
                'errors' => $validator->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $trophy->update($request->all());

        return new TrophyResource($trophy);
    }

    /**
     * Supprime un trophée spécifique.
     *
     * @param  Trophy  $trophy
     * @return \Illuminate\Http\Response
     */
    public function destroy(Trophy $trophy)
    {
        // Vérifier si des utilisateurs ont déjà obtenu ce trophée
        $hasAchievements = $trophy->users()->exists();
        
        if ($hasAchievements) {
            return response()->json([
                'message' => 'Impossible de supprimer ce trophée car il a déjà été attribué à des utilisateurs'
            ], Response::HTTP_CONFLICT);
        }

        $trophy->delete();

        return response()->json([
            'message' => 'Trophée supprimé avec succès'
        ]);
    }

    /**
     * Attribue un trophée à un utilisateur.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  Trophy  $trophy
     * @return \Illuminate\Http\Response
     */
    public function award(Request $request, Trophy $trophy)
    {
        $this->authorize('award', $trophy);
        
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
        
        $achievement = $this->achievementService->awardTrophy($user, $trophy, $data);
        
        return response()->json([
            'message' => 'Trophée attribué avec succès',
            'achievement' => new UserAchievementResource($achievement)
        ]);
    }
    
    /**
     * Récupère les utilisateurs qui ont obtenu un trophée spécifique.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function getUsersWithTrophy($id)
    {
        $trophy = Trophy::findOrFail($id);
        $users = $trophy->users()->paginate(20);
        
        return response()->json([
            'trophy' => new TrophyResource($trophy),
            'users' => $users,
            'count' => $trophy->users()->count()
        ]);
    }
}
