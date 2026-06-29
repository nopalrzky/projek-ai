<?php

namespace App\Events;

use App\Models\Outlet;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Events\ShouldDispatchAfterCommit;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OutletCreated implements ShouldDispatchAfterCommit
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Outlet $outlet;
    public int $ownerId;
    public int $outletId;
    public string $outletName;

    /**
     * Create a new event instance.
     *
     * @param Outlet $outlet
     */
    public function __construct(Outlet $outlet)
    {
        $this->outlet = $outlet;
        $this->ownerId = $outlet->owner_id;
        $this->outletId = $outlet->id;
        $this->outletName = $outlet->name;
    }
}
