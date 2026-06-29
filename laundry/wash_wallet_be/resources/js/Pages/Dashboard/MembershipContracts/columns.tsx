import { ColumnDef } from "@tanstack/react-table";
import { Link } from "@inertiajs/react";
import { Badge } from "@/Components/Badge";
import { Button } from "@/Components/Button";
import { Eye, TrendingUp, Trash2, RefreshCw } from "lucide-react";
import { MembershipContract } from "@/types";
import { formatDate } from "@/lib/utils";

export const createMembershipContractColumns = (
    onView: (membershipContract: MembershipContract) => void,
    onDelete: (membershipContract: MembershipContract) => void,
): ColumnDef<MembershipContract>[] => [
    {
        accessorKey: "customer.name",
        header: "Customer",
        cell: ({ row }) => (
            <div className="flex flex-col gap-1">
                <Link
                    href={route("membership-contracts.show", row.original.id)}
                    className="font-medium hover:underline"
                    style={{ color: "var(--color-primary-600)" }}
                >
                    {row.original.customer.name}
                </Link>
                <div className="flex items-center gap-2">
                    <span
                        className="text-xs"
                        style={{ color: "var(--color-text-tertiary)" }}
                    >
                        {row.original.customer.phone || "-"}
                    </span>
                </div>
            </div>
        ),
        enableSorting: false,
    },
    {
        accessorKey: "membershipPlan.name",
        header: "Membership Plan",
        cell: ({ row }) => (
            <div className="flex flex-col gap-1">
                <span
                    className="text-sm font-medium"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    {row.original.membershipPlan.name}
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="info" size="sm">
                        {new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                        }).format(row.original.membershipPlan.price)}
                    </Badge>
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
                    {row.original.outlet.name}
                </span>
                <span
                    className="text-xs"
                    style={{ color: "var(--color-text-tertiary)" }}
                >
                    {row.original.outlet.code}
                </span>
            </div>
        ),
        enableSorting: false,
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const statusMap = {
                active: { variant: "success" as const, label: "Aktif" },
                expired: { variant: "error" as const, label: "Expired" },
                replaced: { variant: "warning" as const, label: "Diganti" },
                cancelled: { variant: "error" as const, label: "Dibatalkan" },
            };
            const status = statusMap[row.original.status] || {
                variant: "secondary" as const,
                label: row.original.status,
            };
            return <Badge variant={status.variant}>{status.label}</Badge>;
        },
        enableSorting: true,
    },
    {
        accessorKey: "startAt",
        header: "Periode",
        cell: ({ row }) => (
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <span
                        className="text-sm"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        {formatDate(row.original.startAt)}
                    </span>
                </div>
                {row.original.expiredAt && (
                    <>
                        <span
                            className="text-xs"
                            style={{ color: "var(--color-text-tertiary)" }}
                        >
                            s/d {formatDate(row.original.expiredAt)}
                        </span>
                        {row.original.daysRemaining !== null &&
                            row.original.daysRemaining !== undefined && (
                                <Badge
                                    variant={
                                        row.original.daysRemaining > 30
                                            ? "success"
                                            : row.original.daysRemaining > 7
                                              ? "warning"
                                              : "error"
                                    }
                                    size="sm"
                                >
                                    {row.original.daysRemaining > 0
                                        ? `${row.original.daysRemaining} hari lagi`
                                        : "Sudah expired"}
                                </Badge>
                            )}
                    </>
                )}
            </div>
        ),
        enableSorting: true,
    },
    {
        accessorKey: "totalPaid",
        header: "Total Bayar",
        cell: ({ row }) => (
            <div className="text-right">
                <span
                    className="text-sm font-semibold"
                    style={{ color: "var(--color-success-600)" }}
                >
                    {row.original.formattedTotalPaid}
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
                    variant="danger"
                    size="sm"
                    onClick={() => onDelete(row.original)}
                    leftIcon={<Trash2 className="w-4 h-4" />}
                    title="Hapus kontrak"
                    disabled={row.original.status === "active"}
                />
            </div>
        ),
        enableSorting: false,
    },
];
