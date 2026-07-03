import React, { useState, useMemo } from "react";
import { router } from "@inertiajs/react";
import { ColumnDef } from "@tanstack/react-table";
import { Card } from "@/Components/Card";
import { Button } from "@/Components/Button";
import { Badge } from "@/Components/Badge";
import Table from "@/Components/Table/Table";
import {
    ShoppingCart,
    Eye,
    Edit,
    Calendar,
    DollarSign,
    Package,
    AlertCircle,
    CheckCircle,
} from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Order } from "@/types";
import { CustomerOrdersIndexProps } from "./types";
import { customerService } from "@/Services/customer.service";

const CustomerOrders: React.FC<CustomerOrdersIndexProps> = ({ customer }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleViewOrder = (customerId: number, orderId: number) => {
        customerService.goToViewOrder(customerId, orderId);
    };

    const handleEditOrder = (orderId: number) => {
        router.visit(route("orders.edit", orderId));
    };
    const columns: ColumnDef<Order>[] = useMemo(
        () => [
            {
                accessorKey: "orderNumber",
                header: "Nomor Order",
                cell: ({ row }) => {
                    const order = row.original;
                    return (
                        <div className="space-y-1">
                            <div
                                className="font-mono font-semibold text-sm"
                                style={{ color: "var(--color-primary-600)" }}
                            >
                                {order.orderNumber}
                            </div>
                            <div
                                className="text-xs flex items-center gap-1"
                                style={{ color: "var(--color-text-tertiary)" }}
                            >
                                <Calendar className="w-3 h-3" />
                                {formatDate(order.orderDate)}
                            </div>
                        </div>
                    );
                },
                size: 180,
            },
            {
                accessorKey: "status",
                header: "Status",
                cell: ({ row }) => {
                    const order = row.original;
                    return (
                        <div className="space-y-2">
                            <Badge
                                variant={order.statusBadgeVariant || "default"}
                                className="font-medium"
                            >
                                <div className="flex items-center gap-1">
                                    {order.statusLabel}
                                </div>
                            </Badge>
                        </div>
                    );
                },
                size: 150,
            },
            {
                accessorKey: "paymentStatus",
                header: "Status Pembayaran",
                cell: ({ row }) => {
                    const order = row.original;
                    return (
                        <div className="space-y-2">
                            <Badge
                                variant={
                                    order.paymentStatusBadgeVariant || "default"
                                }
                                className="font-medium"
                            >
                                {order.paymentStatusLabel}
                            </Badge>
                        </div>
                    );
                },
            },
            {
                accessorKey: "orderItemsCount",
                header: "Items",
                cell: ({ row }) => {
                    const count = row.original.orderItemsCount || 0;
                    return (
                        <div className="text-center">
                            <div
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-medium"
                                style={{
                                    backgroundColor:
                                        "var(--color-surface-secondary)",
                                    color: "var(--color-text-primary)",
                                }}
                            >
                                <Package className="w-3 h-3" />
                                {count}
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
                    return (
                        <div className="space-y-1">
                            <div
                                className="font-semibold"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                {order.formattedTotalAmount ||
                                    formatCurrency(order.totalAmount)}
                            </div>
                            {order.paymentStatus !== "paid" &&
                                order.remainingAmount > 0 && (
                                    <div
                                        className="text-xs"
                                        style={{
                                            color: "var(--color-error-600)",
                                        }}
                                    >
                                        Sisa:{" "}
                                        {order.formattedRemainingAmount ||
                                            formatCurrency(
                                                order.remainingAmount
                                            )}
                                    </div>
                                )}
                        </div>
                    );
                },
                size: 150,
            },
            {
                accessorKey: "estimatedCompletion",
                header: "Estimasi Selesai",
                cell: ({ row }) => {
                    const order = row.original;
                    if (!order.estimatedCompletion) {
                        return (
                            <span
                                className="text-sm italic"
                                style={{ color: "var(--color-text-tertiary)" }}
                            >
                                Belum ditentukan
                            </span>
                        );
                    }

                    const isOverdue =
                        new Date(order.estimatedCompletion) < new Date() &&
                        !["completed", "delivered", "cancelled"].includes(
                            order.status
                        );

                    return (
                        <div className="space-y-1">
                            <div
                                className={`text-sm flex items-center gap-1 ${
                                    isOverdue ? "font-medium" : ""
                                }`}
                                style={{
                                    color: isOverdue
                                        ? "var(--color-error-600)"
                                        : "var(--color-text-secondary)",
                                }}
                            >
                                {order.formattedEstimatedCompletion ||
                                    formatDate(order.estimatedCompletion)}
                            </div>
                            {isOverdue && (
                                <Badge variant="error" size="sm">
                                    Terlambat
                                </Badge>
                            )}
                        </div>
                    );
                },
                size: 180,
            },
            {
                accessorKey: "employee",
                header: "Dilayani Oleh",
                cell: ({ row }) => {
                    const employee = row.original.employee;
                    if (!employee) {
                        return (
                            <span
                                className="text-sm italic"
                                style={{ color: "var(--color-text-tertiary)" }}
                            >
                                -
                            </span>
                        );
                    }
                    return (
                        <div
                            className="text-sm"
                            style={{ color: "var(--color-text-secondary)" }}
                        >
                            {employee.name}
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
                                onClick={() =>
                                    handleViewOrder(customer.id, order.id)
                                }
                                className="px-2"
                                title="Lihat Detail"
                                style={{ color: "var(--color-text-tertiary)" }}
                            >
                                <Eye className="w-4 h-4" />
                            </Button>
                            {!["cancelled", "completed"].includes(
                                order.status as string
                            ) && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditOrder(order.id)}
                                    className="px-2"
                                    title="Edit Order"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    <Edit className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    );
                },
                enableSorting: false,
                size: 120,
            },
        ],
        []
    );

    const summary = useMemo(() => {
        const totalOrders = customer.orders.length;
        const totalAmount = customer.orders.reduce(
            (sum, order) => sum + order.totalAmount,
            0
        );
        const paidAmount = customer.orders.reduce(
            (sum, order) => sum + order.paidAmount,
            0
        );
        const remainingAmount = customer.orders.reduce(
            (sum, order) => sum + order.remainingAmount,
            0
        );

        const statusCounts = customer.orders.reduce((acc, order) => {
            acc[order.status] = (acc[order.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return {
            totalOrders,
            totalAmount,
            paidAmount,
            remainingAmount,
            statusCounts,
        };
    }, [customer.orders]);

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Orders */}
                <Card variant="elevated" className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p
                                className="text-xs font-medium"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                Total Pesanan
                            </p>
                            <p
                                className="text-2xl font-bold mt-1"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                {summary.totalOrders}
                            </p>
                        </div>
                        <div
                            className="p-3 rounded-full"
                            style={{
                                backgroundColor: "var(--color-primary-100)",
                            }}
                        >
                            <ShoppingCart
                                className="w-5 h-5"
                                style={{ color: "var(--color-primary-600)" }}
                            />
                        </div>
                    </div>
                </Card>

                {/* Total Revenue */}
                <Card variant="elevated" className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p
                                className="text-xs font-medium"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                Total Transaksi
                            </p>
                            <p
                                className="text-lg font-bold mt-1"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                {formatCurrency(summary.totalAmount)}
                            </p>
                        </div>
                        <div
                            className="p-3 rounded-full"
                            style={{
                                backgroundColor: "var(--color-success-100)",
                            }}
                        >
                            <DollarSign
                                className="w-5 h-5"
                                style={{ color: "var(--color-success-600)" }}
                            />
                        </div>
                    </div>
                </Card>

                {/* Paid Amount */}
                <Card variant="elevated" className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p
                                className="text-xs font-medium"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                Sudah Dibayar
                            </p>
                            <p
                                className="text-lg font-bold mt-1"
                                style={{ color: "var(--color-success-600)" }}
                            >
                                {formatCurrency(summary.paidAmount)}
                            </p>
                        </div>
                        <div
                            className="p-3 rounded-full"
                            style={{
                                backgroundColor: "var(--color-success-100)",
                            }}
                        >
                            <CheckCircle
                                className="w-5 h-5"
                                style={{ color: "var(--color-success-600)" }}
                            />
                        </div>
                    </div>
                </Card>

                {/* Remaining Amount */}
                <Card variant="elevated" className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p
                                className="text-xs font-medium"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                Belum Dibayar
                            </p>
                            <p
                                className="text-lg font-bold mt-1"
                                style={{ color: "var(--color-error-600)" }}
                            >
                                {formatCurrency(summary.remainingAmount)}
                            </p>
                        </div>
                        <div
                            className="p-3 rounded-full"
                            style={{
                                backgroundColor: "var(--color-error-100)",
                            }}
                        >
                            <AlertCircle
                                className="w-5 h-5"
                                style={{ color: "var(--color-error-600)" }}
                            />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Orders Table */}
            <Card variant="elevated" className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div
                            className="p-2 rounded-lg"
                            style={{
                                backgroundColor: "var(--color-primary-100)",
                            }}
                        >
                            <ShoppingCart
                                className="w-5 h-5"
                                style={{ color: "var(--color-primary-600)" }}
                            />
                        </div>
                        <div>
                            <h3
                                className="text-lg font-semibold"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                Riwayat Pesanan
                            </h3>
                            <p
                                className="text-sm"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                Daftar semua pesanan dari {customer.name}
                            </p>
                        </div>
                    </div>
                </div>

                <Table
                    data={customer.orders}
                    columns={columns}
                    isLoading={isLoading}
                    enableSorting={true}
                    enablePagination={true}
                    pageSize={10}
                    emptyMessage={`Belum ada riwayat pesanan untuk ${customer.name}. Buat pesanan pertama untuk memulai.`}
                    className="w-full"
                />
            </Card>
        </div>
    );
};

export default CustomerOrders;
