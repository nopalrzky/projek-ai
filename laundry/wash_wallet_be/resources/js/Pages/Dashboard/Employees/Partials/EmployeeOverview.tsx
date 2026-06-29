import { Card } from "@/Components/Card";
import { Badge } from "@/Components/Badge";
import { EmployeeOverviewProps } from "../types";
import { formatCurrency } from "@/lib/utils";

export default function EmployeeOverview({ employee }: EmployeeOverviewProps) {
    const activePositions = employee.employeePositions ?? [];
    const recentOrders = employee.orders ?? [];

    const getStatusBadgeVariant = (status: string) => {
        const variants: { [key: string]: any } = {
            pending: "warning",
            in_progress: "info",
            ready: "success",
            delivered: "success",
            cancelled: "error",
            on_hold: "secondary",
        };
        return variants[status] || "secondary";
    };

    const getPaymentStatusBadgeVariant = (paymentStatus: string) => {
        const variants: { [key: string]: any } = {
            paid: "success",
            partial: "warning",
            unpaid: "error",
            refunded: "secondary",
        };
        return variants[paymentStatus] || "secondary";
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card variant="elevated" className="p-6">
                    <h3
                        className="text-lg font-semibold mb-4"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        Posisi Aktif
                    </h3>
                    <div className="space-y-3">
                        {activePositions.length > 0 ? (
                            activePositions.map((employeePosition) => (
                                <div
                                    key={employeePosition.id}
                                    className="flex items-center justify-between p-3 rounded-lg transition-colors duration-200"
                                    style={{
                                        backgroundColor: "var(--color-gray-50)",
                                        border: "1px solid var(--color-border-light)",
                                    }}
                                >
                                    <div className="flex-1">
                                        <p
                                            className="font-medium mb-1"
                                            style={{
                                                color: "var(--color-text-primary)",
                                            }}
                                        >
                                            {employeePosition.position.name}
                                        </p>
                                        <p
                                            className="text-sm"
                                            style={{
                                                color: "var(--color-text-secondary)",
                                            }}
                                        >
                                            {
                                                employeePosition.position
                                                    .description
                                            }
                                        </p>
                                    </div>
                                    <Badge variant="success" size="sm">
                                        Aktif
                                    </Badge>
                                </div>
                            ))
                        ) : (
                            <div
                                className="text-center py-8 rounded-lg"
                                style={{
                                    backgroundColor: "var(--color-gray-50)",
                                }}
                            >
                                <div
                                    className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center"
                                    style={{
                                        backgroundColor:
                                            "var(--color-gray-200)",
                                    }}
                                >
                                    <svg
                                        className="w-6 h-6"
                                        style={{
                                            color: "var(--color-gray-400)",
                                        }}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                        />
                                    </svg>
                                </div>
                                <p
                                    className="font-medium mb-1"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Belum Ada Posisi
                                </p>
                                <p
                                    className="text-sm"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    Karyawan belum ditugaskan ke posisi manapun
                                </p>
                            </div>
                        )}
                    </div>
                </Card>

                <Card variant="elevated" className="p-6">
                    <h3
                        className="text-lg font-semibold mb-4"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        Pesanan Terbaru
                    </h3>
                    <div className="space-y-3">
                        {recentOrders.length > 0 ? (
                            recentOrders.map((order) => (
                                <div
                                    key={order.id}
                                    className="p-3 rounded-lg transition-colors duration-200 hover:shadow-sm"
                                    style={{
                                        backgroundColor: "var(--color-gray-50)",
                                        border: "1px solid var(--color-border-light)",
                                    }}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <p
                                                    className="font-medium text-sm"
                                                    style={{
                                                        color: "var(--color-text-primary)",
                                                    }}
                                                >
                                                    {order.orderNumber}
                                                </p>
                                                <Badge
                                                    variant={getStatusBadgeVariant(
                                                        order.status,
                                                    )}
                                                    size="sm"
                                                >
                                                    {order.status
                                                        .replace("_", " ")
                                                        .toLowerCase()
                                                        .replace(
                                                            /\b\w/g,
                                                            (l: string) =>
                                                                l.toUpperCase(),
                                                        )}
                                                </Badge>
                                            </div>

                                            <div className="mb-2">
                                                <p
                                                    className="text-sm font-medium"
                                                    style={{
                                                        color: "var(--color-text-secondary)",
                                                    }}
                                                >
                                                    {order.customer.name}
                                                </p>
                                                {order.customer.phone && (
                                                    <p
                                                        className="text-xs"
                                                        style={{
                                                            color: "var(--color-text-tertiary)",
                                                        }}
                                                    >
                                                        {order.customer.phone}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="text-right ml-3">
                                            <p
                                                className="font-semibold text-sm"
                                                style={{
                                                    color: "var(--color-text-primary)",
                                                }}
                                            >
                                                {formatCurrency(
                                                    order.totalAmount,
                                                )}
                                            </p>
                                            <Badge
                                                variant={getPaymentStatusBadgeVariant(
                                                    order.paymentStatus,
                                                )}
                                                size="sm"
                                                className="mt-1"
                                            >
                                                {order.paymentStatus
                                                    .replace("_", " ")
                                                    .toLowerCase()
                                                    .replace(
                                                        /\b\w/g,
                                                        (l: string) =>
                                                            l.toUpperCase(),
                                                    )}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div
                                className="text-center py-8 rounded-lg"
                                style={{
                                    backgroundColor: "var(--color-gray-50)",
                                }}
                            >
                                <div
                                    className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center"
                                    style={{
                                        backgroundColor:
                                            "var(--color-gray-200)",
                                    }}
                                >
                                    <svg
                                        className="w-6 h-6"
                                        style={{
                                            color: "var(--color-gray-400)",
                                        }}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                                        />
                                    </svg>
                                </div>
                                <p
                                    className="font-medium mb-1"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Belum Ada Pesanan
                                </p>
                                <p
                                    className="text-sm"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    Karyawan belum menangani pesanan apapun
                                </p>
                            </div>
                        )}
                    </div>

                    {recentOrders.length > 0 && (
                        <div
                            className="mt-4 pt-4"
                            style={{
                                borderTop:
                                    "1px solid var(--color-border-light)",
                            }}
                        >
                            <button
                                className="w-full text-sm font-medium py-2 px-3 rounded-md transition-colors duration-200 hover:shadow-sm"
                                style={{
                                    color: "var(--color-primary-600)",
                                    backgroundColor: "var(--color-primary-50)",
                                    border: "1px solid var(--color-primary-200)",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor =
                                        "var(--color-primary-100)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor =
                                        "var(--color-primary-50)";
                                }}
                            >
                                Lihat Semua Pesanan
                            </button>
                        </div>
                    )}
                </Card>
            </div>

            <Card variant="elevated" className="p-6">
                <h3
                    className="text-lg font-semibold mb-4"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    Ringkasan Kinerja
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div
                        className="text-center p-4 rounded-lg"
                        style={{ backgroundColor: "var(--color-primary-50)" }}
                    >
                        <p
                            className="text-2xl font-bold mb-1"
                            style={{ color: "var(--color-primary-600)" }}
                        >
                            {recentOrders.length}
                        </p>
                        <p
                            className="text-sm font-medium"
                            style={{ color: "var(--color-primary-700)" }}
                        >
                            Pesanan Terbaru
                        </p>
                    </div>
                    <div
                        className="text-center p-4 rounded-lg"
                        style={{ backgroundColor: "var(--color-success-50)" }}
                    >
                        <p
                            className="text-2xl font-bold mb-1"
                            style={{ color: "var(--color-success-600)" }}
                        >
                            {
                                recentOrders.filter(
                                    (order) => order.status === "delivered",
                                ).length
                            }
                        </p>
                        <p
                            className="text-sm font-medium"
                            style={{ color: "var(--color-success-700)" }}
                        >
                            Selesai
                        </p>
                    </div>
                    <div
                        className="text-center p-4 rounded-lg"
                        style={{ backgroundColor: "var(--color-warning-50)" }}
                    >
                        <p
                            className="text-2xl font-bold mb-1"
                            style={{ color: "var(--color-warning-600)" }}
                        >
                            {
                                recentOrders.filter((order) =>
                                    ["pending", "in_progress"].includes(
                                        order.status,
                                    ),
                                ).length
                            }
                        </p>
                        <p
                            className="text-sm font-medium"
                            style={{ color: "var(--color-warning-700)" }}
                        >
                            Dalam Proses
                        </p>
                    </div>
                    <div
                        className="text-center p-4 rounded-lg"
                        style={{ backgroundColor: "var(--color-secondary-50)" }}
                    >
                        <p
                            className="text-2xl font-bold mb-1"
                            style={{ color: "var(--color-secondary-600)" }}
                        >
                            {employee.employeePositionsCount || 0}
                        </p>
                        <p
                            className="text-sm font-medium"
                            style={{ color: "var(--color-secondary-700)" }}
                        >
                            Posisi Aktif
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}
