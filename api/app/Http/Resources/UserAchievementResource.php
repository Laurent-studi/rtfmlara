<?php

namespace App\Http\Resources;

use App\Models\Badge;
use App\Models\Trophy;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserAchievementResource extends JsonResource
{
    /**
     * Transformer la ressource en tableau.
     *
     * @param  Request  $request
     * @return array
     */
    public function toArray(Request $request): array
    {
        $achievable = $this->achievable;
        $type = $this->isBadge() ? 'badge' : 'trophy';
        
        $data = [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'type' => $type,
            'earned_at' => $this->earned_at->format('Y-m-d H:i:s'),
            'data' => $this->data,
        ];
        
        if ($achievable) {
            // Ajouter les informations de base sur l'achievement
            $data['achievable'] = [
                'id' => $achievable->id,
                'name' => $achievable->name,
                'description' => $achievable->description,
                'icon' => $achievable->icon,
                'image_url' => $achievable->image_url,
                'code' => $achievable->code,
            ];
            
            // Ajouter des informations spécifiques selon le type
            if ($type === 'badge') {
                $data['achievable']['category'] = $achievable->category;
            } else if ($type === 'trophy') {
                $data['achievable']['level'] = $achievable->level;
                $data['achievable']['points'] = $achievable->points;
            }
        }
        
        return $data;
    }
} 