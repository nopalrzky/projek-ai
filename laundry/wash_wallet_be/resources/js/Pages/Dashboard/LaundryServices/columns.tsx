import { ColumnDef } from "@tanstack/react-table";
import { Link } from "@inertiajs/react";
import { Badge } from "@/Components/Badge";
import { Button } from "@/Components/Button";
import { Eye, Edit, Trash2 } from "lucide-react";
import { LaundryService } from "@/types";
import { formatCurrency } from "@/lib/utils";

export const createLaundryServiceColumns = (
    onView: (laundryService: LaundryService) => void,
    onEdit: (laundryService: LaundryService) => void,
    onDelete: (laundryService: LaundryService) => void,
): ColumnDef<LaundryService>[] => [
    {
        accessorKey: "name",
        header: "Nama Layanan",
        cell: ({ row }) => (
            <div className="flex flex-col gap-1">
                <Link
                    href={route("laundry-services.show", row.original.id)}
                    className="font-medium hover:underline"
                    style={{ color: "var(--color-primary-600)" }}
                >
                    {row.original.name}
                </Link>
                <div className="flex items-center gap-2">
                    <Badge
                        variant={row.original.isActive ? "success" : "error"}
                        size="sm"
                    >
                        {row.original.isActive ? "Aktif" : "Nonaktif"}
                    </Badge>
                </div>
            </div>
        ),
        enableSorting: true,
        size: 200,
    },
    {
        accessorKey: "category.name",
        header: "Kategori",
        cell: ({ row }) => (
            <div className="flex flex-col gap-1">
                <span
                    className="text-sm font-medium"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    {row.original.category?.name ?? "-"}
                </span>
                <span
                    className="text-xs"
                    style={{ color: "var(--color-text-tertiary)" }}
                >
                    {row.original.category?.outlet?.name ?? "-"}
                </span>
            </div>
        ),
        enableSorting: false,
        size: 180,
    },
    {
        accessorKey: "unit.name",
        header: "Unit",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <span
                    className="text-sm font-medium"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    {row.original.unit?.name ?? "-"}
                </span>
            </div>
        ),
        enableSorting: false,
        size: 120,
    },
    {
        accessorKey: "price",
        header: "Harga",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <div className="flex flex-col">
                    <span
                        className="text-sm font-semibold"
                        style={{ color: "var(--color-success-600)" }}
                    >
                        {formatCurrency(row.original.price || 0)}
                    </span>
                    <span
                        className="text-xs"
                        style={{ color: "var(--color-text-tertiary)" }}
                    >
                        per {row.original.unit?.symbol ?? "-"}
                    </span>
                </div>
            </div>
        ),
        enableSorting: true,
        size: 140,
    },
    {
        accessorKey: "durationHours",
        header: "Durasi",
        cell: ({ row }) => {
            const hours = row.original.durationHours || 24;
            const days = Math.floor(hours / 24);
            const remainingHours = hours % 24;

            return (
                <div className="flex items-center gap-2">
                    <div className="flex flex-col">
                        <span
                            className="text-sm font-medium"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            {hours} jam
                        </span>
                        {days > 0 && (
                            <span
                                className="text-xs"
                                style={{ color: "var(--color-text-tertiary)" }}
                            >
                                ≈ {days} hari{" "}
                                {remainingHours > 0 ? `${remainingHours}j` : ""}
                            </span>
                        )}
                    </div>
                </div>
            );
        },
        enableSorting: true,
        size: 120,
    },
    {
        accessorKey: "minQuantity",
        header: "Min. Qty",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <div className="flex flex-col">
                    <span
                        className="text-sm font-medium"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        {row.original.minQuantity || 1}{" "}
                        {row.original.unit?.symbol ?? "-"}
                    </span>
                    <span
                        className="text-xs"
                        style={{ color: "var(--color-text-tertiary)" }}
                    >
                        minimum
                    </span>
                </div>
            </div>
        ),
        enableSorting: true,
        size: 120,
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
                    title="Edit layanan"
                />
                <Button
                    variant="danger"
                    size="sm"
                    onClick={() => onDelete(row.original)}
                    leftIcon={<Trash2 className="w-4 h-4" />}
                    title="Hapus layanan"
                />
            </div>
        ),
        enableSorting: false,
        size: 140,
    },
];
