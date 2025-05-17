<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuestionResource extends JsonResource
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
            'question_text' => $this->question_text,
            'points' => $this->points,
            'order_index' => $this->order_index,
            'media_url' => $this->when(isset($this->media_url), $this->media_url),
            'media_type' => $this->when(isset($this->media_type), $this->media_type),
            'time_limit' => $this->when(isset($this->time_limit), $this->time_limit),
            'explanation' => $this->when(isset($this->explanation), $this->explanation),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'answers' => $this->when(
                $this->relationLoaded('answers'),
                AnswerResource::collection($this->answers),
                function() {
                    return $this->answers_count ?? null;
                }
            ),
            'correct_answers_count' => $this->when(
                isset($this->correct_answers_count), 
                $this->correct_answers_count
            ),
            'stats' => $this->when(isset($this->stats), $this->stats),
            'links' => [
                'self' => route('questions.show', $this->id),
                'quiz' => route('quizzes.show', $this->quiz_id),
            ],
        ];
    }
}
