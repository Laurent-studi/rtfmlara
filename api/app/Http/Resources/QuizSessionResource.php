<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuizSessionResource extends JsonResource
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
            'quiz_id' => $this->quiz_id,
            'quiz' => $this->when($this->relationLoaded('quiz'), function() {
                return [
                    'id' => $this->quiz->id,
                    'title' => $this->quiz->title,
                    'code' => $this->quiz->code,
                ];
            }),
            'started_at' => $this->started_at,
            'completed_at' => $this->completed_at,
            'time_spent' => $this->time_spent,
            'status' => $this->status,
            'score' => $this->score,
            'max_score' => $this->max_score,
            'percentage' => $this->percentage,
            'participant_count' => $this->when(isset($this->participant_count), $this->participant_count),
            'current_question_index' => $this->when(isset($this->current_question_index), $this->current_question_index),
            'participants' => $this->when($this->relationLoaded('participants'), ParticipantResource::collection($this->participants)),
            'is_active' => $this->status === 'in_progress',
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'links' => [
                'self' => route('quiz-sessions.show', $this->id),
                'quiz' => route('quizzes.show', $this->quiz_id),
                'results' => route('quiz-sessions.results', $this->id),
            ],
        ];
    }
}
