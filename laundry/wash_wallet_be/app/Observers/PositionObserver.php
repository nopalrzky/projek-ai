<?php

namespace App\Observers;

use App\Models\Position;

class PositionObserver
{
    /**
     * Handle the Position "deleting" event.
     */
    public function deleting(Position $position): void
    {
        // No-op for soft delete; employee_positions handles the linkage.
    }

    /**
     * Handle the Position "deleted" event.
     */
    public function deleted(Position $position): void
    {
        if ($position->isForceDeleting()) {
            $position->permissions()->delete();
        }
    }

    /**
     * Handle the Position "restored" event.
     */
    public function restored(Position $position): void
    {
        // No extra actions needed on restore.
    }
}
