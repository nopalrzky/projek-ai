<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Events\ShouldDispatchAfterCommit;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OutletDeleted implements ShouldDispatchAfterCommit
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public int $outletId;
    public int $ownerId;
    public string $outletName;


    /**
     * Create a new event instance.
     *
     * @param int $outletId
     * @param int $ownerId
     * @param string|null $outletName
     */
    public function __construct(int $outletId, int $ownerId, string $outletName)
    {
        $this->outletId = $outletId;
        $this->ownerId = $ownerId;
        $this->outletName = $outletName;
    }
}
