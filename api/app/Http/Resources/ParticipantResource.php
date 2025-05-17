<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ParticipantResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'quiz_session_id' => $this->quiz_session_id,
            'user_id' => $this->user_id,
            'user' => $this->when($this->relationLoaded('user'), function() {
                return [
                    'id' => $this->user->id,
                    'username' => $this->user->username,
                    'avatar' => $this->user->avatar ? asset('storage/' . $this->user->avatar) : null,
                ];
            }),
            'name' => $this->name,
            'score' => $this->score,
            'max_score' => $this->max_score,
            'percentage' => $this->percentage,
            'time_spent' => $this->time_spent,
            'completed_at' => $this->completed_at,
            'rank' => $this->when(isset($this->rank), $this->rank),
            'answers' => $this->when($this->relationLoaded('participant_answers'), function() {
                return $this->participant_answers->map(function($answer) {
                    return [
                        'id' => $answer->id,
                        'question_id' => $answer->question_id,
                        'answer_id' => $answer->answer_id,
                        'is_correct' => $answer->is_correct,
                        'response_time' => $answer->response_time,
                        'points_earned' => $answer->points_earned,
                    ];
                });
            }),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'links' => [
                'self' => route('participants.show', $this->id),
                'session' => route('quiz-sessions.show', $this->quiz_session_id),
            ],
        ];
    }
}
