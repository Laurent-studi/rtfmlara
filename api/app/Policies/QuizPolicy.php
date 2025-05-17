<?php

namespace App\Policies;

use App\Models\Quiz;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class QuizPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(?User $user): bool
    {
        // Tout le monde peut voir les quiz publiés
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(?User $user, Quiz $quiz): bool
    {
        // Les quiz publiés sont visibles par tous
        if ($quiz->is_published) {
            return true;
        }

        // Les quiz non publiés sont visibles par leur créateur et les admins
        return $user && ($user->id === $quiz->creator_id || $user->hasRole('admin'));
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Tout utilisateur authentifié peut créer un quiz
        return true;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Quiz $quiz): bool
    {
        // Le créateur et les administrateurs peuvent modifier le quiz
        return $user->id === $quiz->creator_id || $user->hasRole('admin');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Quiz $quiz): bool
    {
        // Le créateur et les administrateurs peuvent supprimer le quiz
        return $user->id === $quiz->creator_id || $user->hasRole('admin');
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Quiz $quiz): bool
    {
        // Le créateur et les administrateurs peuvent restaurer le quiz
        return $user->id === $quiz->creator_id || $user->hasRole('admin');
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Quiz $quiz): bool
    {
        // Seuls les administrateurs peuvent supprimer définitivement un quiz
        return $user->hasRole('admin');
    }
    
    /**
     * Determine whether the user can feature a quiz.
     */
    public function feature(User $user, Quiz $quiz): bool
    {
        // Seuls les administrateurs peuvent mettre un quiz en avant
        return $user->hasRole('admin');
    }
    
    /**
     * Determine whether the user can play a quiz.
     */
    public function play(?User $user, Quiz $quiz): bool
    {
        // Tout le monde peut jouer aux quiz publiés
        if ($quiz->is_published) {
            return true;
        }
        
        // Le créateur et les admin peuvent tester un quiz non publié
        return $user && ($user->id === $quiz->creator_id || $user->hasRole('admin'));
    }
    
    /**
     * Determine whether the user can export a quiz.
     */
    public function export(User $user, Quiz $quiz): bool
    {
        // Le créateur, les admins, et les utilisateurs avec un rôle d'enseignant
        // peuvent exporter un quiz
        return $user->id === $quiz->creator_id || 
               $user->hasRole('admin') || 
               $user->hasRole('teacher');
    }
    
    /**
     * Determine whether the user can view analytics for a quiz.
     */
    public function viewAnalytics(User $user, Quiz $quiz): bool
    {
        // Le créateur et les admins peuvent voir les analyses
        return $user->id === $quiz->creator_id || $user->hasRole('admin');
    }
}
