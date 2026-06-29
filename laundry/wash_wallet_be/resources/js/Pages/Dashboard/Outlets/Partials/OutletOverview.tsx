import React, { useState } from "react";
import { router } from "@inertiajs/react";
import { Card } from "@/Components/Card";
import { Badge } from "@/Components/Badge";
import type { BadgeVariant } from "@/Components/Badge";
import { Button } from "@/Components/Button";
import {
    ComposedChart,
    Bar,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
} from "recharts";
import {
    MapPin,
    Phone,
    Mail,
    Calendar,
    BarChart3,
    Building2,
    User,
    ExternalLink,
    Star,
    TrendingUp,
    ShoppingCart,
    Users,
    Layers,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Info,
    Coins,
    Zap,
    Clock,
    Truck,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
    OutletOverviewProps,
    OutletOverviewStats,
    OutletOverviewCharts,
    OrderSummary,
    OperationalChecklistItem,
    RevenueAndOrdersByDay,
    OrderStatusDistributionItem,
    PaymentHealthItem,
    TopServiceItem,
} from "../types";

const PERIOD_OPTIONS = [
    { value: "7d", label: "7 Hari" },
    { value: "30d", label: "30 Hari" },
    { value: "90d", label: "90 Hari" },
] as const;

const PeriodFilterBar: React.FC<{ outletId: number; currentPeriod: string }> = ({
    outletId,
    currentPeriod,
}) => {
    const handlePeriodChange = (period: string) => {
        router.visit(route("outlets.show", outletId), {
            data: { period },
            preserveState: false,
            preserveScroll: false,
        });
    };

    return (
        <div className="flex items-center gap-2">
            {PERIOD_OPTIONS.map((option) => (
                <Button
                    key={option.value}
                    variant={currentPeriod === option.value ? "primary" : "outline"}
                    size="sm"
                    onClick={() => handlePeriodChange(option.value)}
                >
                    {option.label}
                </Button>
            ))}
        </div>
    );
};

const KPICard: React.FC<{
    label: string;
    value: string | number;
    icon: React.ReactNode;
    variant?: "default" | "success" | "warning" | "danger";
    subtitle?: string;
}> = ({ label, value, icon, variant = "default", subtitle }) => {
    const variantStyles = {
        default: {
            bg: "var(--color-surface-secondary)",
            iconBg: "var(--color-primary-100)",
            iconColor: "var(--color-primary-600)",
        },
        success: {
            bg: "var(--color-success-50)",
            iconBg: "var(--color-success-100)",
            iconColor: "var(--color-success-600)",
        },
        warning: {
            bg: "var(--color-warning-50)",
            iconBg: "var(--color-warning-100)",
            iconColor: "var(--color-warning-600)",
        },
        danger: {
            bg: "var(--color-danger-50)",
            iconBg: "var(--color-danger-100)",
            iconColor: "var(--color-danger-600)",
        },
    };

    const style = variantStyles[variant];

    return (
        <div
            className="p-4 rounded-lg"
            style={{ backgroundColor: style.bg }}
        >
            <div className="flex items-center gap-3">
                <div
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: style.iconBg }}
                >
                    {icon}
                </div>
                <div className="flex-1 min-w-0">
                    <p
                        className="text-xs font-medium"
                        style={{ color: "var(--color-text-secondary)" }}
                    >
                        {label}
                    </p>
                    <p
                        className="text-lg font-bold"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        {value}
                    </p>
                    {subtitle && (
                        <p
                            className="text-xs"
                            style={{ color: "var(--color-text-tertiary)" }}
                        >
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

const KPICardsSection: React.FC<{ stats: OutletOverviewStats }> = ({ stats }) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            <KPICard
                label="Order Hari Ini"
                value={stats.todayOrdersCount}
                icon={<ShoppingCart className="w-4 h-4" style={{ color: "var(--color-primary-600)" }} />}
            />
            <KPICard
                label="Order Periode"
                value={stats.periodOrdersCount}
                icon={<ShoppingCart className="w-4 h-4" style={{ color: "var(--color-primary-600)" }} />}
            />
            <KPICard
                label="Pendapatan"
                value={formatCurrency(stats.periodRevenue)}
                icon={<TrendingUp className="w-4 h-4" style={{ color: "var(--color-success-600)" }} />}
                variant="success"
            />
            <KPICard
                label="Order Aktif"
                value={stats.activeOrdersCount}
                icon={<Clock className="w-4 h-4" style={{ color: "var(--color-warning-600)" }} />}
                variant={stats.activeOrdersCount > 0 ? "warning" : "default"}
            />
            <KPICard
                label="Belum Dibayar"
                value={stats.unpaidOrdersCount}
                icon={<AlertTriangle className="w-4 h-4" style={{ color: stats.unpaidOrdersCount > 0 ? "var(--color-danger-600)" : "var(--color-text-quaternary)" }} />}
                variant={stats.unpaidOrdersCount > 0 ? "danger" : "default"}
            />
            <KPICard
                label="Outstanding"
                value={formatCurrency(stats.outstandingAmount)}
                icon={<AlertTriangle className="w-4 h-4" style={{ color: stats.outstandingAmount > 0 ? "var(--color-danger-600)" : "var(--color-text-quaternary)" }} />}
                variant={stats.outstandingAmount > 0 ? "danger" : "default"}
            />
            <KPICard
                label="Total Pelanggan"
                value={stats.customersCount}
                icon={<Users className="w-4 h-4" style={{ color: "var(--color-primary-600)" }} />}
            />
            <KPICard
                label="Layanan Aktif"
                value={stats.activeLaundryServicesCount}
                icon={<Layers className="w-4 h-4" style={{ color: "var(--color-primary-600)" }} />}
                variant={stats.activeLaundryServicesCount === 0 ? "danger" : "default"}
            />
            <KPICard
                label="Karyawan Aktif"
                value={stats.activeEmployeesCount}
                icon={<User className="w-4 h-4" style={{ color: "var(--color-primary-600)" }} />}
                variant={stats.activeEmployeesCount === 0 ? "warning" : "default"}
            />
            <KPICard
                label="Rating"
                value={stats.averageRating > 0 ? `${stats.averageRating}/5` : "-"}
                icon={<Star className="w-4 h-4" style={{ color: "var(--color-warning-500)" }} />}
                subtitle={stats.totalReviews > 0 ? `${stats.totalReviews} review` : undefined}
            />
            <KPICard
                label="Coin Balance"
                value={formatCurrency(stats.coinBalance)}
                icon={<Coins className="w-4 h-4" style={{ color: "var(--color-warning-600)" }} />}
            />
            <KPICard
                label="Fitur Aktif"
                value={stats.featureStatusSummary.active}
                icon={<Zap className="w-4 h-4" style={{ color: "var(--color-success-600)" }} />}
                subtitle={`Trial: ${stats.featureStatusSummary.trial} | Expired: ${stats.featureStatusSummary.expired}`}
            />
        </div>
    );
};

