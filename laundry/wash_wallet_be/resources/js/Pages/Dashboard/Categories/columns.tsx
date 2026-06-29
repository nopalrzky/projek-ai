import { ColumnDef } from "@tanstack/react-table";
import { Link } from "@inertiajs/react";
import { Badge } from "@/Components/Badge";
import { Button } from "@/Components/Button";
import { Eye, Edit, Trash2 } from "lucide-react";
import { Category } from "@/types";

export const createCategoryColumns = (
    onView: (category: Category) => void,
    onEdit: (category: Category) => void,
    onDelete: (category: Category) => void,
): ColumnDef<Category>[] => [
    {
        accessorKey: "name",
        header: "Nama Kategori",
        cell: ({ row }) => (
            <div className="flex flex-col gap-1">
                <Link
                    href={route("categories.show", row.original.id)}
                    className="text-sm font-semibold hover:underline"
                    style={{ color: "var(--color-primary-600)" }}
                >
                    {row.original.name}
                </Link>
                <span
                    className="text-xs"
                    style={{ color: "var(--color-text-tertiary)" }}
                >
                    {row.original.slug}
                </span>
            </div>
        ),
        enableSorting: true,
    },
    {
        accessorKey: "outlet.name",
        header: "Outlet",
        cell: ({ row }) => (
            <div className="flex items-start gap-2">
                <div className="flex flex-col gap-1">
                    <span
                        className="text-sm font-medium"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        {row.original.outlet?.name || "-"}
                    </span>
                    <span
                        className="text-xs"
                        style={{ color: "var(--color-text-tertiary)" }}
                    >
                        {row.original.outlet?.code || "-"}
                    </span>
                </div>
            </div>
        ),
        enableSorting: false,
    },
    {
        accessorKey: "description",
        header: "Deskripsi",
        cell: ({ row }) => (
            <div className="max-w-xs">
                {row.original.description ? (
                    <p
                        className="text-sm line-clamp-2"
                        style={{ color: "var(--color-text-primary)" }}
                        title={row.original.description}
                    >
                        {row.original.description}
                    </p>
                ) : (
                    <span
                        className="text-sm italic"
                        style={{ color: "var(--color-text-tertiary)" }}
                    >
                        Tidak ada deskripsi
                    </span>
                )}
            </div>
        ),
        enableSorting: false,
    },
    {
        accessorKey: "laundryServicesCount",
        header: "Layanan",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <span
                    className="text-sm font-medium"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    {row.original.laundryServicesCount || 0} layanan
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
                    title="Edit kategori"
                />
                <Button
                    variant="danger"
                    size="sm"
                    onClick={() => onDelete(row.original)}
                    leftIcon={<Trash2 className="w-4 h-4" />}
                    title="Hapus kategori"
                />
            </div>
        ),
        enableSorting: false,
    },
];
