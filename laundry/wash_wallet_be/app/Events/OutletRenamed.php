<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Events\ShouldDispatchAfterCommit;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OutletRenamed implements ShouldDispatchAfterCommit
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public int $outletId;
    public string $oldName;
    public string $newName;
    public int $ownerId;

    /**
     * Create a new event instance.
     *
     * @param int $outletId
     * @param string $oldName
     * @param string $newName
     * @param int $ownerId
     */
    public function __construct(int $outletId, string $oldName, string $newName, int $ownerId)
    {
        $this->outletId = $outletId;
        $this->oldName = $oldName;
        $this->newName = $newName;
        $this->ownerId = $ownerId;
    }
}
