<?php

namespace App\Http\Controllers\Web;

use Illuminate\Routing\Attributes\Controllers\Middleware;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

#[Middleware('auth')]
class NotificationController extends Controller
{
    public function index(Request $request): Response
    {
        try {
            /* $user = Auth::user(); */
            $user  = Auth::user();
            $query = $user->notifications();
            $search = trim($request->string('search')->toString());
            $perPage = $request->integer('perPage', 15);

            $perPage = max(5, min($perPage, 100));

            if ($search !== '') {
                $query->where(function ($q) use ($search) {
                    $q->where('data->title', 'like', "%{$search}%")
                        ->orWhere('data->message', 'like', "%{$search}%")
                        ->orWhere('data->code', 'like', "%{$search}%");
                });
            }

            if ($request->filled('filter')) {
                match ($request->string('filter')->toString()) {
                    'unread' => $query->whereNull('read_at'),
                    'read'   => $query->whereNotNull('read_at'),
                    default  => null,
                };
            }

            if ($request->filled('type')) {
                $type = $request->string('type')->toString();
                $query->whereJsonContains('data->request_type', $type);
            }

            $notifications = $query->latest()->paginate($perPage)->withQueryString();

            $items = $notifications->getCollection()->map(function (DatabaseNotification $n) {
                return [
                    'id'         => $n->id,
                    'data'       => $n->data,
                    'read_at'    => $n->read_at?->toISOString(),
                    'created_at' => $n->created_at->toISOString(),
                ];
            });

            return Inertia::render('Dashboard/Notifications/Index', [
                'notifications' => [
                    'data' => $items,
                    'meta' => [
                        'current_page'  => $notifications->currentPage(),
                        'last_page'     => $notifications->lastPage(),
                        'per_page'      => $notifications->perPage(),
                        'total'         => $notifications->total(),
                        'from'          => $notifications->firstItem(),
                        'to'            => $notifications->lastItem(),
                    ],
                ],
                'unread_count' => $user->unreadNotifications()->count(),
                'filters'      => [
                    'search' => $search,
                    'filter' => $request->string('filter')->toString(),
                    'type'   => $request->string('type')->toString(),
                    'page' => $notifications->currentPage(),
                    'perPage' => $notifications->perPage(),
                ],
                'flash' => [
                    'success' => session('success'),
                    'error'   => session('error'),
                ],
            ]);
        } catch (Throwable $e) {
            Log::error('[NotificationController] Failed to fetch notifications', [
                'user_id' => Auth::id(),
                'error'   => $e->getMessage(),
                'type'    => 'notification_management',
            ]);

            return Inertia::render('Dashboard/Notifications/Index', [
                'notifications' => ['data' => [], 'meta' => null],
                'unread_count'  => 0,
                'filters'       => [],
                'flash'         => ['error' => 'Gagal memuat notifikasi.'],
            ]);
        }
    }

    public function unreadCount(): JsonResponse
    {
        try {
            $count = Auth::user()->unreadNotifications()->count();

            return response()->json(['count' => $count]);
        } catch (Throwable $e) {
            Log::error('[NotificationController] Failed to get unread count', [
                'user_id' => Auth::id(),
                'error'   => $e->getMessage(),
                'type'    => 'notification_management',
            ]);

            return response()->json(['count' => 0]);
        }
    }

    public function recent(): JsonResponse
    {
        try {
            $notifications = Auth::user()
                ->notifications()
                ->latest()
                ->limit(5)
                ->get()
                ->map(fn(DatabaseNotification $n) => [
                    'id'         => $n->id,
                    'data'       => $n->data,
                    'read_at'    => $n->read_at?->toISOString(),
                    'created_at' => $n->created_at->toISOString(),
                ]);

            return response()->json(['notifications' => $notifications]);
        } catch (Throwable $e) {
            Log::error('[NotificationController] Failed to get recent notifications', [
                'user_id' => Auth::id(),
                'error'   => $e->getMessage(),
                'type'    => 'notification_management',
            ]);

            return response()->json(['notifications' => []]);
        }
    }

    public function markRead(string $id): RedirectResponse
    {
        try {
            $notification = Auth::user()
                ->notifications()
                ->findOrFail($id);

            $notification->markAsRead();

            Cache::forget("users:" . Auth::id() . ":notifications:unread_count");

            return redirect()->back()->with('success', 'Notifikasi ditandai sudah dibaca.');
        } catch (Throwable $e) {
            Log::error('[NotificationController] Failed to mark notification as read', [
                'user_id'         => Auth::id(),
                'notification_id' => $id,
                'error'           => $e->getMessage(),
                'type'            => 'notification_management',
            ]);

            return redirect()->back()->with('error', 'Gagal menandai notifikasi.');
        }
    }

    public function markAllRead(): RedirectResponse
    {
        try {
            Auth::user()->unreadNotifications()->update(['read_at' => now()]);

            Cache::forget("users:" . Auth::id() . ":notifications:unread_count");

            return redirect()->back()->with('success', 'Semua notifikasi ditandai sudah dibaca.');
        } catch (Throwable $e) {
            Log::error('[NotificationController] Failed to mark all notifications as read', [
                'user_id' => Auth::id(),
                'error'   => $e->getMessage(),
                'type'    => 'notification_management',
            ]);

            return redirect()->back()->with('error', 'Gagal menandai semua notifikasi.');
        }
    }

    public function markReadAndRedirect(string $id): RedirectResponse
    {
        try {
            $notification = Auth::user()
                ->notifications()
                ->findOrFail($id);

            $notification->markAsRead();

            Cache::forget("users:" . Auth::id() . ":notifications:unread_count");

            $url = $notification->data['url'] ?? '/dashboard';

            return redirect($url);
        } catch (Throwable $e) {
            Log::error('[NotificationController] Failed to mark and redirect', [
                'user_id'         => Auth::id(),
                'notification_id' => $id,
                'error'           => $e->getMessage(),
                'type'            => 'notification_management',
            ]);

            return redirect()->route('notifications.index');
        }
    }
}
