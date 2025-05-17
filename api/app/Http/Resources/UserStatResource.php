<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserStatResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        if (!$this->resource) {
            return [];
        }

        return [
            'quizzes_completed' => $this->quizzes_completed ?? 0,
            'total_score' => $this->total_score ?? 0,
            'average_score' => $this->average_score ?? 0,
            'highest_score' => $this->highest_score ?? 0,
            'achievements_count' => $this->achievements_count ?? 0,
            'badges_count' => $this->badges_count ?? 0,
            'streak_current' => $this->streak_current ?? 0,
            'streak_longest' => $this->streak_longest ?? 0,
            'last_activity_date' => $this->last_activity_date,
        ];
    }
} 