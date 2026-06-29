<?php

namespace App\Providers;

use App\Events\OutletCreated;
use App\Events\OutletDeleted;
use App\Events\OutletRenamed;
use App\Listeners\CreateOutletAccountsListener;
use App\Listeners\CreateOutletPositionsListener;
use App\Listeners\DeactivateOutletAccountsListener;
use App\Listeners\RenameOutletAccountsListener;
use App\Models\Position;
use App\Observers\PositionObserver;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event to listener mappings for the application.
     */
    protected $listen = [
        OutletCreated::class => [
            CreateOutletAccountsListener::class,
            CreateOutletPositionsListener::class,
        ],
        OutletRenamed::class => [
            RenameOutletAccountsListener::class,
        ],
        OutletDeleted::class => [
            DeactivateOutletAccountsListener::class,
        ],
    ];

    /**
     * Register any events for your application.
     */
    public function boot(): void
    {
        Position::observe(PositionObserver::class);
    }

    /**
     * Determine if events and listeners should be automatically discovered.
     */
    public function shouldDiscoverEvents(): bool
    {
        return false;
    }
}
