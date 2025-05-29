<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\QuizSession;
use App\Models\Quiz;
use App\Models\Participant;
use App\Models\Question;
use App\Models\User;
use App\Models\ParticipantAnswer;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class PresentationController extends Controller
{
    /**
     * Crée une nouvelle session de présentation pour un quiz.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function createSession(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'quiz_id' => 'required|integer|exists:quizzes,id',
            'session_settings' => 'nullable|array'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation échouée',
                'errors' => $validator->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        // Vérifier que l'utilisateur est le créateur du quiz ou a les droits
        $quiz = Quiz::findOrFail($request->quiz_id);
        $user = Auth::user();

        if ($quiz->creator_id !== $user->id && !$user->hasRole(['admin', 'moderator'])) {
            return response()->json([
                'success' => false,
                'message' => 'Vous n\'êtes pas autorisé à présenter ce quiz'
            ], Response::HTTP_FORBIDDEN);
        }

        // Vérifier que le quiz contient des questions
        $questionsCount = $quiz->questions()->count();
        if ($questionsCount === 0) {
            return response()->json([
                'success' => false,
                'message' => 'Ce quiz ne contient aucune question et ne peut pas être présenté'
            ], Response::HTTP_BAD_REQUEST);
        }

        DB::beginTransaction();
        try {
            // Créer la session de présentation
            $session = new QuizSession();
            $session->quiz_id = $quiz->id;
            $session->presenter_id = $user->id;
            $session->status = 'pending';
            $session->is_presentation_mode = true;
            $session->current_question_index = 0;
            $session->join_code = QuizSession::generateJoinCode();
            $session->session_settings = $request->session_settings;
            $session->save();

            // Ajouter le présentateur comme participant spécial
            $presenter = new Participant();
            $presenter->quiz_session_id = $session->id;
            $presenter->user_id = $user->id;
            $presenter->pseudo = $user->name;
            $presenter->score = 0;
            $presenter->joined_at = Carbon::now();
            $presenter->is_presenter_mode = true;
            $presenter->save();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Session de présentation créée avec succès',
                'data' => [
                    'session' => $session,
                    'join_code' => $session->join_code,
                    'questions_count' => $questionsCount
                ]
            ], Response::HTTP_CREATED);
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Une erreur s\'est produite lors de la création de la session',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Démarre une session de présentation.
     *
     * @param  int  $sessionId
     * @return \Illuminate\Http\Response
     */
    public function startPresentation($sessionId)
    {
        $session = QuizSession::findOrFail($sessionId);
        $user = Auth::user();

        // Vérifier que l'utilisateur est le présentateur
        if ($session->presenter_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Vous n\'êtes pas le présentateur de cette session'
            ], Response::HTTP_FORBIDDEN);
        }

        // Vérifier que la session est en attente
        if ($session->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Cette session ne peut pas être démarrée car elle n\'est pas en attente'
            ], Response::HTTP_BAD_REQUEST);
        }

        // Démarrer la session
        $session->status = 'active';
        $session->started_at = Carbon::now();
        $session->save();

        // Récupérer la première question
        $question = $session->getCurrentQuestion();
        
        if (!$question) {
            return response()->json([
                'success' => false,
                'message' => 'Aucune question disponible pour cette session'
            ], Response::HTTP_BAD_REQUEST);
        }

        // Récupérer les participants
        $participants = $session->participants()
            ->where('is_presenter_mode', false)
            ->count();

        return response()->json([
            'success' => true,
            'message' => 'Session de présentation démarrée avec succès',
            'data' => [
                'session' => $session,
                'current_question' => [
                    'id' => $question->id,
                    'text' => $question->question_text,
                    'multiple_answers' => $question->multiple_answers,
                    'points' => $question->points,
                    'order_index' => $question->order_index,
                    'answers' => $question->answers()->select('id', 'answer_text')->get()
                ],
                'question_index' => $session->current_question_index + 1,
                'total_questions' => $session->getTotalQuestionsCount(),
                'participants_count' => $participants
            ]
        ]);
    }

    /**
     * Passe à la question suivante dans une présentation.
     *
     * @param  int  $sessionId
     * @return \Illuminate\Http\Response
     */
    public function nextQuestion($sessionId)
    {
        $session = QuizSession::findOrFail($sessionId);
        $user = Auth::user();

        // Vérifier que l'utilisateur est le présentateur
        if ($session->presenter_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Vous n\'êtes pas le présentateur de cette session'
            ], Response::HTTP_FORBIDDEN);
        }

        // Vérifier que la session est active
        if ($session->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'Cette session n\'est pas active'
            ], Response::HTTP_BAD_REQUEST);
        }

        // Si c'est la dernière question, terminer la session
        if ($session->isLastQuestion()) {
            $session->status = 'completed';
            $session->ended_at = Carbon::now();
            $session->save();

            return response()->json([
                'success' => true,
                'message' => 'Toutes les questions ont été présentées. Session terminée.',
                'data' => [
                    'session' => $session,
                    'is_completed' => true,
                    'leaderboard' => $session->getLeaderboard()
                ]
            ]);
        }

        // Passer à la question suivante
        $question = $session->nextQuestion();
        
        if (!$question) {
            return response()->json([
                'success' => false,
                'message' => 'Impossible de passer à la question suivante'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        return response()->json([
            'success' => true,
            'message' => 'Question suivante chargée avec succès',
            'data' => [
                'current_question' => [
                    'id' => $question->id,
                    'text' => $question->question_text,
                    'multiple_answers' => $question->multiple_answers,
                    'points' => $question->points,
                    'order_index' => $question->order_index,
                    'answers' => $question->answers()->select('id', 'answer_text')->get()
                ],
                'question_index' => $session->current_question_index + 1,
                'total_questions' => $session->getTotalQuestionsCount(),
                'is_last_question' => $session->isLastQuestion()
            ]
        ]);
    }

    /**
     * Affiche le classement actuel pour une session de présentation.
     *
     * @param  int  $sessionId
     * @return \Illuminate\Http\Response
     */
    public function showLeaderboard($sessionId)
    {
        $session = QuizSession::findOrFail($sessionId);
        $user = Auth::user();

        // Pour les utilisateurs connectés, vérifier qu'ils sont autorisés
        if ($user) {
            $isParticipant = $session->participants()->where('user_id', $user->id)->exists();
            
            if ($session->presenter_id !== $user->id && !$isParticipant) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous n\'êtes pas autorisé à voir ce classement'
                ], Response::HTTP_FORBIDDEN);
            }
        }
        // Pour les utilisateurs anonymes, permettre l'accès au classement public

        return response()->json([
            'success' => true,
            'data' => [
                'session' => [
                    'id' => $session->id,
                    'status' => $session->status,
                    'question_index' => $session->current_question_index + 1,
                    'total_questions' => $session->getTotalQuestionsCount()
                ],
                'leaderboard' => $session->getLeaderboard()
            ]
        ]);
    }

    /**
     * Rejoint une session de présentation en tant que participant.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function joinSession(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'join_code' => 'required|string|size:6',
            'pseudo' => 'required|string|max:50|min:2'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation échouée',
                'errors' => $validator->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        // Rechercher la session avec ce code
        $session = QuizSession::where('join_code', $request->join_code)
            ->whereIn('status', ['pending', 'active'])
            ->first();
            
        if (!$session) {
            return response()->json([
                'success' => false,
                'message' => 'Session introuvable ou expirée'
            ], Response::HTTP_NOT_FOUND);
        }

        // Récupérer l'utilisateur s'il est connecté (optionnel)
        $user = Auth::user();
        $userId = $user ? $user->id : null;

        // Vérifier si l'utilisateur connecté a déjà rejoint cette session
        if ($userId) {
            $existingParticipant = Participant::where([
                'quiz_session_id' => $session->id,
                'user_id' => $userId
            ])->first();

            if ($existingParticipant) {
                // Si l'utilisateur a déjà rejoint, le réactiver
                $existingParticipant->is_active = true;
                $existingParticipant->pseudo = $request->pseudo; // Mettre à jour le pseudo
                $existingParticipant->save();
                
                return response()->json([
                    'success' => true,
                    'message' => 'Vous avez rejoint à nouveau la session',
                    'data' => [
                        'session' => [
                            'id' => $session->id,
                            'status' => $session->status,
                            'quiz' => [
                                'id' => $session->quiz->id,
                                'title' => $session->quiz->title
                            ]
                        ],
                        'participant' => $existingParticipant,
                        'is_anonymous' => false
                    ]
                ]);
            }
        }

        // Vérifier si le pseudo est déjà utilisé dans cette session
        $pseudoExists = Participant::where([
            'quiz_session_id' => $session->id,
            'pseudo' => $request->pseudo,
            'is_active' => true
        ])->exists();

        if ($pseudoExists) {
            return response()->json([
                'success' => false,
                'message' => 'Ce pseudo est déjà utilisé dans cette session. Veuillez en choisir un autre.'
            ], Response::HTTP_CONFLICT);
        }

        // Créer un nouveau participant
        $participant = new Participant();
        $participant->quiz_session_id = $session->id;
        $participant->user_id = $userId; // Peut être null pour les utilisateurs anonymes
        $participant->pseudo = $request->pseudo;
        $participant->score = 0;
        $participant->joined_at = Carbon::now();
        $participant->is_active = true;
        $participant->is_presenter_mode = false;
        $participant->save();

        return response()->json([
            'success' => true,
            'message' => 'Vous avez rejoint la session avec succès',
            'data' => [
                'session' => [
                    'id' => $session->id,
                    'status' => $session->status,
                    'quiz' => [
                        'id' => $session->quiz->id,
                        'title' => $session->quiz->title
                    ]
                ],
                'participant' => $participant,
                'is_anonymous' => !$userId
            ]
        ], Response::HTTP_CREATED);
    }

    /**
     * Soumet une réponse à la question actuelle.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $sessionId
     * @return \Illuminate\Http\Response
     */
    public function submitAnswer(Request $request, $sessionId)
    {
        $validator = Validator::make($request->all(), [
            'answer_ids' => 'required|array',
            'answer_ids.*' => 'required|integer|exists:answers,id',
            'time_taken' => 'required|integer|min:0',
            'participant_id' => 'required|integer|exists:participants,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation échouée',
                'errors' => $validator->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $session = QuizSession::findOrFail($sessionId);

        // Vérifier que la session est active
        if ($session->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'Cette session n\'est pas active'
            ], Response::HTTP_BAD_REQUEST);
        }

        // Récupérer le participant par son ID
        $participant = Participant::where([
            'id' => $request->participant_id,
            'quiz_session_id' => $session->id,
            'is_active' => true
        ])->first();

        if (!$participant) {
            return response()->json([
                'success' => false,
                'message' => 'Participant introuvable ou inactif dans cette session'
            ], Response::HTTP_FORBIDDEN);
        }

        // Vérification supplémentaire pour les utilisateurs connectés
        $user = Auth::user();
        if ($user && $participant->user_id && $participant->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Vous n\'êtes pas autorisé à soumettre des réponses pour ce participant'
            ], Response::HTTP_FORBIDDEN);
        }

        // Récupérer la question actuelle
        $currentQuestion = $session->getCurrentQuestion();
        if (!$currentQuestion) {
            return response()->json([
                'success' => false,
                'message' => 'Aucune question en cours pour cette session'
            ], Response::HTTP_BAD_REQUEST);
        }

        // Vérifier que le participant n'a pas déjà répondu à cette question
        $hasAnswered = ParticipantAnswer::where([
            'participant_id' => $participant->id,
            'question_id' => $currentQuestion->id
        ])->exists();

        if ($hasAnswered) {
            return response()->json([
                'success' => false,
                'message' => 'Ce participant a déjà répondu à cette question'
            ], Response::HTTP_CONFLICT);
        }

        // Vérifier les réponses
        $answerIds = $request->answer_ids;
        $correctAnswers = $currentQuestion->answers()->where('is_correct', true)->pluck('id')->toArray();

        // Calculer le nombre de points
        $basePoints = $currentQuestion->points;
        $timePoints = max(0, $basePoints - ($request->time_taken * 10)); // 10 points déduits par 0.1 seconde

        // Vérifier si toutes les réponses sont correctes
        $isAllCorrect = count(array_diff($correctAnswers, $answerIds)) === 0 && 
                        count(array_diff($answerIds, $correctAnswers)) === 0;

        // Si c'est partiellement correct (pour les questions à choix multiples)
        $isPartiallyCorrect = false;
        $partialPoints = 0;

        if (!$isAllCorrect && $currentQuestion->multiple_answers && count($correctAnswers) > 1) {
            $correctCount = count(array_intersect($answerIds, $correctAnswers));
            $incorrectCount = count(array_diff($answerIds, $correctAnswers));
            
            if ($correctCount > 0) {
                $isPartiallyCorrect = true;
                // Points proportionnels au nombre de réponses correctes, pénalité pour les incorrectes
                $partialPoints = ($correctCount / count($correctAnswers)) * $timePoints * 
                                 max(0, 1 - ($incorrectCount * 0.25));
            }
        }

        $earnedPoints = $isAllCorrect ? $timePoints : ($isPartiallyCorrect ? (int)$partialPoints : 0);

        // Enregistrer les réponses
        DB::beginTransaction();
        try {
            foreach ($answerIds as $answerId) {
                ParticipantAnswer::create([
                    'participant_id' => $participant->id,
                    'question_id' => $currentQuestion->id,
                    'answer_id' => $answerId,
                    'response_time' => $request->time_taken,
                    'points_earned' => $earnedPoints / count($answerIds)
                ]);
            }

            // Mettre à jour le score du participant
            $participant->score += $earnedPoints;
            $participant->save();

            DB::commit();

            // Récupérer les réponses correctes et leurs explications
            $correctAnswersWithExplanations = $currentQuestion->answers()
                ->where('is_correct', true)
                ->select('id', 'answer_text', 'explanation')
                ->get();

            return response()->json([
                'success' => true,
                'message' => 'Réponse enregistrée avec succès',
                'data' => [
                    'is_correct' => $isAllCorrect,
                    'is_partially_correct' => !$isAllCorrect && $isPartiallyCorrect,
                    'points_earned' => $earnedPoints,
                    'total_score' => $participant->score,
                    'correct_answers' => $correctAnswersWithExplanations
                ]
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Une erreur s\'est produite lors de l\'enregistrement de la réponse',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Termine une session de présentation.
     *
     * @param  int  $sessionId
     * @return \Illuminate\Http\Response
     */
    public function endPresentation($sessionId)
    {
        $session = QuizSession::findOrFail($sessionId);
        $user = Auth::user();

        // Vérifier que l'utilisateur est le présentateur
        if ($session->presenter_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Vous n\'êtes pas le présentateur de cette session'
            ], Response::HTTP_FORBIDDEN);
        }

        // Terminer la session
        $session->status = 'completed';
        $session->ended_at = Carbon::now();
        $session->save();

        return response()->json([
            'success' => true,
            'message' => 'Session de présentation terminée avec succès',
            'data' => [
                'session' => $session,
                'leaderboard' => $session->getLeaderboard(),
                'stats' => [
                    'duration' => $session->started_at->diffInMinutes($session->ended_at),
                    'participants_count' => $session->participants()->where('is_presenter_mode', false)->count(),
                    'questions_completed' => $session->current_question_index + 1,
                    'total_questions' => $session->getTotalQuestionsCount()
                ]
            ]
        ]);
    }

    /**
     * Obtient l'état actuel d'une session de présentation.
     *
     * @param  int  $sessionId
     * @return \Illuminate\Http\Response
     */
    public function getSessionState($sessionId)
    {
        $session = QuizSession::findOrFail($sessionId);
        $user = Auth::user();

        $participant = null;
        $isPresenter = false;
        $isPublicAccess = false;

        // Pour les utilisateurs connectés, vérifier qu'ils sont participants ou présentateurs
        if ($user) {
            $participant = $session->participants()->where('user_id', $user->id)->first();
            
            // Vérifier si l'utilisateur est le présentateur de la session
            $isPresenter = ($session->presenter_id === $user->id);
            
            if ($participant) {
                $isPresenter = $participant->is_presenter_mode;
            }
        } else {
            // Pour les utilisateurs anonymes, permettre l'accès public aux sessions de présentation
            $isPublicAccess = true;
        }

        $currentQuestion = null;
        
        if ($session->status === 'active') {
            $questionObj = $session->getCurrentQuestion();
            
            if ($questionObj) {
                $currentQuestion = [
                    'id' => $questionObj->id,
                    'text' => $questionObj->question_text,
                    'multiple_answers' => $questionObj->multiple_answers,
                    'points' => $questionObj->points,
                    'order_index' => $questionObj->order_index
                ];
                
                // Pour les présentateurs, ajouter les réponses avec indication des réponses correctes
                if ($isPresenter) {
                    $currentQuestion['answers'] = $questionObj->answers()
                        ->select('id', 'answer_text', 'is_correct', 'explanation')
                        ->get();
                } else {
                    // Pour les participants, seulement les réponses sans indication
                    $currentQuestion['answers'] = $questionObj->answers()
                        ->select('id', 'answer_text')
                        ->get();
                        
                    // Vérifier si le participant a déjà répondu (seulement pour les utilisateurs connectés)
                    if ($participant) {
                        $hasAnswered = ParticipantAnswer::where([
                            'participant_id' => $participant->id,
                            'question_id' => $questionObj->id
                        ])->exists();
                        
                        $currentQuestion['has_answered'] = $hasAnswered;
                    }
                }
            }
        }

        $response = [
            'success' => true,
            'data' => [
                'session' => [
                    'id' => $session->id,
                    'status' => $session->status,
                    'join_code' => $session->join_code,
                    'started_at' => $session->started_at,
                    'ended_at' => $session->ended_at,
                    'is_presentation_mode' => $session->is_presentation_mode,
                    'question_index' => $session->current_question_index + 1,
                    'total_questions' => $session->getTotalQuestionsCount()
                ],
                'current_question' => $currentQuestion
            ]
        ];
        
        // Ajouter les informations du participant seulement s'il existe
        if ($participant) {
            $response['data']['participant'] = [
                'id' => $participant->id,
                'score' => $participant->score,
                'is_presenter' => $isPresenter
            ];
        }
        
        // Pour les présentateurs, les sessions terminées, ou l'accès public : ajouter le classement et les participants
        if ($session->status === 'completed' || $isPresenter || $isPublicAccess) {
            // Récupérer le leaderboard avec les informations des participants
            $leaderboard = $session->participants()
                ->where('is_presenter_mode', false)
                ->where('is_active', true)
                ->leftJoin('users', 'participants.user_id', '=', 'users.id')
                ->select(
                    'participants.id as participant_id',
                    'participants.pseudo as participant_name',
                    'participants.user_id',
                    'participants.score',
                    'participants.joined_at',
                    'users.username as user_name'
                )
                ->orderBy('participants.score', 'desc')
                ->orderBy('participants.joined_at', 'asc')
                ->get()
                ->map(function($participant) {
                    return [
                        'participant_id' => $participant->participant_id,
                        'name' => $participant->user_name ?: $participant->participant_name,
                        'user_id' => $participant->user_id,
                        'score' => $participant->score,
                        'joined_at' => $participant->joined_at,
                        'level' => rand(1, 20), // Niveau aléatoire pour l'instant
                        'badges' => $participant->score > 0 ? ['⭐'] : []
                    ];
                });
            
            $response['data']['leaderboard'] = $leaderboard;
            $response['data']['participants_count'] = $leaderboard->count();
        }

        return response()->json($response);
    }

    /**
     * Obtient l'état actuel d'une session de présentation pour un participant spécifique.
     *
     * @param  int  $sessionId
     * @param  int  $participantId
     * @return \Illuminate\Http\Response
     */
    public function getParticipantSessionState($sessionId, $participantId)
    {
        $session = QuizSession::findOrFail($sessionId);

        // Récupérer le participant par son ID
        $participant = Participant::where([
            'id' => $participantId,
            'quiz_session_id' => $session->id,
            'is_active' => true
        ])->first();
        
        if (!$participant) {
            return response()->json([
                'success' => false,
                'message' => 'Participant introuvable ou inactif dans cette session'
            ], Response::HTTP_FORBIDDEN);
        }

        // Vérification supplémentaire pour les utilisateurs connectés
        $user = Auth::user();
        if ($user && $participant->user_id && $participant->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Vous n\'êtes pas autorisé à accéder aux données de ce participant'
            ], Response::HTTP_FORBIDDEN);
        }

        $isPresenter = $participant->is_presenter_mode;
        $currentQuestion = null;
        
        if ($session->status === 'active') {
            $questionObj = $session->getCurrentQuestion();
            
            if ($questionObj) {
                $currentQuestion = [
                    'id' => $questionObj->id,
                    'text' => $questionObj->question_text,
                    'multiple_answers' => $questionObj->multiple_answers,
                    'points' => $questionObj->points,
                    'order_index' => $questionObj->order_index
                ];
                
                // Pour les présentateurs, ajouter les réponses avec indication des réponses correctes
                if ($isPresenter) {
                    $currentQuestion['answers'] = $questionObj->answers()
                        ->select('id', 'answer_text', 'is_correct', 'explanation')
                        ->get();
                } else {
                    // Pour les participants, seulement les réponses sans indication
                    $currentQuestion['answers'] = $questionObj->answers()
                        ->select('id', 'answer_text')
                        ->get();
                        
                    // Vérifier si le participant a déjà répondu
                    $hasAnswered = ParticipantAnswer::where([
                        'participant_id' => $participant->id,
                        'question_id' => $questionObj->id
                    ])->exists();
                    
                    $currentQuestion['has_answered'] = $hasAnswered;
                }
            }
        }

        $response = [
            'success' => true,
            'data' => [
                'session' => [
                    'id' => $session->id,
                    'status' => $session->status,
                    'join_code' => $session->join_code,
                    'started_at' => $session->started_at,
                    'ended_at' => $session->ended_at,
                    'is_presentation_mode' => $session->is_presentation_mode,
                    'question_index' => $session->current_question_index + 1,
                    'total_questions' => $session->getTotalQuestionsCount()
                ],
                'participant' => [
                    'id' => $participant->id,
                    'pseudo' => $participant->pseudo,
                    'score' => $participant->score,
                    'is_presenter' => $isPresenter,
                    'is_anonymous' => !$participant->user_id
                ],
                'current_question' => $currentQuestion
            ]
        ];
        
        // Si la session est terminée ou si c'est un présentateur, ajouter le classement
        if ($session->status === 'completed' || $isPresenter) {
            $response['data']['leaderboard'] = $session->getLeaderboard();
        }
        
        // Ajouter le nombre de participants pour les présentateurs
        if ($isPresenter) {
            $response['data']['participants_count'] = $session->participants()
                ->where('is_presenter_mode', false)
                ->where('is_active', true)
                ->count();
        }

        return response()->json($response);
    }
} 