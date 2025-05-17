<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TagController extends Controller
{
    /**
     * Afficher une liste de tous les tags.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        try {
            $tags = Tag::withCount('quizzes')->get();
            
            return response()->json([
                'success' => true,
                'data' => $tags
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Une erreur s\'est produite lors de la récupération des tags',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Enregistrer un nouveau tag.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:50|unique:tags,name',
                'description' => 'nullable|string',
                'color' => 'nullable|string|max:20'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Erreur de validation',
                    'errors' => $validator->errors()
                ], 422);
            }

            $tag = new Tag();
            $tag->name = $request->name;
            $tag->slug = Tag::createSlug($request->name);
            $tag->description = $request->description;
            $tag->color = $request->color ?? '#3498db';
            $tag->save();

            return response()->json([
                'success' => true,
                'message' => 'Tag créé avec succès',
                'data' => $tag
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Une erreur s\'est produite lors de la création du tag',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Afficher un tag spécifique.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        try {
            $tag = Tag::with('quizzes')->findOrFail($id);
            
            return response()->json([
                'success' => true,
                'data' => $tag
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
     * Mettre à jour un tag spécifique.
     *
     * @param \Illuminate\Http\Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        try {
            $tag = Tag::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|required|string|max:50|unique:tags,name,' . $id,
                'description' => 'nullable|string',
                'color' => 'nullable|string|max:20'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Erreur de validation',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Si le nom a changé, mettre à jour le slug
            if ($request->has('name') && $request->name !== $tag->name) {
                $tag->name = $request->name;
                $tag->slug = Tag::createSlug($request->name);
            }
            
            $tag->description = $request->description ?? $tag->description;
            $tag->color = $request->color ?? $tag->color;
            $tag->save();

            return response()->json([
                'success' => true,
                'message' => 'Tag mis à jour avec succès',
                'data' => $tag
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Une erreur s\'est produite lors de la mise à jour du tag',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Supprimer un tag spécifique.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        try {
            $tag = Tag::findOrFail($id);
            $tag->delete();

            return response()->json([
                'success' => true,
                'message' => 'Tag supprimé avec succès'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Une erreur s\'est produite lors de la suppression du tag',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 