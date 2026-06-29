import { ColumnDef } from "@tanstack/react-table";
import { WalletWithdrawal } from "@/types";
import { Badge } from "@/Components/Badge";
import { Button } from "@/Components/Button";
import { Eye, Calendar, Building2, User } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

const STATUS_CONFIG: Record<
    string,
    { variant: "warning" | "info" | "success" | "error" | "secondary"; label: string }
> = {
    pending: { variant: "warning", label: "Menunggu" },
    processing: { variant: "info", label: "Diproses" },
    paid: { variant: "success", label: "Dibayar" },
    rejected: { variant: "error", label: "Ditolak" },
    cancelled: { variant: "secondary", label: "Dibatalkan" },
};

export const createAdminWalletWithdrawalColumns = (
    onView: (withdrawal: WalletWithdrawal) => void
): ColumnDef<WalletWithdrawal>[] => [
    {
        accessorKey: "code",
        header: "Kode Penarikan",
        cell: ({ row }) => (
            <div className="flex flex-col gap-1">
                <span
                    className="font-semibold text-sm"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    {row.original.code}
                </span>
                <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(row.original.createdAt)}</span>
                </div>
            </div>
        ),
        enableSorting: true,
    },
    {
        accessorKey: "user.name",
        header: "Owner",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold uppercase border"
                    style={{
                        backgroundColor: "var(--color-primary-50)",
                        borderColor: "var(--color-primary-200)",
                        color: "var(--color-primary-700)",
                    }}
                >
                    <User className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col">
                    <span className="font-medium text-sm" style={{ color: "var(--color-text-primary)" }}>
                        {row.original.user?.name || "N/A"}
                    </span>
                    <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                        {row.original.user?.email}
                    </span>
                </div>
            </div>
        ),
        enableSorting: true,
    },
    {
        accessorKey: "bankName",
        header: "Rekening Tujuan",
        cell: ({ row }) => (
            <div className="flex items-start gap-2">
                <Building2 className="w-4 h-4 mt-0.5" style={{ color: "var(--color-text-tertiary)" }} />
                <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-sm" style={{ color: "var(--color-text-primary)" }}>
                        {row.original.bankName}
                    </span>
                    <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                        {row.original.accountNumber} - {row.original.accountHolderName}
                    </span>
                </div>
            </div>
        ),
        enableSorting: true,
    },
    {
        accessorKey: "requestedAmount",
        header: "Nominal (Gross)",
        cell: ({ row }) => (
            <span className="font-semibold text-sm" style={{ color: "var(--color-text-primary)" }}>
                {formatCurrency(row.original.requestedAmount)}
            </span>
        ),
        enableSorting: true,
    },
    {
        accessorKey: "netAmount",
        header: "Nominal Bersih",
        cell: ({ row }) => (
            <span className="font-bold text-sm text-green-600" style={{ color: "var(--color-primary-600)" }}>
                {formatCurrency(row.original.netAmount)}
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
                label: row.original.statusLabel || row.original.status,
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
        cell: ({ row }) => (
            <Button
                size="sm"
                variant="info"
                onClick={() => onView(row.original)}
                leftIcon={<Eye className="w-4 h-4" />}
            >
                Detail
            </Button>
        ),
        enableSorting: false,
    },
];
