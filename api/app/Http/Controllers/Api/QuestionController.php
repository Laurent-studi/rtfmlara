<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Question;
use App\Models\Quiz;
use App\Models\Answer;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class QuestionController extends Controller
{
    /**
     * Affiche la liste des questions.
     * Possibilité de filtrer par quiz.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $query = Question::with(['answers']);
        
        // Filtre par quiz
        if ($request->has('quiz_id')) {
            $query->where('quiz_id', $request->quiz_id);
        }
        
        // Tri par ordre d'index si disponible
        $query->orderBy('order_index', 'asc');
        
        $questions = $query->get();
        
        return response()->json([
            'status' => 'success',
            'data' => $questions
        ]);
    }

    /**
     * Crée une nouvelle question avec ses réponses.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'quiz_id' => 'required|integer|exists:quizzes,id',
            'question_text' => 'required|string',
            'points' => 'required|integer|min:1',
            'order_index' => 'nullable|integer|min:0',
            'answers' => 'required|array|min:2',
            'answers.*.answer_text' => 'required|string',
            'answers.*.is_correct' => 'required|boolean',
            'answers.*.explanation' => 'nullable|string'
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

        // Vérifier qu'au moins une réponse est correcte
        $hasCorrectAnswer = false;
        foreach ($request->answers as $answer) {
            if ($answer['is_correct']) {
                $hasCorrectAnswer = true;
                break;
            }
        }

        if (!$hasCorrectAnswer) {
            return response()->json([
                'status' => 'error',
                'message' => 'Au moins une réponse doit être correcte'
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        // Déterminer l'ordre si non spécifié
        if (!$request->has('order_index')) {
            $maxOrder = Question::where('quiz_id', $request->quiz_id)->max('order_index');
            $request->merge(['order_index' => $maxOrder !== null ? $maxOrder + 1 : 0]);
        }

        DB::beginTransaction();
        try {
            // Créer la question
            $question = Question::create($request->only([
                'quiz_id', 'question_text', 'points', 'order_index'
            ]));

            // Créer les réponses
            foreach ($request->answers as $answerData) {
                $question->answers()->create([
                    'answer_text' => $answerData['answer_text'],
                    'is_correct' => $answerData['is_correct'],
                    'explanation' => $answerData['explanation'] ?? null
                ]);
            }

            DB::commit();

            // Charger les réponses pour la réponse API
            $question->load('answers');

            return response()->json([
                'status' => 'success',
                'message' => 'Question créée avec succès',
                'data' => $question
            ], Response::HTTP_CREATED);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'status' => 'error',
                'message' => 'Erreur lors de la création de la question',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Affiche une question spécifique avec ses réponses.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $question = Question::with(['answers', 'quiz'])->find($id);
        
        if (!$question) {
            return response()->json([
                'status' => 'error',
                'message' => 'Question non trouvée'
            ], Response::HTTP_NOT_FOUND);
        }

        return response()->json([
            'status' => 'success',
            'data' => $question
        ]);
    }

    /**
     * Met à jour une question et ses réponses.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $question = Question::find($id);
        
        if (!$question) {
            return response()->json([
                'status' => 'error',
                'message' => 'Question non trouvée'
            ], Response::HTTP_NOT_FOUND);
        }

        $validator = Validator::make($request->all(), [
            'quiz_id' => 'sometimes|required|integer|exists:quizzes,id',
            'question_text' => 'sometimes|required|string',
            'points' => 'sometimes|required|integer|min:1',
            'order_index' => 'nullable|integer|min:0',
            'answers' => 'sometimes|required|array|min:2',
            'answers.*.id' => 'nullable|integer|exists:answers,id',
            'answers.*.answer_text' => 'required|string',
            'answers.*.is_correct' => 'required|boolean',
            'answers.*.explanation' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation échouée',
                'errors' => $validator->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        // Si des réponses sont fournies, vérifier qu'au moins une est correcte
        if ($request->has('answers')) {
            $hasCorrectAnswer = false;
            foreach ($request->answers as $answer) {
                if ($answer['is_correct']) {
                    $hasCorrectAnswer = true;
                    break;
                }
            }

            if (!$hasCorrectAnswer) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Au moins une réponse doit être correcte'
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
        }

        DB::beginTransaction();
        try {
            // Mettre à jour la question
            $question->update($request->only([
                'quiz_id', 'question_text', 'points', 'order_index'
            ]));

            // Mettre à jour ou créer les réponses si fournies
            if ($request->has('answers')) {
                $currentAnswerIds = [];
                
                foreach ($request->answers as $answerData) {
                    if (isset($answerData['id'])) {
                        // Mettre à jour une réponse existante
                        $answer = Answer::find($answerData['id']);
                        if ($answer && $answer->question_id == $id) {
                            $answer->update([
                                'answer_text' => $answerData['answer_text'],
                                'is_correct' => $answerData['is_correct'],
                                'explanation' => $answerData['explanation'] ?? null
                            ]);
                            $currentAnswerIds[] = $answer->id;
                        }
                    } else {
                        // Créer une nouvelle réponse
                        $answer = $question->answers()->create([
                            'answer_text' => $answerData['answer_text'],
                            'is_correct' => $answerData['is_correct'],
                            'explanation' => $answerData['explanation'] ?? null
                        ]);
                        $currentAnswerIds[] = $answer->id;
                    }
                }
                
                // Supprimer les réponses qui ne sont plus présentes
                $question->answers()->whereNotIn('id', $currentAnswerIds)->delete();
            }

            DB::commit();

            // Recharger les relations pour la réponse
            $question->load('answers');

            return response()->json([
                'status' => 'success',
                'message' => 'Question mise à jour avec succès',
                'data' => $question
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'status' => 'error',
                'message' => 'Erreur lors de la mise à jour de la question',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Supprime une question et ses réponses.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $question = Question::find($id);
        
        if (!$question) {
            return response()->json([
                'status' => 'error',
                'message' => 'Question non trouvée'
            ], Response::HTTP_NOT_FOUND);
        }

        // Vérifier si la question a des réponses associées à des participants
        $hasParticipantAnswers = $question->participant_answers()->count() > 0;
        if ($hasParticipantAnswers) {
            return response()->json([
                'status' => 'error',
                'message' => 'Impossible de supprimer cette question car elle a des réponses associées à des participants'
            ], Response::HTTP_CONFLICT);
        }

        DB::beginTransaction();
        try {
            // Supprimer toutes les réponses associées
            $question->answers()->delete();
            
            // Supprimer la question
            $question->delete();
            
            DB::commit();
            
            return response()->json([
                'status' => 'success',
                'message' => 'Question supprimée avec succès'
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'status' => 'error',
                'message' => 'Erreur lors de la suppression de la question',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
