<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Trophy;
use App\Models\UserAchievement;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class TrophyController extends Controller
{
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
        
        // Tri par niveau
        $levelOrder = "CASE 
            WHEN level = 'bronze' THEN 1 
            WHEN level = 'silver' THEN 2 
            WHEN level = 'gold' THEN 3 
            WHEN level = 'platinum' THEN 4 
            ELSE 5 END";
        
        $query->orderByRaw($levelOrder);
        
        $trophies = $query->get();
        
        return response()->json([
            'status' => 'success',
            'data' => $trophies
        ]);
    }

    /**
     * Crée un nouveau trophée.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        
        // Vérifier si l'utilisateur a les droits d'administration
        if (!$user || !$user->roles()->where('name', 'admin')->exists()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Vous n\'avez pas les droits nécessaires pour créer un trophée'
            ], Response::HTTP_FORBIDDEN);
        }
        
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:trophies',
            'description' => 'nullable|string',
            'icon' => 'nullable|string',
            'level' => 'required|string|in:bronze,silver,gold,platinum',
            'requirements' => 'nullable|array'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation échouée',
                'errors' => $validator->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $trophy = Trophy::create($request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Trophée créé avec succès',
            'data' => $trophy
        ], Response::HTTP_CREATED);
    }

    /**
     * Affiche un trophée spécifique.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $trophy = Trophy::with('user_achievements.user')->find($id);
        
        if (!$trophy) {
            return response()->json([
                'status' => 'error',
                'message' => 'Trophée non trouvé'
            ], Response::HTTP_NOT_FOUND);
        }

        return response()->json([
            'status' => 'success',
            'data' => $trophy
        ]);
    }

    /**
     * Met à jour un trophée spécifique.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $user = Auth::user();
        
        // Vérifier si l'utilisateur a les droits d'administration
        if (!$user || !$user->roles()->where('name', 'admin')->exists()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Vous n\'avez pas les droits nécessaires pour modifier un trophée'
            ], Response::HTTP_FORBIDDEN);
        }
        
        $trophy = Trophy::find($id);
        
        if (!$trophy) {
            return response()->json([
                'status' => 'error',
                'message' => 'Trophée non trouvé'
            ], Response::HTTP_NOT_FOUND);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255|unique:trophies,name,' . $id,
            'description' => 'nullable|string',
            'icon' => 'nullable|string',
            'level' => 'sometimes|required|string|in:bronze,silver,gold,platinum',
            'requirements' => 'nullable|array'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation échouée',
                'errors' => $validator->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $trophy->update($request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Trophée mis à jour avec succès',
            'data' => $trophy
        ]);
    }

    /**
     * Supprime un trophée spécifique.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $user = Auth::user();
        
        // Vérifier si l'utilisateur a les droits d'administration
        if (!$user || !$user->roles()->where('name', 'admin')->exists()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Vous n\'avez pas les droits nécessaires pour supprimer un trophée'
            ], Response::HTTP_FORBIDDEN);
        }
        
        $trophy = Trophy::find($id);
        
        if (!$trophy) {
            return response()->json([
                'status' => 'error',
                'message' => 'Trophée non trouvé'
            ], Response::HTTP_NOT_FOUND);
        }
        
        // Vérifier si des utilisateurs ont déjà obtenu ce trophée
        $hasAchievements = UserAchievement::where('trophy_id', $id)->exists();
        
        if ($hasAchievements) {
            return response()->json([
                'status' => 'error',
                'message' => 'Impossible de supprimer ce trophée car il a déjà été attribué à des utilisateurs'
            ], Response::HTTP_CONFLICT);
        }

        $trophy->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Trophée supprimé avec succès'
        ]);
    }

    /**
     * Attribue un trophée à un utilisateur (admin uniquement).
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function awardToUser(Request $request, $id)
    {
        $user = Auth::user();
        
        // Vérifier si l'utilisateur a les droits d'administration
        if (!$user || !$user->roles()->where('name', 'admin')->exists()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Vous n\'avez pas les droits nécessaires pour attribuer un trophée'
            ], Response::HTTP_FORBIDDEN);
        }
        
        $trophy = Trophy::find($id);
        
        if (!$trophy) {
            return response()->json([
                'status' => 'error',
                'message' => 'Trophée non trouvé'
            ], Response::HTTP_NOT_FOUND);
        }
        
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|integer|exists:users,id',
            'notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation échouée',
                'errors' => $validator->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }
        
        // Vérifier si l'utilisateur n'a pas déjà ce trophée
        $existingAchievement = UserAchievement::where('user_id', $request->user_id)
            ->where('trophy_id', $id)
            ->first();
            
        if ($existingAchievement) {
            return response()->json([
                'status' => 'error',
                'message' => 'Cet utilisateur possède déjà ce trophée'
            ], Response::HTTP_CONFLICT);
        }
        
        // Attribuer le trophée
        $achievement = UserAchievement::create([
            'user_id' => $request->user_id,
            'trophy_id' => $id,
            'awarded_by' => $user->id,
            'notes' => $request->notes
        ]);
        
        return response()->json([
            'status' => 'success',
            'message' => 'Trophée attribué avec succès',
            'data' => $achievement
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
        $trophy = Trophy::find($id);
        
        if (!$trophy) {
            return response()->json([
                'status' => 'error',
                'message' => 'Trophée non trouvé'
            ], Response::HTTP_NOT_FOUND);
        }

        $users = UserAchievement::with('user')
            ->where('trophy_id', $id)
            ->get()
            ->map(function($achievement) {
                return [
                    'user_id' => $achievement->user_id,
                    'username' => $achievement->user->username,
                    'avatar' => $achievement->user->avatar,
                    'awarded_at' => $achievement->created_at,
                    'notes' => $achievement->notes
                ];
            });

        return response()->json([
            'status' => 'success',
            'trophy' => [
                'id' => $trophy->id,
                'name' => $trophy->name,
                'level' => $trophy->level,
                'description' => $trophy->description
            ],
            'users' => $users
        ]);
    }
}
