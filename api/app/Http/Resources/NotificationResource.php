<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NotificationResource extends JsonResource
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
            'user_id' => $this->user_id,
            'type' => $this->type,
            'title' => $this->title,
            'content' => $this->content ?? $this->message,
            'is_read' => $this->read_at !== null || $this->is_read,
            'read_at' => $this->read_at,
            'data' => $this->data,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'links' => [
                'self' => route('notifications.show', $this->id),
                'mark_as_read' => route('notifications.mark-as-read', $this->id),
            ],
        ];
    }
}
