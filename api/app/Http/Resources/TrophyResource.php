<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TrophyResource extends JsonResource
{
    /**
     * Transformer la ressource en tableau.
     *
     * @param  Request  $request
     * @return array
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'level' => $this->level,
            'icon' => $this->icon,
            'image_url' => $this->image_url,
            'code' => $this->code,
            'points' => $this->points,
            'is_active' => $this->is_active,
            'is_earned' => $this->when(isset($this->is_earned), $this->is_earned),
            'earned_at' => $this->when(isset($this->earned_at), function () {
                return $this->earned_at?->format('Y-m-d H:i:s');
            }),
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            
            // Inclure les critères uniquement pour les utilisateurs autorisés
            'criteria' => $this->when(
                $request->user() && $request->user()->can('viewCriteria', $this->resource), 
                $this->criteria
            ),
        ];
    }
}
