import { ColumnDef } from "@tanstack/react-table";
import { Link } from "@inertiajs/react";
import { Badge } from "@/Components/Badge";
import { Button } from "@/Components/Button";
import { Eye } from "lucide-react";
import { Order } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

const statusVariants = {
    requested: "info",
    cancelled: "error",
    accepted: "primary",
    rejected: "error",
    picking_up: "warning",
    received: "info",
    weighing: "warning",
    ready_to_process: "info",
    in_progress: "primary",
    ready: "success",
    delivering: "warning",
    delivered: "success",
    completed: "success",
} as const;

const paymentStatusVariants = {
    not_yet_priced: "warning",
    unpaid: "error",
    partial: "warning",
    paid: "success",
    refunded: "info",
    paid_by_package: "success",
    cod: "info",
} as const;

export const createOrderColumns = (
    onView: (order: Order) => void,
): ColumnDef<Order>[] => [
    {
        accessorKey: "orderDate",
        header: "Tanggal Pesan",
        cell: ({ row }) => (
            <div className="flex flex-col gap-1">
                <span
                    className="text-sm font-medium"
                    style={{ color: "var(--color-text-tertiary)" }}
                >
                    {formatDate(row.original.orderDate, "DD MMMM YYYY")}
                </span>
            </div>
        ),
        enableSorting: true,
    },
    {
        accessorKey: "customerName",
        header: "Customer",
        cell: ({ row }) => (
            <div className="flex flex-col gap-1">
                <span
                    className="text-sm font-medium"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    {row.original.customer?.name ?? "-"}
                </span>
                <span
                    className="text-sm"
                    style={{ color: "var(--color-text-tertiary)" }}
                >
                    {row.original.customer?.phone ?? "-"}
                </span>
                <Link
                    href={route("orders.show", row.original.id)}
                    className="text-xs"
                    style={{ color: "var(--color-primary-600)" }}
                >
                    {row.original.orderNumber}
                </Link>
            </div>
        ),
        enableSorting: true,
    },
    {
        accessorKey: "employeeName",
        header: "Employee",
        cell: ({ row }) => (
            <div className="flex flex-col gap-1">
                <span
                    className="text-sm font-medium"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    {row.original.employee?.name ?? "-"}
                </span>
                <span
                    className="text-xs"
                    style={{ color: "var(--color-text-tertiary)" }}
                >
                    {row.original.employee?.username ?? "-"}
                </span>
            </div>
        ),
        enableSorting: true,
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
            <Badge
                variant={
                    statusVariants[
                        row.original.status as keyof typeof statusVariants
                    ] || "default"
                }
                size="sm"
            >
                {row.original.statusLabel}
            </Badge>
        ),
        enableSorting: true,
    },
    {
        accessorKey: "paymentStatus",
        header: "Pembayaran",
        cell: ({ row }) => (
            <div className="flex flex-col gap-1">
                <Badge
                    variant={
                        paymentStatusVariants[
                            row.original
                                .paymentStatus as keyof typeof paymentStatusVariants
                        ] || "default"
                    }
                    size="sm"
                >
                    {row.original.paymentStatusLabel}
                </Badge>
                {row.original.paymentStatus === "partial" && (
                    <span
                        className="text-xs"
                        style={{ color: "var(--color-text-tertiary)" }}
                    >
                        {formatCurrency(row.original.paidAmount)} /{" "}
                        {formatCurrency(row.original.totalAmount)}
                    </span>
                )}
            </div>
        ),
        enableSorting: true,
    },
    {
        accessorKey: "totalAmount",
        header: "Total",
        cell: ({ row }) => (
            <div className="flex flex-col gap-0.5 text-right">
                <span
                    className="text-sm font-semibold"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    {formatCurrency(row.original.totalAmount)}
                </span>
            </div>
        ),
        enableSorting: true,
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
            </div>
        ),
        enableSorting: false,
    },
];
