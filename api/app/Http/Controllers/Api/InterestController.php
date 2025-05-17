<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Interest;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Validator;

class InterestController extends Controller
{
    /**
     * Affiche la liste de tous les centres d'intérêt.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $interests = Interest::with('users')->get();
        return response()->json([
            'status' => 'success',
            'data' => $interests
        ]);
    }

    /**
     * Crée un nouveau centre d'intérêt.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:interests',
            'category' => 'nullable|string|max:100'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation échouée',
                'errors' => $validator->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $interest = Interest::create($request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Centre d\'intérêt créé avec succès',
            'data' => $interest
        ], Response::HTTP_CREATED);
    }

    /**
     * Affiche un centre d'intérêt spécifique.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $interest = Interest::with('users')->find($id);
        
        if (!$interest) {
            return response()->json([
                'status' => 'error',
                'message' => 'Centre d\'intérêt non trouvé'
            ], Response::HTTP_NOT_FOUND);
        }

        return response()->json([
            'status' => 'success',
            'data' => $interest
        ]);
    }

    /**
     * Met à jour un centre d'intérêt spécifique.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $interest = Interest::find($id);
        
        if (!$interest) {
            return response()->json([
                'status' => 'error',
                'message' => 'Centre d\'intérêt non trouvé'
            ], Response::HTTP_NOT_FOUND);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255|unique:interests,name,' . $id,
            'category' => 'nullable|string|max:100'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation échouée',
                'errors' => $validator->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $interest->update($request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Centre d\'intérêt mis à jour avec succès',
            'data' => $interest
        ]);
    }

    /**
     * Supprime un centre d'intérêt spécifique.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $interest = Interest::find($id);
        
        if (!$interest) {
            return response()->json([
                'status' => 'error',
                'message' => 'Centre d\'intérêt non trouvé'
            ], Response::HTTP_NOT_FOUND);
        }

        // Vérifier si ce centre d'intérêt est utilisé par des utilisateurs
        if ($interest->users()->count() > 0) {
            return response()->json([
                'status' => 'error',
                'message' => 'Impossible de supprimer ce centre d\'intérêt car il est utilisé par des utilisateurs'
            ], Response::HTTP_CONFLICT);
        }

        $interest->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Centre d\'intérêt supprimé avec succès'
        ]);
    }
}
