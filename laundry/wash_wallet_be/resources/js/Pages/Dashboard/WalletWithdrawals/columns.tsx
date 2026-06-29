import { ColumnDef } from "@tanstack/react-table";
import { WalletWithdrawal } from "@/types";
import { Badge } from "@/Components/Badge";
import { Button } from "@/Components/Button";
import { Eye, Calendar, Building2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

const STATUS_CONFIG: Record<
    string,
    {
        variant: "warning" | "info" | "success" | "error" | "secondary";
        label: string;
    }
> = {
    pending: { variant: "warning", label: "Menunggu" },
    processing: { variant: "info", label: "Diproses" },
    paid: { variant: "success", label: "Dibayar" },
    rejected: { variant: "error", label: "Ditolak" },
    cancelled: { variant: "secondary", label: "Dibatalkan" },
};

export const createWalletWithdrawalColumns = (
    onView: (withdrawal: WalletWithdrawal) => void,
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
                <div
                    className="flex items-center gap-1.5 text-xs"
                    style={{ color: "var(--color-text-tertiary)" }}
                >
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(row.original.createdAt)}</span>
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
                <Building2
                    className="w-4 h-4 mt-0.5"
                    style={{ color: "var(--color-text-tertiary)" }}
                />
                <div className="flex flex-col gap-0.5">
                    <span
                        className="font-medium text-sm"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        {row.original.bankName}
                    </span>
                    <span
                        className="text-xs"
                        style={{ color: "var(--color-text-secondary)" }}
                    >
                        {row.original.accountNumber} - {row.original.accountHolderName}
                    </span>
                </div>
            </div>
        ),
        enableSorting: true,
    },
    {
        accessorKey: "requestedAmount",
        header: "Nominal",
        cell: ({ row }) => (
            <div className="flex flex-col gap-0.5">
                <span
                    className="font-semibold text-sm"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    {formatCurrency(row.original.requestedAmount)}
                </span>
                <span
                    className="text-xs"
                    style={{ color: "var(--color-text-secondary)" }}
                >
                    Biaya: {formatCurrency(row.original.adminFee)}
                </span>
            </div>
        ),
        enableSorting: true,
    },
    {
        accessorKey: "netAmount",
        header: "Jumlah Bersih",
        cell: ({ row }) => (
            <span
                className="font-bold text-sm"
                style={{ color: "var(--color-primary-600)" }}
            >
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
                title="Lihat detail"
            />
        ),
        enableSorting: false,
    },
];
