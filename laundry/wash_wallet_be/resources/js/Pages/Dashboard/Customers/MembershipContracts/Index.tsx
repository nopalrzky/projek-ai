import React, { useState, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Card } from "@/Components/Card";
import { Button } from "@/Components/Button";
import { Badge } from "@/Components/Badge";
import { Table } from "@/Components/Table";
import {
    Star,
    Plus,
    Eye,
    AlertCircle,
    CheckCircle,
    TrendingUp,
    Package,
    Award,
} from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import { CustomerMembershipContractsIndexProps } from "./types";
import { MembershipContract } from "@/types";
import { customerService } from "@/Services/customer.service";

const CustomerMembershipContractsIndex: React.FC<
    CustomerMembershipContractsIndexProps
> = ({ customer }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleViewContract = (membershipContractId: number) => {
        customerService.goToViewMembershipContract(membershipContractId);
    };

    const handleCreateContract = () => {
        customerService.goToCreateMembershipContract(customer.id);
    };

    const getStatusBadgeVariant = (status: string) => {
        const statusMap: Record<
            string,
            "success" | "warning" | "error" | "info" | "secondary"
        > = {
            active: "success",
            expired: "error",
            replaced: "secondary",
            cancelled: "error",
        };
        return statusMap[status.toLowerCase()] || "secondary";
    };

    const formatStatusLabel = (status: string) => {
        const statusLabels: Record<string, string> = {
            active: "Aktif",
            expired: "Kadaluarsa",
            replaced: "Diganti",
            cancelled: "Dibatalkan",
        };
        return statusLabels[status.toLowerCase()] || status;
    };

    const getDaysRemainingBadge = (
        daysRemaining: number | null | undefined,
    ) => {
        if (
            daysRemaining === null ||
            daysRemaining === undefined ||
            daysRemaining < 0
        ) {
            return (
                <Badge variant="error" size="sm">
                    Kadaluarsa
                </Badge>
            );
        }

        if (daysRemaining === 0) {
            return (
                <Badge variant="warning" size="sm">
                    Hari ini
                </Badge>
            );
        }

        if (daysRemaining <= 7) {
            return (
                <Badge variant="warning" size="sm">
                    {daysRemaining} hari lagi
                </Badge>
            );
        }

        if (daysRemaining <= 30) {
            return (
                <Badge variant="info" size="sm">
                    {daysRemaining} hari lagi
                </Badge>
            );
        }

        return (
            <Badge variant="success" size="sm">
                {daysRemaining} hari lagi
            </Badge>
        );
    };

    const columns: ColumnDef<MembershipContract>[] = useMemo(
        () => [
            {
                accessorKey: "plan",
                header: "Paket Membership",
                cell: ({ row }) => {
                    const contract = row.original;
                    const plan = contract.membershipPlan;

                    return (
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <Star
                                    className="w-4 h-4"
                                    style={{
                                        color: "var(--color-warning-500)",
                                    }}
                                />
                                <span
                                    className="font-semibold"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {plan?.name || "Unknown Plan"}
                                </span>
                            </div>
                            {plan?.description && (
                                <p
                                    className="text-xs"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    {plan.description}
                                </p>
                            )}
                        </div>
                    );
                },
                size: 250,
            },
            {
                accessorKey: "status",
                header: "Status",
                cell: ({ row }) => {
                    const contract = row.original;
                    return (
                        <Badge
                            variant={getStatusBadgeVariant(contract.status)}
                            className="font-medium"
                        >
                            <div className="flex items-center gap-1">
                                {formatStatusLabel(contract.status)}
                            </div>
                        </Badge>
                    );
                },
                size: 130,
            },
            {
                accessorKey: "period",
                header: "Periode",
                cell: ({ row }) => {
                    const contract = row.original;
                    return (
                        <div className="space-y-1">
                            <div
                                className="text-sm flex items-center gap-1"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                {formatDate(contract.startAt)}
                            </div>
                            <div
                                className="text-xs"
                                style={{ color: "var(--color-text-tertiary)" }}
                            >
                                s/d {formatDate(contract.expiredAt)}
                            </div>
                        </div>
                    );
                },
                size: 180,
            },
            {
                accessorKey: "daysRemaining",
                header: "Sisa Waktu",
                cell: ({ row }) => {
                    const contract = row.original;
                    return (
                        <div className="space-y-1">
                            {getDaysRemainingBadge(contract.daysRemaining)}
                            {contract.status === "active" &&
                                contract.daysRemaining != null &&
                                contract.daysRemaining <= 30 && (
                                    <div
                                        className="text-xs flex items-center gap-1"
                                        style={{
                                            color: "var(--color-warning-600)",
                                        }}
                                    >
                                        <AlertCircle className="w-3 h-3" />
                                        Segera habis
                                    </div>
                                )}
                        </div>
                    );
                },
                size: 150,
            },
            {
                accessorKey: "discountAmount",
                header: "Diskon",
                cell: ({ row }) => {
                    const contract = row.original;
                    const discount = contract.discountAmount || 0;

                    return (
                        <div className="text-center">
                            <div
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-semibold"
                                style={{
                                    backgroundColor: "var(--color-success-50)",
                                    color: "var(--color-success-700)",
                                }}
                            >
                                <Award className="w-3 h-3" />
                                {discount}%
                            </div>
                        </div>
                    );
                },
                size: 100,
            },
            {
                accessorKey: "totalPaid",
                header: "Total Dibayar",
                cell: ({ row }) => {
                    const contract = row.original;
                    return (
                        <div
                            className="font-semibold"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            {formatCurrency(contract.totalPaid)}
                        </div>
                    );
                },
                size: 150,
            },
            {
                id: "actions",
                header: "Aksi",
                cell: ({ row }) => {
                    const contract = row.original;

                    return (
                        <div className="flex items-center gap-2">
                            <Button
                                variant="info"
                                size="sm"
                                onClick={() => handleViewContract(contract.id)}
                                className="px-2"
                                title="Lihat Detail"
                            >
                                <Eye className="w-4 h-4" />
                            </Button>
                        </div>
                    );
                },
                enableSorting: false,
                size: 80,
            },
        ],
        [],
    );

    const summary = useMemo(() => {
        const totalContracts = customer.membershipContracts.length;
        const activeContracts = customer.membershipContracts.filter(
            (c) => c.status === "active",
        ).length;
        const expiredContracts = customer.membershipContracts.filter(
            (c) => c.status === "expired",
        ).length;
        const totalSpent = customer.membershipContracts.reduce(
            (sum, contract) => sum + parseFloat(contract.totalPaid.toString()),
            0,
        );

        const activeContractsList = customer.membershipContracts.filter(
            (c) => c.status === "active",
        );
        const currentDiscount =
            activeContractsList.length > 0
                ? Math.max(
                      ...activeContractsList.map((c) => c.discountAmount || 0),
                  )
                : 0;

        return {
            totalContracts,
            activeContracts,
            expiredContracts,
            totalSpent,
            currentDiscount,
        };
    }, [customer.membershipContracts]);

    return (
        <div className="space-y-6">
            {summary.activeContracts > 0 && (
                <Card variant="elevated" className="p-4 border-2">
                    <div className="flex items-start gap-3">
                        <div
                            className="p-2 rounded-full"
                            style={{
                                backgroundColor: "var(--color-success-100)",
                            }}
                        >
                            <CheckCircle
                                className="w-5 h-5"
                                style={{ color: "var(--color-success-600)" }}
                            />
                        </div>
                        <div className="flex-1">
                            <h4
                                className="font-semibold mb-1"
                                style={{ color: "var(--color-success-700)" }}
                            >
                                Membership Aktif
                            </h4>
                            <p
                                className="text-sm"
                                style={{ color: "var(--color-success-600)" }}
                            >
                                {customer.name} memiliki{" "}
                                {summary.activeContracts} kontrak membership
                                aktif dengan diskon hingga{" "}
                                {summary.currentDiscount}% untuk setiap
                                transaksi.
                            </p>
                        </div>
                    </div>
                </Card>
            )}

            {customer.membershipContracts.some(
                (c) =>
                    c.status === "active" &&
                    c.daysRemaining != null &&
                    c.daysRemaining <= 30 &&
                    c.daysRemaining > 0,
            ) && (
                <Card variant="elevated" className="p-4 border-2">
                    <div className="flex items-start gap-3">
                        <div
                            className="p-2 rounded-full"
                            style={{
                                backgroundColor: "var(--color-warning-100)",
                            }}
                        >
                            <AlertCircle
                                className="w-5 h-5"
                                style={{ color: "var(--color-warning-600)" }}
                            />
                        </div>
                        <div className="flex-1">
                            <h4
                                className="font-semibold mb-1"
                                style={{ color: "var(--color-warning-700)" }}
                            >
                                Membership Akan Berakhir
                            </h4>
                            <p
                                className="text-sm"
                                style={{ color: "var(--color-warning-600)" }}
                            >
                                Ada kontrak membership yang akan berakhir dalam
                                30 hari ke depan. Perpanjang sekarang untuk
                                tetap mendapatkan benefit membership.
                            </p>
                        </div>
                    </div>
                </Card>
            )}

            <Card variant="elevated" className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div
                            className="p-2 rounded-lg"
                            style={{
                                backgroundColor: "var(--color-primary-100)",
                            }}
                        >
                            <Star
                                className="w-5 h-5"
                                style={{ color: "var(--color-primary-600)" }}
                            />
                        </div>
                        <div>
                            <h3
                                className="text-lg font-semibold"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                Riwayat Membership
                            </h3>
                            <p
                                className="text-sm"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                Daftar semua kontrak membership {customer.name}
                            </p>
                        </div>
                    </div>

                    <Button
                        variant="primary"
                        onClick={handleCreateContract}
                        leftIcon={<Plus className="w-4 h-4" />}
                    >
                        Beli Membership
                    </Button>
                </div>

                <Table
                    data={customer.membershipContracts}
                    columns={columns}
                    isLoading={isLoading}
                    enableSorting={true}
                    enablePagination={true}
                    pageSize={10}
                    emptyMessage={`${customer.name} belum memiliki membership. Beli paket membership pertama untuk mendapatkan diskon dan benefit eksklusif.`}
                    className="w-full"
                />
            </Card>
        </div>
    );
};

export default CustomerMembershipContractsIndex;
