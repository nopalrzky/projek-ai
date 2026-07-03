import React, { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Table } from "@/Components/Table";
import { Card } from "@/Components/Card";
import { Badge } from "@/Components/Badge";
import { Button } from "@/Components/Button";
import {
    Calendar,
    Eye,
    User,
    Phone,
    Mail,
    Clock,
    CheckCircle2,
    XCircle,
} from "lucide-react";
import { MembershipContract } from "@/types";
import { MembershipPlanContractsProps } from "./types";
import { router } from "@inertiajs/react";
import { format, differenceInDays, isPast, isFuture } from "date-fns";
import { id as localeId } from "date-fns/locale";

const MembershipContractsIndex: React.FC<MembershipPlanContractsProps> = ({
    membershipPlan,
    isLoading = false,
}) => {
    const handleViewContract = (contractId: number) => {
        router.visit(route("membership-contracts.show", contractId));
    };

    const handleViewCustomer = (customerId: number) => {
        router.visit(route("customers.show", customerId));
    };

    const getStatusBadge = (contract: MembershipContract) => {
        const now = new Date();
        const expiredAt = new Date(contract.expiredAt);

        if (contract.status === "cancelled") {
            return (
                <Badge variant="error" size="sm">
                    Dibatalkan
                </Badge>
            );
        }

        if (contract.status === "replaced") {
            return (
                <Badge variant="secondary" size="sm">
                    Diganti
                </Badge>
            );
        }

        if (isPast(expiredAt)) {
            return (
                <Badge variant="error" size="sm">
                    Kadaluarsa
                </Badge>
            );
        }

        const daysRemaining = differenceInDays(expiredAt, now);

        if (daysRemaining <= 7) {
            return (
                <Badge variant="warning" size="sm">
                    {daysRemaining} hari lagi
                </Badge>
            );
        }

        return (
            <Badge variant="success" size="sm">
                Aktif
            </Badge>
        );
    };

    const columns: ColumnDef<MembershipContract>[] = useMemo(
        () => [
            {
                accessorKey: "customer",
                header: "Pelanggan",
                cell: ({ row }) => {
                    const contract = row.original;
                    const customer = contract.customer;

                    return (
                        <div className="space-y-1">
                            <div
                                className="font-medium"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                {customer.name}
                            </div>
                            {customer.gender && (
                                <div
                                    className="text-xs"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    {customer.gender === "male"
                                        ? "Laki-laki"
                                        : "Perempuan"}
                                </div>
                            )}
                        </div>
                    );
                },
                size: 200,
            },
            {
                accessorKey: "contact",
                header: "Kontak",
                cell: ({ row }) => {
                    const customer = row.original.customer;
                    return (
                        <div className="space-y-1">
                            {customer.phone && (
                                <div
                                    className="text-sm flex items-center gap-1"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    <Phone className="w-3 h-3" />
                                    <span>{customer.phone}</span>
                                </div>
                            )}
                            {customer.email && (
                                <div
                                    className="text-sm flex items-center gap-1"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    <Mail className="w-3 h-3" />
                                    <span className="truncate max-w-[200px]">
                                        {customer.email}
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                },
                size: 220,
            },
            {
                accessorKey: "startAt",
                header: "Mulai",
                cell: ({ row }) => {
                    const startAt = new Date(row.original.startAt);
                    return (
                        <div className="space-y-1">
                            <div
                                className="text-sm font-medium"
                                style={{
                                    color: "var(--color-text-primary)",
                                }}
                            >
                                {format(startAt, "dd MMM yyyy", {
                                    locale: localeId,
                                })}
                            </div>
                            <div
                                className="text-xs"
                                style={{
                                    color: "var(--color-text-tertiary)",
                                }}
                            >
                                {format(startAt, "HH:mm")}
                            </div>
                        </div>
                    );
                },
                size: 130,
            },
            {
                accessorKey: "expiredAt",
                header: "Berakhir",
                cell: ({ row }) => {
                    const expiredAt = new Date(row.original.expiredAt);
                    const now = new Date();
                    const daysRemaining = differenceInDays(expiredAt, now);

                    return (
                        <div className="space-y-1">
                            <div
                                className="text-sm font-medium"
                                style={{
                                    color: "var(--color-text-primary)",
                                }}
                            >
                                {format(expiredAt, "dd MMM yyyy", {
                                    locale: localeId,
                                })}
                            </div>
                            {!isPast(expiredAt) && (
                                <div
                                    className="text-xs"
                                    style={{
                                        color:
                                            daysRemaining <= 7
                                                ? "var(--color-warning-600)"
                                                : "var(--color-text-tertiary)",
                                    }}
                                >
                                    {daysRemaining} hari lagi
                                </div>
                            )}
                        </div>
                    );
                },
                size: 130,
            },
            {
                accessorKey: "totalPaid",
                header: "Total Bayar",
                cell: ({ row }) => {
                    const totalPaid = row.original.totalPaid;
                    return (
                        <div className="flex items-center gap-1">
                            <span
                                className="text-sm font-semibold"
                                style={{
                                    color: "var(--color-success-600)",
                                }}
                            >
                                {row.original.formattedTotalPaid}
                            </span>
                        </div>
                    );
                },
                size: 150,
            },
            {
                accessorKey: "status",
                header: "Status",
                cell: ({ row }) => {
                    return getStatusBadge(row.original);
                },
                size: 140,
            },
            {
                id: "actions",
                header: "Aksi",
                cell: ({ row }) => {
                    const contract = row.original;

                    return (
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewContract(contract.id)}
                                className="px-2"
                                title="Lihat Detail Kontrak"
                                style={{
                                    color: "var(--color-text-tertiary)",
                                }}
                            >
                                <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                    handleViewCustomer(contract.customerId)
                                }
                                className="px-2"
                                title="Lihat Detail Pelanggan"
                                style={{
                                    color: "var(--color-text-tertiary)",
                                }}
                            >
                                <User className="w-4 h-4" />
                            </Button>
                        </div>
                    );
                },
                enableSorting: false,
                size: 120,
            },
        ],
        [],
    );

    const stats = useMemo(() => {
        const contracts = membershipPlan.membershipContracts || [];
        const now = new Date();

        const active = contracts.filter((c) => {
            const expiredAt = new Date(c.expiredAt);
            return (
                c.status === "active" &&
                isFuture(expiredAt) &&
                !isPast(expiredAt)
            );
        }).length;

        const expired = contracts.filter((c) => {
            const expiredAt = new Date(c.expiredAt);
            return isPast(expiredAt) || c.status === "expired";
        }).length;

        const expiringSoon = contracts.filter((c) => {
            if (c.status !== "active") return false;
            const expiredAt = new Date(c.expiredAt);
            const daysRemaining = differenceInDays(expiredAt, now);
            return daysRemaining <= 7 && daysRemaining >= 0;
        }).length;

        return { total: contracts.length, active, expired, expiringSoon };
    }, [membershipPlan.membershipContracts]);

    return (
        <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card variant="elevated" className="p-4">
                    <div className="flex items-center gap-3">
                        <div
                            className="p-3 rounded-lg"
                            style={{
                                backgroundColor: "var(--color-primary-100)",
                            }}
                        >
                            <Calendar
                                className="w-5 h-5"
                                style={{
                                    color: "var(--color-primary-600)",
                                }}
                            />
                        </div>
                        <div>
                            <p
                                className="text-sm"
                                style={{
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                Total Kontrak
                            </p>
                            <p
                                className="text-2xl font-bold"
                                style={{
                                    color: "var(--color-text-primary)",
                                }}
                            >
                                {stats.total}
                            </p>
                        </div>
                    </div>
                </Card>

                <Card variant="elevated" className="p-4">
                    <div className="flex items-center gap-3">
                        <div
                            className="p-3 rounded-lg"
                            style={{
                                backgroundColor: "var(--color-success-100)",
                            }}
                        >
                            <CheckCircle2
                                className="w-5 h-5"
                                style={{
                                    color: "var(--color-success-600)",
                                }}
                            />
                        </div>
                        <div>
                            <p
                                className="text-sm"
                                style={{
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                Aktif
                            </p>
                            <p
                                className="text-2xl font-bold"
                                style={{
                                    color: "var(--color-success-600)",
                                }}
                            >
                                {stats.active}
                            </p>
                        </div>
                    </div>
                </Card>

                <Card variant="elevated" className="p-4">
                    <div className="flex items-center gap-3">
                        <div
                            className="p-3 rounded-lg"
                            style={{
                                backgroundColor: "var(--color-warning-100)",
                            }}
                        >
                            <Clock
                                className="w-5 h-5"
                                style={{
                                    color: "var(--color-warning-600)",
                                }}
                            />
                        </div>
                        <div>
                            <p
                                className="text-sm"
                                style={{
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                Akan Berakhir
                            </p>
                            <p
                                className="text-2xl font-bold"
                                style={{
                                    color: "var(--color-warning-600)",
                                }}
                            >
                                {stats.expiringSoon}
                            </p>
                        </div>
                    </div>
                </Card>

                <Card variant="elevated" className="p-4">
                    <div className="flex items-center gap-3">
                        <div
                            className="p-3 rounded-lg"
                            style={{
                                backgroundColor: "var(--color-error-100)",
                            }}
                        >
                            <XCircle
                                className="w-5 h-5"
                                style={{
                                    color: "var(--color-error-600)",
                                }}
                            />
                        </div>
                        <div>
                            <p
                                className="text-sm"
                                style={{
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                Kadaluarsa
                            </p>
                            <p
                                className="text-2xl font-bold"
                                style={{
                                    color: "var(--color-error-600)",
                                }}
                            >
                                {stats.expired}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Main Table */}
            <Card variant="elevated" className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{
                                backgroundColor: "var(--color-primary-100)",
                            }}
                        >
                            <Calendar
                                className="w-5 h-5"
                                style={{
                                    color: "var(--color-primary-600)",
                                }}
                            />
                        </div>
                        <div>
                            <h3
                                className="text-lg font-semibold"
                                style={{
                                    color: "var(--color-text-primary)",
                                }}
                            >
                                Daftar Kontrak Member ({stats.total})
                            </h3>
                            <p
                                className="text-sm"
                                style={{
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                Pelanggan yang berlangganan{" "}
                                {membershipPlan.name}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <Table
                    data={membershipPlan.membershipContracts || []}
                    columns={columns}
                    isLoading={isLoading}
                    enableSorting={true}
                    enablePagination={true}
                    emptyMessage="Belum ada pelanggan yang berlangganan paket membership ini. Kontrak member akan muncul di sini ketika ada pelanggan yang mendaftar."
                    pageSize={10}
                    rows={5}
                    className="w-full"
                />
            </Card>
        </div>
    );
};

export default MembershipContractsIndex;
