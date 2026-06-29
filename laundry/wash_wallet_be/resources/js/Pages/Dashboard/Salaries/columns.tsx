import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/Components/Badge";
import { Button } from "@/Components/Button";
import { Eye, Edit, Trash2, Users } from "lucide-react";
import { Salary } from "@/types";
import { formatDate } from "@/lib/utils";

const typeLabels: Record<string, string> = {
    daily: "Harian",
    monthly: "Bulanan",
    hourly: "Per Jam",
    once: "Sekali",
    overtime: "Lembur",
    allowance: "Tunjangan",
};

const typeVariants: Record<
    string,
    "info" | "primary" | "warning" | "secondary" | "success" | "error"
> = {
    daily: "info",
    monthly: "primary",
    hourly: "warning",
    once: "secondary",
    overtime: "error",
    allowance: "success",
};

export const createSalaryColumns = (
    onView: (salary: Salary) => void,
    onEdit: (salary: Salary) => void,
    onDelete: (salary: Salary) => void,
): ColumnDef<Salary>[] => [
    {
        accessorKey: "name",
        header: "Nama Komponen",
        cell: ({ row }) => (
            <div className="flex flex-col gap-1">
                <span
                    className="font-medium"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    {row.original.name}
                </span>
                {row.original.description && (
                    <span
                        className="text-xs line-clamp-1"
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
        accessorKey: "type",
        header: "Tipe",
        cell: ({ row }) => (
            <Badge
                variant={typeVariants[row.original.type] ?? "secondary"}
                size="sm"
            >
                {typeLabels[row.original.type] ?? row.original.type}
            </Badge>
        ),
        enableSorting: true,
    },
    {
        accessorKey: "employeeSalariesCount",
        header: "Karyawan",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <Users
                    className="w-4 h-4"
                    style={{ color: "var(--color-text-tertiary)" }}
                />
                <Badge
                    variant={
                        row.original.employeeSalariesCount > 0
                            ? "warning"
                            : "secondary"
                    }
                    size="sm"
                >
                    {row.original.employeeSalariesCount} Karyawan
                </Badge>
            </div>
        ),
        enableSorting: false,
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
                    title="Edit"
                />
                <Button
                    variant="danger"
                    size="sm"
                    onClick={() => onDelete(row.original)}
                    leftIcon={<Trash2 className="w-4 h-4" />}
                    title="Hapus"
                />
            </div>
        ),
        enableSorting: false,
    },
];
