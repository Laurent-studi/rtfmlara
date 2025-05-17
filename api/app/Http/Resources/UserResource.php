<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
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
            'username' => $this->username,
            'email' => $this->when($this->isCurrentUser($request), $this->email),
            'avatar' => $this->avatar ? asset('storage/' . $this->avatar) : null,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'trophies_count' => $this->trophies_count,
            'achievement_points' => $this->achievement_points,
            'stats' => $this->when($this->relationLoaded('stats'), new UserStatResource($this->stats)),
            'badges' => $this->when($this->relationLoaded('badges'), BadgeResource::collection($this->badges)),
            'trophies' => $this->when($this->relationLoaded('trophies'), TrophyResource::collection($this->trophies)),
            'roles' => $this->when($this->relationLoaded('roles'), function() {
                return $this->roles->pluck('name');
            }),
            'created_quizzes_count' => $this->when(isset($this->created_quizzes_count), $this->created_quizzes_count),
            'completed_quizzes_count' => $this->when(isset($this->completed_quizzes_count), $this->completed_quizzes_count),
            // N'incluez les informations sensibles que si l'utilisateur voit son propre profil
            'email_verified_at' => $this->when($this->isCurrentUser($request), $this->email_verified_at),
            'push_enabled' => $this->when($this->isCurrentUser($request), $this->push_enabled),
            // Liens vers les ressources liées
            'links' => [
                'self' => route('users.show', $this->id),
                'quizzes' => route('users.quizzes', $this->id),
                'achievements' => route('users.achievements', $this->id),
            ],
        ];
    }

    /**
     * Vérifie si l'utilisateur actuel est le même que la ressource.
     *
     * @param Request $request
     * @return bool
     */
    protected function isCurrentUser(Request $request): bool
    {
        return $request->user() && $request->user()->id === $this->id;
    }
}
