<?php

namespace App\Policies;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class NotificationPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // L'utilisateur ne peut voir que ses propres notifications
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Notification $notification): bool
    {
        // L'utilisateur ne peut voir que ses propres notifications
        return $user->id === $notification->user_id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Seuls les administrateurs peuvent créer manuellement des notifications
        return $user->hasRole('admin');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Notification $notification): bool
    {
        // L'utilisateur peut marquer ses propres notifications comme lues
        return $user->id === $notification->user_id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Notification $notification): bool
    {
        // L'utilisateur peut supprimer ses propres notifications
        return $user->id === $notification->user_id;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Notification $notification): bool
    {
        // L'utilisateur peut restaurer ses propres notifications
        return $user->id === $notification->user_id;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Notification $notification): bool
    {
        // Seuls les administrateurs peuvent supprimer définitivement des notifications
        return $user->hasRole('admin');
    }
    
    /**
     * Determine whether the user can mark a notification as read.
     */
    public function markAsRead(User $user, Notification $notification): bool
    {
        // L'utilisateur ne peut marquer comme lues que ses propres notifications
        return $user->id === $notification->user_id;
    }
    
    /**
     * Determine whether the user can mark all notifications as read.
     */
    public function markAllAsRead(User $user): bool
    {
        // L'utilisateur peut marquer toutes ses notifications comme lues
        return true;
    }
    
    /**
     * Determine whether the user can send a notification.
     */
    public function send(User $user): bool
    {
        // Seuls les administrateurs peuvent envoyer des notifications manuellement
        return $user->hasRole('admin');
    }
} 