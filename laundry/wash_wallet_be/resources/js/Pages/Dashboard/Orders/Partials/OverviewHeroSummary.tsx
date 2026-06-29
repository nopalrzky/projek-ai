import { Order } from "@/types";
import type { ReactNode } from "react";
import { Card, CardContent } from "@/Components/Card";
import { Badge } from "@/Components/Badge";
import { Progress } from "@/Components/Progress";
import {
    Banknote,
    CalendarClock,
    Clock,
    PackageCheck,
    ReceiptText,
    Truck,
} from "lucide-react";

interface Props {
    order: Order;
}

const clampPercentage = (value: number) => Math.max(0, Math.min(100, value));

const SummaryMetric = ({
    icon,
    label,
    value,
    tone = "default",
}: {
    icon: ReactNode;
    label: string;
    value: ReactNode;
    tone?: "default" | "success" | "warning" | "danger" | "primary";
}) => {
    const toneClass = {
        default: "text-[var(--color-text-primary)]",
        success: "text-[var(--color-success-600)]",
        warning: "text-[var(--color-warning-600)]",
        danger: "text-[var(--color-error-600)]",
        primary: "text-[var(--color-primary-600)]",
    }[tone];

    return (
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-sm)]">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border-light)] bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)]">
                {icon}
            </div>
            <p className="text-xs font-medium text-[var(--color-text-secondary)]">
                {label}
            </p>
            <div className={`mt-1 min-w-0 text-lg font-bold ${toneClass}`}>
                {value}
            </div>
        </div>
    );
};

export default function OverviewHeroSummary({ order }: Props) {
    const paymentProgress = clampPercentage(
        order.totalAmount > 0 ? (order.paidAmount / order.totalAmount) * 100 : 0,
    );
    const productionProgress = clampPercentage(order.completionPercentage || 0);
    const hasOutstanding = order.remainingAmount > 0;

    return (
        <Card className="overflow-hidden border border-[var(--color-border)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--color-primary-500)_8%,var(--color-surface)),var(--color-surface)_44%,var(--color-surface))] shadow-[var(--shadow-md)]">
            <CardContent className="p-5 sm:p-6">
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.65fr)]">
                    <div className="min-w-0 space-y-5">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="min-w-0">
                                <div className="mb-3 flex flex-wrap items-center gap-2">
                                    <Badge variant={order.statusBadgeVariant} size="md">
                                        {order.statusLabel}
                                    </Badge>
                                    <Badge
                                        variant={order.paymentStatusBadgeVariant}
                                        size="md"
                                    >
                                        {order.paymentStatusLabel}
                                    </Badge>
                                    <Badge variant="secondary" size="sm">
                                        {order.deliveryTypeLabel}
                                    </Badge>
                                </div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">
                                    Overview Order
                                </p>
                                <h2 className="mt-1 text-2xl font-bold tracking-tight text-[var(--color-text-primary)] sm:text-3xl">
                                    #{order.orderNumber}
                                </h2>
                                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[var(--color-text-secondary)]">
                                    <span className="inline-flex items-center gap-1.5">
                                        <CalendarClock className="h-4 w-4 text-[var(--color-text-tertiary)]" />
                                        {order.formattedOrderDate}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5">
                                        <Clock className="h-4 w-4 text-[var(--color-text-tertiary)]" />
                                        {order.formattedEstimatedCompletion ||
                                            "Estimasi belum ditentukan"}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5">
                                        <Truck className="h-4 w-4 text-[var(--color-text-tertiary)]" />
                                        {order.sourceLabel}
                                    </span>
                                </div>
                            </div>

                            <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] p-4 shadow-[var(--shadow-sm)] lg:min-w-[16rem]">
                                <p className="text-xs font-medium text-[var(--color-text-secondary)]">
                                    Total Tagihan
                                </p>
                                <p className="mt-1 text-2xl font-bold text-[var(--color-primary-700)]">
                                    {order.formattedTotalAmount}
                                </p>
                                <div className="mt-3 flex items-center justify-between text-xs">
                                    <span className="text-[var(--color-text-secondary)]">
                                        Pembayaran
                                    </span>
                                    <span className="font-semibold text-[var(--color-text-primary)]">
                                        {Math.round(paymentProgress)}%
                                    </span>
                                </div>
                                <Progress
                                    value={paymentProgress}
                                    variant={hasOutstanding ? "warning" : "success"}
                                    size="sm"
                                    className="mt-2"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            <SummaryMetric
                                icon={<PackageCheck className="h-4 w-4" />}
                                label="Progress Produksi"
                                value={`${productionProgress}%`}
                                tone={productionProgress >= 100 ? "success" : "primary"}
                            />
                            <SummaryMetric
                                icon={<Banknote className="h-4 w-4" />}
                                label="Sudah Dibayar"
                                value={order.formattedPaidAmount}
                                tone="success"
                            />
                            <SummaryMetric
                                icon={<ReceiptText className="h-4 w-4" />}
                                label="Sisa Tagihan"
                                value={order.formattedRemainingAmount}
                                tone={hasOutstanding ? "danger" : "success"}
                            />
                            <SummaryMetric
                                icon={<Truck className="h-4 w-4" />}
                                label="Fulfillment"
                                value={
                                    <span className="block truncate text-base">
                                        {order.deliveryTypeLabel}
                                    </span>
                                }
                            />
                        </div>
                    </div>

                    <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-sm)]">
                        <div className="mb-3 flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
                                Produksi
                            </span>
                            <span className="text-sm font-bold text-[var(--color-text-primary)]">
                                {productionProgress}%
                            </span>
                        </div>
                        <Progress
                            value={productionProgress}
                            variant={productionProgress >= 100 ? "success" : "primary"}
                            size="lg"
                        />
                        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                            <div className="rounded-[var(--radius-md)] bg-[var(--color-surface-muted)] p-3">
                                <p className="text-xs text-[var(--color-text-secondary)]">
                                    Item
                                </p>
                                <p className="font-semibold text-[var(--color-text-primary)]">
                                    {order.orderItemsCount ?? order.orderItems?.length ?? 0}
                                </p>
                            </div>
                            <div className="rounded-[var(--radius-md)] bg-[var(--color-surface-muted)] p-3">
                                <p className="text-xs text-[var(--color-text-secondary)]">
                                    Pembayaran
                                </p>
                                <p className="font-semibold text-[var(--color-text-primary)]">
                                    {Math.round(paymentProgress)}%
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
