<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Quiz;
use App\Models\Tag;
use App\Models\Question;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class QuizController extends Controller
{
    /**
     * Afficher une liste de quiz.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        try {
            // Vérifier si l'utilisateur est authentifié
            if (!$request->user()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non authentifié',
                    'error' => 'Attempt to read property "id" on null'
                ], 401);
            }
            
            $quizzes = Quiz::where('creator_id', $request->user()->id)
                ->with('questions')
                ->orderBy('created_at', 'desc')
                ->paginate(10);

            return response()->json([
                'success' => true,
                'data' => $quizzes
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Une erreur s\'est produite lors de la récupération des quiz',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Enregistrer un nouveau quiz.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        try {
            // Vérifier si l'utilisateur est authentifié
            if (!$request->user()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non authentifié',
                    'error' => 'Attempt to read property "id" on null'
                ], 401);
            }
            
            $validator = Validator::make($request->all(), [
                'title' => 'required|string|max:100',
                'description' => 'nullable|string',
                'category' => 'nullable|string|max:50',
                'time_per_question' => 'nullable|integer|min:5|max:300',
                'status' => 'nullable|in:draft,active,archived',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Erreur de validation',
                    'errors' => $validator->errors()
                ], 422);
            }

            $quiz = new Quiz();
            $quiz->title = $request->title;
            $quiz->description = $request->description;
            $quiz->creator_id = $request->user()->id;
            $quiz->category = $request->category;
            $quiz->time_per_question = $request->time_per_question ?? 30;
            $quiz->status = $request->status ?? 'draft';
            $quiz->code = Quiz::generateUniqueCode();
            $quiz->save();

            return response()->json([
                'success' => true,
                'message' => 'Quiz créé avec succès',
                'data' => $quiz
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Une erreur s\'est produite lors de la création du quiz',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Afficher un quiz spécifique.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        try {
            $quiz = Quiz::with(['questions.answers', 'creator:id,username,avatar', 'tags'])
                ->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $quiz
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Quiz non trouvé ou erreur',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Mettre à jour un quiz spécifique.
     *
     * @param \Illuminate\Http\Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        try {
            // Vérifier si l'utilisateur est authentifié
            if (!$request->user()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non authentifié',
                    'error' => 'Attempt to read property "id" on null'
                ], 401);
            }
            
            $quiz = Quiz::findOrFail($id);

            // Vérifier que l'utilisateur est le créateur du quiz
            if ($quiz->creator_id !== $request->user()->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous n\'êtes pas autorisé à modifier ce quiz'
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'title' => 'sometimes|required|string|max:100',
                'description' => 'nullable|string',
                'category' => 'nullable|string|max:50',
                'time_per_question' => 'nullable|integer|min:5|max:300',
                'status' => 'nullable|in:draft,active,archived',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Erreur de validation',
                    'errors' => $validator->errors()
                ], 422);
            }

            $quiz->title = $request->title ?? $quiz->title;
            $quiz->description = $request->description ?? $quiz->description;
            $quiz->category = $request->category ?? $quiz->category;
            $quiz->time_per_question = $request->time_per_question ?? $quiz->time_per_question;
            $quiz->status = $request->status ?? $quiz->status;
            $quiz->save();

            return response()->json([
                'success' => true,
                'message' => 'Quiz mis à jour avec succès',
                'data' => $quiz
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Une erreur s\'est produite lors de la mise à jour du quiz',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Supprimer un quiz spécifique.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        try {
            // Vérifier si l'utilisateur est authentifié
            if (!auth()->user()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non authentifié',
                    'error' => 'Attempt to read property "id" on null'
                ], 401);
            }
            
            $quiz = Quiz::findOrFail($id);

            // Vérifier que l'utilisateur est le créateur du quiz
            if ($quiz->creator_id !== auth()->id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous n\'êtes pas autorisé à supprimer ce quiz'
                ], 403);
            }

            $quiz->delete();

            return response()->json([
                'success' => true,
                'message' => 'Quiz supprimé avec succès'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Une erreur s\'est produite lors de la suppression du quiz',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Afficher les quiz publics.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function public(Request $request)
    {
        try {
            $quizzes = Quiz::where('status', 'active')
                ->with(['creator:id,username,avatar', 'tags'])
                ->withCount('questions')
                ->orderBy('created_at', 'desc')
                ->paginate(12);

            return response()->json([
                'success' => true,
                'data' => $quizzes
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Une erreur s\'est produite lors de la récupération des quiz publics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Afficher les quiz à la une.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function featured()
    {
        try {
            // Pour cet exemple, nous prenons simplement les 5 quiz les plus récents comme "featured"
            $featuredQuizzes = Quiz::where('status', 'active')
                ->with(['creator:id,username,avatar', 'tags'])
                ->withCount('questions')
                ->orderBy('created_at', 'desc')
                ->take(5)
                ->get();

            return response()->json([
                'success' => true,
                'data' => $featuredQuizzes
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Une erreur s\'est produite lors de la récupération des quiz à la une',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupérer les catégories de quiz disponibles.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function categories()
    {
        try {
            $categories = Quiz::where('status', 'active')
                ->whereNotNull('category')
                ->select('category')
                ->distinct()
                ->orderBy('category')
                ->pluck('category');

            return response()->json([
                'success' => true,
                'data' => $categories
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Une erreur s\'est produite lors de la récupération des catégories',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Associer des tags à un quiz.
     *
     * @param \Illuminate\Http\Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function attachTags(Request $request, $id)
    {
        try {
            $quiz = Quiz::findOrFail($id);

            // Vérifier que l'utilisateur est le créateur du quiz
            if ($quiz->creator_id !== $request->user()->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous n\'êtes pas autorisé à modifier ce quiz'
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'tag_ids' => 'required|array',
                'tag_ids.*' => 'exists:tags,id'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Erreur de validation',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Attacher les tags au quiz
            $quiz->tags()->sync($request->tag_ids);

            return response()->json([
                'success' => true,
                'message' => 'Tags associés au quiz avec succès',
                'data' => $quiz->load('tags')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Une erreur s\'est produite lors de l\'association des tags',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Supprimer un tag d'un quiz.
     *
     * @param \Illuminate\Http\Request $request
     * @param int $quizId
     * @param int $tagId
     * @return \Illuminate\Http\JsonResponse
     */
    public function detachTag(Request $request, $quizId, $tagId)
    {
        try {
            $quiz = Quiz::findOrFail($quizId);

            // Vérifier que l'utilisateur est le créateur du quiz
            if ($quiz->creator_id !== $request->user()->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous n\'êtes pas autorisé à modifier ce quiz'
                ], 403);
            }

            // Vérifier que le tag existe
            $tag = Tag::findOrFail($tagId);

            // Détacher le tag du quiz
            $quiz->tags()->detach($tagId);

            return response()->json([
                'success' => true,
                'message' => 'Tag retiré du quiz avec succès',
                'data' => $quiz->load('tags')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Une erreur s\'est produite lors du retrait du tag',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Rechercher des quiz par tag.
     *
     * @param \Illuminate\Http\Request $request
     * @param string $tagSlug
     * @return \Illuminate\Http\JsonResponse
     */
    public function findByTag(Request $request, $tagSlug)
    {
        try {
            $tag = Tag::where('slug', $tagSlug)->firstOrFail();
            
            $quizzes = $tag->quizzes()
                ->where('status', 'active')
                ->with(['creator:id,username,avatar', 'tags'])
                ->withCount('questions')
                ->orderBy('created_at', 'desc')
                ->paginate(12);

            return response()->json([
                'success' => true,
                'tag' => $tag,
                'data' => $quizzes
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Tag non trouvé ou erreur',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Récupérer les quiz récents de l'utilisateur.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function recent(Request $request)
    {
        try {
            // Vérifier si l'utilisateur est authentifié
            if (!$request->user()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non authentifié',
                    'error' => 'Attempt to read property "id" on null'
                ], 401);
            }
            
            $quizzes = Quiz::where('creator_id', $request->user()->id)
                ->with('questions')
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'quizzes' => $quizzes
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Une erreur s\'est produite lors de la récupération des quiz récents',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Crée un quiz avec des questions sélectionnées aléatoirement depuis la base de données.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function createRandomQuiz(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'title' => 'required|string|max:100',
                'description' => 'nullable|string',
                'category' => 'nullable|string|max:50',
                'time_per_question' => 'nullable|integer|min:5|max:300',
                'number_of_questions' => 'required|integer|min:1|max:50',
                'points_per_question' => 'nullable|integer|min:100',
                'status' => 'nullable|in:draft,active,archived',
                'categories' => 'nullable|array',
                'categories.*' => 'nullable|string',
                'difficulty_level' => 'nullable|integer|min:1|max:10',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Erreur de validation',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            // Créer le quiz
            $quiz = new Quiz();
            $quiz->title = $request->title;
            $quiz->description = $request->description;
            $quiz->creator_id = $request->user()->id;
            $quiz->category = $request->category;
            $quiz->time_per_question = $request->time_per_question ?? 30;
            $quiz->status = $request->status ?? 'active';
            $quiz->code = Quiz::generateUniqueCode();
            $quiz->save();

            // Construire la requête pour les questions aléatoires
            $questionsQuery = Question::with('answers');
            
            // Filtrer par catégorie si spécifié
            if ($request->has('categories') && !empty($request->categories)) {
                $questionsQuery->whereHas('quiz', function($query) use ($request) {
                    $query->whereIn('category', $request->categories);
                });
            }
            
            // Filtrer par niveau de difficulté si spécifié
            if ($request->has('difficulty_level')) {
                $questionsQuery->whereHas('quiz', function($query) use ($request) {
                    $query->where('difficulty_level', $request->difficulty_level);
                });
            }
            
            // Obtenir des questions aléatoires
            $randomQuestions = $questionsQuery->inRandomOrder()
                ->limit($request->number_of_questions)
                ->get();
            
            // S'il n'y a pas assez de questions
            if ($randomQuestions->count() < $request->number_of_questions) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Pas assez de questions disponibles pour créer un quiz aléatoire avec les critères sélectionnés',
                    'available_questions' => $randomQuestions->count(),
                    'requested_questions' => $request->number_of_questions
                ], 422);
            }
            
            // Cloner les questions et réponses dans le nouveau quiz
            foreach ($randomQuestions as $index => $sourceQuestion) {
                // Créer une nouvelle question pour le quiz
                $newQuestion = new Question();
                $newQuestion->quiz_id = $quiz->id;
                $newQuestion->question_text = $sourceQuestion->question_text;
                $newQuestion->points = $request->points_per_question ?? 3000;
                $newQuestion->order_index = $index;
                $newQuestion->multiple_answers = $sourceQuestion->multiple_answers ?? false;
                $newQuestion->save();
                
                // Copier les réponses
                foreach ($sourceQuestion->answers as $sourceAnswer) {
                    $newQuestion->answers()->create([
                        'answer_text' => $sourceAnswer->answer_text,
                        'is_correct' => $sourceAnswer->is_correct,
                        'explanation' => $sourceAnswer->explanation ?? null
                    ]);
                }
            }
            
            DB::commit();
            
            // Charger toutes les questions et réponses pour la réponse API
            $quiz->load('questions.answers');
            
            return response()->json([
                'success' => true,
                'message' => 'Quiz aléatoire créé avec succès',
                'data' => $quiz
            ], 201);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Une erreur s\'est produite lors de la création du quiz aléatoire',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
