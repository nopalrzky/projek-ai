<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Table;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Query\Builder;

#[Table('position_permissions')]
class PositionPermission extends Model
{
    use HasFactory;

    protected $fillable = [
        'position_id',
        'permission_key',
    ];

    public function position(): BelongsTo
    {
        return $this->belongsTo(Position::class);
    }

    public function scopeByPositionId(Builder $query, int $positionId)
    {
        return $query->where('position_id', $positionId);
    }

    public function scopeByKey(Builder $query, string $key)
    {
        return $query->where('permission_key', $key);
    }
}
