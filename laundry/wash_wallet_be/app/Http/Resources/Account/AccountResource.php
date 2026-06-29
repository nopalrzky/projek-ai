<?php

namespace App\Http\Resources\Account;

use App\Http\Resources\JournalDetail\JournalDetailResource;
use App\Http\Resources\User\UserResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AccountResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => (int) $this->id,
            'ownerId' => $this->owner_id ? (int) $this->owner_id : null,
            'parentId' => $this->parent_id ? (int) $this->parent_id : null,
            'code' => (string) $this->code,
            'name' => (string) $this->name,
            'slug' => (string) $this->slug,
            'type' => (string) $this->type,
            'typeLabel' => $this->getTypeLabel(),
            'variant' => $this->getTypeVariant(),
            'level' => (int) $this->level,
            'isActive' => (bool) ($this->is_active ?? true),
            'isSystem' => (bool) $this->is_system,
            'isTransactional' => (bool) $this->is_transactional,
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
            'deletedAt' => $this->deleted_at?->toISOString(),

            'owner' => UserResource::make($this->whenLoaded('owner')),

            'journalDetails' => JournalDetailResource::collection($this->whenLoaded('journalDetails')),

            'parent' => AccountResource::make($this->whenLoaded('parent')),

            'children' => AccountResource::collection($this->whenLoaded('children')),

            'hasChildren' => $this->when(
                $this->relationLoaded('children') || isset($this->children_count),
                $this->relationLoaded('children') ? $this->children->isNotEmpty() : ((int) $this->children_count > 0)
            ),

            'childrensCount' => $this->when(
                $this->relationLoaded('children') || isset($this->children_count),
                $this->relationLoaded('children') ? $this->children->count() : (int) $this->children_count
            ),

        ];
    }
}
