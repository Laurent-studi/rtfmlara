<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SeasonalTheme;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class SeasonalThemeController extends Controller
{
    /**
     * Afficher une liste des thèmes saisonniers.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $themes = SeasonalTheme::orderBy('is_active', 'desc')
            ->orderBy('name')
            ->get();
        
        return response()->json($themes);
    }

    /**
     * Obtenir le thème actif actuel.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getCurrentTheme()
    {
        $theme = SeasonalTheme::where('is_active', true)
            ->first();
        
        if (!$theme) {
            return response()->json([
                'message' => 'Aucun thème actif trouvé'
            ], 404);
        }
        
        return response()->json($theme);
    }

    /**
     * Enregistrer un nouveau thème saisonnier.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'description' => 'nullable|string',
            'css_class' => 'required|string|unique:seasonal_themes,css_class|max:50',
            'colors' => 'nullable|array',
            'background_image' => 'nullable|image|max:2048',
            'logo_image' => 'nullable|image|max:2048',
            'is_active' => 'boolean',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }
        
        $data = $request->all();
        
        // Traitement des images si fournies
        if ($request->hasFile('background_image')) {
            $path = $request->file('background_image')->store('themes/backgrounds', 'public');
            $data['background_image'] = $path;
        }
        
        if ($request->hasFile('logo_image')) {
            $path = $request->file('logo_image')->store('themes/logos', 'public');
            $data['logo_image'] = $path;
        }
        
        $theme = SeasonalTheme::create($data);
        
        // Si le thème est actif, désactiver les autres
        if ($theme->is_active) {
            SeasonalTheme::where('id', '!=', $theme->id)
                ->update(['is_active' => false]);
        }
        
        return response()->json([
            'message' => 'Thème saisonnier créé avec succès',
            'theme' => $theme
        ], 201);
    }

    /**
     * Afficher un thème saisonnier spécifique.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $theme = SeasonalTheme::findOrFail($id);
        
        return response()->json($theme);
    }

    /**
     * Mettre à jour un thème saisonnier spécifique.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $theme = SeasonalTheme::findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:100',
            'description' => 'nullable|string',
            'css_class' => 'sometimes|required|string|max:50|unique:seasonal_themes,css_class,' . $id,
            'colors' => 'nullable|array',
            'background_image' => 'nullable|image|max:2048',
            'logo_image' => 'nullable|image|max:2048',
            'is_active' => 'boolean',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }
        
        // Traitement des images si fournies
        if ($request->hasFile('background_image')) {
            // Supprimer l'ancienne image si elle existe
            if ($theme->background_image) {
                Storage::disk('public')->delete($theme->background_image);
            }
            
            $path = $request->file('background_image')->store('themes/backgrounds', 'public');
            $theme->background_image = $path;
        }
        
        if ($request->hasFile('logo_image')) {
            // Supprimer l'ancienne image si elle existe
            if ($theme->logo_image) {
                Storage::disk('public')->delete($theme->logo_image);
            }
            
            $path = $request->file('logo_image')->store('themes/logos', 'public');
            $theme->logo_image = $path;
        }
        
        // Mise à jour des autres champs
        $theme->name = $request->name ?? $theme->name;
        $theme->description = $request->description ?? $theme->description;
        $theme->css_class = $request->css_class ?? $theme->css_class;
        $theme->colors = $request->colors ?? $theme->colors;
        $theme->start_date = $request->start_date ?? $theme->start_date;
        $theme->end_date = $request->end_date ?? $theme->end_date;
        
        // Gestion de l'activation
        if ($request->has('is_active')) {
            $theme->is_active = $request->is_active;
            
            // Si le thème est activé, désactiver les autres
            if ($theme->is_active) {
                SeasonalTheme::where('id', '!=', $theme->id)
                    ->update(['is_active' => false]);
            }
        }
        
        $theme->save();
        
        return response()->json([
            'message' => 'Thème saisonnier mis à jour avec succès',
            'theme' => $theme
        ]);
    }

    /**
     * Supprimer un thème saisonnier spécifique.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $theme = SeasonalTheme::findOrFail($id);
        
        // Supprimer les images associées
        if ($theme->background_image) {
            Storage::disk('public')->delete($theme->background_image);
        }
        
        if ($theme->logo_image) {
            Storage::disk('public')->delete($theme->logo_image);
        }
        
        $theme->delete();
        
        return response()->json([
            'message' => 'Thème saisonnier supprimé avec succès'
        ]);
    }

    /**
     * Activer un thème saisonnier spécifique.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function activate($id)
    {
        $theme = SeasonalTheme::findOrFail($id);
        
        if ($theme->setAsActive()) {
            return response()->json([
                'message' => 'Thème saisonnier activé avec succès',
                'theme' => $theme
            ]);
        }
        
        return response()->json([
            'message' => 'Erreur lors de l\'activation du thème'
        ], 500);
    }
} 