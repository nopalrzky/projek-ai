import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/Components/Badge";
import { Button } from "@/Components/Button";
import { Eye, Edit, Trash2 } from "lucide-react";
import { Loan } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

export const createLoanColumns = (
    onView: (loan: Loan) => void,
    onEdit: (loan: Loan) => void,
    onDelete: (loan: Loan) => void,
): ColumnDef<Loan>[] => [
    {
        accessorKey: "employee.name",
        header: "Karyawan",
        cell: ({ row }) => (
            <div className="flex flex-col gap-1">
                <span
                    className="text-sm font-medium"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    {row.original.employee?.name}
                </span>
                <span
                    className="text-xs"
                    style={{ color: "var(--color-text-tertiary)" }}
                >
                    {row.original.outlet?.name}
                </span>
            </div>
        ),
        enableSorting: false,
    },
    {
        accessorKey: "amount",
        header: "Nominal Kasbon",
        cell: ({ row }) => (
            <div className="flex flex-col gap-1">
                <span
                    className="text-sm font-semibold"
                    style={{ color: "var(--color-primary-600)" }}
                >
                    {formatCurrency(row.original.amount)}
                </span>
                <div className="flex items-center gap-1">
                    <span
                        className="text-xs"
                        style={{ color: "var(--color-text-tertiary)" }}
                    >
                        Sisa: {formatCurrency(row.original.remainingAmount)}
                    </span>
                </div>
            </div>
        ),
        enableSorting: true,
    },
    {
        accessorKey: "repaymentType",
        header: "Jenis Pembayaran",
        cell: ({ row }) => (
            <div className="flex flex-col gap-1">
                <Badge
                    variant={
                        row.original.repaymentType === "full"
                            ? "info"
                            : "warning"
                    }
                    size="sm"
                >
                    {row.original.repaymentType === "full"
                        ? "Sekaligus"
                        : "Cicilan"}
                </Badge>
                {row.original.repaymentType === "installment" && (
                    <span
                        className="text-xs"
                        style={{ color: "var(--color-text-tertiary)" }}
                    >
                        {formatCurrency(row.original.installmentAmount)} x{" "}
                        {row.original.totalInstallments}
                    </span>
                )}
            </div>
        ),
        enableSorting: true,
    },
    {
        accessorKey: "loanDate",
        header: "Tanggal Kasbon",
        cell: ({ row }) => (
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1">
                    <span
                        className="text-sm"
                        style={{ color: "var(--color-text-secondary)" }}
                    >
                        {formatDate(row.original.loanDate, "DD MMMM YYYY")}
                    </span>
                </div>
                {row.original.dueDate && (
                    <span
                        className="text-xs"
                        style={{ color: "var(--color-text-tertiary)" }}
                    >
                        Jatuh tempo:{" "}
                        {formatDate(row.original.dueDate, "DD MMMM YYYY")}
                    </span>
                )}
            </div>
        ),
        enableSorting: true,
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const statusConfig = {
                ongoing: { label: "Berjalan", variant: "warning" as const },
                paid: { label: "Lunas", variant: "success" as const },
                bad_debt: { label: "Macet", variant: "error" as const },
            };

            const config =
                statusConfig[row.original.status] || statusConfig["ongoing"];

            return (
                <Badge variant={config.variant} size="sm">
                    {config.label}
                </Badge>
            );
        },
        enableSorting: true,
    },
    {
        accessorKey: "sourceAccount.name",
        header: "Sumber Dana",
        cell: ({ row }) => (
            <span
                className="text-sm"
                style={{ color: "var(--color-text-secondary)" }}
            >
                {row.original.sourceAccount?.name ?? "-"}
            </span>
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
                    title="Edit kasbon"
                    disabled={row.original.status !== "ongoing"}
                />
                <Button
                    variant="danger"
                    size="sm"
                    onClick={() => onDelete(row.original)}
                    leftIcon={<Trash2 className="w-4 h-4" />}
                    title="Hapus kasbon"
                    disabled={
                        row.original.status !== "ongoing" ||
                        row.original.remainingAmount < row.original.amount
                    }
                />
            </div>
        ),
        enableSorting: false,
    },
];
