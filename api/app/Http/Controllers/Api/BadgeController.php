<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Badge;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Validator;

class BadgeController extends Controller
{
    /**
     * Affiche la liste de tous les badges.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $badges = Badge::all();
        return response()->json([
            'status' => 'success',
            'data' => $badges
        ]);
    }

    /**
     * Crée un nouveau badge.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:badges',
            'description' => 'nullable|string',
            'icon' => 'nullable|string',
            'category' => 'required|string',
            'requirements' => 'nullable|array'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation échouée',
                'errors' => $validator->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $badge = Badge::create($request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Badge créé avec succès',
            'data' => $badge
        ], Response::HTTP_CREATED);
    }

    /**
     * Affiche un badge spécifique.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $badge = Badge::find($id);
        
        if (!$badge) {
            return response()->json([
                'status' => 'error',
                'message' => 'Badge non trouvé'
            ], Response::HTTP_NOT_FOUND);
        }

        return response()->json([
            'status' => 'success',
            'data' => $badge
        ]);
    }

    /**
     * Met à jour un badge spécifique.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $badge = Badge::find($id);
        
        if (!$badge) {
            return response()->json([
                'status' => 'error',
                'message' => 'Badge non trouvé'
            ], Response::HTTP_NOT_FOUND);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255|unique:badges,name,' . $id,
            'description' => 'nullable|string',
            'icon' => 'nullable|string',
            'category' => 'sometimes|required|string',
            'requirements' => 'nullable|array'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation échouée',
                'errors' => $validator->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $badge->update($request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Badge mis à jour avec succès',
            'data' => $badge
        ]);
    }

    /**
     * Supprime un badge spécifique.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $badge = Badge::find($id);
        
        if (!$badge) {
            return response()->json([
                'status' => 'error',
                'message' => 'Badge non trouvé'
            ], Response::HTTP_NOT_FOUND);
        }

        $badge->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Badge supprimé avec succès'
        ]);
    }
}
