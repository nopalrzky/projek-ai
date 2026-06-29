import { useCallback, useMemo, useState } from "react";
import { Head, router } from "@inertiajs/react";
import { motion } from "framer-motion";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import {
    Bell,
    CheckCheck,
    ExternalLink,
    Filter,
    RefreshCw,
} from "lucide-react";
import { Button } from "@/Components/Button";
import { Alert } from "@/Components/Alert";
import { Badge } from "@/Components/Badge";
import { Pagination } from "@/Components/Pagination";
import PageHeader from "@/Components/Page/PageHeader";
import { AppNotification, PaginationMeta } from "@/types";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { NotificationsIndexProps } from "./types";
import { Modal, ModalBody, ModalFooter } from "@/Components/Modal";

const TYPE_LABELS: Record<string, string> = {
    deposit: "Deposit",
    expense: "Pengeluaran",
    petty_cash: "Kas Kecil",
};

function NotificationsIndex({
    notifications,
    unread_count,
    filters: serverFilters,
    flash,
}: NotificationsIndexProps) {
    const [isMarkingAll, setIsMarkingAll] = useState(false);
    const [isFiltering, setIsFiltering] = useState(false);

    const handleMarkAllRead = useCallback(() => {
        setIsMarkingAll(true);
        router.post(
            route("notifications.read-all"),
            {},
            {
                preserveScroll: true,
                onFinish: () => setIsMarkingAll(false),
            },
        );
    }, []);

    const [selectedNotif, setSelectedNotif] = useState<AppNotification | null>(
        null,
    );

    const handleClickNotif = useCallback((notif: AppNotification) => {
        setSelectedNotif(notif);
        if (!notif.read_at) {
            router.post(
                route("notifications.read", notif.id),
                {},
                { preserveScroll: true },
            );
        }
    }, []);

    const handleMarkOne = useCallback((notif: AppNotification) => {
        if (notif.read_at) {
            return;
        }

        router.post(
            route("notifications.read", notif.id),
            {},
            { preserveScroll: true },
        );
    }, []);

    const normalizedMeta = useMemo<PaginationMeta>(() => {
        if (!notifications.meta) {
            return {
                currentPage: 1,
                lastPage: 1,
                perPage: 15,
                total: notifications.data.length,
                from: notifications.data.length > 0 ? 1 : null,
                to:
                    notifications.data.length > 0
                        ? notifications.data.length
                        : null,
            };
        }

        return {
            currentPage: notifications.meta.current_page,
            lastPage: notifications.meta.last_page,
            perPage: notifications.meta.per_page,
            total: notifications.meta.total,
            from: notifications.meta.from,
            to: notifications.meta.to,
        };
    }, [notifications.data.length, notifications.meta]);

    const [localFilters, setLocalFilters] = useState({
        search: serverFilters?.search || "",
        filter: serverFilters?.filter || "",
        type: serverFilters?.type || "",
        perPage: String(serverFilters?.perPage || normalizedMeta.perPage || 15),
    });

    const applyFilters = useCallback(
        (overrides?: Partial<typeof localFilters> & { page?: number }) => {
            const nextFilters = {
                ...localFilters,
                ...overrides,
            };

            setIsFiltering(true);

            router.get(
                route("notifications.index"),
                {
                    search: nextFilters.search || undefined,
                    filter: nextFilters.filter || undefined,
                    type: nextFilters.type || undefined,
                    perPage: nextFilters.perPage || undefined,
                    page: overrides?.page || 1,
                },
                {
                    preserveScroll: true,
                    preserveState: true,
                    replace: true,
                    onFinish: () => setIsFiltering(false),
                },
            );
        },
        [localFilters],
    );

    const handleSearchEnter = useCallback(
        (event: React.KeyboardEvent<HTMLInputElement>) => {
            if (event.key === "Enter") {
                applyFilters({ page: 1 });
            }
        },
        [applyFilters],
    );

    const handleResetFilters = useCallback(() => {
        const resetFilters = {
            search: "",
            filter: "",
            type: "",
            perPage: "15",
        };

        setLocalFilters(resetFilters);
        setIsFiltering(true);

        router.get(
            route("notifications.index"),
            { perPage: 15, page: 1 },
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
                onFinish: () => setIsFiltering(false),
            },
        );
    }, []);

    return (
        <>
            <Head title="Notifikasi" />

            <motion.div
                className="p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <div className="mx-auto  space-y-6">
                    {flash?.success && (
                        <Alert
                            variant="success"
                            title="Berhasil"
                            description={flash.success}
                        />
                    )}
                    {flash?.error && (
                        <Alert
                            variant="error"
                            title="Error"
                            description={flash.error}
                        />
                    )}

                    <PageHeader
                        title="Notifikasi"
                        subtitle={`Kelola notifikasi sistem (${notifications.meta?.total ?? notifications.data.length} notifikasi)`}
                        icon={Bell}
                        animate={true}
                        variant="default"
                    />

                    <div className="flex items-center justify-between">
                        <p
                            className="text-sm"
                            style={{ color: "var(--color-text-tertiary)" }}
                        >
                            {unread_count > 0
                                ? `${unread_count} notifikasi belum dibaca`
                                : "Semua notifikasi sudah dibaca"}
                        </p>
                        {unread_count > 0 && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleMarkAllRead}
                                loading={isMarkingAll}
                                loadingText="Memproses..."
                                leftIcon={<CheckCheck className="w-4 h-4" />}
                            >
                                Tandai Semua Dibaca
                            </Button>
                        )}
                    </div>

                    <div
                        className="rounded-xl border p-4 space-y-4"
                        style={{
                            borderColor: "var(--color-border)",
                            backgroundColor: "var(--color-surface)",
                        }}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
                            <div className="xl:col-span-2">
                                <label
                                    className="mb-1 block text-xs font-medium"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    Pencarian
                                </label>
                                <input
                                    type="text"
                                    value={localFilters.search}
                                    onChange={(event) =>
                                        setLocalFilters((prev) => ({
                                            ...prev,
                                            search: event.target.value,
                                        }))
                                    }
                                    onKeyDown={handleSearchEnter}
                                    placeholder="Cari judul, pesan, atau kode notifikasi lalu tekan Enter"
                                    className="w-full px-3 py-2 rounded-lg border text-sm"
                                    style={{
                                        borderColor: "var(--color-border)",
                                        backgroundColor:
                                            "var(--color-background)",
                                        color: "var(--color-text-primary)",
                                    }}
                                />
                            </div>

                            <div>
                                <label
                                    className="mb-1 block text-xs font-medium"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    Status Baca
                                </label>
                                <select
                                    value={localFilters.filter}
                                    onChange={(event) =>
                                        setLocalFilters((prev) => ({
                                            ...prev,
                                            filter: event.target.value,
                                        }))
                                    }
                                    className="w-full px-3 py-2 rounded-lg border text-sm"
                                    style={{
                                        borderColor: "var(--color-border)",
                                        backgroundColor:
                                            "var(--color-background)",
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    <option value="">Semua Status</option>
                                    <option value="unread">Belum Dibaca</option>
                                    <option value="read">Sudah Dibaca</option>
                                </select>
                            </div>

                            <div>
                                <label
                                    className="mb-1 block text-xs font-medium"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    Jenis Notifikasi
                                </label>
                                <select
                                    value={localFilters.type}
                                    onChange={(event) =>
                                        setLocalFilters((prev) => ({
                                            ...prev,
                                            type: event.target.value,
                                        }))
                                    }
                                    className="w-full px-3 py-2 rounded-lg border text-sm"
                                    style={{
                                        borderColor: "var(--color-border)",
                                        backgroundColor:
                                            "var(--color-background)",
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    <option value="">Semua Jenis</option>
                                    <option value="deposit">Deposit</option>
                                    <option value="expense">Pengeluaran</option>
                                    <option value="petty_cash">
                                        Kas Kecil
                                    </option>
                                </select>
                            </div>

                            <div>
                                <label
                                    className="mb-1 block text-xs font-medium"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    Per Halaman
                                </label>
                                <select
                                    value={localFilters.perPage}
                                    onChange={(event) => {
                                        const value = event.target.value;
                                        setLocalFilters((prev) => ({
                                            ...prev,
                                            perPage: value,
                                        }));
                                        applyFilters({
                                            perPage: value,
                                            page: 1,
                                        });
                                    }}
                                    className="w-full px-3 py-2 rounded-lg border text-sm"
                                    style={{
                                        borderColor: "var(--color-border)",
                                        backgroundColor:
                                            "var(--color-background)",
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    <option value="15">15</option>
                                    <option value="25">25</option>
                                    <option value="50">50</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-end gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleResetFilters}
                                disabled={isFiltering}
                                leftIcon={<RefreshCw className="w-4 h-4" />}
                            >
                                Reset
                            </Button>
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => applyFilters({ page: 1 })}
                                loading={isFiltering}
                                leftIcon={<Filter className="w-4 h-4" />}
                            >
                                Terapkan Filter
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {notifications.data.length === 0 ? (
                            <div
                                className="rounded-xl border p-8 text-center"
                                style={{
                                    borderColor: "var(--color-border)",
                                    backgroundColor: "var(--color-surface)",
                                }}
                            >
                                <h3
                                    className="text-base font-semibold"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    Belum ada notifikasi
                                </h3>
                                <p
                                    className="mt-1 text-sm"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Tidak ada notifikasi yang sesuai dengan
                                    filter saat ini.
                                </p>
                            </div>
                        ) : (
                            notifications.data.map((notification) => (
                                <motion.div
                                    key={notification.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="rounded-xl border p-4"
                                    style={{
                                        borderColor: notification.read_at
                                            ? "var(--color-border)"
                                            : "var(--color-primary-300)",
                                        backgroundColor: "var(--color-surface)",
                                    }}
                                >
                                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                        <div className="space-y-2 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <Badge
                                                    variant={
                                                        notification.read_at
                                                            ? "success"
                                                            : "warning"
                                                    }
                                                    size="sm"
                                                >
                                                    {notification.read_at
                                                        ? "Sudah Dibaca"
                                                        : "Belum Dibaca"}
                                                </Badge>
                                                <Badge variant="info" size="sm">
                                                    {TYPE_LABELS[
                                                        notification.data
                                                            .request_type
                                                    ] ?? "Lainnya"}
                                                </Badge>
                                            </div>

                                            <h3
                                                className="text-base font-semibold"
                                                style={{
                                                    color: "var(--color-text-primary)",
                                                }}
                                            >
                                                {notification.data.title}
                                            </h3>

                                            <p
                                                className="text-sm"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                {notification.data.message}
                                            </p>

                                            <div
                                                className="flex flex-wrap items-center gap-4 text-xs"
                                                style={{
                                                    color: "var(--color-text-tertiary)",
                                                }}
                                            >
                                                <span>
                                                    Kode:{" "}
                                                    {notification.data.code}
                                                </span>
                                                <span>
                                                    Nominal:{" "}
                                                    {formatCurrency(
                                                        notification.data
                                                            .amount,
                                                    )}
                                                </span>
                                                <span>
                                                    {formatDate(
                                                        notification.created_at,
                                                        "DD MMMM YYYY",
                                                    )}{" "}
                                                    {new Date(
                                                        notification.created_at,
                                                    ).toLocaleTimeString(
                                                        "id-ID",
                                                        {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        },
                                                    )}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            <Button
                                                variant="info"
                                                size="sm"
                                                onClick={() =>
                                                    handleClickNotif(
                                                        notification,
                                                    )
                                                }
                                                leftIcon={
                                                    <ExternalLink className="w-4 h-4" />
                                                }
                                            >
                                                Buka
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    handleMarkOne(notification)
                                                }
                                                leftIcon={
                                                    <CheckCheck className="w-4 h-4" />
                                                }
                                                disabled={Boolean(
                                                    notification.read_at,
                                                )}
                                            >
                                                Tandai Dibaca
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>

                    <Pagination
                        meta={normalizedMeta}
                        onPageChange={(page) => applyFilters({ page })}
                        isLoading={isFiltering}
                        showInfo={true}
                    />
                </div>
            </motion.div>
            <Modal
                isOpen={!!selectedNotif}
                onClose={() => setSelectedNotif(null)}
                title={selectedNotif?.data.title || "Detail Notifikasi"}
                size="md"
            >
                <ModalBody>
                    {selectedNotif && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Badge variant="info" size="md">
                                    {TYPE_LABELS[
                                        selectedNotif.data.request_type
                                    ] ?? "Lainnya"}
                                </Badge>
                                <span className="text-xs text-[var(--color-text-tertiary)]">
                                    {formatDateTime(
                                        selectedNotif.created_at,
                                        "long",
                                    )}
                                </span>
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-semibold text-[var(--color-text-primary)]">
                                    Pesan
                                </h4>
                                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                                    {selectedNotif.data.message}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[var(--color-border)]">
                                <div>
                                    <p className="text-xs text-[var(--color-text-tertiary)] uppercase font-semibold">
                                        Kode Request
                                    </p>
                                    <p className="text-sm font-medium text-[var(--color-text-primary)]">
                                        {selectedNotif.data.code}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-[var(--color-text-tertiary)] uppercase font-semibold">
                                        Nominal
                                    </p>
                                    <p className="text-sm font-bold text-[var(--color-primary-600)] dark:text-[var(--color-primary-400)]">
                                        {formatCurrency(
                                            selectedNotif.data.amount,
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-[var(--color-text-tertiary)] uppercase font-semibold">
                                        Outlet
                                    </p>
                                    <p className="text-sm font-medium text-[var(--color-text-primary)]">
                                        {selectedNotif.data.outlet_name}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-[var(--color-text-tertiary)] uppercase font-semibold">
                                        Kasir
                                    </p>
                                    <p className="text-sm font-medium text-[var(--color-text-primary)]">
                                        {selectedNotif.data.cashier_name}
                                    </p>
                                </div>
                            </div>

                            {selectedNotif.data.description && (
                                <div className="pt-4 border-t border-[var(--color-border)]">
                                    <p className="text-xs text-[var(--color-text-tertiary)] uppercase font-semibold">
                                        Keterangan
                                    </p>
                                    <p className="text-sm text-[var(--color-text-secondary)] mt-1 italic">
                                        "{selectedNotif.data.description}"
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </ModalBody>
                <ModalFooter>
                    <div className="flex justify-end gap-2 w-full">
                        <Button
                            variant="outline"
                            onClick={() => setSelectedNotif(null)}
                        >
                            Tutup
                        </Button>
                        <Button
                            variant="primary"
                            onClick={() => {
                                if (selectedNotif) {
                                    const url = selectedNotif.data.url;
                                    const finalUrl = url.startsWith(
                                        "/dashboard",
                                    )
                                        ? url
                                        : `/dashboard${url.startsWith("/") ? "" : "/"}${url}`;
                                    router.get(finalUrl);
                                }
                            }}
                            leftIcon={<ExternalLink className="w-4 h-4" />}
                        >
                            Buka Halaman Terkait
                        </Button>
                    </div>
                </ModalFooter>
            </Modal>
        </>
    );
}

NotificationsIndex.layout = withAuthenticatedLayout({
    title: "Notifikasi",
    searchable: true,
    breadcrumbs: [{ label: "Notifikasi", href: route("notifications.index") }],
});

export default NotificationsIndex;
