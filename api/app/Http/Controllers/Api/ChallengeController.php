<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Challenge;
use App\Models\User;
use App\Models\Quiz;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Validator;

class ChallengeController extends Controller
{
    /**
     * Affiche la liste de tous les défis.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $challenges = Challenge::with(['user', 'quiz'])->get();
        return response()->json([
            'status' => 'success',
            'data' => $challenges
        ]);
    }

    /**
     * Crée un nouveau défi.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'challenger_id' => 'required|integer|exists:users,id',
            'challenged_id' => 'required|integer|exists:users,id',
            'quiz_id' => 'required|integer|exists:quizzes,id',
            'status' => 'required|string|in:pending,accepted,declined,completed',
            'winner_id' => 'nullable|integer|exists:users,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation échouée',
                'errors' => $validator->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        // Vérifier que l'utilisateur ne se défie pas lui-même
        if ($request->challenger_id === $request->challenged_id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Un utilisateur ne peut pas se défier lui-même'
            ], Response::HTTP_BAD_REQUEST);
        }

        $challenge = Challenge::create($request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Défi créé avec succès',
            'data' => $challenge
        ], Response::HTTP_CREATED);
    }

    /**
     * Affiche un défi spécifique.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $challenge = Challenge::with(['user', 'quiz'])->find($id);
        
        if (!$challenge) {
            return response()->json([
                'status' => 'error',
                'message' => 'Défi non trouvé'
            ], Response::HTTP_NOT_FOUND);
        }

        return response()->json([
            'status' => 'success',
            'data' => $challenge
        ]);
    }

    /**
     * Met à jour un défi spécifique.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $challenge = Challenge::find($id);
        
        if (!$challenge) {
            return response()->json([
                'status' => 'error',
                'message' => 'Défi non trouvé'
            ], Response::HTTP_NOT_FOUND);
        }

        $validator = Validator::make($request->all(), [
            'challenger_id' => 'sometimes|required|integer|exists:users,id',
            'challenged_id' => 'sometimes|required|integer|exists:users,id',
            'quiz_id' => 'sometimes|required|integer|exists:quizzes,id',
            'status' => 'sometimes|required|string|in:pending,accepted,declined,completed',
            'winner_id' => 'nullable|integer|exists:users,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation échouée',
                'errors' => $validator->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        // Vérifier que l'utilisateur ne se défie pas lui-même
        if ($request->has('challenger_id') && $request->has('challenged_id') && 
            $request->challenger_id === $request->challenged_id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Un utilisateur ne peut pas se défier lui-même'
            ], Response::HTTP_BAD_REQUEST);
        }

        $challenge->update($request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Défi mis à jour avec succès',
            'data' => $challenge
        ]);
    }

    /**
     * Supprime un défi spécifique.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $challenge = Challenge::find($id);
        
        if (!$challenge) {
            return response()->json([
                'status' => 'error',
                'message' => 'Défi non trouvé'
            ], Response::HTTP_NOT_FOUND);
        }

        $challenge->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Défi supprimé avec succès'
        ]);
    }
}
