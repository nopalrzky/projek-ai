import { ColumnDef } from "@tanstack/react-table";
import { Deposit } from "@/types";
import { Badge } from "@/Components/Badge";
import { Button } from "@/Components/Button";
import {
    Building2,
    Calendar,
    CheckCircle,
    Clock,
    Eye,
    Trash2,
    User,
    XCircle,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

const STATUS_CONFIG: Record<
    string,
    { variant: "warning" | "success" | "error"; label: string }
> = {
    pending: {
        variant: "warning",
        label: "Menunggu",
    },
    approved: {
        variant: "success",
        label: "Disetujui",
    },
    rejected: {
        variant: "error",
        label: "Ditolak",
    },
};

export const createDepositColumns = (
    onView: (deposit: Deposit) => void,
    onApprove: (deposit: Deposit) => void,
    onReject: (deposit: Deposit) => void,
    onDelete: (deposit: Deposit) => void,
): ColumnDef<Deposit>[] => [
    {
        accessorKey: "code",
        header: "Kode Setoran",
        cell: ({ row }) => (
            <div className="flex flex-col gap-1">
                <span
                    className="font-medium"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    {row.original.code}
                </span>
                <div className="flex items-center gap-1.5 text-xs">
                    <Calendar
                        className="w-3 h-3"
                        style={{ color: "var(--color-text-tertiary)" }}
                    />
                    <span>{formatDate(row.original.createdAt)}</span>
                </div>
            </div>
        ),
        enableSorting: true,
    },
    {
        accessorKey: "outlet.name",
        header: "Outlet",
        cell: ({ row }) => (
            <div className="flex items-start gap-2">
                <Building2
                    className="w-4 h-4 mt-0.5 flex-shrink-0"
                    style={{ color: "var(--color-text-tertiary)" }}
                />
                <div className="flex flex-col gap-0.5 min-w-0">
                    <span
                        className="font-medium text-sm truncate"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        {row.original.outlet?.name || "-"}
                    </span>
                    <span
                        className="text-xs truncate"
                        style={{ color: "var(--color-text-tertiary)" }}
                    >
                        {row.original.outlet?.code || "-"}
                    </span>
                </div>
            </div>
        ),
        enableSorting: false,
    },
    {
        accessorKey: "cashier",
        header: "Kasir",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <User
                    className="w-4 h-4"
                    style={{ color: "var(--color-text-tertiary)" }}
                />
                <span
                    className="text-sm"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    {row.original.cashier?.name || "-"}
                </span>
            </div>
        ),
        enableSorting: false,
    },
    {
        accessorKey: "amount",
        header: "Jumlah",
        cell: ({ row }) => (
            <span
                className="font-semibold"
                style={{ color: "var(--color-text-primary)" }}
            >
                {formatCurrency(row.original.amount)}
            </span>
        ),
        enableSorting: true,
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const config = STATUS_CONFIG[row.original.status] || {
                variant: "warning" as const,
                label: "Menunggu",
            };

            return (
                <Badge variant={config.variant} size="sm">
                    {config.label}
                </Badge>
            );
        },
        enableSorting: true,
    },
    {
        id: "actions",
        header: "Aksi",
        cell: ({ row }) => {
            const isPending = row.original.status === "pending";

            return (
                <div className="flex items-center gap-2">
                    {isPending && (
                        <>
                            <Button
                                size="sm"
                                variant="success"
                                onClick={() => onApprove(row.original)}
                                leftIcon={<CheckCircle className="w-4 h-4" />}
                            >
                                Setujui
                            </Button>
                            <Button
                                size="sm"
                                variant="danger"
                                onClick={() => onReject(row.original)}
                                leftIcon={<XCircle className="w-4 h-4" />}
                            >
                                Tolak
                            </Button>
                        </>
                    )}
                    <Button
                        size="sm"
                        variant="info"
                        onClick={() => onView(row.original)}
                        leftIcon={<Eye className="w-4 h-4" />}
                        title="Lihat detail"
                    >
                        Lihat
                    </Button>
                    <Button
                        size="sm"
                        variant="danger"
                        onClick={() => onDelete(row.original)}
                        leftIcon={<Trash2 className="w-4 h-4" />}
                        title="Hapus setoran"
                    >
                        Hapus
                    </Button>
                </div>
            );
        },
        enableSorting: false,
    },
];
