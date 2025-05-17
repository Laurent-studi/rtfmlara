<?php

namespace App\Policies;

use App\Models\Badge;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class BadgePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(?User $user): bool
    {
        // Tout le monde peut voir les badges
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(?User $user, Badge $badge): bool
    {
        // Tout le monde peut voir les badges individuels
        return true;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Seuls les administrateurs peuvent créer des badges
        return $user->hasRole('admin');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Badge $badge): bool
    {
        // Seuls les administrateurs peuvent modifier les badges
        return $user->hasRole('admin');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Badge $badge): bool
    {
        // Seuls les administrateurs peuvent supprimer les badges
        return $user->hasRole('admin');
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Badge $badge): bool
    {
        // Seuls les administrateurs peuvent restaurer les badges
        return $user->hasRole('admin');
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Badge $badge): bool
    {
        // Seuls les super-administrateurs peuvent supprimer définitivement les badges
        return $user->hasRole('super-admin');
    }
    
    /**
     * Determine whether the user can award a badge to someone.
     */
    public function award(User $user, Badge $badge): bool
    {
        // Seuls les administrateurs peuvent attribuer des badges manuellement
        return $user->hasRole('admin');
    }
    
    /**
     * Determine whether the user can view badge criteria.
     */
    public function viewCriteria(User $user, Badge $badge): bool
    {
        // Seuls les administrateurs peuvent voir les critères détaillés des badges
        return $user->hasRole('admin');
    }
} 