import React, { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Table } from "@/Components/Table";
import { Card } from "@/Components/Card";
import { Badge } from "@/Components/Badge";
import { ListOrdered } from "lucide-react";
import { LaundryServiceOrderItemsIndexProps } from "./types";
import { OrderItem } from "@/types";
import { formatDate } from "@/lib/utils";

const LaundryServiceOrderItemsIndex: React.FC<LaundryServiceOrderItemsIndexProps> = ({
    laundryService,
    isLoading = false,
}) => {
    const items = laundryService.orderItems || [];

    const columns: ColumnDef<OrderItem>[] = useMemo(
        () => [
            {
                accessorKey: "order.orderNumber",
                header: "Order & Tanggal",
                cell: ({ row }) => {
                    const item = row.original;
                    const orderNumber = item.order?.orderNumber || "-";
                    const orderDate = item.createdAt;

                    return (
                        <div className="space-y-1">
                            <div
                                className="font-medium"
                                style={{ color: "var(--color-primary-600)" }}
                            >
                                {orderNumber}
                            </div>
                            <div
                                className="text-xs"
                                style={{ color: "var(--color-text-tertiary)" }}
                            >
                                {formatDate(orderDate)}
                            </div>
                        </div>
                    );
                },
                size: 200,
            },
            {
                accessorKey: "order.customer.name",
                header: "Pelanggan",
                cell: ({ row }) => {
                    const customerName = row.original.order?.customer?.name || "Pelanggan Tidak Diketahui";
                    
                    return (
                        <div
                            className="font-medium"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            {customerName}
                        </div>
                    );
                },
                size: 200,
            },
            {
                accessorKey: "quantity",
                header: "Kuantitas",
                cell: ({ row }) => {
                    const quantity = row.original.quantity;
                    const unitSymbol = laundryService.unit?.symbol || "";
                    
                    return (
                        <div
                            className="font-semibold"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            {quantity} {unitSymbol}
                        </div>
                    );
                },
                size: 150,
            },
            {
                accessorKey: "totalAmount",
                header: "Total",
                cell: ({ row }) => {
                    const formattedTotal = row.original.formattedTotalAmount;
                    
                    return (
                        <div
                            className="font-semibold"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            {formattedTotal}
                        </div>
                    );
                },
                size: 150,
            },
            {
                accessorKey: "status",
                header: "Status",
                cell: ({ row }) => {
                    const statusLabel = row.original.statusLabel;
                    const status = row.original.status;
                    
                    // Assign variant based on typical order item statuses
                    let variant: "default" | "success" | "warning" | "info" = "default";
                    if (status === "done") variant = "success";
                    else if (status === "processing") variant = "warning";
                    else if (status === "pending") variant = "info";

                    return (
                        <Badge variant={variant}>
                            {statusLabel || status}
                        </Badge>
                    );
                },
                size: 150,
            },
        ],
        [laundryService.unit?.symbol]
    );

    return (
        <div className="space-y-6">
            <Card variant="elevated" className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{
                                backgroundColor: "var(--color-primary-100)",
                            }}
                        >
                            <ListOrdered
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
                                Order Terbaru ({laundryService.orderItemsCount ?? 0})
                            </h3>
                            <p
                                className="text-sm"
                                style={{
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                Menampilkan order terbaru untuk layanan ini (Maks. 20)
                            </p>
                        </div>
                    </div>
                </div>

                <Table
                    data={items}
                    columns={columns}
                    isLoading={isLoading}
                    enableSorting={false}
                    enablePagination={false}
                    enableRowSelection={false}
                    emptyMessage="Belum ada order untuk layanan ini."
                    className="w-full"
                />
            </Card>
        </div>
    );
};

export default LaundryServiceOrderItemsIndex;
