<?php

namespace App\Listeners;

use App\Events\BadgeEarned;
use App\Models\Notification;
use App\Services\PushNotificationService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class NotifyUserForBadge implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * The number of times the job may be attempted.
     *
     * @var int
     */
    public $tries = 3;

    /**
     * @var PushNotificationService
     */
    protected $pushNotificationService;

    /**
     * Create the event listener.
     */
    public function __construct(PushNotificationService $pushNotificationService)
    {
        $this->pushNotificationService = $pushNotificationService;
    }

    /**
     * Handle the event.
     */
    public function handle(BadgeEarned $event): void
    {
        try {
            // Créer une notification dans la base de données
            Notification::create([
                'user_id' => $event->user->id,
                'type' => 'badge_earned',
                'title' => 'Nouveau badge obtenu !',
                'content' => 'Félicitations ! Vous avez obtenu le badge "' . $event->badge->name . '".',
                'data' => [
                    'badge_id' => $event->badge->id,
                    'badge_name' => $event->badge->name,
                    'badge_image' => $event->badge->image_url,
                ],
                'read_at' => null
            ]);

            // Envoyer une notification push si l'utilisateur a activé les notifications
            if ($event->user->push_enabled) {
                $this->pushNotificationService->sendNotification(
                    $event->user,
                    'Nouveau badge obtenu !',
                    'Félicitations ! Vous avez obtenu le badge "' . $event->badge->name . '".',
                    [
                        'type' => 'badge_earned',
                        'badge_id' => $event->badge->id
                    ]
                );
            }
            
            Log::info('Notification de badge envoyée', [
                'user_id' => $event->user->id,
                'badge_id' => $event->badge->id,
                'badge_name' => $event->badge->name
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur lors de l\'envoi de la notification de badge: ' . $e->getMessage(), [
                'user_id' => $event->user->id,
                'badge_id' => $event->badge->id
            ]);
            
            $this->fail($e);
        }
    }
}
