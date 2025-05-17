<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\OfflineSession;
use App\Models\Quiz;
use App\Models\Answer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class OfflineSessionController extends Controller
{
    /**
     * Afficher la liste des sessions hors ligne de l'utilisateur.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $sessions = OfflineSession::with('quiz')
            ->where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->paginate(10);
        
        return response()->json($sessions);
    }

    /**
     * Créer une nouvelle session hors ligne.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'quiz_id' => 'required|integer|exists:quizzes,id',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        // Vérifier que le quiz existe et est actif
        $quiz = Quiz::findOrFail($request->quiz_id);
        if ($quiz->status !== 'active') {
            return response()->json([
                'message' => 'Ce quiz n\'est pas disponible pour une session hors ligne'
            ], 422);
        }
        
        $session = new OfflineSession();
        $session->user_id = Auth::id();
        $session->quiz_id = $request->quiz_id;
        $session->data = [
            'started_at' => now()->timestamp,
            'answers' => [],
            'total_score' => 0,
            'correct_count' => 0,
        ];
        $session->save();
        
        return response()->json([
            'message' => 'Session hors ligne créée avec succès',
            'session' => $session
        ], 201);
    }

    /**
     * Afficher une session hors ligne spécifique.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $session = OfflineSession::with('quiz.questions.answers')
            ->where('user_id', Auth::id())
            ->findOrFail($id);
        
        return response()->json($session);
    }

    /**
     * Soumettre une réponse à une question dans une session hors ligne.
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function submitAnswer(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'question_id' => 'required|integer|exists:questions,id',
            'answer_id' => 'required|integer|exists:answers,id',
            'response_time' => 'required|numeric|min:0',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        $session = OfflineSession::where('user_id', Auth::id())->findOrFail($id);
        
        // Vérifier si la session est déjà complétée
        if ($session->isCompleted()) {
            return response()->json([
                'message' => 'Cette session est déjà terminée'
            ], 422);
        }
        
        // Vérifier si la question appartient au quiz de la session
        $quiz = $session->quiz;
        $questionExists = $quiz->questions()->where('id', $request->question_id)->exists();
        if (!$questionExists) {
            return response()->json([
                'message' => 'Cette question n\'appartient pas au quiz de cette session'
            ], 422);
        }
        
        // Vérifier si la réponse appartient à la question
        $answer = Answer::findOrFail($request->answer_id);
        if ($answer->question_id != $request->question_id) {
            return response()->json([
                'message' => 'Cette réponse n\'appartient pas à la question spécifiée'
            ], 422);
        }
        
        // Calculer les points en fonction de la réponse et du temps
        $isCorrect = $answer->revealIsCorrect();
        $pointsEarned = 0;
        
        if ($isCorrect) {
            // Formule : plus le temps de réponse est court, plus les points sont élevés
            $maxPoints = 1000;
            $minPoints = 100;
            $maxTime = 30; // 30 secondes max pour répondre
            
            $responseTime = min($request->response_time, $maxTime);
            $pointsEarned = $maxPoints - (($responseTime / $maxTime) * ($maxPoints - $minPoints));
            $pointsEarned = max((int)$pointsEarned, $minPoints);
        }
        
        // Ajouter la réponse à la session
        $session->addAnswer(
            $request->question_id,
            $request->answer_id,
            $request->response_time,
            $isCorrect,
            $pointsEarned
        );
        
        return response()->json([
            'message' => $isCorrect ? 'Bonne réponse !' : 'Mauvaise réponse.',
            'is_correct' => $isCorrect,
            'points_earned' => $pointsEarned,
            'total_score' => $session->getTotalScore(),
            'correct_count' => $session->getCorrectCount()
        ]);
    }

    /**
     * Terminer une session hors ligne.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function complete($id)
    {
        $session = OfflineSession::where('user_id', Auth::id())->findOrFail($id);
        
        // Vérifier si la session est déjà complétée
        if ($session->isCompleted()) {
            return response()->json([
                'message' => 'Cette session est déjà terminée'
            ], 422);
        }
        
        $session->complete();
        
        return response()->json([
            'message' => 'Session terminée avec succès',
            'total_score' => $session->getTotalScore(),
            'correct_count' => $session->getCorrectCount(),
            'total_questions' => $session->quiz->questions()->count()
        ]);
    }

    /**
     * Synchroniser une session hors ligne avec le serveur.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function synchronize($id)
    {
        $session = OfflineSession::where('user_id', Auth::id())->findOrFail($id);
        
        // Vérifier si la session est déjà synchronisée
        if ($session->synced) {
            return response()->json([
                'message' => 'Cette session est déjà synchronisée'
            ], 422);
        }
        
        // Vérifier si la session est complétée
        if (!$session->isCompleted()) {
            return response()->json([
                'message' => 'La session doit être terminée avant d\'être synchronisée'
            ], 422);
        }
        
        if ($session->synchronize()) {
            return response()->json([
                'message' => 'Session synchronisée avec succès'
            ]);
        }
        
        return response()->json([
            'message' => 'Erreur lors de la synchronisation de la session'
        ], 500);
    }

    /**
     * Supprimer une session hors ligne.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $session = OfflineSession::where('user_id', Auth::id())->findOrFail($id);
        $session->delete();
        
        return response()->json([
            'message' => 'Session supprimée avec succès'
        ]);
    }


    public function update(Request $request, \App\Models\OfflineSession $offlineSession)
    {
        $validated = $request->validate([
            'user_id' => 'required',
            'quiz_id' => 'required',
            'data' => 'required',
            'synced' => 'required',
            'synced_at' => 'required'
        ]);

        $offlineSession->update($validated);

        return redirect()->route('offline-sessions.index');
    }
}