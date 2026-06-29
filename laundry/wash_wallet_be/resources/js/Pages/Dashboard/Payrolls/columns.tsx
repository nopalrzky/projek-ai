import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/Components/Badge";
import { Button } from "@/Components/Button";
import { Eye, Pencil, Trash2, CreditCard } from "lucide-react";
import { Payroll } from "@/types";
import { formatDate } from "@/lib/utils";

export const createPayrollColumns = (
    onView: (payroll: Payroll) => void,
    onDelete: (payroll: Payroll) => void,
): ColumnDef<Payroll>[] => [
    {
        accessorKey: "transactionNumber",
        header: "No. Transaksi",
        cell: ({ row }) => (
            <div className="flex flex-col gap-1">
                <span
                    className="text-sm font-medium"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    {row.original.transactionNumber}
                </span>
            </div>
        ),
        enableSorting: true,
        size: 180,
    },
    {
        accessorKey: "employee.name",
        header: "Karyawan",
        cell: ({ row }) => (
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <span
                        className="text-sm font-medium"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        {row.original.employeeName}
                    </span>
                </div>
                <span
                    className="text-xs"
                    style={{ color: "var(--color-text-tertiary)" }}
                >
                    {row.original.outletName}
                </span>
            </div>
        ),
        enableSorting: false,
        size: 200,
    },
    {
        accessorKey: "periodLabel",
        header: "Periode Gaji",
        cell: ({ row }) => (
            <div className="flex flex-col gap-1">
                <span
                    className="text-sm"
                    style={{ color: "var(--color-text-secondary)" }}
                >
                    {row.original.periodLabel}
                </span>
            </div>
        ),
        enableSorting: false,
        size: 180,
    },
    {
        accessorKey: "netSalary",
        header: "Gaji Bersih",
        cell: ({ row }) => (
            <div className="flex flex-col gap-1">
                <span
                    className="text-sm font-semibold"
                    style={{ color: "var(--color-primary-600)" }}
                >
                    {row.original.formattedNetSalary}
                </span>
                <div className="flex items-center gap-1">
                    <span
                        className="text-xs"
                        style={{ color: "var(--color-text-tertiary)" }}
                    >
                        Kotor: {row.original.formattedGrossSalary}
                    </span>
                </div>
            </div>
        ),
        enableSorting: true,
        size: 160,
    },
    {
        accessorKey: "paymentDate",
        header: "Tgl Pembayaran",
        cell: ({ row }) => (
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1">
                    <span
                        className="text-sm"
                        style={{ color: "var(--color-text-secondary)" }}
                    >
                        {formatDate(row.original.paymentDate, "DD MMMM YYYY")}
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    <CreditCard
                        className="w-3 h-3"
                        style={{ color: "var(--color-text-tertiary)" }}
                    />
                    <span
                        className="text-xs"
                        style={{ color: "var(--color-text-tertiary)" }}
                    >
                        {row.original.paymentMethodLabel}
                    </span>
                </div>
            </div>
        ),
        enableSorting: true,
        size: 170,
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const statusConfig: Record<
                string,
                { variant: "warning" | "success" | "error"; label: string }
            > = {
                draft: { variant: "warning", label: "Draft" },
                paid: { variant: "success", label: "Lunas" },
                cancelled: { variant: "error", label: "Dibatalkan" },
            };

            const config =
                statusConfig[row.original.status] || statusConfig["draft"];

            return (
                <Badge variant={config.variant} size="sm">
                    {config.label}
                </Badge>
            );
        },
        enableSorting: true,
        size: 110,
    },
    {
        accessorKey: "bankAccount.name",
        header: "Sumber Dana",
        cell: ({ row }) => (
            <span
                className="text-sm"
                style={{ color: "var(--color-text-secondary)" }}
            >
                {row.original.bankAccountName}
            </span>
        ),
        enableSorting: false,
        size: 150,
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
                    variant="danger"
                    size="sm"
                    onClick={() => onDelete(row.original)}
                    leftIcon={<Trash2 className="w-4 h-4" />}
                    title="Hapus penggajian"
                    disabled={row.original.status !== "draft"}
                />
            </div>
        ),
        enableSorting: false,
        size: 120,
    },
];
