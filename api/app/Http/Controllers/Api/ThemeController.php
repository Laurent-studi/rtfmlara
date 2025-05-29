<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Theme;
use App\Services\ThemeService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class ThemeController extends Controller
{
    protected $themeService;

    public function __construct(ThemeService $themeService)
    {
        $this->themeService = $themeService;
    }

    /**
     * Liste tous les thèmes actifs
     */
    public function index()
    {
        return response()->json([
            'status' => 'success',
            'data' => $this->themeService->getAllThemes()
        ]);
    }

    /**
     * Récupère le thème par défaut
     */
    public function default()
    {
        $theme = $this->themeService->getDefaultTheme();
        
        if (!$theme) {
            return response()->json([
                'status' => 'error',
                'message' => 'Aucun thème par défaut n\'est défini'
            ], Response::HTTP_NOT_FOUND);
        }
        
        return response()->json([
            'status' => 'success',
            'data' => $theme
        ]);
    }

    /**
     * Récupère le thème actuel de l'utilisateur
     */
    public function getCurrentUserTheme()
    {
        $theme = $this->themeService->getUserTheme();
        
        return response()->json([
            'status' => 'success',
            'data' => $theme
        ]);
    }

    /**
     * Crée un nouveau thème (admin)
     */
    public function store(Request $request)
    {
        // Vérification des droits d'admin - à adapter selon votre logique d'autorisation
        if (!$this->checkAdminRights()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Non autorisé'
            ], Response::HTTP_FORBIDDEN);
        }
        
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100|unique:themes',
            'code' => 'required|string|max:50|unique:themes',
            'filename' => 'required|string|max:100',
            'description' => 'nullable|string',
            'is_default' => 'boolean',
            'is_active' => 'boolean',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation échouée',
                'errors' => $validator->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }
        
        $theme = $this->themeService->createTheme($request->all());
        
        return response()->json([
            'status' => 'success',
            'message' => 'Thème créé avec succès',
            'data' => $theme
        ], Response::HTTP_CREATED);
    }

    /**
     * Affiche les détails d'un thème
     */
    public function show($id)
    {
        $theme = Theme::find($id);
        
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
     * Met à jour un thème existant (admin)
     */
    public function update(Request $request, $id)
    {
        // Vérification des droits d'admin
        if (!$this->checkAdminRights()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Non autorisé'
            ], Response::HTTP_FORBIDDEN);
        }
        
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:100|unique:themes,name,' . $id,
            'code' => 'sometimes|required|string|max:50|unique:themes,code,' . $id,
            'filename' => 'sometimes|required|string|max:100',
            'description' => 'nullable|string',
            'is_default' => 'boolean',
            'is_active' => 'boolean',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation échouée',
                'errors' => $validator->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }
        
        $theme = $this->themeService->updateTheme($id, $request->all());
        
        if (!$theme) {
            return response()->json([
                'status' => 'error',
                'message' => 'Thème non trouvé'
            ], Response::HTTP_NOT_FOUND);
        }
        
        return response()->json([
            'status' => 'success',
            'message' => 'Thème mis à jour avec succès',
            'data' => $theme
        ]);
    }

    /**
     * Supprime un thème (admin)
     */
    public function destroy($id)
    {
        // Vérification des droits d'admin
        if (!$this->checkAdminRights()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Non autorisé'
            ], Response::HTTP_FORBIDDEN);
        }
        
        $result = $this->themeService->deleteTheme($id);
        
        if (!$result) {
            return response()->json([
                'status' => 'error',
                'message' => 'Impossible de supprimer ce thème. Il n\'existe pas ou c\'est le thème par défaut.'
            ], Response::HTTP_BAD_REQUEST);
        }
        
        return response()->json([
            'status' => 'success',
            'message' => 'Thème supprimé avec succès'
        ]);
    }

    /**
     * Définit un thème comme thème par défaut (admin)
     */
    public function setDefault($id)
    {
        // Vérification des droits d'admin
        if (!$this->checkAdminRights()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Non autorisé'
            ], Response::HTTP_FORBIDDEN);
        }
        
        $theme = $this->themeService->setDefaultTheme($id);
        
        if (!$theme) {
            return response()->json([
                'status' => 'error',
                'message' => 'Thème non trouvé'
            ], Response::HTTP_NOT_FOUND);
        }
        
        return response()->json([
            'status' => 'success',
            'message' => 'Thème défini comme thème par défaut',
            'data' => $theme
        ]);
    }

    /**
     * Applique un thème à l'utilisateur connecté
     */
    public function applyTheme(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'theme_id' => 'required|exists:themes,id',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation échouée',
                'errors' => $validator->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }
        
        $result = $this->themeService->setUserTheme($request->theme_id);
        
        if (!$result) {
            return response()->json([
                'status' => 'error',
                'message' => 'Impossible d\'appliquer ce thème'
            ], Response::HTTP_BAD_REQUEST);
        }
        
        $theme = Theme::find($request->theme_id);
        
        return response()->json([
            'status' => 'success',
            'message' => 'Thème appliqué avec succès',
            'data' => $theme
        ]);
    }

    /**
     * Réinitialise le thème de l'utilisateur au thème par défaut
     */
    public function resetTheme()
    {
        $result = $this->themeService->resetUserTheme();
        
        if (!$result) {
            return response()->json([
                'status' => 'error',
                'message' => 'Impossible de réinitialiser le thème'
            ], Response::HTTP_BAD_REQUEST);
        }
        
        return response()->json([
            'status' => 'success',
            'message' => 'Thème réinitialisé avec succès',
            'data' => $this->themeService->getDefaultTheme()
        ]);
    }

    /**
     * Vérifie si l'utilisateur a les droits d'administration
     */
    private function checkAdminRights(): bool
    {
        $user = Auth::user();
        
        // À adapter selon votre logique d'autorisation
        // Par exemple : return $user && $user->isAdmin();
        return $user && $user->roles()->where('name', 'admin')->exists();
    }
}
