<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AnswerResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $data = [
            'id' => $this->id,
            'question_id' => $this->question_id,
            'answer_text' => $this->answer_text,
            'order_index' => $this->when(isset($this->order_index), $this->order_index),
            'image_url' => $this->when(isset($this->image_url), $this->image_url),
        ];
        
        // Seul le créateur du quiz ou un admin peut voir si la réponse est correcte
        $user = $request->user();
        $isCreatorOrAdmin = false;
        
        if ($user && $this->relationLoaded('question') && $this->question->relationLoaded('quiz')) {
            $isCreatorOrAdmin = $user->id === $this->question->quiz->creator_id || $user->hasRole('admin');
        }
        
        // Durant une session de quiz active, on ne montre jamais si la réponse est correcte
        if ($isCreatorOrAdmin && !$request->session()->has('active_quiz_session')) {
            $data['is_correct'] = $this->is_correct;
        }
        
        return $data;
    }
}
