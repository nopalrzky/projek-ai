import { ColumnDef } from "@tanstack/react-table";
import { Link } from "@inertiajs/react";
import { Badge } from "@/Components/Badge";
import { Button } from "@/Components/Button";
import {
    Eye,
    Edit,
    Trash2,
    Paperclip,
    CheckCircle,
    XCircle,
} from "lucide-react";
import { Expense } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

const statusConfig = {
    pending: {
        variant: "warning" as const,
        label: "Menunggu",
    },
    approved: {
        variant: "success" as const,
        label: "Disetujui",
    },
    rejected: {
        variant: "error" as const,
        label: "Ditolak",
    },
};

export const createExpenseColumns = (
    onView: (expense: Expense) => void,
    onEdit: (expense: Expense) => void,
    onDelete: (expense: Expense) => void,
    onApprove?: (expense: Expense) => void,
    onReject?: (expense: Expense) => void,
    onAttachmentClick?: (expense: Expense) => void,
): ColumnDef<Expense>[] => [
    {
        accessorKey: "date",
        header: "Tanggal",
        cell: ({ row }) => (
            <div className="flex flex-col gap-1">
                <Link
                    href={route("expenses.show", row.original.id)}
                    className="font-medium hover:underline"
                    style={{ color: "var(--color-primary-600)" }}
                >
                    {formatDate(row.original.date, "DD MMMM YYYY")}
                </Link>
                {row.original.hasAttachment && (
                    <button
                        type="button"
                        onClick={() => onAttachmentClick?.(row.original)}
                        className="inline-flex items-center gap-1 self-start text-left"
                        title="Klik untuk melihat lampiran"
                    >
                        <Badge variant="info" size="sm">
                            <span className="inline-flex items-center gap-1">
                                <Paperclip className="w-3 h-3" />
                                Lampiran
                            </span>
                        </Badge>
                    </button>
                )}
            </div>
        ),
        enableSorting: true,
    },
    {
        accessorKey: "outletName",
        header: "Outlet",
        cell: ({ row }) => (
            <div className="flex flex-col gap-1">
                <span
                    className="text-sm font-medium"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    {row.original.outlet?.name ?? "-"}
                </span>
                <span
                    className="text-xs"
                    style={{ color: "var(--color-text-tertiary)" }}
                >
                    {row.original.outlet?.code ?? "-"}
                </span>
            </div>
        ),
        enableSorting: true,
    },
    {
        accessorKey: "expenseAccountName",
        header: "Akun Pengeluaran",
        cell: ({ row }) => (
            <div className="flex flex-col gap-1">
                <span
                    className="text-sm font-medium"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    {row.original.expenseAccount?.name ?? "-"}
                </span>
                <span
                    className="text-xs"
                    style={{ color: "var(--color-text-tertiary)" }}
                >
                    {row.original.expenseAccount?.code ?? "-"}
                </span>
            </div>
        ),
        enableSorting: false,
    },
    {
        accessorKey: "sourceAccountName",
        header: "Sumber Dana",
        cell: ({ row }) => (
            <div className="flex flex-col gap-1">
                <span
                    className="text-sm font-medium"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    {row.original.sourceAccount?.name ?? "-"}
                </span>
                <span
                    className="text-xs"
                    style={{ color: "var(--color-text-tertiary)" }}
                >
                    {row.original.sourceAccount?.code ?? "-"}
                </span>
            </div>
        ),
        enableSorting: false,
    },
    {
        accessorKey: "description",
        header: "Deskripsi",
        cell: ({ row }) => (
            <div className="max-w-xs">
                <p
                    className="text-sm line-clamp-2"
                    style={{ color: "var(--color-text-primary)" }}
                    title={row.original.description || "-"}
                >
                    {row.original.description || "-"}
                </p>
            </div>
        ),
        enableSorting: false,
    },
    {
        accessorKey: "amount",
        header: "Jumlah",
        cell: ({ row }) => (
            <div className="text-right">
                <span
                    className="text-sm font-semibold"
                    style={{ color: "var(--color-error-600)" }}
                >
                    {formatCurrency(row.original.amount)}
                </span>
            </div>
        ),
        enableSorting: true,
    },
    {
        accessorKey: "creatorName",
        header: "Dibuat Oleh",
        cell: ({ row }) => (
            <div className="flex flex-col gap-1">
                <span
                    className="text-sm font-medium"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    {row.original.creatorName}
                </span>
                <Badge
                    variant={
                        row.original.creatorType === "employee"
                            ? "info"
                            : "secondary"
                    }
                    size="sm"
                >
                    {row.original.creatorType === "employee"
                        ? "Karyawan"
                        : "User"}
                </Badge>
            </div>
        ),
        enableSorting: false,
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const config =
                statusConfig[row.original.status as keyof typeof statusConfig];

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
                    {isPending && onApprove && onReject && (
                        <>
                            <Button
                                variant="success"
                                size="sm"
                                onClick={() => onApprove(row.original)}
                                leftIcon={<CheckCircle className="w-4 h-4" />}
                                title="Setujui pengeluaran"
                            />
                            <Button
                                variant="danger"
                                size="sm"
                                onClick={() => onReject(row.original)}
                                leftIcon={<XCircle className="w-4 h-4" />}
                                title="Tolak pengeluaran"
                            />
                        </>
                    )}
                    <Button
                        variant="info"
                        size="sm"
                        onClick={() => onView(row.original)}
                        leftIcon={<Eye className="w-4 h-4" />}
                        title="Lihat detail"
                    />
                    {isPending && (
                        <Button
                            variant="warning"
                            size="sm"
                            onClick={() => onEdit(row.original)}
                            leftIcon={<Edit className="w-4 h-4" />}
                            title="Edit pengeluaran"
                        />
                    )}
                    <Button
                        variant="danger"
                        size="sm"
                        onClick={() => onDelete(row.original)}
                        leftIcon={<Trash2 className="w-4 h-4" />}
                        title="Hapus pengeluaran"
                    />
                </div>
            );
        },
        enableSorting: false,
    },
];
