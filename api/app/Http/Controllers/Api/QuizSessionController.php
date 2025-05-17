<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\QuizSession;
use App\Models\Quiz;
use App\Models\Participant;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class QuizSessionController extends Controller
{
    /**
     * Affiche la liste des sessions de quiz.
     * Possibilité de filtrer par statut, par quiz, ou par date.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $query = QuizSession::with(['quiz', 'participants']);
        
        // Filtre par quiz
        if ($request->has('quiz_id')) {
            $query->where('quiz_id', $request->quiz_id);
        }
        
        // Filtre par statut
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        // Filtre par date de début (intervalle)
        if ($request->has('start_date_from') && $request->has('start_date_to')) {
            $query->whereBetween('started_at', [
                Carbon::parse($request->start_date_from)->startOfDay(),
                Carbon::parse($request->start_date_to)->endOfDay()
            ]);
        }
        
        // Tri par date de début par défaut (du plus récent au plus ancien)
        $query->orderBy('started_at', 'desc');
        
        $sessions = $query->get();
        
        return response()->json([
            'status' => 'success',
            'data' => $sessions
        ]);
    }

    /**
     * Crée une nouvelle session de quiz.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'quiz_id' => 'required|integer|exists:quizzes,id',
            'started_at' => 'nullable|date',
            'ended_at' => 'nullable|date|after_or_equal:started_at',
            'status' => 'required|string|in:pending,active,completed,cancelled'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation échouée',
                'errors' => $validator->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        // Vérifier si le quiz existe
        $quiz = Quiz::find($request->quiz_id);
        if (!$quiz) {
            return response()->json([
                'status' => 'error',
                'message' => 'Quiz non trouvé'
            ], Response::HTTP_NOT_FOUND);
        }

        // Définir la date de début par défaut si non spécifiée
        if (!$request->has('started_at')) {
            $request->merge(['started_at' => Carbon::now()]);
        }

        $session = QuizSession::create($request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Session de quiz créée avec succès',
            'data' => $session
        ], Response::HTTP_CREATED);
    }

    /**
     * Affiche une session de quiz spécifique avec ses participants.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $session = QuizSession::with(['quiz', 'participants.user', 'participants.answers'])->find($id);
        
        if (!$session) {
            return response()->json([
                'status' => 'error',
                'message' => 'Session de quiz non trouvée'
            ], Response::HTTP_NOT_FOUND);
        }

        return response()->json([
            'status' => 'success',
            'data' => $session
        ]);
    }

    /**
     * Met à jour une session de quiz spécifique.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $session = QuizSession::find($id);
        
        if (!$session) {
            return response()->json([
                'status' => 'error',
                'message' => 'Session de quiz non trouvée'
            ], Response::HTTP_NOT_FOUND);
        }

        $validator = Validator::make($request->all(), [
            'quiz_id' => 'sometimes|required|integer|exists:quizzes,id',
            'started_at' => 'nullable|date',
            'ended_at' => 'nullable|date|after_or_equal:started_at',
            'status' => 'sometimes|required|string|in:pending,active,completed,cancelled'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation échouée',
                'errors' => $validator->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        // Si on termine la session, définir la date de fin si non spécifiée
        if ($request->has('status') && $request->status === 'completed' && !$request->has('ended_at')) {
            $request->merge(['ended_at' => Carbon::now()]);
        }

        $session->update($request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Session de quiz mise à jour avec succès',
            'data' => $session
        ]);
    }

    /**
     * Supprime une session de quiz spécifique.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $session = QuizSession::find($id);
        
        if (!$session) {
            return response()->json([
                'status' => 'error',
                'message' => 'Session de quiz non trouvée'
            ], Response::HTTP_NOT_FOUND);
        }

        // Vérifier si la session a des participants
        if ($session->participants()->count() > 0) {
            return response()->json([
                'status' => 'error',
                'message' => 'Impossible de supprimer la session car elle a des participants'
            ], Response::HTTP_CONFLICT);
        }

        $session->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Session de quiz supprimée avec succès'
        ]);
    }

    /**
     * Termine une session de quiz active.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function endSession($id)
    {
        $session = QuizSession::find($id);
        
        if (!$session) {
            return response()->json([
                'status' => 'error',
                'message' => 'Session de quiz non trouvée'
            ], Response::HTTP_NOT_FOUND);
        }

        if ($session->status !== 'active') {
            return response()->json([
                'status' => 'error',
                'message' => 'Seule une session active peut être terminée'
            ], Response::HTTP_BAD_REQUEST);
        }

        $session->update([
            'status' => 'completed',
            'ended_at' => Carbon::now()
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Session de quiz terminée avec succès',
            'data' => $session
        ]);
    }

    /**
     * Récupère les résultats d'une session de quiz.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function getResults($id)
    {
        $session = QuizSession::with(['quiz', 'participants.user', 'participants.answers'])->find($id);
        
        if (!$session) {
            return response()->json([
                'status' => 'error',
                'message' => 'Session de quiz non trouvée'
            ], Response::HTTP_NOT_FOUND);
        }

        // Organiser les résultats
        $participants = $session->participants;
        $results = [];

        foreach ($participants as $participant) {
            $results[] = [
                'participant_id' => $participant->id,
                'user_id' => $participant->user_id,
                'username' => $participant->user ? $participant->user->username : $participant->pseudo,
                'score' => $participant->score,
                'joined_at' => $participant->joined_at,
                'answers_count' => $participant->answers->count()
            ];
        }

        // Trier par score décroissant
        usort($results, function($a, $b) {
            return $b['score'] - $a['score'];
        });

        return response()->json([
            'status' => 'success',
            'session' => [
                'id' => $session->id,
                'quiz_name' => $session->quiz->name ?? 'Quiz inconnu',
                'started_at' => $session->started_at,
                'ended_at' => $session->ended_at,
                'status' => $session->status,
                'participants_count' => count($results)
            ],
            'results' => $results
        ]);
    }
}
