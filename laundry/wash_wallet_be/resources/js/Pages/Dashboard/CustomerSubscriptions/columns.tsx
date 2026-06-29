import { ColumnDef } from "@tanstack/react-table";
import { Link } from "@inertiajs/react";
import { Badge } from "@/Components/Badge";
import { Button } from "@/Components/Button";
import { Eye, Edit, Trash2 } from "lucide-react";
import { CustomerSubscription } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

export const createCustomerSubscriptionColumns = (
    onView: (subscription: CustomerSubscription) => void,
    onEdit: (subscription: CustomerSubscription) => void,
    onDelete: (subscription: CustomerSubscription) => void,
): ColumnDef<CustomerSubscription>[] => [
    {
        accessorKey: "subscriptionCode",
        header: "Kode Subscription",
        cell: ({ row }) => (
            <div className="flex flex-col gap-1">
                <Link
                    href={route("customer-subscriptions.show", row.original.id)}
                    className="text-sm font-semibold hover:underline"
                    style={{ color: "var(--color-primary-600)" }}
                >
                    {row.original.subscriptionCode}
                </Link>
                <div className="flex items-center gap-2">
                    <Badge variant={row.original.statusBadgeVariant} size="sm">
                        {row.original.statusLabel}
                    </Badge>
                    {row.original.isUnlimited && (
                        <Badge variant="info" size="sm">
                            Unlimited
                        </Badge>
                    )}
                </div>
            </div>
        ),
        enableSorting: true,
    },
    {
        accessorKey: "customer.name",
        header: "Customer",
        cell: ({ row }) => (
            <div className="flex items-start gap-2">
                <div className="flex flex-col gap-1">
                    <span
                        className="text-sm font-medium"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        {row.original.customer?.name || "-"}
                    </span>
                    <span
                        className="text-xs"
                        style={{ color: "var(--color-text-tertiary)" }}
                    >
                        {row.original.customer?.phone || "-"}
                    </span>
                </div>
            </div>
        ),
        enableSorting: false,
    },
    {
        accessorKey: "servicePackage.name",
        header: "Paket Layanan",
        cell: ({ row }) => (
            <div className="flex items-start gap-2 min-w-0">
                <div className="flex flex-col gap-1 min-w-0">
                    <span
                        className="text-sm font-medium"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        {row.original.servicePackage?.name || "-"}
                    </span>
                </div>
            </div>
        ),
        enableSorting: false,
    },
    {
        accessorKey: "pricePaid",
        header: "Harga",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <span
                    className="text-sm font-semibold"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    {formatCurrency(row.original.pricePaid)}
                </span>
            </div>
        ),
        enableSorting: true,
    },
    {
        accessorKey: "purchaseDate",
        header: "Tanggal Pembelian",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <span
                    className="text-sm"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    {formatDate(row.original.purchaseDate)}
                </span>
            </div>
        ),
        enableSorting: true,
    },
    {
        accessorKey: "expiredAt",
        header: "Kadaluarsa",
        cell: ({ row }) => (
            <div className="flex flex-col gap-1">
                {row.original.expiredAt ? (
                    <>
                        <span
                            className="text-sm"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            {formatDate(row.original.expiredAt)}
                        </span>
                        {row.original.remainingDays !== null &&
                            row.original.remainingDays !== undefined && (
                                <span
                                    className="text-xs"
                                    style={{
                                        color:
                                            row.original.remainingDays <= 7
                                                ? "var(--color-error-600)"
                                                : "var(--color-text-tertiary)",
                                    }}
                                >
                                    {row.original.remainingDays > 0
                                        ? `${row.original.remainingDays} hari lagi`
                                        : "Sudah kadaluarsa"}
                                </span>
                            )}
                    </>
                ) : (
                    <Badge variant="info" size="sm">
                        Tidak Terbatas
                    </Badge>
                )}
            </div>
        ),
        enableSorting: true,
    },
    {
        accessorKey: "customerQuotas",
        header: "Kuota",
        cell: ({ row }) => {
            const quotas = row.original.customerQuotas || [];
            const totalQuota = quotas.reduce(
                (sum, quota) => sum + quota.totalQuota,
                0,
            );
            const remainingQuota = quotas.reduce(
                (sum, quota) => sum + quota.remainingQuota,
                0,
            );
            const usagePercentage =
                totalQuota > 0
                    ? ((totalQuota - remainingQuota) / totalQuota) * 100
                    : 0;

            return (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <span
                            className="text-sm font-medium"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            {remainingQuota} / {totalQuota}
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                            className="h-1.5 rounded-full transition-all"
                            style={{
                                width: `${usagePercentage}%`,
                                backgroundColor:
                                    usagePercentage >= 80
                                        ? "var(--color-error-500)"
                                        : usagePercentage >= 50
                                          ? "var(--color-warning-500)"
                                          : "var(--color-success-500)",
                            }}
                        />
                    </div>
                </div>
            );
        },
        enableSorting: false,
    },
    {
        id: "actions",
        header: "Aksi",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <Button
                    variant="info"
                    size="sm"
                    onClick={() => onView(row.original)}
                    leftIcon={<Eye className="w-4 h-4" />}
                    title="Lihat detail"
                />
                <Button
                    variant="warning"
                    size="sm"
                    onClick={() => onEdit(row.original)}
                    leftIcon={<Edit className="w-4 h-4" />}
                    title="Edit subscription"
                />
                <Button
                    variant="danger"
                    size="sm"
                    onClick={() => onDelete(row.original)}
                    leftIcon={<Trash2 className="w-4 h-4" />}
                    title="Hapus subscription"
                    disabled={row.original.status === "active"}
                />
            </div>
        ),
        enableSorting: false,
    },
];
