<?php

namespace App\Listeners;

use App\Events\TrophyAwarded;
use App\Models\UserAchievement;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class UpdateUserAchievements implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * The number of times the job may be attempted.
     *
     * @var int
     */
    public $tries = 3;

    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(TrophyAwarded $event): void
    {
        try {
            // Enregistrer le trophée dans les réalisations de l'utilisateur
            UserAchievement::create([
                'user_id' => $event->user->id,
                'achievable_type' => get_class($event->trophy),
                'achievable_id' => $event->trophy->id,
                'earned_at' => now(),
                'data' => [
                    'trophy_name' => $event->trophy->name,
                    'trophy_description' => $event->trophy->description,
                ]
            ]);

            // Mettre à jour les statistiques de l'utilisateur
            $event->user->increment('trophies_count');
            $event->user->increment('achievement_points', $event->trophy->points);
            
            Log::info('Trophée attribué', [
                'user_id' => $event->user->id,
                'trophy_id' => $event->trophy->id,
                'trophy_name' => $event->trophy->name
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur lors de la mise à jour des réalisations: ' . $e->getMessage(), [
                'user_id' => $event->user->id,
                'trophy_id' => $event->trophy->id
            ]);
            
            $this->fail($e);
        }
    }
}
