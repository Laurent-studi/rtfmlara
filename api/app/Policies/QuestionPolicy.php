<?php

namespace App\Policies;

use App\Models\Question;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class QuestionPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(?User $user): bool
    {
        // Tout le monde peut voir les questions des quiz publiés
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(?User $user, Question $question): bool
    {
        // Vérifier si la question fait partie d'un quiz publié
        if ($question->quiz && $question->quiz->is_published) {
            return true;
        }

        // Sinon, seul le créateur du quiz et les administrateurs peuvent voir la question
        return $user && $question->quiz && (
            $user->id === $question->quiz->creator_id || 
            $user->hasRole('admin')
        );
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user, int $quizId): bool
    {
        // L'utilisateur peut créer des questions pour ses propres quiz
        // ou s'il est administrateur
        $quiz = \App\Models\Quiz::find($quizId);
        
        if (!$quiz) {
            return false;
        }
        
        return $user->id === $quiz->creator_id || $user->hasRole('admin');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Question $question): bool
    {
        // Le créateur du quiz et les administrateurs peuvent modifier la question
        return $question->quiz && (
            $user->id === $question->quiz->creator_id || 
            $user->hasRole('admin')
        );
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Question $question): bool
    {
        // Le créateur du quiz et les administrateurs peuvent supprimer la question
        return $question->quiz && (
            $user->id === $question->quiz->creator_id || 
            $user->hasRole('admin')
        );
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Question $question): bool
    {
        // Le créateur du quiz et les administrateurs peuvent restaurer la question
        return $question->quiz && (
            $user->id === $question->quiz->creator_id || 
            $user->hasRole('admin')
        );
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Question $question): bool
    {
        // Seuls les administrateurs peuvent supprimer définitivement une question
        return $user->hasRole('admin');
    }
    
    /**
     * Determine whether the user can reorder questions.
     */
    public function reorder(User $user, Question $question): bool
    {
        // Le créateur du quiz et les administrateurs peuvent réordonner les questions
        return $question->quiz && (
            $user->id === $question->quiz->creator_id || 
            $user->hasRole('admin')
        );
    }
    
    /**
     * Determine whether the user can see the correct answers.
     */
    public function viewCorrectAnswers(User $user, Question $question): bool
    {
        // Le créateur du quiz, les enseignants et les administrateurs peuvent 
        // voir les réponses correctes
        return $question->quiz && (
            $user->id === $question->quiz->creator_id || 
            $user->hasRole('admin') ||
            $user->hasRole('teacher')
        );
    }
}
