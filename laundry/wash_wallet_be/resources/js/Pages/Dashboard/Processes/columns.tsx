import { ColumnDef } from "@tanstack/react-table";
import { Link } from "@inertiajs/react";
import { Badge } from "@/Components/Badge";
import { Button } from "@/Components/Button";
import { Eye, Edit, Trash2, Package, Users } from "lucide-react";
import { Process } from "@/types";

export const createProcessColumns = (
    onView: (process: Process) => void,
    onEdit: (process: Process) => void,
    onDelete: (process: Process) => void,
): ColumnDef<Process>[] => [
    {
        accessorKey: "name",
        header: "Nama Proses",
        cell: ({ row }) => (
            <div className="flex flex-col gap-1">
                <Link
                    href={route("processes.show", row.original.id)}
                    className="text-sm font-semibold hover:underline"
                    style={{ color: "var(--color-primary-600)" }}
                >
                    {row.original.name}
                </Link>
                {row.original.description && (
                    <span
                        className="text-xs line-clamp-1"
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
        header: "Layanan Terkait",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <Package
                    className="w-4 h-4"
                    style={{ color: "var(--color-text-tertiary)" }}
                />
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
        accessorKey: "employeesCount",
        header: "Karyawan Terkait",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <Users
                    className="w-4 h-4"
                    style={{ color: "var(--color-text-tertiary)" }}
                />
                <span
                    className="text-sm font-medium"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    {row.original.employeesCount || 0} karyawan
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
                    title="Edit proses"
                />
                <Button
                    variant="danger"
                    size="sm"
                    onClick={() => onDelete(row.original)}
                    leftIcon={<Trash2 className="w-4 h-4" />}
                    title="Hapus proses"
                />
            </div>
        ),
        enableSorting: false,
    },
];
