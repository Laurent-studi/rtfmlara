<?php

namespace App\Events;

use App\Models\User;
use App\Models\Quiz;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class QuizCompleted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * @var User
     */
    public $user;

    /**
     * @var Quiz
     */
    public $quiz;

    /**
     * @var int
     */
    public $score;

    /**
     * @var int
     */
    public $totalQuestions;

    /**
     * Create a new event instance.
     */
    public function __construct(User $user, Quiz $quiz, int $score, int $totalQuestions)
    {
        $this->user = $user;
        $this->quiz = $quiz;
        $this->score = $score;
        $this->totalQuestions = $totalQuestions;
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
            'quiz_id' => $this->quiz->id,
            'quiz_title' => $this->quiz->title,
            'score' => $this->score,
            'total_questions' => $this->totalQuestions,
            'percentage' => $this->totalQuestions > 0 ? round(($this->score / $this->totalQuestions) * 100) : 0,
            'completed_at' => now()->toIso8601String(),
        ];
    }
}
