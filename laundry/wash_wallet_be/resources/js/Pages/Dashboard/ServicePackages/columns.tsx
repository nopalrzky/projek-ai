import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/Components/Badge";
import { Button } from "@/Components/Button";
import { Eye, Edit, Trash2, Package, Calendar } from "lucide-react";
import { ServicePackage } from "@/types";
import { formatCurrency } from "@/lib/utils";

export const createServicePackageColumns = (
    onView: (pkg: ServicePackage) => void,
    onEdit: (pkg: ServicePackage) => void,
    onDelete: (pkg: ServicePackage) => void,
): ColumnDef<ServicePackage>[] => [
    {
        accessorKey: "name",
        header: "Nama Paket",
        cell: ({ row }) => (
            <div className="flex flex-col gap-1 min-w-[200px]">
                <div className="flex items-center gap-2">
                    <Package
                        className="w-4 h-4 flex-shrink-0"
                        style={{ color: "var(--color-primary-600)" }}
                    />
                    <span
                        className="text-sm font-semibold truncate"
                        style={{ color: "var(--color-text-primary)" }}
                        title={row.original.name}
                    >
                        {row.original.name}
                    </span>
                </div>
                {row.original.description && (
                    <span
                        className="text-xs line-clamp-2 pl-6"
                        style={{ color: "var(--color-text-tertiary)" }}
                        title={row.original.description}
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
            <div className="flex items-start gap-2">
                <div className="flex flex-col gap-1">
                    {row.original.isGlobal ? (
                        <Badge variant="info" size="sm">
                            Global
                        </Badge>
                    ) : (
                        <>
                            <span
                                className="text-sm font-medium"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                {row.original.outlet?.name || "-"}
                            </span>
                            {row.original.outlet?.code && (
                                <span
                                    className="text-xs font-mono"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    {row.original.outlet.code}
                                </span>
                            )}
                        </>
                    )}
                </div>
            </div>
        ),
        enableSorting: false,
    },
    {
        accessorKey: "price",
        header: "Harga",
        cell: ({ row }) => {
            return (
                <div className="flex flex-col gap-1">
                    <span
                        className="text-sm font-bold"
                        style={{ color: "var(--color-success-600)" }}
                    >
                        {formatCurrency(row.original.price)}
                    </span>
                </div>
            );
        },
        enableSorting: true,
    },
    {
        accessorKey: "packageItemsCount",
        header: "Isi Paket",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <Package
                    className="w-4 h-4"
                    style={{ color: "var(--color-text-tertiary)" }}
                />
                <span
                    className="text-sm font-medium"
                    style={{ color: "var(--color-text-secondary)" }}
                >
                    {row.original.servicePackageItemsCount ||
                        row.original.servicePackageItems?.length ||
                        0}{" "}
                    Item
                </span>
            </div>
        ),
        enableSorting: true,
    },
    {
        accessorKey: "validityDays",
        header: "Masa Berlaku",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <Calendar
                    className="w-4 h-4"
                    style={{ color: "var(--color-text-tertiary)" }}
                />
                <span
                    className="text-sm"
                    style={{ color: "var(--color-text-secondary)" }}
                >
                    {row.original.validityDays
                        ? `${row.original.validityDays} hari`
                        : "Tidak terbatas"}
                </span>
            </div>
        ),
        enableSorting: true,
    },

    {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => (
            <div className="flex flex-col gap-2">
                {row.original.isActive ? (
                    <Badge variant="success" size="sm">
                        Aktif
                    </Badge>
                ) : (
                    <Badge variant="error" size="sm">
                        Nonaktif
                    </Badge>
                )}
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
                    title="Edit paket"
                />
                <Button
                    variant="danger"
                    size="sm"
                    onClick={() => onDelete(row.original)}
                    leftIcon={<Trash2 className="w-4 h-4" />}
                    title="Hapus paket"
                />
            </div>
        ),
        enableSorting: false,
    },
];
