import type { ReactNode } from "react";
import { Order, OrderPaymentLog, OrderStatusHistory } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/Card";
import { Badge } from "@/Components/Badge";
import { Button } from "@/Components/Button";
import { Activity, ArrowRight, Banknote, Clock, User } from "lucide-react";

interface Props {
    order: Order;
    onNavigateTab: (index: number) => void;
}

interface ActivityItem {
    id: string;
    createdAt: string;
    label: string;
    description: string;
    actor: string;
    formattedTime: string;
    icon: ReactNode;
    badgeVariant: "info" | "success";
    iconClassName: string;
}

export default function OverviewRecentActivity({ order, onNavigateTab }: Props) {
    const statusHistories: ActivityItem[] = (
        order.orderStatusHistories || []
    ).map((history: OrderStatusHistory) => ({
        id: `status_${history.id}`,
        createdAt: history.createdAt,
        label: "Status",
        description:
            history.description ||
            `Status berubah dari ${history.fromStatusLabel || "-"} menjadi ${
                history.toStatusLabel
            }`,
        actor: history.employee?.name || history.actorLabel || "Sistem",
        formattedTime: history.timeAgo || history.formattedCreatedAt,
        icon: <Clock className="h-4 w-4" />,
        badgeVariant: "info",
        iconClassName:
            "border-[var(--color-info-200)] bg-[var(--color-info-50)] text-[var(--color-info-600)]",
    }));

    const paymentLogs: ActivityItem[] = (order.orderPaymentLogs || []).map(
        (payment: OrderPaymentLog) => ({
            id: `payment_${payment.id}`,
            createdAt: payment.createdAt,
            label: "Payment",
            description: `Pembayaran ${payment.formattedAmount} via ${payment.paymentMethodLabel}`,
            actor: payment.employee?.name || "Karyawan",
            formattedTime: payment.formattedCreatedAt,
            icon: <Banknote className="h-4 w-4" />,
            badgeVariant: "success",
            iconClassName:
                "border-[var(--color-success-200)] bg-[var(--color-success-50)] text-[var(--color-success-600)]",
        }),
    );

    const activities = [...statusHistories, ...paymentLogs]
        .sort(
            (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
        )
        .slice(0, 5);

    return (
        <Card className="h-full overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)]">
            <CardHeader className="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)] pb-4">
                <CardTitle className="flex items-center justify-between gap-3 text-base">
                    <span className="flex items-center gap-2 text-[var(--color-text-primary)]">
                        <Activity className="h-4 w-4 text-[var(--color-primary-600)]" />
                        Aktivitas Terbaru
                    </span>
                    <Badge variant="secondary" size="sm">
                        {activities.length} update
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                {activities.length > 0 ? (
                    <div className="divide-y divide-[var(--color-border)]">
                        {activities.map((activity) => (
                            <div
                                key={activity.id}
                                className="flex gap-3 p-4 transition-colors hover:bg-[var(--color-surface-muted)]"
                            >
                                <div
                                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] border ${activity.iconClassName}`}
                                >
                                    {activity.icon}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="mb-1 flex flex-wrap items-center gap-2">
                                        <Badge
                                            variant={activity.badgeVariant}
                                            size="xs"
                                        >
                                            {activity.label}
                                        </Badge>
                                        <span className="text-xs text-[var(--color-text-tertiary)]">
                                            {activity.formattedTime}
                                        </span>
                                    </div>
                                    <p className="text-sm font-medium leading-relaxed text-[var(--color-text-primary)]">
                                        {activity.description}
                                    </p>
                                    <div className="mt-2 flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)]">
                                        <User className="h-3 w-3" />
                                        <span className="truncate">
                                            {activity.actor}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex min-h-[14rem] flex-col items-center justify-center px-6 py-10 text-center">
                        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[var(--color-text-tertiary)]">
                            <Activity className="h-5 w-5" />
                        </div>
                        <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                            Belum Ada Aktivitas
                        </p>
                        <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                            Update status dan pembayaran akan tampil di sini.
                        </p>
                    </div>
                )}

                <div className="flex flex-col gap-2 border-t border-[var(--color-border)] bg-[var(--color-surface-muted)] p-3 sm:flex-row sm:justify-end">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-primary-600)]"
                        onClick={() => onNavigateTab(3)}
                        rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                    >
                        Riwayat Status
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-primary-600)]"
                        onClick={() => onNavigateTab(2)}
                        rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                    >
                        Riwayat Pembayaran
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
