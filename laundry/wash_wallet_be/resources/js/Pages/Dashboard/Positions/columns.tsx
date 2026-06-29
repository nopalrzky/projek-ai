import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/Components/Badge";
import { Button } from "@/Components/Button";
import { Eye, Edit, Trash2 } from "lucide-react";
import { Position } from "@/types";
import { formatDate } from "@/lib/utils";

export const createPositionColumns = (
    onView: (position: Position) => void,
    onEdit: (position: Position) => void,
    onDelete: (position: Position) => void,
    onViewOutlet: (outlet: Position["outlet"]) => void,
): ColumnDef<Position>[] => [
    {
        accessorKey: "name",
        header: "Nama Posisi",
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
                <button
                    onClick={() => onViewOutlet(row.original.outlet)}
                    className="text-sm font-medium hover:underline text-left"
                    style={{ color: "var(--color-primary-600)" }}
                >
                    {row.original.outlet?.name || "-"}
                </button>
                <span
                    className="text-xs"
                    style={{ color: "var(--color-text-tertiary)" }}
                >
                    {row.original.outlet?.code || "-"} •{" "}
                    {row.original.outlet?.cityName || "-"}
                </span>
            </div>
        ),
        enableSorting: false,
    },
    {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => (
            <Badge
                variant={row.original.isActive ? "success" : "error"}
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
                    title="Edit posisi"
                />
                <Button
                    variant="danger"
                    size="sm"
                    onClick={() => onDelete(row.original)}
                    leftIcon={<Trash2 className="w-4 h-4" />}
                    title="Hapus posisi"
                />
            </div>
        ),
        enableSorting: false,
    },
];
