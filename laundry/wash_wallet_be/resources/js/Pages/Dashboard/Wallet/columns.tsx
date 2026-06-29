import { ColumnDef } from "@tanstack/react-table";
import { WalletTransaction } from "@/types";
import { Badge } from "@/Components/Badge";
import { Calendar, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

const TYPE_BADGE_CONFIG: Record<
    string,
    {
        variant: "success" | "info" | "warning" | "danger" | "secondary";
        label: string;
    }
> = {
    order_transfer_income: { variant: "success", label: "Pendapatan Transfer" },
    order_wallet_income: { variant: "success", label: "Pendapatan Wallet" },
    withdrawal_request: { variant: "warning", label: "Penarikan Saldo" },
    withdrawal_rejected_refund: {
        variant: "info",
        label: "Refund Penolakan",
    },
    withdrawal_cancelled_refund: {
        variant: "secondary",
        label: "Refund Pembatalan",
    },
    manual_adjustment: { variant: "info", label: "Penyesuaian Manual" },
};

export const createWalletTransactionColumns =
    (): ColumnDef<WalletTransaction>[] => [
    {
        accessorKey: "transactionNumber",
        header: "Nomor Transaksi",
        cell: ({ row }) => (
            <div className="flex flex-col gap-1">
                <span
                    className="font-medium"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    {row.original.transactionNumber}
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
        accessorKey: "type",
        header: "Tipe",
        cell: ({ row }) => {
            const config = TYPE_BADGE_CONFIG[row.original.type] || {
                variant: "info" as const,
                label: row.original.typeLabel || row.original.type,
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
        accessorKey: "amount",
        header: "Nominal",
        cell: ({ row }) => {
            const amount = row.original.amount;
            const isCredit = amount > 0;

            return (
                <div className="flex items-center gap-1">
                    {isCredit ? (
                        <ArrowUpRight className="w-4 h-4 text-green-500" />
                    ) : (
                        <ArrowDownLeft className="w-4 h-4 text-red-500" />
                    )}
                    <span
                        className={`font-semibold ${
                            isCredit ? "text-green-600" : "text-red-600"
                        }`}
                    >
                        {isCredit ? "+" : ""}
                        {formatCurrency(amount)}
                    </span>
                </div>
            );
        },
        enableSorting: true,
    },
    {
        accessorKey: "balanceAfter",
        header: "Saldo Setelahnya",
        cell: ({ row }) => (
            <span
                className="font-medium"
                style={{ color: "var(--color-text-primary)" }}
            >
                {formatCurrency(row.original.balanceAfter)}
            </span>
        ),
        enableSorting: true,
    },
    {
        accessorKey: "description",
        header: "Deskripsi",
        cell: ({ row }) => (
            <span
                className="text-sm"
                style={{ color: "var(--color-text-secondary)" }}
            >
                {row.original.description || "-"}
            </span>
        ),
        enableSorting: false,
    },
];
