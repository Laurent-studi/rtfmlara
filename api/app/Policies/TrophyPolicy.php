<?php

namespace App\Policies;

use App\Models\Trophy;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class TrophyPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(?User $user): bool
    {
        // Tout le monde peut voir les trophées
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(?User $user, Trophy $trophy): bool
    {
        // Tout le monde peut voir les trophées individuels
        return true;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Seuls les administrateurs peuvent créer des trophées
        return $user->hasRole('admin');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Trophy $trophy): bool
    {
        // Seuls les administrateurs peuvent modifier les trophées
        return $user->hasRole('admin');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Trophy $trophy): bool
    {
        // Seuls les administrateurs peuvent supprimer les trophées
        return $user->hasRole('admin');
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Trophy $trophy): bool
    {
        // Seuls les administrateurs peuvent restaurer les trophées
        return $user->hasRole('admin');
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Trophy $trophy): bool
    {
        // Seuls les super-administrateurs peuvent supprimer définitivement les trophées
        return $user->hasRole('super-admin');
    }
    
    /**
     * Determine whether the user can award a trophy to someone.
     */
    public function award(User $user, Trophy $trophy): bool
    {
        // Seuls les administrateurs peuvent attribuer des trophées manuellement
        return $user->hasRole('admin');
    }
    
    /**
     * Determine whether the user can view trophy criteria.
     */
    public function viewCriteria(User $user, Trophy $trophy): bool
    {
        // Seuls les administrateurs peuvent voir les critères détaillés des trophées
        return $user->hasRole('admin');
    }
} 