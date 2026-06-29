import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/Components/Badge";
import { Button } from "@/Components/Button";
import { Eye, Edit, Trash2 } from "lucide-react";
import { Setting } from "@/types";
import { formatDate } from "@/lib/utils";

export const createSettingColumns = (
    onView: (setting: Setting) => void,
    onEdit: (setting: Setting) => void,
    onDelete: (setting: Setting) => void,
): ColumnDef<Setting>[] => [
    {
        accessorKey: "key",
        header: "Key",
        cell: ({ row }) => (
            <Badge
                variant="outline"
                className="font-mono text-xs"
                style={{ borderColor: "var(--color-border)" }}
            >
                {row.original.key}
            </Badge>
        ),
        enableSorting: true,
    },
    {
        accessorKey: "name",
        header: "Nama",
        cell: ({ row }) => (
            <span
                className="text-sm font-medium"
                style={{ color: "var(--color-text-primary)" }}
            >
                {row.original.name ?? "-"}
            </span>
        ),
        enableSorting: true,
    },
    {
        accessorKey: "description",
        header: "Deskripsi",
        cell: ({ row }) => (
            <div className="max-w-md">
                <p
                    className="text-sm truncate"
                    style={{ color: "var(--color-text-secondary)" }}
                    title={row.original.description ?? ""}
                >
                    {row.original.description ?? "-"}
                </p>
            </div>
        ),
        enableSorting: false,
    },
    {
        accessorKey: "createdAt",
        header: "Dibuat",
        cell: ({ row }) => (
            <div className="flex flex-col gap-1">
                <span
                    className="text-sm font-medium"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    {formatDate(new Date(row.original.createdAt))}
                </span>
                <span
                    className="text-xs"
                    style={{ color: "var(--color-text-tertiary)" }}
                >
                    {new Date(row.original.createdAt).toLocaleTimeString(
                        "id-ID",
                        { hour: "2-digit", minute: "2-digit" },
                    )}
                </span>
            </div>
        ),
        enableSorting: true,
    },
    {
        id: "actions",
        header: "Aksi",
        cell: ({ row }) => (
            <div className="flex items-center justify-end gap-2">
                <Button
                    size="sm"
                    variant="ghost"
                    leftIcon={<Eye className="w-4 h-4" />}
                    title="Lihat detail"
                    onClick={() => onView(row.original)}
                />
                <Button
                    size="sm"
                    variant="ghost"
                    leftIcon={<Edit className="w-4 h-4" />}
                    title="Edit"
                    onClick={() => onEdit(row.original)}
                />
                <Button
                    size="sm"
                    variant="ghost"
                    leftIcon={<Trash2 className="w-4 h-4" />}
                    title="Hapus"
                    onClick={() => onDelete(row.original)}
                />
            </div>
        ),
        enableSorting: false,
    },
];
