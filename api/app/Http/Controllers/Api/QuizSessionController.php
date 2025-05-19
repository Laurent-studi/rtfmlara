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
use Illuminate\Support\Facades\Auth;
use App\Models\Answer;
use App\Models\Question;
use App\Models\ParticipantAnswer;

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

    /**
     * Permet à un utilisateur de rejoindre une session de quiz.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $session
     * @return \Illuminate\Http\Response
     */
    public function join(Request $request, $session)
    {
        $session = QuizSession::find($session);
        
        if (!$session) {
            return response()->json([
                'status' => 'error',
                'message' => 'Session de quiz non trouvée'
            ], Response::HTTP_NOT_FOUND);
        }

        // Vérifier que la session est en attente ou active
        if (!in_array($session->status, ['pending', 'active'])) {
            return response()->json([
                'status' => 'error',
                'message' => 'Impossible de rejoindre une session qui n\'est pas en attente ou active'
            ], Response::HTTP_BAD_REQUEST);
        }

        $validator = Validator::make($request->all(), [
            'pseudo' => 'nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation échouée',
                'errors' => $validator->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        // Vérifier si l'utilisateur a déjà rejoint cette session
        $user = Auth::user();
        $existingParticipant = Participant::where([
            'quiz_session_id' => $session->id,
            'user_id' => $user->id
        ])->first();

        if ($existingParticipant) {
            return response()->json([
                'status' => 'error',
                'message' => 'Vous avez déjà rejoint cette session',
                'data' => $existingParticipant
            ], Response::HTTP_CONFLICT);
        }

        // Créer un nouveau participant
        $participant = Participant::create([
            'quiz_session_id' => $session->id,
            'user_id' => $user->id,
            'pseudo' => $request->pseudo ?? $user->username,
            'score' => 0,
            'joined_at' => Carbon::now()
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Vous avez rejoint la session avec succès',
            'data' => $participant
        ], Response::HTTP_CREATED);
    }

    /**
     * Démarre une session de quiz.
     *
     * @param  int  $session
     * @return \Illuminate\Http\Response
     */
    public function start($session)
    {
        $session = QuizSession::find($session);
        
        if (!$session) {
            return response()->json([
                'status' => 'error',
                'message' => 'Session de quiz non trouvée'
            ], Response::HTTP_NOT_FOUND);
        }

        // Vérifier que la session est en attente
        if ($session->status !== 'pending') {
            return response()->json([
                'status' => 'error',
                'message' => 'Seule une session en attente peut être démarrée'
            ], Response::HTTP_BAD_REQUEST);
        }

        // Vérifier qu'il y a au moins un participant
        $participantsCount = $session->participants()->count();
        if ($participantsCount < 1) {
            return response()->json([
                'status' => 'error',
                'message' => 'Impossible de démarrer une session sans participant'
            ], Response::HTTP_BAD_REQUEST);
        }

        // Mettre à jour le statut et la date de début
        $session->update([
            'status' => 'active',
            'started_at' => Carbon::now()
        ]);

        // Récupérer les questions pour ce quiz
        $questions = $session->quiz->questions()->with('answers')->get();

        return response()->json([
            'status' => 'success',
            'message' => 'Session de quiz démarrée avec succès',
            'data' => [
                'session' => $session,
                'questions_count' => $questions->count(),
                'participants_count' => $participantsCount
            ]
        ]);
    }

    /**
     * Soumet une réponse à une question dans une session de quiz.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $session
     * @return \Illuminate\Http\Response
     */
    public function submitAnswer(Request $request, $session)
    {
        $session = QuizSession::find($session);
        
        if (!$session) {
            return response()->json([
                'status' => 'error',
                'message' => 'Session de quiz non trouvée'
            ], Response::HTTP_NOT_FOUND);
        }

        // Vérifier que la session est active
        if ($session->status !== 'active') {
            return response()->json([
                'status' => 'error',
                'message' => 'Impossible de soumettre une réponse pour une session qui n\'est pas active'
            ], Response::HTTP_BAD_REQUEST);
        }

        $validator = Validator::make($request->all(), [
            'question_id' => 'required|integer|exists:questions,id',
            'answer_id' => 'required|integer|exists:answers,id',
            'time_taken' => 'nullable|integer|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation échouée',
                'errors' => $validator->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        // Vérifier que la question fait partie du quiz de cette session
        $question = Question::where('id', $request->question_id)
            ->where('quiz_id', $session->quiz_id)
            ->first();

        if (!$question) {
            return response()->json([
                'status' => 'error',
                'message' => 'Cette question ne fait pas partie du quiz de cette session'
            ], Response::HTTP_BAD_REQUEST);
        }

        // Vérifier que la réponse appartient à la question
        $answer = Answer::where('id', $request->answer_id)
            ->where('question_id', $request->question_id)
            ->first();

        if (!$answer) {
            return response()->json([
                'status' => 'error',
                'message' => 'Cette réponse ne fait pas partie de la question'
            ], Response::HTTP_BAD_REQUEST);
        }

        // Trouver le participant (utilisateur actuel)
        $user = Auth::user();
        $participant = Participant::where([
            'quiz_session_id' => $session->id,
            'user_id' => $user->id
        ])->first();

        if (!$participant) {
            return response()->json([
                'status' => 'error',
                'message' => 'Vous n\'êtes pas participant de cette session'
            ], Response::HTTP_FORBIDDEN);
        }

        // Vérifier si l'utilisateur a déjà répondu à cette question
        $existingAnswer = ParticipantAnswer::where([
            'participant_id' => $participant->id,
            'question_id' => $request->question_id
        ])->first();

        if ($existingAnswer) {
            return response()->json([
                'status' => 'error',
                'message' => 'Vous avez déjà répondu à cette question'
            ], Response::HTTP_CONFLICT);
        }

        // Enregistrer la réponse du participant
        $participantAnswer = ParticipantAnswer::create([
            'participant_id' => $participant->id,
            'question_id' => $request->question_id,
            'answer_id' => $request->answer_id,
            'is_correct' => $answer->is_correct,
            'time_taken' => $request->time_taken ?? 0,
            'submitted_at' => Carbon::now()
        ]);

        // Mettre à jour le score du participant si la réponse est correcte
        if ($answer->is_correct) {
            $participant->increment('score', $question->points ?? 1);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Réponse soumise avec succès',
            'data' => [
                'participant_answer' => $participantAnswer,
                'is_correct' => $answer->is_correct,
                'updated_score' => $participant->score
            ]
        ]);
    }
}
