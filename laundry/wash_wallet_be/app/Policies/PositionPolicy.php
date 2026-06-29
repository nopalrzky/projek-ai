<?php

namespace App\Policies;

use App\Models\Position;
use App\Models\User;
use Illuminate\Contracts\Auth\Authenticatable;

class PositionPolicy
{
    /**
     * Owner hanya boleh store/update/destroy position pada outlet miliknya.
     * Employee (non-User) selalu ditolak.
     */
    public function store(Authenticatable $user): bool
    {
        return $user instanceof User;
    }

    public function update(Authenticatable $user, Position $position): bool
    {
        if (!$user instanceof User) {
            return false;
        }
        return $user->hasRole('super_admin') || $position->outlet->owner_id === $user->id;
    }

    public function destroy(Authenticatable $user, Position $position): bool
    {
        if (!$user instanceof User) {
            return false;
        }
        return $user->hasRole('super_admin') || $position->outlet->owner_id === $user->id;
    }

    public function restore(Authenticatable $user, Position $position): bool
    {
        if (!$user instanceof User) {
            return false;
        }
        return $user->hasRole('super_admin') || $position->outlet->owner_id === $user->id;
    }

    public function forceDestroy(Authenticatable $user, Position $position): bool
    {
        if (!$user instanceof User) {
            return false;
        }
        return $user->hasRole('super_admin') || $position->outlet->owner_id === $user->id;
    }

    public function updatePermissions(Authenticatable $user, Position $position): bool
    {
        if (!$user instanceof User) {
            return false;
        }
        return $user->hasRole('super_admin') || $position->outlet->owner_id === $user->id;
    }
}
