<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    /**
     * Afficher la liste des notifications de l'utilisateur.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $notifications = Notification::where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json($notifications);
    }

    /**
     * Récupérer les notifications non lues de l'utilisateur.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function unread()
    {
        $notifications = Notification::getUnreadByUserId(Auth::id());
        return response()->json($notifications);
    }

    /**
     * Marquer une notification comme lue.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update($id)
    {
        $notification = Notification::findOrFail($id);

        // Vérifier si l'utilisateur est le propriétaire de la notification
        if ($notification->user_id !== Auth::id()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $notification->markAsRead();

        return response()->json(['message' => 'Notification marquée comme lue']);
    }

    /**
     * Marquer toutes les notifications de l'utilisateur comme lues.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function markAllAsRead()
    {
        Notification::where('user_id', Auth::id())
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json(['message' => 'Toutes les notifications ont été marquées comme lues']);
    }

    /**
     * Supprimer une notification.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $notification = Notification::findOrFail($id);

        // Vérifier si l'utilisateur est le propriétaire de la notification
        if ($notification->user_id !== Auth::id()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $notification->delete();

        return response()->json(['message' => 'Notification supprimée avec succès']);
    }


    public function show(\App\Models\Notification $notification)
    {
        return view('notifications.show', compact('notification'));
    }


    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required',
            'title' => 'required',
            'message' => 'required',
            'type' => 'required',
            'is_read' => 'required'
        ]);

        \App\Models\Notification::create($validated);

        return redirect()->route('notifications.index');
    }
}