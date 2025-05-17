<?php

namespace App\Listeners;

use App\Events\BadgeEarned;
use App\Events\TrophyAwarded;
use App\Models\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class SendAchievementNotification implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle when a badge is earned.
     */
    public function handleBadgeEarned(BadgeEarned $event)
    {
        $notification = new Notification([
            'user_id' => $event->user->id,
            'type' => 'badge_earned',
            'title' => 'Nouveau badge obtenu !',
            'content' => 'Vous avez obtenu le badge ' . $event->badge->name,
            'data' => [
                'badge_id' => $event->badge->id,
                'badge_name' => $event->badge->name,
                'badge_image' => $event->badge->image_url ?? $event->badge->icon,
                'category' => $event->badge->category,
                'earned_at' => $event->achievement->earned_at->format('Y-m-d H:i:s'),
            ],
            'is_read' => false,
        ]);

        $notification->save();
    }

    /**
     * Handle when a trophy is awarded.
     */
    public function handleTrophyAwarded(TrophyAwarded $event)
    {
        $notification = new Notification([
            'user_id' => $event->user->id,
            'type' => 'trophy_awarded',
            'title' => 'Nouveau trophée obtenu !',
            'content' => 'Vous avez obtenu le trophée ' . $event->trophy->name,
            'data' => [
                'trophy_id' => $event->trophy->id,
                'trophy_name' => $event->trophy->name,
                'trophy_image' => $event->trophy->image_url ?? $event->trophy->icon,
                'level' => $event->trophy->level,
                'points' => $event->trophy->points,
                'earned_at' => $event->achievement->earned_at->format('Y-m-d H:i:s'),
                'total_points' => $event->user->getAchievementPoints(),
            ],
            'is_read' => false,
        ]);

        $notification->save();
    }

    /**
     * Register the listeners for the subscriber.
     *
     * @param  \Illuminate\Events\Dispatcher  $events
     * @return void
     */
    public function subscribe($events)
    {
        $events->listen(
            BadgeEarned::class,
            [SendAchievementNotification::class, 'handleBadgeEarned']
        );

        $events->listen(
            TrophyAwarded::class,
            [SendAchievementNotification::class, 'handleTrophyAwarded']
        );
    }
} 