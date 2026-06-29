import React, { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Table } from "@/Components/Table";
import { Card } from "@/Components/Card";
import { Badge } from "@/Components/Badge";
import { Button } from "@/Components/Button";
import { Users, Eye, Calendar, TrendingUp } from "lucide-react";
import { CustomerSubscription } from "@/types";
import { CustomerSubscriptionsIndexProps } from "./types";

const CustomerSubscriptionsIndex: React.FC<CustomerSubscriptionsIndexProps> = ({
    servicePackage,
}) => {
    const columns: ColumnDef<CustomerSubscription>[] = useMemo(
        () => [
            {
                accessorKey: "subscriptionCode",
                header: "Kode Langganan",
                cell: ({ row }) => {
                    const subscription = row.original;
                    return (
                        <div className="space-y-1">
                            <div
                                className="font-medium"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                {subscription.subscriptionCode}
                            </div>
                            <div
                                className="text-xs"
                                style={{ color: "var(--color-text-tertiary)" }}
                            >
                                Dibeli:{" "}
                                {new Date(
                                    subscription.purchaseDate,
                                ).toLocaleDateString("id-ID", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                })}
                            </div>
                        </div>
                    );
                },
                size: 200,
            },
            {
                accessorKey: "customer.name",
                header: "Pelanggan",
                cell: ({ row }) => {
                    const subscription = row.original;
                    return (
                        <div className="flex items-center space-x-3">
                            <div
                                className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                                style={{
                                    backgroundColor: "var(--color-primary-100)",
                                    color: "var(--color-primary-600)",
                                }}
                            >
                                {subscription.customer?.name
                                    .charAt(0)
                                    .toUpperCase()}
                            </div>
                            <div>
                                <p
                                    className="font-medium"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {subscription.customer?.name}
                                </p>
                                <p
                                    className="text-sm"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    {subscription.customer?.phone}
                                </p>
                            </div>
                        </div>
                    );
                },
                size: 250,
            },
            {
                accessorKey: "pricePaid",
                header: "Harga Dibayar",
                cell: ({ row }) => {
                    const pricePaid = row.original.pricePaid;
                    return (
                        <div
                            className="font-semibold"
                            style={{ color: "var(--color-success-600)" }}
                        >
                            {new Intl.NumberFormat("id-ID", {
                                style: "currency",
                                currency: "IDR",
                            }).format(pricePaid)}
                        </div>
                    );
                },
                size: 150,
            },
            {
                accessorKey: "status",
                header: "Status",
                cell: ({ row }) => {
                    const status = row.original.status;
                    return (
                        <Badge
                            variant={
                                status === "active"
                                    ? "success"
                                    : status === "expired"
                                      ? "error"
                                      : "warning"
                            }
                        >
                            {status === "active"
                                ? "Aktif"
                                : status === "expired"
                                  ? "Kedaluwarsa"
                                  : "Kuota Habis"}
                        </Badge>
                    );
                },
                size: 120,
            },
            {
                accessorKey: "expiredAt",
                header: "Masa Berlaku",
                cell: ({ row }) => {
                    const subscription = row.original;
                    const expiredAt = subscription.expiredAt;
                    const remainingDays = subscription.remainingDays;

                    return (
                        <div className="space-y-1">
                            <div
                                className="text-sm flex items-center gap-1"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                <Calendar className="w-3 h-3" />
                                {expiredAt
                                    ? new Date(expiredAt).toLocaleDateString(
                                          "id-ID",
                                          {
                                              day: "2-digit",
                                              month: "short",
                                              year: "numeric",
                                          },
                                      )
                                    : "Tidak terbatas"}
                            </div>
                            {remainingDays !== null &&
                                remainingDays !== undefined && (
                                    <div
                                        className="text-xs"
                                        style={{
                                            color:
                                                remainingDays < 7
                                                    ? "var(--color-error-600)"
                                                    : remainingDays < 30
                                                      ? "var(--color-warning-600)"
                                                      : "var(--color-success-600)",
                                        }}
                                    >
                                        {remainingDays === 0
                                            ? "Berakhir hari ini"
                                            : `${remainingDays} hari lagi`}
                                    </div>
                                )}
                        </div>
                    );
                },
                size: 150,
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
                                className="px-2"
                                title="Lihat Detail"
                                style={{
                                    color: "var(--color-text-tertiary)",
                                }}
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

    const activeSubscriptions =
        servicePackage.customerSubscriptions?.filter(
            (s) => s.status === "active",
        ) || [];
    const expiredSubscriptions =
        servicePackage.customerSubscriptions?.filter(
            (s) => s.status === "expired",
        ) || [];
    const exhaustedSubscriptions =
        servicePackage.customerSubscriptions?.filter(
            (s) => s.status === "exhausted",
        ) || [];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card variant="elevated" className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p
                                className="text-sm"
                                style={{
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                Langganan Aktif
                            </p>
                            <p
                                className="text-2xl font-bold mt-1"
                                style={{
                                    color: "var(--color-text-primary)",
                                }}
                            >
                                {activeSubscriptions.length}
                            </p>
                        </div>
                        <div
                            className="w-12 h-12 rounded-full flex items-center justify-center"
                            style={{
                                backgroundColor: "var(--color-success-100)",
                            }}
                        >
                            <Users
                                className="w-6 h-6"
                                style={{
                                    color: "var(--color-success-600)",
                                }}
                            />
                        </div>
                    </div>
                </Card>

                <Card variant="elevated" className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p
                                className="text-sm"
                                style={{
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                Kuota Habis
                            </p>
                            <p
                                className="text-2xl font-bold mt-1"
                                style={{
                                    color: "var(--color-text-primary)",
                                }}
                            >
                                {exhaustedSubscriptions.length}
                            </p>
                        </div>
                        <div
                            className="w-12 h-12 rounded-full flex items-center justify-center"
                            style={{
                                backgroundColor: "var(--color-warning-100)",
                            }}
                        >
                            <TrendingUp
                                className="w-6 h-6"
                                style={{
                                    color: "var(--color-warning-600)",
                                }}
                            />
                        </div>
                    </div>
                </Card>

                <Card variant="elevated" className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p
                                className="text-sm"
                                style={{
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                Kedaluwarsa
                            </p>
                            <p
                                className="text-2xl font-bold mt-1"
                                style={{
                                    color: "var(--color-text-primary)",
                                }}
                            >
                                {expiredSubscriptions.length}
                            </p>
                        </div>
                        <div
                            className="w-12 h-12 rounded-full flex items-center justify-center"
                            style={{
                                backgroundColor: "var(--color-error-100)",
                            }}
                        >
                            <Calendar
                                className="w-6 h-6"
                                style={{
                                    color: "var(--color-error-600)",
                                }}
                            />
                        </div>
                    </div>
                </Card>
            </div>

            <Card variant="elevated" className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{
                                backgroundColor: "var(--color-primary-100)",
                            }}
                        >
                            <Users
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
                                Pelanggan yang Berlangganan (
                                {servicePackage.customerSubscriptions?.length ||
                                    0}
                                )
                            </h3>
                            <p
                                className="text-sm"
                                style={{
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                Daftar pelanggan yang berlangganan paket{" "}
                                {servicePackage.name}
                            </p>
                        </div>
                    </div>
                </div>

                <Table
                    data={servicePackage.customerSubscriptions || []}
                    columns={columns}
                    isLoading={false}
                    enableSorting={true}
                    enablePagination={true}
                    enableRowSelection={false}
                    emptyMessage="Belum ada pelanggan yang berlangganan paket ini. Mulai menjual paket untuk mendapatkan pelanggan pertama."
                    pageSize={10}
                    rows={5}
                    className="w-full"
                />
            </Card>
        </div>
    );
};

export default CustomerSubscriptionsIndex;
