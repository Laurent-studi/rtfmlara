<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Participant;
use App\Models\QuizSession;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Carbon;

class ParticipantController extends Controller
{
    /**
     * Affiche la liste de tous les participants.
     * Possibilité de filtrer par session (quiz_session_id).
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $query = Participant::with(['quiz_session', 'user', 'answers']);
        
        // Filtre par session
        if ($request->has('session_id')) {
            $query->where('session_id', $request->session_id);
        }
        
        // Filtre par utilisateur
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }
        
        $participants = $query->get();
        
        return response()->json([
            'status' => 'success',
            'data' => $participants
        ]);
    }

    /**
     * Crée un nouveau participant.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'session_id' => 'required|integer|exists:quiz_sessions,id',
            'user_id' => 'nullable|integer|exists:users,id',
            'pseudo' => 'required_without:user_id|nullable|string|max:50',
            'score' => 'nullable|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation échouée',
                'errors' => $validator->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        // Vérifier que la session existe et est ouverte
        $session = QuizSession::find($request->session_id);
        if (!$session || $session->status !== 'active') {
            return response()->json([
                'status' => 'error',
                'message' => 'La session n\'existe pas ou n\'est pas active'
            ], Response::HTTP_BAD_REQUEST);
        }

        // Vérifier que l'utilisateur n'est pas déjà participant à cette session
        if ($request->has('user_id')) {
            $existingParticipant = Participant::where('session_id', $request->session_id)
                ->where('user_id', $request->user_id)
                ->first();
            
            if ($existingParticipant) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Cet utilisateur participe déjà à cette session'
                ], Response::HTTP_CONFLICT);
            }
        }

        // Initialiser le score à 0 si non spécifié
        if (!$request->has('score')) {
            $request->merge(['score' => 0]);
        }

        // Définir la date de participation
        $participantData = $request->all();
        $participantData['joined_at'] = Carbon::now();

        $participant = Participant::create($participantData);

        return response()->json([
            'status' => 'success',
            'message' => 'Participant ajouté avec succès',
            'data' => $participant
        ], Response::HTTP_CREATED);
    }

    /**
     * Affiche un participant spécifique.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $participant = Participant::with(['quiz_session', 'user', 'answers'])->find($id);
        
        if (!$participant) {
            return response()->json([
                'status' => 'error',
                'message' => 'Participant non trouvé'
            ], Response::HTTP_NOT_FOUND);
        }

        return response()->json([
            'status' => 'success',
            'data' => $participant
        ]);
    }

    /**
     * Met à jour un participant spécifique.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $participant = Participant::find($id);
        
        if (!$participant) {
            return response()->json([
                'status' => 'error',
                'message' => 'Participant non trouvé'
            ], Response::HTTP_NOT_FOUND);
        }

        $validator = Validator::make($request->all(), [
            'session_id' => 'sometimes|required|integer|exists:quiz_sessions,id',
            'user_id' => 'nullable|integer|exists:users,id',
            'pseudo' => 'sometimes|required_without:user_id|nullable|string|max:50',
            'score' => 'sometimes|required|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation échouée',
                'errors' => $validator->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        // Vérifier que l'utilisateur n'est pas déjà participant à cette session (si changement de session ou d'utilisateur)
        if (($request->has('session_id') && $request->session_id != $participant->session_id) || 
            ($request->has('user_id') && $request->user_id != $participant->user_id)) {
                
            $existingParticipant = Participant::where('session_id', $request->session_id ?? $participant->session_id)
                ->where('user_id', $request->user_id ?? $participant->user_id)
                ->where('id', '!=', $id)
                ->first();
            
            if ($existingParticipant) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Cet utilisateur participe déjà à cette session'
                ], Response::HTTP_CONFLICT);
            }
        }

        $participant->update($request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Participant mis à jour avec succès',
            'data' => $participant
        ]);
    }

    /**
     * Supprime un participant spécifique.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $participant = Participant::find($id);
        
        if (!$participant) {
            return response()->json([
                'status' => 'error',
                'message' => 'Participant non trouvé'
            ], Response::HTTP_NOT_FOUND);
        }

        // Vérifier si le participant a des réponses
        if ($participant->answers()->count() > 0) {
            return response()->json([
                'status' => 'error',
                'message' => 'Impossible de supprimer ce participant car il a déjà répondu à des questions'
            ], Response::HTTP_CONFLICT);
        }

        $participant->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Participant supprimé avec succès'
        ]);
    }
}
