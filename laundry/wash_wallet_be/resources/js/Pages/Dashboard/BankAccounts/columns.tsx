import { ColumnDef } from "@tanstack/react-table";
import { OwnerBankAccount } from "@/types";
import { Badge } from "@/Components/Badge";
import { Button } from "@/Components/Button";
import { CreditCard, Edit, Trash2, Star, Calendar } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export const createBankAccountColumns = (
    onEdit: (account: OwnerBankAccount) => void,
    onDelete: (account: OwnerBankAccount) => void,
    onSetDefault: (account: OwnerBankAccount) => void,
): ColumnDef<OwnerBankAccount>[] => [
    {
        accessorKey: "bankName",
        header: "Bank",
        cell: ({ row }) => (
            <div className="flex items-start gap-2">
                <CreditCard
                    className="w-4 h-4 mt-0.5 flex-shrink-0"
                    style={{ color: "var(--color-text-tertiary)" }}
                />
                <div className="flex flex-col gap-1">
                    <span
                        className="text-sm font-medium"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        {row.original.bankName || "-"}
                    </span>
                    {row.original.adminFee !== undefined && (
                        <span
                            className="text-xs"
                            style={{ color: "var(--color-text-tertiary)" }}
                        >
                            Admin {formatCurrency(row.original.adminFee)}
                        </span>
                    )}
                </div>
            </div>
        ),
        enableSorting: true,
    },
    {
        accessorKey: "accountNumber",
        header: "Nomor Rekening",
        cell: ({ row }) => (
            <span
                className="text-sm font-semibold font-mono"
                style={{ color: "var(--color-text-primary)" }}
            >
                {row.original.accountNumber}
            </span>
        ),
        enableSorting: true,
    },
    {
        accessorKey: "accountHolderName",
        header: "Nama Pemilik",
        cell: ({ row }) => (
            <span
                className="text-sm"
                style={{ color: "var(--color-text-secondary)" }}
            >
                {row.original.accountHolderName}
            </span>
        ),
        enableSorting: true,
    },
    {
        accessorKey: "isDefault",
        header: "Utama",
        cell: ({ row }) => (
            <Badge
                variant={row.original.isDefault ? "success" : "secondary"}
                size="sm"
            >
                {row.original.isDefault ? "Rekening Utama" : "Biasa"}
            </Badge>
        ),
        enableSorting: true,
    },
    {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => (
            <Badge
                variant={row.original.isActive ? "success" : "danger"}
                size="sm"
            >
                {row.original.isActive ? "Aktif" : "Nonaktif"}
            </Badge>
        ),
        enableSorting: true,
    },
    {
        accessorKey: "createdAt",
        header: "Dibuat",
        cell: ({ row }) => (
            <div className="flex items-center gap-1">
                <Calendar
                    className="w-3 h-3"
                    style={{ color: "var(--color-text-tertiary)" }}
                />
                <span
                    className="text-xs"
                    style={{ color: "var(--color-text-tertiary)" }}
                >
                    {formatDate(row.original.createdAt)}
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
                {!row.original.isDefault && row.original.isActive && (
                    <Button
                        size="sm"
                        variant="warning"
                        onClick={() => onSetDefault(row.original)}
                        leftIcon={<Star className="w-4 h-4" />}
                        title="Jadikan rekening utama"
                    />
                )}
                <Button
                    size="sm"
                    variant="info"
                    onClick={() => onEdit(row.original)}
                    leftIcon={<Edit className="w-4 h-4" />}
                    title="Ubah rekening"
                />
                {!row.original.isDefault && (
                    <Button
                        size="sm"
                        variant="danger"
                        onClick={() => onDelete(row.original)}
                        leftIcon={<Trash2 className="w-4 h-4" />}
                        title="Hapus rekening"
                    />
                )}
            </div>
        ),
        enableSorting: false,
    },
];
