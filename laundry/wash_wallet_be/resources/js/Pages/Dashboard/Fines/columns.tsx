import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/Components/Badge";
import { Button } from "@/Components/Button";
import { Eye, Edit, Trash2 } from "lucide-react";
import { Fine } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

export const createFineColumns = (
    onView: (fine: Fine) => void,
    onEdit: (fine: Fine) => void,
    onDelete: (fine: Fine) => void,
): ColumnDef<Fine>[] => [
    {
        accessorKey: "name",
        header: "Nama Denda",
        cell: ({ row }) => (
            <div className="flex flex-col gap-1">
                <span
                    className="text-sm font-medium"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    {row.original.name}
                </span>
                {row.original.description && (
                    <span
                        className="text-xs"
                        style={{ color: "var(--color-text-tertiary)" }}
                    >
                        {row.original.description}
                    </span>
                )}
            </div>
        ),
        enableSorting: true,
    },
    {
        accessorKey: "outlet.name",
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
        enableSorting: false,
    },
    {
        accessorKey: "amount",
        header: "Nominal",
        cell: ({ row }) => (
            <span
                className="text-sm font-semibold"
                style={{ color: "var(--color-error-600)" }}
            >
                {formatCurrency(row.original.amount)}
            </span>
        ),
        enableSorting: true,
    },
    {
        accessorKey: "fineLogsCount",
        header: "Penggunaan",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <Badge
                    variant={
                        row.original.fineLogsCount > 0 ? "success" : "warning"
                    }
                    size="sm"
                >
                    {row.original.fineLogsCount} kali
                </Badge>
            </div>
        ),
        enableSorting: true,
    },
    {
        accessorKey: "createdAt",
        header: "Dibuat",
        cell: ({ row }) => (
            <span
                className="text-sm"
                style={{ color: "var(--color-text-secondary)" }}
            >
                {formatDate(row.original.createdAt, "DD MMMM YYYY")}
            </span>
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
                <Button
                    variant="warning"
                    size="sm"
                    onClick={() => onEdit(row.original)}
                    leftIcon={<Edit className="w-4 h-4" />}
                    title="Edit denda"
                />
                <Button
                    variant="danger"
                    size="sm"
                    onClick={() => onDelete(row.original)}
                    leftIcon={<Trash2 className="w-4 h-4" />}
                    title="Hapus denda"
                    disabled={row.original.fineLogsCount > 0}
                />
            </div>
        ),
        enableSorting: false,
    },
];
