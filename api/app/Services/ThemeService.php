<?php

namespace App\Services;

use App\Models\Theme;
use App\Models\UserTheme;
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
        
        $userTheme = UserTheme::where('user_id', $userId)
            ->orderBy('applied_at', 'desc')
            ->first();
        
        if ($userTheme && $userTheme->theme_id) {
            return Theme::find($userTheme->theme_id);
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
        
        // Supprimer l'ancien thème de l'utilisateur s'il existe
        UserTheme::where('user_id', $userId)->delete();
        
        // Créer une nouvelle entrée pour le nouveau thème
        $userTheme = UserTheme::create([
            'user_id' => $userId,
            'theme_id' => $themeId,
            'applied_at' => now()
        ]);
        
        return $userTheme !== null;
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
        
        // Supprimer tous les thèmes de l'utilisateur pour revenir au thème par défaut
        $deleted = UserTheme::where('user_id', $userId)->delete();
        
        return true; // Toujours retourner true car même s'il n'y avait rien à supprimer, l'utilisateur est maintenant sur le thème par défaut
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
        
        // Supprimer les associations des utilisateurs qui utilisaient ce thème
        UserTheme::where('theme_id', $themeId)->delete();
        
        $theme->delete();
        
        // Vider le cache
        Cache::forget('themes.all');
        
        return true;
    }
} 