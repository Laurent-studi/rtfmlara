<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\Response;

class UserPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // Les administrateurs peuvent voir tous les utilisateurs
        return $user->hasRole('admin');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, User $model): bool
    {
        // Tout utilisateur peut voir les profils publics
        // Les détails sensibles sont gérés par UserResource
        return true;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Seuls les administrateurs peuvent créer des utilisateurs
        // L'inscription normale passe par les routes d'authentification
        return $user->hasRole('admin');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, User $model): bool
    {
        // Un utilisateur peut modifier son propre profil
        // Un administrateur peut modifier n'importe quel profil
        return $user->id === $model->id || $user->hasRole('admin');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, User $model): bool
    {
        // Un utilisateur peut supprimer son propre compte
        // Un administrateur peut supprimer n'importe quel compte
        // Mais un administrateur ne peut pas se supprimer lui-même
        return ($user->id === $model->id && !$user->hasRole('admin')) || 
               ($user->hasRole('admin') && $user->id !== $model->id);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, User $model): bool
    {
        // Seuls les administrateurs peuvent restaurer un utilisateur supprimé
        return $user->hasRole('admin');
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, User $model): bool
    {
        // Seuls les super-administrateurs peuvent supprimer définitivement un utilisateur
        return $user->hasRole('super-admin');
    }
    
    /**
     * Determine whether the user can view all achievements.
     */
    public function viewAchievements(User $user, User $model): bool
    {
        // Un utilisateur peut voir ses propres réalisations
        // Un administrateur peut voir les réalisations de n'importe quel utilisateur
        return $user->id === $model->id || $user->hasRole('admin');
    }
    
    /**
     * Determine whether the user can view statistics.
     */
    public function viewStats(User $user, User $model): bool
    {
        // Un utilisateur peut voir ses propres statistiques
        // Un administrateur peut voir les statistiques de n'importe quel utilisateur
        return $user->id === $model->id || $user->hasRole('admin');
    }
}
