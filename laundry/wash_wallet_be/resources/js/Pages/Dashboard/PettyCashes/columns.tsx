import { ColumnDef } from "@tanstack/react-table";
import { PettyCash } from "@/types";
import { Badge } from "@/Components/Badge";
import { Button } from "@/Components/Button";
import {
    Building2,
    Calendar,
    CheckCircle,
    Clock,
    Eye,
    Trash,
    User,
    XCircle,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export const createPettyCashColumns = (
    onView: (pettyCash: PettyCash) => void,
    onApprove: (pettyCash: PettyCash) => void,
    onReject: (pettyCash: PettyCash) => void,
    onDelete: (pettyCash: PettyCash) => void,
): ColumnDef<PettyCash>[] => [
    {
        accessorKey: "code",
        header: "Kode Permintaan",
        cell: ({ row }) => (
            <div className="flex flex-col gap-1">
                <span className="font-medium text-foreground">
                    {row.original.code}
                </span>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(row.original.requestDate, "short")}</span>
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
                <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="font-medium text-sm truncate">
                        {row.original.outlet?.name || "-"}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                        {row.original.outlet?.code || "-"}
                    </span>
                </div>
            </div>
        ),
        enableSorting: false,
    },
    {
        accessorKey: "cashier",
        header: "Kasir",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">
                    {row.original.cashier?.name || "-"}
                </span>
            </div>
        ),
        enableSorting: false,
    },
    {
        accessorKey: "description",
        header: "Deskripsi",
        cell: ({ row }) => (
            <span className="text-sm text-muted-foreground line-clamp-2">
                {row.original.description || "-"}
            </span>
        ),
        enableSorting: false,
    },
    {
        accessorKey: "amount",
        header: "Jumlah",
        cell: ({ row }) => (
            <span className="font-semibold text-foreground">
                {formatCurrency(row.original.amount)}
            </span>
        ),
        enableSorting: true,
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const statusConfig = {
                pending: {
                    variant: "warning" as const,
                    label: "Menunggu",
                    icon: Clock,
                },
                approved: {
                    variant: "success" as const,
                    label: "Disetujui",
                    icon: CheckCircle,
                },
                rejected: {
                    variant: "error" as const,
                    label: "Ditolak",
                    icon: XCircle,
                },
            };

            const config =
                statusConfig[row.original.status as keyof typeof statusConfig];

            return (
                <Badge variant={config.variant} size="sm">
                    {config.label}
                </Badge>
            );
        },
        enableSorting: true,
    },
    {
        id: "actions",
        header: "Aksi",
        cell: ({ row }) => {
            const isPending = row.original.status === "pending";

            return (
                <div className="flex items-center gap-2">
                    {isPending && (
                        <>
                            <Button
                                variant="success"
                                size="sm"
                                onClick={() => onApprove(row.original)}
                            >
                                <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="danger"
                                size="sm"
                                onClick={() => onReject(row.original)}
                            >
                                <XCircle className="w-4 h-4" />
                            </Button>
                        </>
                    )}
                    <Button
                        variant="info"
                        size="sm"
                        onClick={() => onView(row.original)}
                    >
                        <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="danger"
                        size="sm"
                        onClick={() => onDelete(row.original)}
                        disabled={row.original.status === "approved"}
                    >
                        <Trash className="w-4 h-4" />
                    </Button>
                </div>
            );
        },
        enableSorting: false,
    },
];
