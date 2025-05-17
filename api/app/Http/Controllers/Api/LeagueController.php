<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\League;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Validator;

class LeagueController extends Controller
{
    /**
     * Affiche la liste de toutes les ligues.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $leagues = League::orderBy('level', 'asc')->get();
        
        return response()->json([
            'status' => 'success',
            'data' => $leagues
        ]);
    }

    /**
     * Crée une nouvelle ligue.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:leagues',
            'description' => 'nullable|string',
            'level' => 'required|integer|min:1',
            'min_points' => 'required|integer|min:0',
            'max_points' => 'nullable|integer|gt:min_points',
            'season' => 'required|integer|min:1',
            'status' => 'required|string|in:active,inactive,coming_soon,archived'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation échouée',
                'errors' => $validator->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        // Vérifier si un niveau de ligue existe déjà pour cette saison
        $existingLeague = League::where('level', $request->level)
            ->where('season', $request->season)
            ->first();

        if ($existingLeague) {
            return response()->json([
                'status' => 'error',
                'message' => 'Une ligue de ce niveau existe déjà pour cette saison'
            ], Response::HTTP_CONFLICT);
        }

        $league = League::create($request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Ligue créée avec succès',
            'data' => $league
        ], Response::HTTP_CREATED);
    }

    /**
     * Affiche une ligue spécifique.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $league = League::find($id);
        
        if (!$league) {
            return response()->json([
                'status' => 'error',
                'message' => 'Ligue non trouvée'
            ], Response::HTTP_NOT_FOUND);
        }

        return response()->json([
            'status' => 'success',
            'data' => $league
        ]);
    }

    /**
     * Met à jour une ligue spécifique.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $league = League::find($id);
        
        if (!$league) {
            return response()->json([
                'status' => 'error',
                'message' => 'Ligue non trouvée'
            ], Response::HTTP_NOT_FOUND);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255|unique:leagues,name,' . $id,
            'description' => 'nullable|string',
            'level' => 'sometimes|required|integer|min:1',
            'min_points' => 'sometimes|required|integer|min:0',
            'max_points' => 'nullable|integer|gt:min_points',
            'season' => 'sometimes|required|integer|min:1',
            'status' => 'sometimes|required|string|in:active,inactive,coming_soon,archived'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation échouée',
                'errors' => $validator->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        // Vérifier si un niveau de ligue existe déjà pour cette saison (sauf la ligue en cours)
        if ($request->has('level') && $request->has('season')) {
            $existingLeague = League::where('level', $request->level)
                ->where('season', $request->season)
                ->where('id', '!=', $id)
                ->first();

            if ($existingLeague) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Une ligue de ce niveau existe déjà pour cette saison'
                ], Response::HTTP_CONFLICT);
            }
        }

        $league->update($request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Ligue mise à jour avec succès',
            'data' => $league
        ]);
    }

    /**
     * Supprime une ligue spécifique.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $league = League::find($id);
        
        if (!$league) {
            return response()->json([
                'status' => 'error',
                'message' => 'Ligue non trouvée'
            ], Response::HTTP_NOT_FOUND);
        }

        $league->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Ligue supprimée avec succès'
        ]);
    }
}