const RevenueOrderChart: React.FC<{ data: RevenueAndOrdersByDay[] }> = ({ data }) => {
    const formatXAxis = (dateStr: string) => {
        const date = new Date(dateStr);
        return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}`;
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div
                    className="p-3 rounded-lg shadow-lg border"
                    style={{
                        backgroundColor: "var(--color-surface-primary)",
                        borderColor: "var(--color-border)",
                    }}
                >
                    <p className="font-medium mb-2">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} className="text-sm">
                            <span style={{ color: entry.color }}>{entry.name}: </span>
                            <span className="font-medium">
                                {entry.name === "Revenue"
                                    ? formatCurrency(entry.value)
                                    : entry.value}
                            </span>
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <Card variant="elevated" className="p-6">
            <h3
                className="text-lg font-semibold mb-4"
                style={{ color: "var(--color-text-primary)" }}
            >
                Tren Pendapatan & Order
            </h3>
            {data.length === 0 ? (
                <div className="h-64 flex items-center justify-center">
                    <p style={{ color: "var(--color-text-tertiary)" }}>
                        Tidak ada data untuk periode ini
                    </p>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                        <XAxis
                            dataKey="date"
                            tickFormatter={formatXAxis}
                            tick={{ fontSize: 12 }}
                            stroke="var(--color-text-tertiary)"
                        />
                        <YAxis
                            yAxisId="left"
                            tickFormatter={(v) => `Rp ${(v / 1000).toFixed(0)}k`}
                            tick={{ fontSize: 12 }}
                            stroke="var(--color-text-tertiary)"
                        />
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            tick={{ fontSize: 12 }}
                            stroke="var(--color-text-tertiary)"
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar
                            yAxisId="left"
                            dataKey="revenue"
                            name="Revenue"
                            fill="var(--color-primary-500)"
                            radius={[4, 4, 0, 0]}
                        />
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="ordersCount"
                            name="Order"
                            stroke="var(--color-success-500)"
                            strokeWidth={2}
                            dot={false}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            )}
        </Card>
    );
};

const OrderStatusChart: React.FC<{ data: OrderStatusDistributionItem[] }> = ({ data }) => {
    const totalCount = data.reduce((sum, item) => sum + item.count, 0);

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const item = payload[0].payload;
            const percentage = totalCount > 0 ? ((item.count / totalCount) * 100).toFixed(1) : 0;
            return (
                <div
                    className="p-3 rounded-lg shadow-lg border"
                    style={{
                        backgroundColor: "var(--color-surface-primary)",
                        borderColor: "var(--color-border)",
                    }}
                >
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm">
                        {item.count} order ({percentage}%)
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <Card variant="elevated" className="p-6">
            <h3
                className="text-lg font-semibold mb-4"
                style={{ color: "var(--color-text-primary)" }}
            >
                Distribusi Status Order
            </h3>
            {data.length === 0 ? (
                <div className="h-64 flex items-center justify-center">
                    <p style={{ color: "var(--color-text-tertiary)" }}>
                        Tidak ada data untuk periode ini
                    </p>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={2}
                            dataKey="count"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            )}
        </Card>
    );
};

const PaymentHealthChart: React.FC<{ data: PaymentHealthItem[] }> = ({ data }) => {
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const item = payload[0].payload;
            return (
                <div
                    className="p-3 rounded-lg shadow-lg border"
                    style={{
                        backgroundColor: "var(--color-surface-primary)",
                        borderColor: "var(--color-border)",
                    }}
                >
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm">Order: {item.ordersCount}</p>
                    <p className="text-sm">Total: {formatCurrency(item.totalAmount)}</p>
                    <p className="text-sm">Paid: {formatCurrency(item.paidAmount)}</p>
                    <p className="text-sm">Sisa: {formatCurrency(item.remainingAmount)}</p>
                </div>
            );
        }
        return null;
    };

    const getBarColor = (status: string) => {
        if (status === "unpaid" || status === "partial") {
            return "var(--color-warning-500)";
        }
        return "var(--color-primary-500)";
    };

    return (
        <Card variant="elevated" className="p-6">
            <h3
                className="text-lg font-semibold mb-4"
                style={{ color: "var(--color-text-primary)" }}
            >
                Kesehatan Pembayaran
            </h3>
            {data.length === 0 ? (
                <div className="h-64 flex items-center justify-center">
                    <p style={{ color: "var(--color-text-tertiary)" }}>
                        Tidak ada data untuk periode ini
                    </p>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                        <XAxis type="number" tick={{ fontSize: 12 }} stroke="var(--color-text-tertiary)" />
                        <YAxis
                            type="category"
                            dataKey="label"
                            tick={{ fontSize: 12 }}
                            stroke="var(--color-text-tertiary)"
                            width={100}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="ordersCount" name="Order" radius={[0, 4, 4, 0]}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={getBarColor(entry.paymentStatus)} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            )}
        </Card>
    );
};

const TopServicesSection: React.FC<{
    topServices: TopServiceItem[];
    topCategories: any[];
}> = ({ topServices, topCategories }) => {
    const [activeTab, setActiveTab] = useState<"services" | "categories">("services");

    const data = activeTab === "services" ? topServices : topCategories;

    return (
        <Card variant="elevated" className="p-6">
            <div className="flex items-center justify-between mb-4">
                <h3
                    className="text-lg font-semibold"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    Performa Layanan
                </h3>
                <div className="flex gap-2">
                    <Button
                        variant={activeTab === "services" ? "primary" : "outline"}
                        size="sm"
                        onClick={() => setActiveTab("services")}
                    >
                        Top Layanan
                    </Button>
                    <Button
                        variant={activeTab === "categories" ? "primary" : "outline"}
                        size="sm"
                        onClick={() => setActiveTab("categories")}
                    >
                        Top Kategori
                    </Button>
                </div>
            </div>

            {data.length === 0 ? (
                <div className="py-8 text-center">
                    <p style={{ color: "var(--color-text-tertiary)" }}>
                        Tidak ada data untuk periode ini
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {data.map((item, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-4 p-3 rounded-lg"
                            style={{ backgroundColor: "var(--color-surface-secondary)" }}
                        >
                            <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                                style={{
                                    backgroundColor: index < 3 ? "var(--color-primary-100)" : "var(--color-surface-tertiary)",
                                    color: index < 3 ? "var(--color-primary-600)" : "var(--color-text-secondary)",
                                }}
                            >
                                {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p
                                    className="font-medium truncate"
                                    style={{ color: "var(--color-text-primary)" }}
                                >
                                    {item.name}
                                </p>
                                {activeTab === "services" && item.categoryName && (
                                    <p
                                        className="text-xs truncate"
                                        style={{ color: "var(--color-text-tertiary)" }}
                                    >
                                        {item.categoryName}
                                    </p>
                                )}
                            </div>
                            <div className="text-right">
                                <p
                                    className="font-medium"
                                    style={{ color: "var(--color-text-primary)" }}
                                >
                                    {item.quantity} item
                                </p>
                                <p
                                    className="text-xs"
                                    style={{ color: "var(--color-text-tertiary)" }}
                                >
                                    {formatCurrency(item.revenue)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
};

const ChecklistItem: React.FC<{ item: OperationalChecklistItem }> = ({ item }) => {
    const statusConfig = {
        ok: {
            icon: <CheckCircle2 className="w-4 h-4" style={{ color: "var(--color-success-500)" }} />,
            bg: "var(--color-success-50)",
            badgeVariant: "success" as const,
        },
        info: {
            icon: <Info className="w-4 h-4" style={{ color: "var(--color-info-500)" }} />,
            bg: "var(--color-info-50)",
            badgeVariant: "info" as const,
        },
        warning: {
            icon: <AlertTriangle className="w-4 h-4" style={{ color: "var(--color-warning-500)" }} />,
            bg: "var(--color-warning-50)",
            badgeVariant: "warning" as const,
        },
        critical: {
            icon: <XCircle className="w-4 h-4" style={{ color: "var(--color-danger-500)" }} />,
            bg: "var(--color-danger-50)",
            badgeVariant: "danger" as const,
        },
    };

    const config = statusConfig[item.status];
    const hasAction = item.actionLabel && item.actionTarget;

    return (
        <div
            className="flex items-start gap-3 p-3 rounded-lg"
            style={{ backgroundColor: config.bg }}
        >
            <div className="mt-0.5">{config.icon}</div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <span
                        className="font-medium text-sm"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        {item.label}
                    </span>
                    <Badge variant={config.badgeVariant} size="sm">
                        {item.status === "ok" ? "OK" : item.status}
                    </Badge>
                </div>
                <p
                    className="text-sm"
                    style={{ color: "var(--color-text-secondary)" }}
                >
                    {item.message}
                </p>
                {hasAction && (
                    <a
                        href={item.actionTarget}
                        className="inline-flex items-center gap-1 mt-2 text-sm font-medium"
                        style={{ color: "var(--color-primary-600)" }}
                    >
                        {item.actionLabel}
                        <ExternalLink className="w-3 h-3" />
                    </a>
                )}
            </div>
        </div>
    );
};

const OperationalReadinessSection: React.FC<{ checklist: OperationalChecklistItem[] }> = ({
    checklist,
}) => {
    const criticalItems = checklist.filter((i) => i.status === "critical");
    const warningItems = checklist.filter((i) => i.status === "warning");
    const infoItems = checklist.filter((i) => i.status === "info");
    const okItems = checklist.filter((i) => i.status === "ok");

    const allOk = criticalItems.length === 0 && warningItems.length === 0;

    return (
        <Card variant="elevated" className="p-6">
            <div className="flex items-center gap-3 mb-4">
                <div
                    className="p-2 rounded-lg"
                    style={{
                        backgroundColor: allOk ? "var(--color-success-100)" : "var(--color-warning-100)",
                    }}
                >
                    {allOk ? (
                        <CheckCircle2
                            className="w-5 h-5"
                            style={{ color: "var(--color-success-600)" }}
                        />
                    ) : (
                        <AlertTriangle
                            className="w-5 h-5"
                            style={{ color: "var(--color-warning-600)" }}
                        />
                    )}
                </div>
                <div>
                    <h3
                        className="text-lg font-semibold"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        Kesiapan Operasional
                    </h3>
                    <p
                        className="text-sm"
                        style={{ color: "var(--color-text-secondary)" }}
                    >
                        {allOk
                            ? "Outlet siap beroperasi"
                            : `${criticalItems.length} kritis, ${warningItems.length} perlu perhatian`}
                    </p>
                </div>
            </div>

            <div className="space-y-3">
                {criticalItems.map((item) => (
                    <ChecklistItem key={item.key} item={item} />
                ))}
                {warningItems.map((item) => (
                    <ChecklistItem key={item.key} item={item} />
                ))}
                {infoItems.map((item) => (
                    <ChecklistItem key={item.key} item={item} />
                ))}
                {okItems.map((item) => (
                    <ChecklistItem key={item.key} item={item} />
                ))}
            </div>
        </Card>
    );
};

const RecentOrdersSection: React.FC<{ orders: OrderSummary[]; outletId: number }> = ({
    orders,
    outletId,
}) => {
    const getPaymentBadgeVariant = (status: string): BadgeVariant => {
        switch (status) {
            case "paid":
                return "success";
            case "partial":
                return "warning";
            case "unpaid":
                return "danger";
            case "paid_by_package":
                return "primary";
            case "cod":
                return "primary";
            default:
                return "default";
        }
    };

    return (
        <Card variant="elevated" className="p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: "var(--color-success-100)" }}
                    >
                        <BarChart3
                            className="w-5 h-5"
                            style={{ color: "var(--color-success-600)" }}
                        />
                    </div>
                    <h3
                        className="text-lg font-semibold"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        Pesanan Terbaru
                    </h3>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                        router.visit(route("orders.index", { outlet_id: outletId }))
                    }
                    rightIcon={<ExternalLink className="w-4 h-4" />}
                >
                    Lihat Semua
                </Button>
            </div>

            <div className="space-y-3">
                {orders.length > 0 ? (
                    orders.slice(0, 6).map((order) => (
                        <div
                            key={order.id}
                            className="flex items-center justify-between p-4 rounded-lg hover:shadow-sm transition-all duration-150 cursor-pointer"
                            style={{ backgroundColor: "var(--color-surface-secondary)" }}
                            onClick={() => router.visit(route("orders.show", order.id))}
                        >
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <p
                                        className="font-medium text-sm"
                                        style={{ color: "var(--color-text-primary)" }}
                                    >
                                        #{order.orderNumber}
                                    </p>
                                    <Badge variant={order.statusBadgeVariant}>
                                        {order.statusLabel}
                                    </Badge>
                                    <Badge variant={getPaymentBadgeVariant(order.paymentStatus)}>
                                        {order.paymentStatusLabel}
                                    </Badge>
                                </div>
                                <p
                                    className="text-xs truncate"
                                    style={{ color: "var(--color-text-secondary)" }}
                                >
                                    {order.customerName || `Pelanggan #${order.customerId}`}
                                </p>
                                <p
                                    className="text-xs"
                                    style={{ color: "var(--color-text-tertiary)" }}
                                >
                                    {formatDate(order.createdAt)}
                                </p>
                            </div>
                            <div className="text-right flex-shrink-0 ml-4">
                                <p
                                    className="font-semibold text-sm"
                                    style={{ color: "var(--color-text-primary)" }}
                                >
                                    {formatCurrency(order.totalAmount)}
                                </p>
                                {order.remainingAmount > 0 && (
                                    <p
                                        className="text-xs"
                                        style={{ color: "var(--color-danger-500)" }}
                                    >
                                        Sisa: {formatCurrency(order.remainingAmount)}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12">
                        <div
                            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                            style={{ backgroundColor: "var(--color-surface-secondary)" }}
                        >
                            <BarChart3
                                className="w-8 h-8"
                                style={{ color: "var(--color-text-quaternary)" }}
                            />
                        </div>
                        <p
                            className="font-medium"
                            style={{ color: "var(--color-text-tertiary)" }}
                        >
                            Belum ada pesanan
                        </p>
                        <p
                            className="text-sm mt-1"
                            style={{ color: "var(--color-text-quaternary)" }}
                        >
                            Pesanan akan muncul di sini setelah outlet mulai beroperasi
                        </p>
                    </div>
                )}
            </div>
        </Card>
    );
};

const OutletOverview: React.FC<OutletOverviewProps> = ({
    outlet,
    overviewStats,
    overviewCharts,
    recentOrders,
    operationalChecklist,
    overviewMeta,
}) => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2
                    className="text-xl font-bold"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    Ringkasan Outlet
                </h2>
                <PeriodFilterBar
                    outletId={outlet.id}
                    currentPeriod={overviewMeta.period}
                />
            </div>

            <KPICardsSection stats={overviewStats} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RevenueOrderChart data={overviewCharts.revenueAndOrdersByDay} />
                <OrderStatusChart data={overviewCharts.orderStatusDistribution} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PaymentHealthChart data={overviewCharts.paymentHealth} />
                <TopServicesSection
                    topServices={overviewCharts.topServices}
                    topCategories={overviewCharts.topCategories}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <OperationalReadinessSection checklist={operationalChecklist} />
                <RecentOrdersSection orders={recentOrders} outletId={outlet.id} />
            </div>
        </div>
    );
};

export default OutletOverview;
