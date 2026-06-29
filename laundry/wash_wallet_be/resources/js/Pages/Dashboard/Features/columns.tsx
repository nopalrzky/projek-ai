import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/Components/Badge";
import { Button } from "@/Components/Button";
import { Edit, Trash2, Coins, Calendar } from "lucide-react";
import { Feature } from "@/types";
import { formatDate } from "@/lib/utils";

export const createFeatureColumns = (
    onEdit: (feature: Feature) => void,
    onDelete: (feature: Feature) => void,
): ColumnDef<Feature>[] => [
    {
        accessorKey: "name",
        header: "Nama Fitur",
        cell: ({ row }) => (
            <div className="flex flex-col gap-1">
                <span className="font-medium" style={{ color: "var(--color-primary-600)" }}>
                    {row.original.name}
                </span>
                <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                    {row.original.key}
                </span>
            </div>
        ),
        enableSorting: true,
    },
    {
        accessorKey: "coinPrice",
        header: "Harga (Coin)",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-500" />
                <span className="font-semibold">{row.original.coinPrice}</span>
            </div>
        ),
        enableSorting: true,
    },
    {
        accessorKey: "durationDays",
        header: "Masa Aktif",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span>
                    {row.original.durationDays 
                        ? `${row.original.durationDays} Hari` 
                        : "Selamanya"}
                </span>
            </div>
        ),
        enableSorting: true,
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
        accessorKey: "sortOrder",
        header: "Urutan",
        cell: ({ row }) => row.original.sortOrder,
        enableSorting: true,
    },
    {
        id: "actions",
        header: "Aksi",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <Button
                    variant="warning"
                    size="sm"
                    onClick={() => onEdit(row.original)}
                    leftIcon={<Edit className="w-4 h-4" />}
                    title="Edit fitur"
                />
                <Button
                    variant="danger"
                    size="sm"
                    onClick={() => onDelete(row.original)}
                    leftIcon={<Trash2 className="w-4 h-4" />}
                    title="Hapus fitur"
                />
            </div>
        ),
        enableSorting: false,
    },
];
