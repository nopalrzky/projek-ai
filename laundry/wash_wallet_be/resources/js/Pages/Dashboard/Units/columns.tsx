import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/Components/Badge";
import { Button } from "@/Components/Button";
import { Eye, Edit, Trash2 } from "lucide-react";
import { Unit } from "@/types";
import { formatDate } from "@/lib/utils";

export const createUnitColumns = (
    onView: (unit: Unit) => void,
    onEdit: (unit: Unit) => void,
    onDelete: (unit: Unit) => void,
): ColumnDef<Unit>[] => [
    {
        accessorKey: "name",
        header: "Nama Unit",
        cell: ({ row }) => (
            <div className="flex flex-col gap-1">
                <span
                    className="font-medium"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    {row.original.name}
                </span>
                <span
                    className="text-xs"
                    style={{ color: "var(--color-text-tertiary)" }}
                >
                    {row.original.symbol}
                </span>
            </div>
        ),
        enableSorting: true,
    },
    {
        accessorKey: "description",
        header: "Deskripsi",
        cell: ({ row }) => (
            <span
                className="text-sm line-clamp-2"
                style={{ color: "var(--color-text-secondary)" }}
            >
                {row.original.description || "-"}
            </span>
        ),
        enableSorting: false,
    },
    {
        accessorKey: "laundryServicesCount",
        header: "Layanan",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <Badge variant="info" size="sm">
                    {row.original.laundryServicesCount || 0} Layanan
                </Badge>
            </div>
        ),
        enableSorting: true,
    },
    {
        accessorKey: "createdAt",
        header: "Dibuat",
        cell: ({ row }) => (
            <div className="flex flex-col gap-0.5">
                <span
                    className="text-sm"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    {formatDate(row.original.createdAt, "DD MMMM YYYY")}
                </span>
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
                    title="Edit unit"
                />
                <Button
                    variant="danger"
                    size="sm"
                    onClick={() => onDelete(row.original)}
                    leftIcon={<Trash2 className="w-4 h-4" />}
                    title="Hapus unit"
                />
            </div>
        ),
        enableSorting: false,
    },
];
