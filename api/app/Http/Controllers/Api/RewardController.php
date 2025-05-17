<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reward;
use App\Models\UserAchievement;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Validator;

class RewardController extends Controller
{
    /**
     * Affiche la liste des récompenses.
     * Possibilité de filtrer par type.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $query = Reward::query();
        
        // Filtre par type
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }
        
        // Tri par points décroissants
        $query->orderBy('points', 'desc');
        
        $rewards = $query->get();
        
        return response()->json([
            'status' => 'success',
            'data' => $rewards
        ]);
    }

    /**
     * Crée une nouvelle récompense.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:rewards',
            'description' => 'nullable|string',
            'icon' => 'nullable|string',
            'points' => 'required|integer|min:0',
            'type' => 'required|string|in:achievement,item,currency,cosmetic'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation échouée',
                'errors' => $validator->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $reward = Reward::create($request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Récompense créée avec succès',
            'data' => $reward
        ], Response::HTTP_CREATED);
    }

    /**
     * Affiche une récompense spécifique.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $reward = Reward::with('user_achievements')->find($id);
        
        if (!$reward) {
            return response()->json([
                'status' => 'error',
                'message' => 'Récompense non trouvée'
            ], Response::HTTP_NOT_FOUND);
        }

        return response()->json([
            'status' => 'success',
            'data' => $reward
        ]);
    }

    /**
     * Met à jour une récompense spécifique.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $reward = Reward::find($id);
        
        if (!$reward) {
            return response()->json([
                'status' => 'error',
                'message' => 'Récompense non trouvée'
            ], Response::HTTP_NOT_FOUND);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255|unique:rewards,name,' . $id,
            'description' => 'nullable|string',
            'icon' => 'nullable|string',
            'points' => 'sometimes|required|integer|min:0',
            'type' => 'sometimes|required|string|in:achievement,item,currency,cosmetic'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation échouée',
                'errors' => $validator->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $reward->update($request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Récompense mise à jour avec succès',
            'data' => $reward
        ]);
    }

    /**
     * Supprime une récompense spécifique.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $reward = Reward::find($id);
        
        if (!$reward) {
            return response()->json([
                'status' => 'error',
                'message' => 'Récompense non trouvée'
            ], Response::HTTP_NOT_FOUND);
        }

        // Vérifier si la récompense est utilisée par des utilisateurs
        $usedByUsers = UserAchievement::where('reward_id', $id)->exists();
        
        if ($usedByUsers) {
            return response()->json([
                'status' => 'error',
                'message' => 'Impossible de supprimer cette récompense car elle est déjà attribuée à des utilisateurs'
            ], Response::HTTP_CONFLICT);
        }

        $reward->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Récompense supprimée avec succès'
        ]);
    }

    /**
     * Récupère les utilisateurs ayant obtenu une récompense spécifique.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function getUsers($id)
    {
        $reward = Reward::find($id);
        
        if (!$reward) {
            return response()->json([
                'status' => 'error',
                'message' => 'Récompense non trouvée'
            ], Response::HTTP_NOT_FOUND);
        }

        $users = UserAchievement::with('user')
            ->where('reward_id', $id)
            ->get()
            ->map(function($achievement) {
                return [
                    'user_id' => $achievement->user_id,
                    'username' => $achievement->user->username,
                    'avatar' => $achievement->user->avatar,
                    'awarded_at' => $achievement->created_at
                ];
            });

        return response()->json([
            'status' => 'success',
            'reward' => [
                'id' => $reward->id,
                'name' => $reward->name,
                'type' => $reward->type,
                'points' => $reward->points
            ],
            'users' => $users
        ]);
    }
}
