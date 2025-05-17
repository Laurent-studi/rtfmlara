<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TournamentResource extends JsonResource
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
            'registration_deadline' => $this->registration_deadline,
            'max_participants' => $this->max_participants,
            'format' => $this->format,
            'status' => $this->status,
            'current_round' => $this->current_round,
            'total_rounds' => $this->total_rounds,
            'prize_description' => $this->prize_description,
            'image_url' => $this->image_url,
            'participant_count' => $this->when(isset($this->participant_count), $this->participant_count),
            'current_matches' => $this->when($this->relationLoaded('current_matches'), function() {
                return $this->current_matches->map(function($match) {
                    return [
                        'id' => $match->id,
                        'round' => $match->round,
                        'player1_id' => $match->player1_id,
                        'player2_id' => $match->player2_id,
                        'winner_id' => $match->winner_id,
                        'status' => $match->status,
                    ];
                });
            }),
            'leaderboard' => $this->when(isset($this->leaderboard), $this->leaderboard),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'links' => [
                'self' => route('tournaments.show', $this->id),
                'participants' => route('tournaments.participants', $this->id),
                'matches' => route('tournaments.matches', $this->id),
                'join' => route('tournaments.join', $this->id),
            ],
        ];
    }
}
