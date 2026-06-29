import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import { Bell, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PageProps, AppNotification } from "@/types";

interface RecentNotification {
    id: string;
    data: AppNotification["data"];
    read_at: string | null;
    created_at: string;
}

function timeAgo(dateStr: string): string {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return `${diff} dtk lalu`;
    if (diff < 3600) return `${Math.floor(diff / 60)} mnt lalu`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
    return `${Math.floor(diff / 86400)} hari lalu`;
}

const TYPE_ICONS: Record<string, string> = {
    deposit: "💰",
    expense: "📋",
    petty_cash: "🏦",
};

export default function NotificationBell() {
    const { notifications } = usePage<PageProps>().props;
    const [unreadCount, setUnreadCount] = useState(
        notifications?.unread_count ?? 0,
    );
    const [isOpen, setIsOpen] = useState(false);
    const [recentNotifs, setRecentNotifs] = useState<RecentNotification[]>([]);
    const [loadingDropdown, setLoadingDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Polling setiap 60 detik untuk update badge count
    useEffect(() => {
        const poll = async () => {
            try {
                const res = await fetch(route("notifications.unread-count"), {
                    headers: { "X-Requested-With": "XMLHttpRequest" },
                });
                if (res.ok) {
                    const data = await res.json();
                    setUnreadCount(data.count ?? 0);
                }
            } catch {
                // silent fail
            }
        };

        let interval: NodeJS.Timeout;
        let timeoutId: number;

        const startPolling = () => {
            poll();
            interval = setInterval(poll, 60000);
        };

        if (typeof window !== "undefined") {
            const win = window as any;
            if ("requestIdleCallback" in win) {
                timeoutId = win.requestIdleCallback(() => {
                    startPolling();
                });
            } else {
                timeoutId = win.setTimeout(startPolling, 2000);
            }
        } else {
            startPolling();
        }

        return () => {
            if (interval) clearInterval(interval);
            if (timeoutId) {
                const win = window as any;
                if (typeof window !== "undefined" && "cancelIdleCallback" in win) {
                    win.cancelIdleCallback(timeoutId);
                } else {
                    clearTimeout(timeoutId);
                }
            }
        };
    }, []);

    // Sync dari shared props ketika berubah (setelah navigasi)
    useEffect(() => {
        setUnreadCount(notifications?.unread_count ?? 0);
    }, [notifications?.unread_count]);

    // Tutup dropdown jika klik di luar
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    const fetchRecent = useCallback(async () => {
        setLoadingDropdown(true);
        try {
            const res = await fetch(route("notifications.recent"), {
                headers: {
                    "X-Requested-With": "XMLHttpRequest",
                    Accept: "application/json",
                },
            });
            if (res.ok) {
                const json = await res.json();
                setRecentNotifs(json?.notifications ?? []);
            }
        } catch {
            // silent fail
        } finally {
            setLoadingDropdown(false);
        }
    }, []);

    const handleToggle = () => {
        const next = !isOpen;
        setIsOpen(next);
        if (next) fetchRecent();
    };

    const handleMarkAllRead = () => {
        router.post(
            route("notifications.read-all"),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setUnreadCount(0);
                    setRecentNotifs((prev) =>
                        prev.map((n) => ({
                            ...n,
                            read_at: new Date().toISOString(),
                        })),
                    );
                },
            },
        );
    };

    const handleClickNotif = (notif: RecentNotification) => {
        setIsOpen(false);
        router.get(route("notifications.redirect", notif.id));
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={handleToggle}
                className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Notifikasi"
            >
                <Bell
                    className="w-5 h-5"
                    style={{ color: "var(--color-text-secondary)" }}
                />
                {unreadCount > 0 && (
                    <span
                        className="absolute top-1 right-1 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold text-white rounded-full px-1"
                        style={{ backgroundColor: "var(--color-error-500)" }}
                    >
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div
                    className="absolute right-0 mt-2 w-80 rounded-xl shadow-xl border z-50 overflow-hidden"
                    style={{
                        backgroundColor: "var(--color-surface)",
                        borderColor: "var(--color-border)",
                    }}
                >
                    <div
                        className="flex items-center justify-between px-4 py-3 border-b"
                        style={{ borderColor: "var(--color-border)" }}
                    >
                        <div className="flex items-center gap-2">
                            <Bell
                                className="w-4 h-4"
                                style={{ color: "var(--color-text-secondary)" }}
                            />
                            <span
                                className="text-sm font-semibold"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                Notifikasi
                                {unreadCount > 0 && (
                                    <span
                                        className="ml-1.5 text-xs font-medium px-1.5 py-0.5 rounded-full"
                                        style={{
                                            backgroundColor:
                                                "var(--color-error-50)",
                                            color: "var(--color-error-500)",
                                        }}
                                    >
                                        {unreadCount} belum dibaca
                                    </span>
                                )}
                            </span>
                        </div>
                        {unreadCount > 0 && (
                            <button
                                type="button"
                                onClick={handleMarkAllRead}
                                className="flex items-center gap-1 text-xs hover:opacity-80 transition-opacity"
                                style={{ color: "var(--color-primary-600)" }}
                            >
                                <Check className="w-3 h-3" />
                                Tandai semua
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div className="max-h-72 overflow-y-auto">
                        {loadingDropdown ? (
                            <div
                                className="py-8 text-center text-sm"
                                style={{ color: "var(--color-text-tertiary)" }}
                            >
                                Memuat...
                            </div>
                        ) : recentNotifs.length === 0 ? (
                            <div
                                className="py-8 text-center text-sm"
                                style={{ color: "var(--color-text-tertiary)" }}
                            >
                                Tidak ada notifikasi
                            </div>
                        ) : (
                            recentNotifs.map((notif) => (
                                <button
                                    key={notif.id}
                                    type="button"
                                    onClick={() => handleClickNotif(notif)}
                                    className={cn(
                                        "w-full text-left px-4 py-3 border-b transition-colors hover:opacity-90",
                                        !notif.read_at
                                            ? "opacity-100"
                                            : "opacity-60",
                                    )}
                                    style={{
                                        borderColor: "var(--color-border)",
                                        backgroundColor: !notif.read_at
                                            ? "var(--color-warning-50, #fffbeb)"
                                            : "transparent",
                                    }}
                                >
                                    <div className="flex items-start gap-2">
                                        <span className="text-base mt-0.5">
                                            {TYPE_ICONS[
                                                notif.data.request_type
                                            ] ?? "🔔"}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <span
                                                    className="text-xs font-semibold truncate"
                                                    style={{
                                                        color: "var(--color-text-primary)",
                                                    }}
                                                >
                                                    {notif.data.title}
                                                </span>
                                                <span
                                                    className="text-[10px] flex-shrink-0"
                                                    style={{
                                                        color: "var(--color-text-tertiary)",
                                                    }}
                                                >
                                                    {timeAgo(notif.created_at)}
                                                </span>
                                            </div>
                                            <p
                                                className="text-xs mt-0.5 line-clamp-2"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                {notif.data.message}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    <div
                        className="border-t"
                        style={{ borderColor: "var(--color-border)" }}
                    >
                        <Link
                            href={route("notifications.index")}
                            onClick={() => setIsOpen(false)}
                            className="block text-center text-sm py-3 font-medium hover:opacity-80 transition-opacity"
                            style={{ color: "var(--color-primary-600)" }}
                        >
                            Lihat Semua Notifikasi →
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
