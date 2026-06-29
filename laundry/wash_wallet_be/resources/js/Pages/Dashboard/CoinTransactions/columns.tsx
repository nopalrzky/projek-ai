import { ColumnDef } from "@tanstack/react-table";
import { Link } from "@inertiajs/react";
import { Badge } from "@/Components/Badge";
import { Button } from "@/Components/Button";
import {
    Eye,
    User,
    Building2,
    TrendingUp,
    TrendingDown,
    Calendar,
} from "lucide-react";
import { CoinTransaction } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

const TYPE_VARIANTS: Record<
    string,
    "success" | "primary" | "error" | "warning" | "secondary"
> = {
    topup: "success",
    commission: "primary",
    deduction: "error",
    refund: "warning",
};

const POSITIVE_TYPES = new Set(["topup", "commission", "refund"]);

export const createCoinTransactionColumns = (
    onView: (transaction: CoinTransaction) => void,
): ColumnDef<CoinTransaction>[] => [
    {
        accessorKey: "transactionNumber",
        header: "No. Transaksi",
        cell: ({ row }) => (
            <div className="flex flex-col gap-1">
                <Link
                    href={route("coin-transactions.show", row.original.id)}
                    className="text-sm font-semibold hover:underline font-mono"
                    style={{ color: "var(--color-primary-600)" }}
                >
                    {row.original.transactionNumber || `#${row.original.id}`}
                </Link>
                <div className="flex items-center gap-1">
                    <Calendar
                        className="w-3 h-3"
                        style={{ color: "var(--color-text-tertiary)" }}
                    />
                    <span
                        className="text-xs"
                        style={{ color: "var(--color-text-tertiary)" }}
                    >
                        {formatDate(row.original.createdAt)}
                    </span>
                </div>
            </div>
        ),
        enableSorting: true,
    },
    {
        accessorKey: "user.name",
        header: "Pengguna",
        cell: ({ row }) => (
            <div className="flex items-start gap-2">
                <User
                    className="w-4 h-4 mt-0.5 flex-shrink-0"
                    style={{ color: "var(--color-text-tertiary)" }}
                />
                <div className="flex flex-col gap-1">
                    <span
                        className="text-sm font-medium"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        {row.original.user?.name || "-"}
                    </span>
                    {row.original.user?.email && (
                        <span
                            className="text-xs"
                            style={{ color: "var(--color-text-tertiary)" }}
                        >
                            {row.original.user.email}
                        </span>
                    )}
                </div>
            </div>
        ),
        enableSorting: false,
    },
    {
        accessorKey: "outlet.name",
        header: "Outlet",
        cell: ({ row }) => {
            if (!row.original.outlet) {
                return (
                    <span
                        className="text-sm italic"
                        style={{ color: "var(--color-text-tertiary)" }}
                    >
                        Global
                    </span>
                );
            }
            return (
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
                            {row.original.outlet.name}
                        </span>
                        <span
                            className="text-xs"
                            style={{ color: "var(--color-text-tertiary)" }}
                        >
                            {row.original.outlet.code}
                        </span>
                    </div>
                </div>
            );
        },
        enableSorting: false,
    },
    {
        accessorKey: "type",
        header: "Tipe",
        cell: ({ row }) => (
            <Badge
                variant={TYPE_VARIANTS[row.original.type] || "secondary"}
                size="sm"
            >
                {row.original.typeLabel}
            </Badge>
        ),
        enableSorting: true,
    },
    {
        accessorKey: "amount",
        header: "Jumlah",
        cell: ({ row }) => {
            const isPositive = POSITIVE_TYPES.has(row.original.type);

            return (
                <div className="flex items-center gap-1">
                    {isPositive ? (
                        <TrendingUp
                            className="w-4 h-4"
                            style={{ color: "var(--color-success-600)" }}
                        />
                    ) : (
                        <TrendingDown
                            className="w-4 h-4"
                            style={{ color: "var(--color-error-600)" }}
                        />
                    )}
                    <span
                        className="text-sm font-bold"
                        style={{
                            color: isPositive
                                ? "var(--color-success-600)"
                                : "var(--color-error-600)",
                        }}
                    >
                        {isPositive ? "+" : "-"}
                        {formatCurrency(row.original.amount)}
                    </span>
                </div>
            );
        },
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
                        -
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
            </div>
        ),
        enableSorting: false,
    },
];
