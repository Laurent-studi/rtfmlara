<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuizResource extends JsonResource
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
            'title' => $this->title,
            'description' => $this->description,
            'creator_id' => $this->creator_id,
            'creator' => $this->when($this->relationLoaded('creator'), function() {
                return [
                    'id' => $this->creator->id,
                    'username' => $this->creator->username,
                    'avatar' => $this->creator->avatar ? asset('storage/' . $this->creator->avatar) : null,
                ];
            }),
            'category' => $this->category,
            'category_id' => $this->when($this->relationLoaded('category'), $this->category_id),
            'time_per_question' => $this->time_per_question,
            'time_limit' => $this->time_limit,
            'multiple_answers' => $this->multiple_answers,
            'difficulty_level' => $this->difficulty_level,
            'status' => $this->status,
            'code' => $this->code,
            'is_featured' => $this->is_featured,
            'is_published' => $this->is_published,
            'publish_date' => $this->publish_date,
            'image_url' => $this->image_url,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'questions_count' => $this->when(isset($this->questions_count), $this->questions_count),
            'participants_count' => $this->when(isset($this->participants_count), $this->participants_count),
            'average_score' => $this->when(isset($this->average_score), $this->average_score),
            'completion_time_avg' => $this->when(isset($this->completion_time_avg), $this->completion_time_avg),
            'questions' => $this->when($this->relationLoaded('questions') && !$this->shouldHideAnswers($request), 
                QuestionResource::collection($this->questions)
            ),
            'questions_preview' => $this->when($this->relationLoaded('questions') && $this->shouldHideAnswers($request), function() {
                return $this->questions->map(function($question) {
                    return [
                        'id' => $question->id,
                        'question_text' => $question->question_text,
                        'points' => $question->points,
                        'order_index' => $question->order_index,
                        'answers_count' => $question->answers->count(),
                    ];
                });
            }),
            'tags' => $this->when($this->relationLoaded('tags'), function() {
                return $this->tags->pluck('name');
            }),
            'user_stats' => $this->when(isset($this->user_stats), $this->user_stats),
            'meta_data' => $this->meta_data,
            // Liens vers les ressources liées
            'links' => [
                'self' => route('quizzes.show', $this->id),
                'questions' => route('quizzes.questions.index', $this->id),
                'play' => route('quizzes.play', $this->code ?? $this->id),
            ],
        ];
    }

    /**
     * Détermine si les réponses aux questions doivent être cachées.
     * 
     * @param Request $request
     * @return bool
     */
    protected function shouldHideAnswers(Request $request): bool
    {
        // Cachez les réponses correctes sauf au créateur ou à un admin
        $user = $request->user();
        
        if (!$user) {
            return true;
        }
        
        if ($user->id === $this->creator_id) {
            return false;
        }
        
        if ($user->hasRole('admin')) {
            return false;
        }
        
        return true;
    }
}
