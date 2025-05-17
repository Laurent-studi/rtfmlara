<?php

namespace App\Events;

use App\Models\Badge;
use App\Models\User;
use App\Models\UserAchievement;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BadgeEarned implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * L'utilisateur qui a obtenu le badge.
     *
     * @var User
     */
    public User $user;

    /**
     * Le badge obtenu.
     *
     * @var Badge
     */
    public Badge $badge;

    /**
     * L'enregistrement UserAchievement créé.
     *
     * @var UserAchievement
     */
    public UserAchievement $achievement;

    /**
     * Créez une nouvelle instance d'événement.
     *
     * @param User $user
     * @param Badge $badge
     * @param UserAchievement $achievement
     * @return void
     */
    public function __construct(User $user, Badge $badge, UserAchievement $achievement)
    {
        $this->user = $user;
        $this->badge = $badge;
        $this->achievement = $achievement;
    }

    /**
     * Obtenir les canaux sur lesquels l'événement doit être diffusé.
     *
     * @return \Illuminate\Broadcasting\Channel|array
     */
    public function broadcastOn()
    {
        return new PrivateChannel('user.' . $this->user->id);
    }

    /**
     * Les données à diffuser.
     *
     * @return array
     */
    public function broadcastWith()
    {
        return [
            'badge' => [
                'id' => $this->badge->id,
                'name' => $this->badge->name,
                'description' => $this->badge->description,
                'icon' => $this->badge->icon,
                'image_url' => $this->badge->image_url,
                'category' => $this->badge->category,
            ],
            'earned_at' => $this->achievement->earned_at->format('Y-m-d H:i:s'),
        ];
    }

    /**
     * Le nom de l'événement pour la diffusion.
     *
     * @return string
     */
    public function broadcastAs()
    {
        return 'badge.earned';
    }
}
