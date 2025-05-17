<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SoundEffect;
use App\Models\UserSoundPreference;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class SoundEffectController extends Controller
{
    /**
     * Afficher une liste des effets sonores.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $sounds = SoundEffect::orderBy('category')
            ->orderBy('name')
            ->get();
        
        return response()->json($sounds);
    }

    /**
     * Obtenir les effets sonores groupés par catégorie.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getByCategory()
    {
        $sounds = SoundEffect::select('id', 'name', 'category', 'trigger_event', 'file_path', 'is_enabled')
            ->where('is_enabled', true)
            ->get()
            ->groupBy('category');
        
        return response()->json($sounds);
    }

    /**
     * Obtenir les effets sonores pour un événement spécifique.
     *
     * @param string $event
     * @return \Illuminate\Http\JsonResponse
     */
    public function getForEvent($event)
    {
        $sounds = SoundEffect::where('trigger_event', $event)
            ->where('is_enabled', true)
            ->get();
        
        return response()->json($sounds);
    }

    /**
     * Enregistrer un nouvel effet sonore.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'description' => 'nullable|string',
            'sound_file' => 'required|file|mimes:mp3,wav,ogg|max:2048',
            'category' => 'required|string|max:50',
            'trigger_event' => 'required|in:correct_answer,wrong_answer,quiz_start,quiz_end,elimination,victory,timer_warning,level_up,achievement_unlocked',
            'is_enabled' => 'boolean',
            'volume' => 'integer|min:0|max:100',
            'duration_ms' => 'nullable|integer|min:0',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }
        
        // Traitement du fichier audio
        $filePath = $request->file('sound_file')->store('sounds', 'public');
        
        $sound = SoundEffect::create([
            'name' => $request->name,
            'description' => $request->description,
            'file_path' => $filePath,
            'category' => $request->category,
            'trigger_event' => $request->trigger_event,
            'is_enabled' => $request->is_enabled ?? true,
            'volume' => $request->volume ?? 100,
            'duration_ms' => $request->duration_ms,
        ]);
        
        return response()->json([
            'message' => 'Effet sonore créé avec succès',
            'sound' => $sound
        ], 201);
    }

    /**
     * Afficher un effet sonore spécifique.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $sound = SoundEffect::findOrFail($id);
        
        return response()->json($sound);
    }

    /**
     * Mettre à jour un effet sonore spécifique.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $sound = SoundEffect::findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:100',
            'description' => 'nullable|string',
            'sound_file' => 'nullable|file|mimes:mp3,wav,ogg|max:2048',
            'category' => 'sometimes|required|string|max:50',
            'trigger_event' => 'sometimes|required|in:correct_answer,wrong_answer,quiz_start,quiz_end,elimination,victory,timer_warning,level_up,achievement_unlocked',
            'is_enabled' => 'boolean',
            'volume' => 'integer|min:0|max:100',
            'duration_ms' => 'nullable|integer|min:0',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }
        
        // Traitement du fichier audio si fourni
        if ($request->hasFile('sound_file')) {
            // Supprimer l'ancien fichier audio
            Storage::disk('public')->delete($sound->file_path);
            
            // Stocker le nouveau fichier
            $filePath = $request->file('sound_file')->store('sounds', 'public');
            $sound->file_path = $filePath;
        }
        
        // Mise à jour des autres champs
        $sound->name = $request->name ?? $sound->name;
        $sound->description = $request->description ?? $sound->description;
        $sound->category = $request->category ?? $sound->category;
        $sound->trigger_event = $request->trigger_event ?? $sound->trigger_event;
        $sound->is_enabled = $request->has('is_enabled') ? $request->is_enabled : $sound->is_enabled;
        $sound->volume = $request->volume ?? $sound->volume;
        $sound->duration_ms = $request->duration_ms ?? $sound->duration_ms;
        
        $sound->save();
        
        return response()->json([
            'message' => 'Effet sonore mis à jour avec succès',
            'sound' => $sound
        ]);
    }

    /**
     * Supprimer un effet sonore spécifique.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $sound = SoundEffect::findOrFail($id);
        
        // Supprimer le fichier audio
        Storage::disk('public')->delete($sound->file_path);
        
        $sound->delete();
        
        return response()->json([
            'message' => 'Effet sonore supprimé avec succès'
        ]);
    }

    /**
     * Obtenir les préférences sonores de l'utilisateur.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getUserPreferences()
    {
        $preferences = UserSoundPreference::getForUser(Auth::id());
        
        return response()->json($preferences);
    }

    /**
     * Mettre à jour les préférences sonores de l'utilisateur.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateUserPreferences(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'sounds_enabled' => 'boolean',
            'volume_level' => 'integer|min:0|max:100',
            'disabled_categories' => 'nullable|array',
            'custom_settings' => 'nullable|array',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }
        
        $preferences = UserSoundPreference::getForUser(Auth::id());
        
        // Mise à jour des préférences
        if ($request->has('sounds_enabled')) {
            $preferences->sounds_enabled = $request->sounds_enabled;
        }
        
        if ($request->has('volume_level')) {
            $preferences->volume_level = $request->volume_level;
        }
        
        if ($request->has('disabled_categories')) {
            $preferences->disabled_categories = $request->disabled_categories;
        }
        
        if ($request->has('custom_settings')) {
            $preferences->custom_settings = $request->custom_settings;
        }
        
        $preferences->save();
        
        return response()->json([
            'message' => 'Préférences sonores mises à jour avec succès',
            'preferences' => $preferences
        ]);
    }
} 