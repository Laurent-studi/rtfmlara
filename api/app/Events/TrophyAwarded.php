<?php

namespace App\Events;

use App\Models\Trophy;
use App\Models\User;
use App\Models\UserAchievement;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TrophyAwarded implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * L'utilisateur qui a obtenu le trophée.
     *
     * @var User
     */
    public User $user;

    /**
     * Le trophée obtenu.
     *
     * @var Trophy
     */
    public Trophy $trophy;

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
     * @param Trophy $trophy
     * @param UserAchievement $achievement
     * @return void
     */
    public function __construct(User $user, Trophy $trophy, UserAchievement $achievement)
    {
        $this->user = $user;
        $this->trophy = $trophy;
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
            'trophy' => [
                'id' => $this->trophy->id,
                'name' => $this->trophy->name,
                'description' => $this->trophy->description,
                'icon' => $this->trophy->icon,
                'image_url' => $this->trophy->image_url,
                'level' => $this->trophy->level,
                'points' => $this->trophy->points,
            ],
            'earned_at' => $this->achievement->earned_at->format('Y-m-d H:i:s'),
            'total_points' => $this->user->getAchievementPoints(),
        ];
    }

    /**
     * Le nom de l'événement pour la diffusion.
     *
     * @return string
     */
    public function broadcastAs()
    {
        return 'trophy.awarded';
    }
}
