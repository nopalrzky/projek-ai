import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/Components/Badge";
import { Button } from "@/Components/Button";
import { Eye, Edit, Trash2, Download } from "lucide-react";
import { FineLog } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

const statusVariants = {
    unpaid: "error",
    paid: "success",
    cancelled: "warning",
} as const;

const statusLabels = {
    unpaid: "Belum Dibayar",
    paid: "Sudah Dibayar",
    cancelled: "Dibatalkan",
} as const;

export const createFineLogColumns = (
    onView: (fineLog: FineLog) => void,
    onEdit: (fineLog: FineLog) => void,
    onDelete: (fineLog: FineLog) => void,
): ColumnDef<FineLog>[] => [
    {
        accessorKey: "date",
        header: "Tanggal",
        cell: ({ row }) => (
            <div className="flex flex-col gap-1">
                <span
                    className="text-sm font-medium"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    {formatDate(row.original.date, "DD MMMM YYYY")}
                </span>
            </div>
        ),
        enableSorting: true,
    },
    {
        accessorKey: "employee.name",
        header: "Karyawan",
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
                    {row.original.outlet?.name ?? "-"}
                </span>
            </div>
        ),
        enableSorting: false,
    },
    {
        accessorKey: "fine.name",
        header: "Jenis Denda",
        cell: ({ row }) => (
            <div className="flex flex-col gap-1">
                <span
                    className="text-sm font-medium"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    {row.original.fine?.name ?? "-"}
                </span>
                {row.original.reason && (
                    <span
                        className="text-xs"
                        style={{ color: "var(--color-text-tertiary)" }}
                    >
                        {row.original.reason}
                    </span>
                )}
            </div>
        ),
        enableSorting: false,
    },
    {
        accessorKey: "amount",
        header: "Jumlah",
        cell: ({ row }) => (
            <span
                className="text-sm font-semibold"
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
        cell: ({ row }) => (
            <Badge
                variant={
                    statusVariants[
                        row.original.status as keyof typeof statusVariants
                    ] || "default"
                }
                size="sm"
            >
                {statusLabels[row.original.status as keyof typeof statusLabels]}
            </Badge>
        ),
        enableSorting: true,
    },
    {
        id: "attachment",
        header: "Lampiran",
        cell: ({ row }) => (
            <div>
                {row.original.hasAttachment ? (
                    <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<Download className="w-4 h-4" />}
                        title="Download lampiran"
                    >
                        Download
                    </Button>
                ) : (
                    <span
                        className="text-xs"
                        style={{ color: "var(--color-text-tertiary)" }}
                    >
                        Tidak ada
                    </span>
                )}
            </div>
        ),
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
                {row.original.canBeUpdated && (
                    <Button
                        variant="warning"
                        size="sm"
                        onClick={() => onEdit(row.original)}
                        leftIcon={<Edit className="w-4 h-4" />}
                        title="Edit denda"
                    />
                )}
                {row.original.canBeDeleted && (
                    <Button
                        variant="danger"
                        size="sm"
                        onClick={() => onDelete(row.original)}
                        leftIcon={<Trash2 className="w-4 h-4" />}
                        title="Hapus denda"
                    />
                )}
            </div>
        ),
        enableSorting: false,
    },
];
