<?php

namespace App\Services;

use App\Models\Theme;
use App\Models\UserPreference;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Collection;

class ThemeService
{
    /**
     * Délai de mise en cache des thèmes (en minutes)
     */
    const CACHE_DURATION = 60;

    /**
     * Retourne tous les thèmes actifs (avec mise en cache)
     */
    public function getAllThemes(): Collection
    {
        return Cache::remember('themes.all', self::CACHE_DURATION, function () {
            return Theme::where('is_active', true)->get();
        });
    }

    /**
     * Retourne le thème par défaut (avec mise en cache)
     */
    public function getDefaultTheme(): ?Theme
    {
        return Cache::remember('themes.default', self::CACHE_DURATION, function () {
            return Theme::where('is_default', true)->first();
        });
    }

    /**
     * Retourne le thème pour un utilisateur spécifique
     */
    public function getUserTheme($userId = null): ?Theme
    {
        $userId = $userId ?: Auth::id();
        
        if (!$userId) {
            return $this->getDefaultTheme();
        }
        
        $preference = UserPreference::where('user_id', $userId)->first();
        
        if ($preference && $preference->theme_id) {
            return Theme::find($preference->theme_id);
        }
        
        return $this->getDefaultTheme();
    }

    /**
     * Définit le thème choisi par un utilisateur
     */
    public function setUserTheme(int $themeId, $userId = null): bool
    {
        $userId = $userId ?: Auth::id();
        
        if (!$userId) {
            return false;
        }
        
        $theme = Theme::find($themeId);
        
        if (!$theme || !$theme->is_active) {
            return false;
        }
        
        $preference = UserPreference::firstOrNew(['user_id' => $userId]);
        $preference->theme_id = $themeId;
        return $preference->save();
    }

    /**
     * Réinitialise le thème d'un utilisateur au thème par défaut
     */
    public function resetUserTheme($userId = null): bool
    {
        $userId = $userId ?: Auth::id();
        
        if (!$userId) {
            return false;
        }
        
        $preference = UserPreference::where('user_id', $userId)->first();
        
        if (!$preference) {
            return true; // Déjà sur le thème par défaut
        }
        
        $preference->theme_id = null;
        return $preference->save();
    }

    /**
     * Définit un thème comme thème par défaut
     */
    public function setDefaultTheme(int $themeId): ?Theme
    {
        $theme = Theme::find($themeId);
        
        if (!$theme) {
            return null;
        }
        
        $theme->setAsDefault();
        
        // Vider le cache
        Cache::forget('themes.default');
        Cache::forget('themes.all');
        
        return $theme;
    }

    /**
     * Crée un nouveau thème
     */
    public function createTheme(array $data): Theme
    {
        $theme = Theme::create($data);
        
        if (isset($data['is_default']) && $data['is_default']) {
            $theme->setAsDefault();
        }
        
        // Vider le cache
        Cache::forget('themes.all');
        
        return $theme;
    }

    /**
     * Met à jour un thème existant
     */
    public function updateTheme(int $themeId, array $data): ?Theme
    {
        $theme = Theme::find($themeId);
        
        if (!$theme) {
            return null;
        }
        
        $theme->update($data);
        
        if (isset($data['is_default']) && $data['is_default']) {
            $theme->setAsDefault();
        }
        
        // Vider le cache
        Cache::forget('themes.all');
        Cache::forget('themes.default');
        
        return $theme;
    }

    /**
     * Supprime un thème
     */
    public function deleteTheme(int $themeId): bool
    {
        $theme = Theme::find($themeId);
        
        if (!$theme || $theme->is_default) {
            return false;
        }
        
        // Mettre à jour les préférences des utilisateurs qui utilisaient ce thème
        UserPreference::where('theme_id', $themeId)
            ->update(['theme_id' => null]);
        
        $theme->delete();
        
        // Vider le cache
        Cache::forget('themes.all');
        
        return true;
    }
} 