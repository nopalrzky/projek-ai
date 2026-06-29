import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/Components/Button";
import {
    Eye,
    Edit,
    Trash2,
    Calendar,
    DollarSign,
    Building2,
    User,
} from "lucide-react";
import { Prive } from "@/types";

export const createPriveColumns = (
    onView: (prive: Prive) => void,
    onEdit: (prive: Prive) => void,
    onDelete: (prive: Prive) => void,
): ColumnDef<Prive>[] => [
    {
        accessorKey: "date",
        header: "Tanggal",
        cell: ({ row }) => (
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <Calendar
                        className="w-4 h-4"
                        style={{ color: "var(--color-text-tertiary)" }}
                    />
                    <span
                        className="text-sm font-medium"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        {row.original.formattedDate}
                    </span>
                </div>
                <span
                    className="text-xs"
                    style={{ color: "var(--color-text-tertiary)" }}
                >
                    {new Date(row.original.date).toLocaleDateString("id-ID", {
                        weekday: "long",
                    })}
                </span>
            </div>
        ),
        enableSorting: true,
    },
    {
        accessorKey: "amount",
        header: "Jumlah",
        cell: ({ row }) => (
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <DollarSign
                        className="w-4 h-4"
                        style={{ color: "var(--color-success-600)" }}
                    />
                    <span
                        className="text-base font-semibold"
                        style={{ color: "var(--color-success-600)" }}
                    >
                        {row.original.formattedAmount}
                    </span>
                </div>
            </div>
        ),
        enableSorting: true,
    },
    {
        accessorKey: "outlet.name",
        header: "Outlet",
        cell: ({ row }) => (
            <div className="flex items-start gap-2">
                <Building2
                    className="w-4 h-4 mt-0.5 flex-shrink-0"
                    style={{ color: "var(--color-text-tertiary)" }}
                />
                <div className="flex flex-col gap-1">
                    <span
                        className="text-sm font-medium"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        {row.original.outlet?.name || row.original.outletName}
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
        accessorKey: "user.name",
        header: "Owner",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <User
                    className="w-4 h-4"
                    style={{ color: "var(--color-text-tertiary)" }}
                />
                <span
                    className="text-sm"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    {row.original.user?.name || row.original.ownerName}
                </span>
            </div>
        ),
        enableSorting: false,
    },
    {
        accessorKey: "sourceAccount.name",
        header: "Akun Sumber",
        cell: ({ row }) => (
            <div className="flex flex-col gap-1">
                <span
                    className="text-sm font-medium"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    {row.original.sourceAccount?.name ||
                        row.original.sourceAccountName}
                </span>
                <span
                    className="text-xs"
                    style={{ color: "var(--color-text-tertiary)" }}
                >
                    {row.original.sourceAccount?.code || "-"}
                </span>
            </div>
        ),
        enableSorting: false,
    },
    {
        accessorKey: "equityAccount.name",
        header: "Akun Modal",
        cell: ({ row }) => (
            <div className="flex flex-col gap-1">
                <span
                    className="text-sm font-medium"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    {row.original.equityAccount?.name ||
                        row.original.equityAccountName}
                </span>
                <span
                    className="text-xs"
                    style={{ color: "var(--color-text-tertiary)" }}
                >
                    {row.original.equityAccount?.code || "-"}
                </span>
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
                    title="Edit prive"
                />
                <Button
                    variant="danger"
                    size="sm"
                    onClick={() => onDelete(row.original)}
                    leftIcon={<Trash2 className="w-4 h-4" />}
                    title="Hapus prive"
                />
            </div>
        ),
        enableSorting: false,
    },
];
