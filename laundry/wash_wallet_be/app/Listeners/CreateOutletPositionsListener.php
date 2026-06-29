<?php

namespace App\Listeners;

use App\Events\OutletCreated;
use App\Services\PositionService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;
use Exception;

class CreateOutletPositionsListener implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * The number of times the job may be attempted.
     *
     * @var int
     */
    public $tries = 3;

    /**
     * The maximum number of seconds the job may run.
     *
     * @var int
     */
    public $timeout = 60;

    protected PositionService $positionService;

    /**
     * Create the event listener.
     */
    public function __construct(PositionService $positionService)
    {
        $this->positionService = $positionService;
    }

    /**
     * Handle the event.
     */
    public function handle(OutletCreated $event): void
    {
        try {
            Log::info('Starting outlet positions creation', [
                'outlet_id' => $event->outletId,
                'outlet_name' => $event->outletName,
                'owner_id' => $event->ownerId,
                'type' => 'outlet_positions_creation_start'
            ]);

            $positions = $this->positionService->createDefaultPositionsForOutlet($event->outletId);

            Log::info('Outlet positions creation completed successfully', [
                'outlet_id' => $event->outletId,
                'outlet_name' => $event->outletName,
                'owner_id' => $event->ownerId,
                'positions_created' => count($positions),
                'position_names' => array_map(fn($p) => $p->name, $positions),
                'type' => 'outlet_positions_creation_success'
            ]);
        } catch (Exception $e) {
            Log::error('Failed to create outlet positions', [
                'outlet_id' => $event->outletId,
                'outlet_name' => $event->outletName,
                'owner_id' => $event->ownerId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'type' => 'outlet_positions_creation_error'
            ]);

            // Re-throw exception to trigger retry mechanism
            throw $e;
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(OutletCreated $event, Exception $exception): void
    {
        Log::error('Outlet positions creation job failed permanently', [
            'outlet_id' => $event->outletId,
            'outlet_name' => $event->outletName,
            'owner_id' => $event->ownerId,
            'error' => $exception->getMessage(),
            'attempts' => $this->attempts(),
            'type' => 'outlet_positions_creation_failed'
        ]);
    }
}
