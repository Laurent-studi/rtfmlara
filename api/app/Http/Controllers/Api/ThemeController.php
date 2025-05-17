<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Theme;
use App\Models\UserTheme;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Carbon;

class ThemeController extends Controller
{
    /**
     * Affiche la liste des thèmes.
     * Possibilité de filtrer par type (user_selectable, dark_mode, etc.)
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $query = Theme::query();
        
        // Filtre par thèmes sélectionnables par l'utilisateur
        if ($request->has('user_selectable') && $request->user_selectable === 'true') {
            $query->where('is_user_selectable', true);
        }
        
        // Filtre par mode sombre
        if ($request->has('dark_mode')) {
            $query->where('is_dark', $request->dark_mode === 'true');
        }
        
        // Filtre par thème par défaut
        if ($request->has('default') && $request->default === 'true') {
            $query->where('is_default', true);
        }
        
        // Filtre par créateur (si admin)
        if ($request->has('created_by')) {
            $user = Auth::user();
            if ($user && $user->roles()->where('name', 'admin')->exists()) {
                $query->where('created_by', $request->created_by);
            }
        }
        
        $themes = $query->get();
        
        return response()->json([
            'status' => 'success',
            'data' => $themes
        ]);
    }

    /**
     * Crée un nouveau thème.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        
        // Vérifier si l'utilisateur a les droits de créer un thème
        if (!$user || (!$user->roles()->where('name', 'admin')->exists() && 
                      !$user->roles()->where('name', 'designer')->exists())) {
            return response()->json([
                'status' => 'error',
                'message' => 'Vous n\'avez pas les droits nécessaires pour créer un thème'
            ], Response::HTTP_FORBIDDEN);
        }
        
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:themes',
            'description' => 'nullable|string',
            'primary_color' => 'required|string|regex:/^#[a-fA-F0-9]{6}$/',
            'secondary_color' => 'required|string|regex:/^#[a-fA-F0-9]{6}$/',
            'accent_color' => 'nullable|string|regex:/^#[a-fA-F0-9]{6}$/',
            'text_color' => 'required|string|regex:/^#[a-fA-F0-9]{6}$/',
            'background_color' => 'required|string|regex:/^#[a-fA-F0-9]{6}$/',
            'card_color' => 'nullable|string|regex:/^#[a-fA-F0-9]{6}$/',
            'is_dark' => 'required|boolean',
            'font_family' => 'nullable|string|max:255',
            'border_radius' => 'required|integer|min:0|max:20',
            'css_variables' => 'nullable|string',
            'is_default' => 'boolean',
            'is_user_selectable' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation échouée',
                'errors' => $validator->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        // Si le thème est défini comme par défaut, mettre tous les autres à false
        if ($request->has('is_default') && $request->is_default) {
            Theme::where('is_default', true)->update(['is_default' => false]);
        }

        // Ajouter l'ID du créateur
        $data = $request->all();
        $data['created_by'] = $user->id;

        $theme = Theme::create($data);

        return response()->json([
            'status' => 'success',
            'message' => 'Thème créé avec succès',
            'data' => $theme
        ], Response::HTTP_CREATED);
    }

    /**
     * Affiche un thème spécifique.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $theme = Theme::with('user')->find($id);
        
        if (!$theme) {
            return response()->json([
                'status' => 'error',
                'message' => 'Thème non trouvé'
            ], Response::HTTP_NOT_FOUND);
        }

        return response()->json([
            'status' => 'success',
            'data' => $theme
        ]);
    }

    /**
     * Met à jour un thème spécifique.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $user = Auth::user();
        $theme = Theme::find($id);
        
        if (!$theme) {
            return response()->json([
                'status' => 'error',
                'message' => 'Thème non trouvé'
            ], Response::HTTP_NOT_FOUND);
        }
        
        // Vérifier si l'utilisateur a les droits de modifier ce thème
        if (!$user || (!$user->roles()->where('name', 'admin')->exists() && 
                       $theme->created_by !== $user->id)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Vous n\'avez pas les droits nécessaires pour modifier ce thème'
            ], Response::HTTP_FORBIDDEN);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255|unique:themes,name,' . $id,
            'description' => 'nullable|string',
            'primary_color' => 'sometimes|required|string|regex:/^#[a-fA-F0-9]{6}$/',
            'secondary_color' => 'sometimes|required|string|regex:/^#[a-fA-F0-9]{6}$/',
            'accent_color' => 'nullable|string|regex:/^#[a-fA-F0-9]{6}$/',
            'text_color' => 'sometimes|required|string|regex:/^#[a-fA-F0-9]{6}$/',
            'background_color' => 'sometimes|required|string|regex:/^#[a-fA-F0-9]{6}$/',
            'card_color' => 'nullable|string|regex:/^#[a-fA-F0-9]{6}$/',
            'is_dark' => 'sometimes|required|boolean',
            'font_family' => 'nullable|string|max:255',
            'border_radius' => 'sometimes|required|integer|min:0|max:20',
            'css_variables' => 'nullable|string',
            'is_default' => 'boolean',
            'is_user_selectable' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation échouée',
                'errors' => $validator->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        // Si le thème est défini comme par défaut, mettre tous les autres à false
        if ($request->has('is_default') && $request->is_default) {
            Theme::where('is_default', true)
                 ->where('id', '!=', $id)
                 ->update(['is_default' => false]);
        }

        $theme->update($request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Thème mis à jour avec succès',
            'data' => $theme
        ]);
    }

    /**
     * Supprime un thème spécifique.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $user = Auth::user();
        $theme = Theme::find($id);
        
        if (!$theme) {
            return response()->json([
                'status' => 'error',
                'message' => 'Thème non trouvé'
            ], Response::HTTP_NOT_FOUND);
        }
        
        // Vérifier si l'utilisateur a les droits de supprimer ce thème
        if (!$user || (!$user->roles()->where('name', 'admin')->exists() && 
                       $theme->created_by !== $user->id)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Vous n\'avez pas les droits nécessaires pour supprimer ce thème'
            ], Response::HTTP_FORBIDDEN);
        }
        
        // Vérifier si c'est le thème par défaut
        if ($theme->is_default) {
            return response()->json([
                'status' => 'error',
                'message' => 'Impossible de supprimer le thème par défaut'
            ], Response::HTTP_CONFLICT);
        }
        
        // Vérifier si le thème est utilisé par des utilisateurs
        if ($theme->users()->count() > 0) {
            return response()->json([
                'status' => 'error',
                'message' => 'Impossible de supprimer ce thème car il est utilisé par des utilisateurs'
            ], Response::HTTP_CONFLICT);
        }

        $theme->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Thème supprimé avec succès'
        ]);
    }

    /**
     * Applique un thème à l'utilisateur courant.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function applyTheme($id)
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Utilisateur non authentifié'
            ], Response::HTTP_UNAUTHORIZED);
        }
        
        $theme = Theme::find($id);
        
        if (!$theme) {
            return response()->json([
                'status' => 'error',
                'message' => 'Thème non trouvé'
            ], Response::HTTP_NOT_FOUND);
        }
        
        // Vérifier si le thème est sélectionnable par l'utilisateur
        if (!$theme->is_user_selectable && !$user->roles()->where('name', 'admin')->exists()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Ce thème n\'est pas disponible pour les utilisateurs'
            ], Response::HTTP_FORBIDDEN);
        }
        
        // Enregistrer l'application du thème
        UserTheme::create([
            'user_id' => $user->id,
            'theme_id' => $theme->id,
            'applied_at' => Carbon::now()
        ]);
        
        return response()->json([
            'status' => 'success',
            'message' => 'Thème appliqué avec succès',
            'data' => $theme
        ]);
    }
}
