<?php

namespace App\Http\Middleware;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => fn() => $this->shareUser($request),
            ],
            'flash' => [
                'success' => fn() => $request->session()->get('success'),
                'error'   => fn() => $request->session()->get('error'),
            ],
            'notifications' => [
                'unread_count' => fn() => $this->unreadNotificationCount($request),
            ],
        ];
    }

    /**
     * Keep global Inertia auth data limited to fields used by the shell UI.
     *
     * Full user resources are still returned by page-specific controllers when
     * a page needs profile, finance, referral, or relation details.
     */
    private function shareUser(Request $request): ?array
    {
        $user = $request->user();

        if (!$user instanceof User) {
            return null;
        }

        return [
            'id' => (int) $user->id,
            'name' => $user->name ? (string) $user->name : null,
            'username' => $user->username ? (string) $user->username : null,
            'email' => $user->email ? (string) $user->email : null,
            'avatar' => $user->avatar ? (string) $user->avatar : null,
            'status' => $user->status instanceof \BackedEnum
                ? $user->status->value
                : ($user->status ? (string) $user->status : null),
            'coinBalance' => $user->coin_balance !== null ? (int) $user->coin_balance : 0,
            'walletBalance' => $user->wallet_balance !== null ? (float) $user->wallet_balance : 0.0,
            'rewardBalance' => $user->reward_balance !== null ? (int) $user->reward_balance : 0,
            'roles' => $user->getRoleNames()->values()->all(),
            'isOwner' => $user->hasRole(User::ROLE_OWNER),
        ];
    }

    private function unreadNotificationCount(Request $request): int
    {
        $user = $request->user();

        if (!$user instanceof User) {
            return 0;
        }

        return (int) Cache::remember(
            "users:{$user->id}:notifications:unread_count",
            now()->addSeconds(45),
            fn() => $user->unreadNotifications()->count()
        );
    }
}
