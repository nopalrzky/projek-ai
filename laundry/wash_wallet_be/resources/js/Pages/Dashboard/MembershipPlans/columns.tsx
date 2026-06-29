import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/Components/Badge";
import { Button } from "@/Components/Button";
import { Eye, Edit, Trash2 } from "lucide-react";
import { MembershipPlan } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

export const createMembershipPlanColumns = (
    onView: (plan: MembershipPlan) => void,
    onEdit: (plan: MembershipPlan) => void,
    onDelete: (plan: MembershipPlan) => void,
): ColumnDef<MembershipPlan>[] => [
    {
        accessorKey: "name",
        header: "Nama Paket",
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
                <span
                    className="text-sm font-medium"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    {row.original.outlet?.name}
                </span>
                <span
                    className="text-xs"
                    style={{ color: "var(--color-text-tertiary)" }}
                >
                    {row.original.outlet?.code}
                </span>
            </div>
        ),
        enableSorting: false,
    },
    {
        accessorKey: "price",
        header: "Harga",
        cell: ({ row }) => (
            <span
                className="text-sm font-semibold"
                style={{ color: "var(--color-primary-600)" }}
            >
                {formatCurrency(row.original.price)}
            </span>
        ),
        enableSorting: true,
    },
    {
        accessorKey: "durationDays",
        header: "Durasi",
        cell: ({ row }) => (
            <div className="flex flex-col gap-1">
                <span
                    className="text-sm font-medium"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    {row.original.durationDays} hari
                </span>
                <span
                    className="text-xs"
                    style={{ color: "var(--color-text-tertiary)" }}
                >
                    ±{Math.round(row.original.durationDays / 30)} bulan
                </span>
            </div>
        ),
        enableSorting: true,
    },
    {
        accessorKey: "discountPercentage",
        header: "Diskon",
        cell: ({ row }) => (
            <Badge
                variant={
                    row.original.discountPercentage > 0 ? "success" : "default"
                }
                size="sm"
            >
                {row.original.discountPercentage}%
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
                    title="Edit paket"
                />
                <Button
                    variant="danger"
                    size="sm"
                    onClick={() => onDelete(row.original)}
                    leftIcon={<Trash2 className="w-4 h-4" />}
                    title="Hapus paket"
                    disabled={
                        (row.original.activeMembershipContractsCount || 0) > 0
                    }
                />
            </div>
        ),
        enableSorting: false,
    },
];
