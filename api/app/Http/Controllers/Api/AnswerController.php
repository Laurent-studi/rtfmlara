<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Answer;
use App\Models\Question;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class AnswerController extends Controller
{
    /**
     * Afficher la liste des réponses pour une question.
     *
     * @param int $questionId
     * @return \Illuminate\Http\JsonResponse
     */
    public function index($questionId)
    {
        $question = Question::findOrFail($questionId);
        
        // Vérifier si l'utilisateur est le créateur du quiz
        $quiz = $question->quiz;
        $isCreator = $quiz->creator_id === Auth::id();
        
        // Si c'est le créateur, nous pouvons montrer l'attribut is_correct
        $answers = $question->answers;
        
        if ($isCreator) {
            foreach ($answers as $answer) {
                $answer->is_correct_visible = $answer->revealIsCorrect();
            }
        }
        
        return response()->json($answers);
    }

    /**
     * Stocker une nouvelle réponse pour une question.
     *
     * @param Request $request
     * @param int $questionId
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request, $questionId)
    {
        $question = Question::findOrFail($questionId);
        
        // Vérifier si l'utilisateur est le créateur du quiz
        $quiz = $question->quiz;
        if ($quiz->creator_id !== Auth::id()) {
            return response()->json(['message' => 'Vous n\'êtes pas autorisé à ajouter des réponses à cette question'], 403);
        }
        
        $validator = Validator::make($request->all(), [
            'answer_text' => 'required|string',
            'is_correct' => 'required|boolean',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        // Si c'est une question à réponse unique, désactiver les autres réponses correctes
        if (!$quiz->multiple_answers && $request->is_correct) {
            Answer::where('question_id', $questionId)
                ->where('is_correct', true)
                ->update(['is_correct' => false]);
        }
        
        $answer = new Answer();
        $answer->question_id = $questionId;
        $answer->answer_text = $request->answer_text;
        $answer->is_correct = $request->is_correct;
        $answer->save();
        
        return response()->json([
            'message' => 'Réponse créée avec succès',
            'answer' => $answer
        ], 201);
    }

    /**
     * Afficher une réponse spécifique.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $answer = Answer::findOrFail($id);
        
        // Vérifier si l'utilisateur est le créateur du quiz
        $quiz = $answer->question->quiz;
        $isCreator = $quiz->creator_id === Auth::id();
        
        if ($isCreator) {
            $answer->is_correct_visible = $answer->revealIsCorrect();
        }
        
        return response()->json($answer);
    }

    /**
     * Mettre à jour une réponse existante.
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $answer = Answer::findOrFail($id);
        
        // Vérifier si l'utilisateur est le créateur du quiz
        $quiz = $answer->question->quiz;
        if ($quiz->creator_id !== Auth::id()) {
            return response()->json(['message' => 'Vous n\'êtes pas autorisé à modifier cette réponse'], 403);
        }
        
        $validator = Validator::make($request->all(), [
            'answer_text' => 'sometimes|required|string',
            'is_correct' => 'sometimes|required|boolean',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        // Si c'est une question à réponse unique et qu'on veut rendre cette réponse correcte
        if (!$quiz->multiple_answers && $request->has('is_correct') && $request->is_correct) {
            Answer::where('question_id', $answer->question_id)
                ->where('id', '!=', $id)
                ->where('is_correct', true)
                ->update(['is_correct' => false]);
        }
        
        $answer->update($request->all());
        
        return response()->json([
            'message' => 'Réponse mise à jour avec succès',
            'answer' => $answer
        ]);
    }

    /**
     * Supprimer une réponse.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $answer = Answer::findOrFail($id);
        
        // Vérifier si l'utilisateur est le créateur du quiz
        $quiz = $answer->question->quiz;
        if ($quiz->creator_id !== Auth::id()) {
            return response()->json(['message' => 'Vous n\'êtes pas autorisé à supprimer cette réponse'], 403);
        }
        
        $answer->delete();
        
        return response()->json(['message' => 'Réponse supprimée avec succès']);
    }
}
