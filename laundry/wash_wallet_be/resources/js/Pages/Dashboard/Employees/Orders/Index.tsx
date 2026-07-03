import React, { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Table } from "@/Components/Table";
import { Card } from "@/Components/Card";
import { Badge } from "@/Components/Badge";
import { Button } from "@/Components/Button";
import {
    ShoppingBag,
    Eye,
    DollarSign,
    TrendingUp,
    AlertCircle,
    CheckCircle,
    Clock,
    Package,
} from "lucide-react";
import { Order } from "@/types";
import { EmployeeOrdersIndexProps } from "./types";
import { formatCurrency, formatDate } from "@/lib/utils";
import orderService from "@/Services/order.service";

const EmployeeOrdersIndex: React.FC<EmployeeOrdersIndexProps> = ({
    employee,
    isLoading = false,
}) => {
    const handleViewOrder = (order: Order) => {
        orderService.goToView(order.id);
    };
    const getStatusBadge = (status: string) => {
        const variants: Record<
            string,
            { variant: any; label: string; icon: any }
        > = {
            requested: {
                variant: "warning",
                label: "Menunggu",
                icon: Clock,
            },
            in_progress: {
                variant: "primary",
                label: "Proses",
                icon: Package,
            },
            ready: {
                variant: "success",
                label: "Siap",
                icon: CheckCircle,
            },
            delivered: {
                variant: "success",
                label: "Selesai",
                icon: CheckCircle,
            },
            cancelled: {
                variant: "error",
                label: "Dibatalkan",
                icon: AlertCircle,
            },
            on_hold: {
                variant: "secondary",
                label: "Ditahan",
                icon: AlertCircle,
            },
        };
        return (
            variants[status] || {
                variant: "default",
                label: status,
                icon: AlertCircle,
            }
        );
    };

    const getPaymentStatusBadge = (paymentStatus: string) => {
        const variants: Record<
            string,
            { variant: any; label: string; icon: any }
        > = {
            unpaid: {
                variant: "error",
                label: "Belum Bayar",
                icon: AlertCircle,
            },
            partial: {
                variant: "warning",
                label: "Sebagian",
                icon: Clock,
            },
            paid: {
                variant: "success",
                label: "Lunas",
                icon: CheckCircle,
            },
            refunded: {
                variant: "secondary",
                label: "Refund",
                icon: TrendingUp,
            },
        };
        return (
            variants[paymentStatus] || {
                variant: "default",
                label: paymentStatus,
                icon: AlertCircle,
            }
        );
    };

    const statistics = useMemo(() => {
        const orders = employee.orders || [];
        const totalOrders = orders.length;
        const totalRevenue = orders.reduce(
            (sum, order) => sum + order.totalAmount,
            0,
        );
        const paidOrders = orders.filter(
            (o) => o.paymentStatus === "paid",
        ).length;
        const pendingOrders = orders.filter(
            (o) => o.status === "requested",
        ).length;
        const inProgressOrders = orders.filter(
            (o) => o.status === "in_progress",
        ).length;
        const completedOrders = orders.filter(
            (o) => o.status === "delivered" || o.status === "ready",
        ).length;

        return {
            totalOrders,
            totalRevenue,
            paidOrders,
            pendingOrders,
            inProgressOrders,
            completedOrders,
        };
    }, [employee.orders]);

    const columns: ColumnDef<Order>[] = useMemo(
        () => [
            {
                accessorKey: "orderNumber",
                header: "No. Order",
                cell: ({ row }) => {
                    const order = row.original;
                    const statusBadge = getStatusBadge(order.status);
                    const StatusIcon = statusBadge.icon;

                    return (
                        <div className="flex items-center gap-3">
                            <div className="space-y-1">
                                <div
                                    className="font-medium"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {order.orderNumber}
                                </div>
                                <Badge variant={statusBadge.variant} size="sm">
                                    {statusBadge.label}
                                </Badge>
                            </div>
                        </div>
                    );
                },
                size: 220,
            },

            {
                accessorKey: "customer",
                header: "Customer",
                cell: ({ row }) => {
                    const order = row.original;
                    const customer = order.customer;

                    return (
                        <div className="flex items-center gap-3">
                            <div className="space-y-1">
                                <div
                                    className="font-medium"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {customer?.name || "Unknown"}
                                </div>
                                {customer?.phone && (
                                    <div
                                        className="text-xs"
                                        style={{
                                            color: "var(--color-text-tertiary)",
                                        }}
                                    >
                                        {customer.phone}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                },
                size: 200,
            },

            {
                accessorKey: "orderDate",
                header: "Tanggal Order",
                cell: ({ row }) => {
                    const order = row.original;

                    return (
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span
                                    className="text-sm font-medium"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {formatDate(
                                        order.orderDate,
                                        "DD MMMM YYYY",
                                    )}
                                </span>
                            </div>
                            {order.estimatedCompletion && (
                                <div
                                    className="text-xs"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    Est:{" "}
                                    {formatDate(
                                        order.estimatedCompletion,
                                        "DD MMMM YYYY",
                                    )}
                                </div>
                            )}
                        </div>
                    );
                },
                size: 180,
            },

            {
                accessorKey: "orderItemsCount",
                header: "Items",
                cell: ({ row }) => {
                    const order = row.original;

                    return (
                        <div className="text-center">
                            <div
                                className="inline-flex items-center justify-center w-8 h-8 rounded-full font-semibold"
                                style={{
                                    backgroundColor: "var(--color-info-100)",
                                    color: "var(--color-info-700)",
                                }}
                            >
                                {order.orderItemsCount || 0}
                            </div>
                        </div>
                    );
                },
                size: 100,
            },

            {
                accessorKey: "totalAmount",
                header: "Total",
                cell: ({ row }) => {
                    const order = row.original;
                    const paymentStatusBadge = getPaymentStatusBadge(
                        order.paymentStatus,
                    );
                    const PaymentIcon = paymentStatusBadge.icon;

                    return (
                        <div className="space-y-2">
                            <div
                                className="font-bold text-lg"
                                style={{
                                    color: "var(--color-text-primary)",
                                }}
                            >
                                {formatCurrency(order.totalAmount)}
                            </div>
                            <Badge
                                variant={paymentStatusBadge.variant}
                                size="sm"
                            >
                                {paymentStatusBadge.label}
                            </Badge>
                        </div>
                    );
                },
                size: 180,
            },

            {
                accessorKey: "paidAmount",
                header: "Dibayar",
                cell: ({ row }) => {
                    const order = row.original;
                    const remainingAmount = order.remainingAmount || 0;

                    return (
                        <div className="space-y-1">
                            <div
                                className="font-semibold"
                                style={{
                                    color:
                                        remainingAmount > 0
                                            ? "var(--color-warning-600)"
                                            : "var(--color-success-600)",
                                }}
                            >
                                {formatCurrency(order.paidAmount)}
                            </div>
                            {remainingAmount > 0 && (
                                <div
                                    className="text-xs"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    Sisa: {formatCurrency(remainingAmount)}
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
                    const order = row.original;

                    return (
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewOrder(order)}
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
                size: 100,
            },
        ],
        [],
    );

    return (
        <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div
                            className="p-3 rounded-lg"
                            style={{
                                backgroundColor: "var(--color-primary-100)",
                            }}
                        >
                            <ShoppingBag
                                className="w-6 h-6"
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
                                Total Order
                            </p>
                            <p
                                className="text-2xl font-bold"
                                style={{
                                    color: "var(--color-text-primary)",
                                }}
                            >
                                {statistics.totalOrders}
                            </p>
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div
                            className="p-3 rounded-lg"
                            style={{
                                backgroundColor: "var(--color-success-100)",
                            }}
                        >
                            <DollarSign
                                className="w-6 h-6"
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
                                Total Revenue
                            </p>
                            <p
                                className="text-xl font-bold"
                                style={{
                                    color: "var(--color-success-600)",
                                }}
                            >
                                {formatCurrency(statistics.totalRevenue)}
                            </p>
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div
                            className="p-3 rounded-lg"
                            style={{
                                backgroundColor: "var(--color-warning-100)",
                            }}
                        >
                            <Clock
                                className="w-6 h-6"
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
                                Dalam Proses
                            </p>
                            <p
                                className="text-2xl font-bold"
                                style={{
                                    color: "var(--color-warning-600)",
                                }}
                            >
                                {statistics.inProgressOrders}
                            </p>
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div
                            className="p-3 rounded-lg"
                            style={{
                                backgroundColor: "var(--color-info-100)",
                            }}
                        >
                            <CheckCircle
                                className="w-6 h-6"
                                style={{
                                    color: "var(--color-info-600)",
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
                                Selesai
                            </p>
                            <p
                                className="text-2xl font-bold"
                                style={{
                                    color: "var(--color-text-primary)",
                                }}
                            >
                                {statistics.completedOrders}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Main Table Card */}
            <Card variant="elevated" className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{
                                backgroundColor: "var(--color-primary-100)",
                            }}
                        >
                            <ShoppingBag
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
                                Daftar Order ({employee.ordersCount || 0})
                            </h3>
                            <p
                                className="text-sm"
                                style={{
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                Order yang di-handle oleh {employee.name}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <Table
                    data={employee.orders || []}
                    columns={columns}
                    isLoading={isLoading}
                    enableSorting={true}
                    enablePagination={true}
                    enableRowSelection={false}
                    emptyMessage="Belum ada order untuk karyawan ini."
                    pageSize={10}
                    rows={5}
                    className="w-full"
                />
            </Card>
        </div>
    );
};

export default EmployeeOrdersIndex;
