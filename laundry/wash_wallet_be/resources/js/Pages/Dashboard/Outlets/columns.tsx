import { ColumnDef } from "@tanstack/react-table";
import { Link } from "@inertiajs/react";
import { Badge } from "@/Components/Badge";
import { Button } from "@/Components/Button";
import { Eye, Edit, Trash2, MapPin, Zap, Truck } from "lucide-react";
import { Outlet } from "@/types";
import { formatDate } from "@/lib/utils";

export const createOutletColumns = (
    onView: (outlet: Outlet) => void,
    onEdit: (outlet: Outlet) => void,
    onDelete: (outlet: Outlet) => void,
    onActivate: (outlet: Outlet) => void,
): ColumnDef<Outlet>[] => [
    {
        accessorKey: "name",
        header: "Nama Outlet",
        cell: ({ row }) => (
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <Link
                        href={
                            row.original.status === "active"
                                ? route("outlets.show", row.original.id)
                                : route(
                                      "outlets.activate.page",
                                      row.original.id,
                                  )
                        }
                        className="font-medium hover:underline"
                        style={{ color: "var(--color-primary-600)" }}
                    >
                        {row.original.name}
                    </Link>
                    {row.original.hasFreeShipping && (
                        <Badge
                            variant="success"
                            size="sm"
                            className="flex items-center gap-1 font-semibold"
                            leftIcon={<Truck className="w-3 h-3" />}
                        >
                            <span>Gratis Ongkir</span>
                        </Badge>
                    )}
                </div>
                <span
                    className="text-xs"
                    style={{ color: "var(--color-text-tertiary)" }}
                >
                    {row.original.code}
                </span>
            </div>
        ),
        enableSorting: true,
    },
    {
        accessorKey: "email",
        header: "Kontak",
        cell: ({ row }) => (
            <div className="flex flex-col gap-1">
                <span
                    className="text-sm"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    {row.original.email || "-"}
                </span>
                <span
                    className="text-xs"
                    style={{ color: "var(--color-text-tertiary)" }}
                >
                    {row.original.phone || "-"}
                </span>
            </div>
        ),
    },
    {
        accessorKey: "cityName",
        header: "Lokasi",
        cell: ({ row }) => (
            <div className="flex items-start gap-2">
                <MapPin
                    className="w-4 h-4 mt-0.5 flex-shrink-0"
                    style={{ color: "var(--color-text-quaternary)" }}
                />
                <div className="flex flex-col gap-0.5">
                    <span
                        className="text-sm"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        {row.original.cityName || "-"}
                    </span>
                    <span
                        className="text-xs"
                        style={{ color: "var(--color-text-tertiary)" }}
                    >
                        {row.original.provinceName || "-"}
                    </span>
                </div>
            </div>
        ),
        enableSorting: true,
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
            <Badge
                variant={row.original.status === "active" ? "success" : "error"}
                size="sm"
            >
                {row.original.status}
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
                style={{ color: "var(--color-text-primary)" }}
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
                {row.original.status === "active" ? (
                    <Button
                        variant="info"
                        size="sm"
                        onClick={() => onView(row.original)}
                        leftIcon={<Eye className="w-4 h-4" />}
                        title="Lihat detail"
                    />
                ) : (
                    <Button
                        variant="success"
                        size="sm"
                        onClick={() => onActivate(row.original)}
                        leftIcon={<Zap className="w-4 h-4" />}
                        title="Aktivasi Outlet"
                    />
                )}
                <Button
                    variant="warning"
                    size="sm"
                    onClick={() => onEdit(row.original)}
                    leftIcon={<Edit className="w-4 h-4" />}
                    title="Edit outlet"
                />
                <Button
                    variant="danger"
                    size="sm"
                    onClick={() => onDelete(row.original)}
                    leftIcon={<Trash2 className="w-4 h-4" />}
                    title="Hapus outlet"
                />
            </div>
        ),
        enableSorting: false,
    },
];
