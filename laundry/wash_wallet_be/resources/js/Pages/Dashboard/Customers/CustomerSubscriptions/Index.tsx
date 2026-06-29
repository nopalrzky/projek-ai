import React, { useState, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Card } from "@/Components/Card";
import { Button } from "@/Components/Button";
import { Badge } from "@/Components/Badge";
import { Table } from "@/Components/Table";
import { Package, Plus, Eye, AlertCircle, ShoppingBag } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import { CustomerSubscriptionsIndexProps } from "./types";
import { CustomerSubscription } from "@/types";
import { customerService } from "@/Services/customer.service";

const CustomerSubscriptionsIndex: React.FC<CustomerSubscriptionsIndexProps> = ({
    customer,
}) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleViewSubscription = (subscriptionId: number) => {
        customerService.goToViewCustomerSubscription(
            customer.id,
            subscriptionId,
        );
    };

    console.log(customer.customerSubscriptions);

    const handleCreateSubscription = () => {
        customerService.goToCreateCustomerSubscription(customer.id);
    };

    const columns: ColumnDef<CustomerSubscription>[] = useMemo(
        () => [
            {
                accessorKey: "servicePackage",
                header: "Paket Layanan",
                cell: ({ row }) => {
                    const subscription = row.original;
                    const pkg = subscription.servicePackage;

                    return (
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <Package
                                    className="w-4 h-4"
                                    style={{
                                        color: "var(--color-primary-500)",
                                    }}
                                />
                                <span
                                    className="font-semibold"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {pkg?.name || "Unknown Package"}
                                </span>
                            </div>
                            {pkg?.description && (
                                <p
                                    className="text-xs line-clamp-1"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    {pkg.description}
                                </p>
                            )}
                            <div
                                className="text-xs font-mono"
                                style={{
                                    color: "var(--color-text-tertiary)",
                                }}
                            >
                                #{subscription.subscriptionCode}
                            </div>
                        </div>
                    );
                },
                size: 280,
            },
            {
                accessorKey: "status",
                header: "Status",
                cell: ({ row }) => {
                    const subscription = row.original;
                    return (
                        <Badge
                            variant={subscription.statusBadgeVariant}
                            className="font-medium"
                        >
                            <div className="flex items-center gap-1">
                                {subscription.statusLabel}
                            </div>
                        </Badge>
                    );
                },
                size: 120,
            },
            {
                accessorKey: "pricePaid",
                header: "Harga Dibayar",
                cell: ({ row }) => {
                    const subscription = row.original;

                    return (
                        <div className="space-y-1">
                            <div
                                className="font-semibold"
                                style={{ color: "var(--color-success-600)" }}
                            >
                                {formatCurrency(subscription.pricePaid)}
                            </div>
                        </div>
                    );
                },
                size: 150,
            },
            {
                accessorKey: "purchaseDate",
                header: "Tanggal Beli",
                cell: ({ row }) => {
                    const subscription = row.original;
                    return (
                        <div className="space-y-1">
                            <div
                                className="text-sm flex items-center gap-1"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                {formatDate(subscription.purchaseDate)}
                            </div>
                            {subscription.expiredAt && (
                                <div
                                    className="text-xs"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    Berlaku s/d{" "}
                                    {formatDate(subscription.expiredAt)}
                                </div>
                            )}
                            {!subscription.expiredAt && (
                                <div
                                    className="text-xs"
                                    style={{
                                        color: "var(--color-success-600)",
                                    }}
                                >
                                    Tidak terbatas
                                </div>
                            )}
                        </div>
                    );
                },
                size: 300,
            },
            {
                id: "actions",
                header: "Aksi",
                cell: ({ row }) => {
                    const subscription = row.original;

                    return (
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                    handleViewSubscription(subscription.id)
                                }
                                className="px-2"
                                tooltip="Lihat Detail"
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

    return (
        <div className="space-y-6">
            {/* Expiring Soon Warning */}
            {customer.customerSubscriptions?.some(
                (s) =>
                    s.status === "active" &&
                    s.remainingDays != null &&
                    s.remainingDays <= 7 &&
                    s.remainingDays > 0,
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
                                Paket Akan Berakhir
                            </h4>
                            <p
                                className="text-sm"
                                style={{ color: "var(--color-warning-600)" }}
                            >
                                Ada paket deposit yang akan berakhir dalam 7
                                hari ke depan. Pastikan {customer.name}{" "}
                                menggunakan kuota sebelum masa berlaku habis.
                            </p>
                        </div>
                    </div>
                </Card>
            )}

            {/* Subscriptions Table */}
            <Card variant="elevated" className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div
                            className="p-2 rounded-lg"
                            style={{
                                backgroundColor: "var(--color-primary-100)",
                            }}
                        >
                            <ShoppingBag
                                className="w-5 h-5"
                                style={{ color: "var(--color-primary-600)" }}
                            />
                        </div>
                        <div>
                            <h3
                                className="text-lg font-semibold"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                Riwayat Paket Deposit
                            </h3>
                            <p
                                className="text-sm"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                Daftar semua paket deposit {customer.name}
                            </p>
                        </div>
                    </div>

                    <Button
                        variant="primary"
                        onClick={handleCreateSubscription}
                        leftIcon={<Plus className="w-4 h-4" />}
                    >
                        Beli Paket
                    </Button>
                </div>

                <Table
                    data={customer.customerSubscriptions || []}
                    columns={columns}
                    isLoading={isLoading}
                    enableSorting={true}
                    enablePagination={true}
                    pageSize={10}
                    emptyMessage={`${customer.name} belum memiliki paket deposit. Beli paket deposit pertama untuk mendapatkan harga lebih hemat.`}
                    className="w-full"
                />
            </Card>
        </div>
    );
};

export default CustomerSubscriptionsIndex;
