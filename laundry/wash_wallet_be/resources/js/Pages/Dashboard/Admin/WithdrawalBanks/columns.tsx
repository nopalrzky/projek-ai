import { ColumnDef } from "@tanstack/react-table";
import { WithdrawalBank } from "@/types";
import { Badge } from "@/Components/Badge";
import { Button } from "@/Components/Button";
import { CreditCard, Edit, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export const createWithdrawalBankColumns = (
    onEdit: (bank: WithdrawalBank) => void,
    onDelete: (bank: WithdrawalBank) => void
): ColumnDef<WithdrawalBank>[] => [
    {
        accessorKey: "bankName",
        header: "Nama Bank",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" style={{ color: "var(--color-text-tertiary)" }} />
                <span className="font-semibold" style={{ color: "var(--color-text-primary)" }}>
                    {row.original.bankName}
                </span>
                {row.original.bankCode && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 font-mono" style={{ color: "var(--color-text-secondary)" }}>
                        {row.original.bankCode}
                    </span>
                )}
            </div>
        ),
        enableSorting: true,
    },
    {
        accessorKey: "adminFee",
        header: "Biaya Admin",
        cell: ({ row }) => (
            <span className="font-medium" style={{ color: "var(--color-text-primary)" }}>
                {formatCurrency(row.original.adminFee)}
            </span>
        ),
        enableSorting: true,
    },
    {
        accessorKey: "minWithdrawal",
        header: "Min. Penarikan",
        cell: ({ row }) => (
            <span style={{ color: "var(--color-text-secondary)" }}>
                {formatCurrency(row.original.minWithdrawal)}
            </span>
        ),
        enableSorting: true,
    },
    {
        accessorKey: "maxWithdrawal",
        header: "Max. Penarikan",
        cell: ({ row }) => (
            <span style={{ color: "var(--color-text-secondary)" }}>
                {row.original.maxWithdrawal ? formatCurrency(row.original.maxWithdrawal) : "Tanpa Batas"}
            </span>
        ),
        enableSorting: true,
    },
    {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => (
            <Badge variant={row.original.isActive ? "success" : "danger"} size="sm">
                {row.original.isActive ? "Aktif" : "Nonaktif"}
            </Badge>
        ),
        enableSorting: true,
    },
    {
        id: "actions",
        header: "Aksi",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <Button
                    size="sm"
                    variant="info"
                    onClick={() => onEdit(row.original)}
                    leftIcon={<Edit className="w-4 h-4" />}
                >
                    Ubah
                </Button>
                <Button
                    size="sm"
                    variant="danger"
                    onClick={() => onDelete(row.original)}
                    leftIcon={<Trash2 className="w-4 h-4" />}
                >
                    Hapus
                </Button>
            </div>
        ),
        enableSorting: false,
    },
];
