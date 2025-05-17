<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PushNotificationService
{
    /**
     * Envoyer une notification push à un utilisateur.
     *
     * @param User $user
     * @param string $title
     * @param string $body
     * @param array $data
     * @return bool
     */
    public function sendNotification(User $user, string $title, string $body, array $data = []): bool
    {
        try {
            // Vérifier si l'utilisateur a un token de notification
            if (empty($user->push_token)) {
                Log::info('Tentative d\'envoi de notification push à un utilisateur sans token', [
                    'user_id' => $user->id
                ]);
                return false;
            }

            // Configuration pour FCM (Firebase Cloud Messaging)
            $response = Http::withHeaders([
                'Authorization' => 'key=' . config('services.fcm.key'),
                'Content-Type' => 'application/json'
            ])->post('https://fcm.googleapis.com/fcm/send', [
                'to' => $user->push_token,
                'notification' => [
                    'title' => $title,
                    'body' => $body,
                    'sound' => 'default',
                    'badge' => $user->notifications()->unread()->count()
                ],
                'data' => array_merge($data, [
                    'timestamp' => now()->timestamp
                ])
            ]);

            if ($response->successful()) {
                Log::info('Notification push envoyée avec succès', [
                    'user_id' => $user->id,
                    'title' => $title
                ]);
                return true;
            } else {
                Log::error('Échec de l\'envoi de notification push', [
                    'user_id' => $user->id,
                    'response' => $response->json()
                ]);
                return false;
            }
        } catch (\Exception $e) {
            Log::error('Exception lors de l\'envoi de notification push: ' . $e->getMessage(), [
                'user_id' => $user->id,
                'exception' => get_class($e)
            ]);
            return false;
        }
    }

    /**
     * Envoyer une notification push à plusieurs utilisateurs.
     *
     * @param array $userIds
     * @param string $title
     * @param string $body
     * @param array $data
     * @return int Nombre de notifications envoyées avec succès
     */
    public function sendBulkNotifications(array $userIds, string $title, string $body, array $data = []): int
    {
        $successCount = 0;
        
        $users = User::whereIn('id', $userIds)
            ->where('push_enabled', true)
            ->whereNotNull('push_token')
            ->get();
            
        foreach ($users as $user) {
            if ($this->sendNotification($user, $title, $body, $data)) {
                $successCount++;
            }
        }
        
        return $successCount;
    }
} 