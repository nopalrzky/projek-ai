import React from "react";
import { Clock } from "lucide-react";
import { Badge } from "@/Components/Badge";
import { Card } from "@/Components/Card";
import { OrderPageHeaderProps } from "../types";

const OrderPageHeader: React.FC<OrderPageHeaderProps> = ({ order }) => {
    const getStatusColor = (status: string) => {
        const colors = {
            requested: "info",
            cancelled: "error",
            accepted: "primary",
            rejected: "error",
            picking_up: "warning",
            received: "info",
            weighing: "warning",
            ready_to_process: "info",
            in_progress: "primary",
            ready: "success",
            delivering: "warning",
            delivered: "success",
            completed: "success",
        } as const;
        return colors[status as keyof typeof colors] || "secondary";
    };

    const getPaymentStatusColor = (status: string) => {
        const colors = {
            not_yet_priced: "warning",
            unpaid: "error",
            partial: "warning",
            paid: "success",
            refunded: "info",
            paid_by_package: "success",
            cod: "info",
        } as const;
        return colors[status as keyof typeof colors] || "secondary";
    };

    return (
        <Card className="p-6">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-4">
                        <div className="flex-1">
                            <h1
                                className="text-2xl font-bold mb-2"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                Order #{order.orderNumber}
                            </h1>

                            <div className="flex flex-wrap items-center gap-3">
                                <Badge
                                    variant={getStatusColor(order.status)}
                                    size="md"
                                >
                                    {order.statusLabel}
                                </Badge>

                                <Badge
                                    variant={getPaymentStatusColor(
                                        order.paymentStatus,
                                    )}
                                    size="md"
                                >
                                    {order.paymentStatusLabel}
                                </Badge>

                                <div
                                    className="flex items-center gap-1.5 text-sm"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    <Clock className="w-4 h-4" />
                                    <span>{order.formattedOrderDate}</span>
                                </div>
                            </div>

                            <div
                                className="mt-3 text-sm"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                <p>
                                    <strong>Customer:</strong>{" "}
                                    {order.customer?.name} (
                                    {order.customer?.phone})
                                </p>
                                <p>
                                    <strong>Employee:</strong>{" "}
                                    {order.employee?.name}
                                </p>
                                {order.employee?.outlet && (
                                    <p>
                                        <strong>Outlet:</strong>{" "}
                                        {order.employee.outlet.name}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default OrderPageHeader;
