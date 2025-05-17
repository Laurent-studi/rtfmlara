<?php

namespace App\Events;

use App\Models\User;
use App\Models\Trophy;
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
     * @var User
     */
    public $user;

    /**
     * @var Trophy
     */
    public $trophy;

    /**
     * Create a new event instance.
     */
    public function __construct(User $user, Trophy $trophy)
    {
        $this->user = $user;
        $this->trophy = $trophy;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.' . $this->user->id),
        ];
    }

    /**
     * Get the data to broadcast.
     *
     * @return array
     */
    public function broadcastWith(): array
    {
        return [
            'trophy_id' => $this->trophy->id,
            'trophy_name' => $this->trophy->name,
            'trophy_description' => $this->trophy->description,
            'awarded_at' => now()->toIso8601String(),
        ];
    }
}
