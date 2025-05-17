<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LeagueResource extends JsonResource
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
            'name' => $this->name,
            'description' => $this->description,
            'creator_id' => $this->creator_id,
            'creator' => $this->when($this->relationLoaded('creator'), function() {
                return [
                    'id' => $this->creator->id,
                    'username' => $this->creator->username,
                    'avatar' => $this->creator->avatar ? asset('storage/' . $this->creator->avatar) : null,
                ];
            }),
            'start_date' => $this->start_date,
            'end_date' => $this->end_date,
            'status' => $this->status,
            'points_win' => $this->points_win,
            'points_draw' => $this->points_draw,
            'points_loss' => $this->points_loss,
            'image_url' => $this->image_url,
            'member_count' => $this->when(isset($this->member_count), $this->member_count),
            'max_members' => $this->max_members,
            'is_private' => $this->is_private,
            'join_code' => $this->when(
                // Seulement le créateur ou les admins peuvent voir le code d'invitation
                $request->user() && ($request->user()->id === $this->creator_id || $request->user()->hasRole('admin')),
                $this->join_code
            ),
            'seasons' => $this->when($this->relationLoaded('seasons'), function() {
                return $this->seasons->map(function($season) {
                    return [
                        'id' => $season->id,
                        'name' => $season->name,
                        'start_date' => $season->start_date,
                        'end_date' => $season->end_date,
                        'status' => $season->status,
                    ];
                });
            }),
            'leaderboard' => $this->when(isset($this->leaderboard), $this->leaderboard),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'links' => [
                'self' => route('leagues.show', $this->id),
                'members' => route('leagues.members', $this->id),
                'join' => route('leagues.join', $this->id),
                'matches' => route('leagues.matches', $this->id),
            ],
        ];
    }
}
