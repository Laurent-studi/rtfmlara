<?php

namespace App\Http\Controllers;

use App\Models\Quiz;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class QuizController extends Controller
{
    /**
     * Afficher la liste des quiz.
     */
    public function index()
    {
        $quizzes = Quiz::with('creator')->paginate(10);
        return response()->json($quizzes);
    }

    /**
     * Créer un nouveau quiz.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:100',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:50',
            'time_per_question' => 'nullable|integer|min:5|max:300',
            'multiple_answers' => 'nullable|boolean',
            'status' => 'nullable|in:draft,active,archived',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $quiz = new Quiz();
        $quiz->title = $request->title;
        $quiz->description = $request->description;
        $quiz->creator_id = Auth::id();
        $quiz->category = $request->category;
        $quiz->time_per_question = $request->time_per_question ?? 30;
        $quiz->multiple_answers = $request->multiple_answers ?? false;
        $quiz->status = $request->status ?? 'draft';
        $quiz->save();

        return response()->json(['message' => 'Quiz créé avec succès', 'quiz' => $quiz], 201);
    }

    /**
     * Afficher un quiz spécifique.
     */
    public function show($id)
    {
        $quiz = Quiz::with(['creator', 'questions.answers'])->findOrFail($id);
        return response()->json($quiz);
    }

    /**
     * Mettre à jour un quiz existant.
     */
    public function update(Request $request, $id)
    {
        $quiz = Quiz::findOrFail($id);

        // Vérifier si l'utilisateur est le propriétaire du quiz
        if ($quiz->creator_id !== Auth::id()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:100',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:50',
            'time_per_question' => 'nullable|integer|min:5|max:300',
            'multiple_answers' => 'nullable|boolean',
            'status' => 'nullable|in:draft,active,archived',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $quiz->update($request->all());

        return response()->json(['message' => 'Quiz mis à jour avec succès', 'quiz' => $quiz]);
    }

    /**
     * Supprimer un quiz.
     */
    public function destroy($id)
    {
        $quiz = Quiz::findOrFail($id);

        // Vérifier si l'utilisateur est le propriétaire du quiz
        if ($quiz->creator_id !== Auth::id()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $quiz->delete();

        return response()->json(['message' => 'Quiz supprimé avec succès']);
    }
} 