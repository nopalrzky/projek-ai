import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/Components/Badge";
import { Button } from "@/Components/Button";
import { Eye, Edit, Trash2, User, Mail, Phone } from "lucide-react";
import { Employee } from "@/types";
import { formatDate } from "@/lib/utils";

export const createEmployeeColumns = (
    onView: (employee: Employee) => void,
    onEdit: (employee: Employee) => void,
    onDelete: (employee: Employee) => void,
): ColumnDef<Employee>[] => [
    {
        accessorKey: "name",
        header: "Karyawan",
        cell: ({ row }) => (
            <div className="flex items-center gap-3">
                {row.original.avatar ? (
                    <img
                        src={row.original.avatar}
                        alt={row.original.name}
                        className="w-10 h-10 rounded-full object-cover border-2"
                        style={{ borderColor: "var(--color-border)" }}
                    />
                ) : (
                    <div
                        className="w-10 h-10 rounded-full flex items-center justify-center border-2"
                        style={{
                            backgroundColor: "var(--color-primary-100)",
                            borderColor: "var(--color-border)",
                        }}
                    >
                        <User
                            className="w-5 h-5"
                            style={{ color: "var(--color-primary-600)" }}
                        />
                    </div>
                )}
                <div className="flex flex-col gap-1">
                    <span
                        className="text-sm font-medium"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        {row.original.name}
                    </span>
                    <span
                        className="text-xs"
                        style={{ color: "var(--color-text-tertiary)" }}
                    >
                        @{row.original.username}
                    </span>
                </div>
            </div>
        ),
        enableSorting: true,
    },
    {
        accessorKey: "email",
        header: "Kontak",
        cell: ({ row }) => (
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <Mail
                        className="w-3.5 h-3.5"
                        style={{ color: "var(--color-text-tertiary)" }}
                    />
                    <span
                        className="text-xs"
                        style={{ color: "var(--color-text-secondary)" }}
                    >
                        {row.original.email ?? "-"}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <Phone
                        className="w-3.5 h-3.5"
                        style={{ color: "var(--color-text-tertiary)" }}
                    />
                    <span
                        className="text-xs"
                        style={{ color: "var(--color-text-secondary)" }}
                    >
                        {row.original.phone ?? "-"}
                    </span>
                </div>
            </div>
        ),
        enableSorting: false,
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
        accessorKey: "gender",
        header: "Gender",
        cell: ({ row }) => (
            <Badge
                variant={row.original.gender === "male" ? "info" : "secondary"}
                size="sm"
            >
                {row.original.gender === "male" ? "Laki-laki" : "Perempuan"}
            </Badge>
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
        accessorKey: "startDate",
        header: "Mulai Kerja",
        cell: ({ row }) => (
            <div className="flex flex-col gap-1">
                <span
                    className="text-sm"
                    style={{ color: "var(--color-text-secondary)" }}
                >
                    {formatDate(row.original.startDate, "DD MMMM YYYY")}
                </span>
                {row.original.lastLoginAt && (
                    <span
                        className="text-xs"
                        style={{ color: "var(--color-text-tertiary)" }}
                    >
                        Login:{" "}
                        {formatDate(row.original.lastLoginAt, "DD/MM/YYYY")}
                    </span>
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
                    title="Edit karyawan"
                />
                <Button
                    variant="danger"
                    size="sm"
                    onClick={() => onDelete(row.original)}
                    leftIcon={<Trash2 className="w-4 h-4" />}
                    title="Hapus karyawan"
                />
            </div>
        ),
        enableSorting: false,
    },
];
