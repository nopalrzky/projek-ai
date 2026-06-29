import React from "react";
import { Link } from "@inertiajs/react";
import { Activity, Clock, FileWarning, ArrowRight } from "lucide-react";
import { OwnerDashboardOperations } from "../types";
import dayjs from "dayjs";
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/Card";
import { Progress } from "@/Components/Progress";
import { Badge } from "@/Components/Badge";
import { cn } from "@/lib/utils";

interface OrderFunnelProps {
    operations: OwnerDashboardOperations;
}

const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

const getStatusBadgeConfig = (status: string): { variant?: any, className?: string } => {
    const config: Record<string, { variant?: any, className?: string }> = {
        'requested': { variant: 'info' },
        'pending_dropoff': { variant: 'warning' },
        'accepted': { variant: 'primary' },
        'picking_up': { className: 'bg-[var(--color-purple-100)] text-[var(--color-purple-700)] dark:bg-[var(--color-purple-900)]/40 dark:text-[var(--color-purple-300)]' },
        'picked_up': { className: 'bg-[var(--color-purple-200)] text-[var(--color-purple-800)] dark:bg-[var(--color-purple-800)]/40 dark:text-[var(--color-purple-200)]' },
        'received': { className: 'bg-[var(--color-primary-200)] text-[var(--color-primary-800)] dark:bg-[var(--color-primary-800)]/40 dark:text-[var(--color-primary-200)]' },
        'weighing': { className: 'bg-[var(--color-warning-200)] text-[var(--color-warning-800)] dark:bg-[var(--color-warning-800)]/40 dark:text-[var(--color-warning-200)]' },
        'ready_to_process': { className: 'bg-[var(--color-info-200)] text-[var(--color-info-800)] dark:bg-[var(--color-info-800)]/40 dark:text-[var(--color-info-200)]' },
        'in_progress': { className: 'bg-[var(--color-primary-500)] text-white' },
        'ready': { variant: 'success' },
        'delivering': { className: 'bg-[var(--color-purple-500)] text-white' },
        'delivered': { className: 'bg-[var(--color-success-200)] text-[var(--color-success-800)] dark:bg-[var(--color-success-800)]/40 dark:text-[var(--color-success-200)]' },
        'completed': { className: 'bg-[var(--color-success-600)] text-white' },
        'cancelled': { variant: 'error' },
        'rejected': { className: 'bg-[var(--color-error-200)] text-[var(--color-error-800)] dark:bg-[var(--color-error-800)]/40 dark:text-[var(--color-error-200)]' },
    };
    return config[status] || { variant: 'default' };
};

const OrderFunnel: React.FC<OrderFunnelProps> = ({ operations }) => {
    const maxFunnelCount = Math.max(...operations.orderFunnel.map(f => f.count), 1);

    return (
        <Card className="flex flex-col h-full" hoverable>
            <CardHeader className="py-4">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="w-5 h-5 text-[var(--color-primary-500)]" />
                    <span className="text-[var(--color-text-primary)]">Operasional Pesanan</span>
                </CardTitle>
            </CardHeader>

            <CardContent noPadding className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x border-t-0 divide-[var(--color-border)]">
                {/* Left Side: Funnel */}
                <div className="p-5 md:p-6 flex flex-col gap-5">
                    <h4 className="text-sm font-semibold text-[var(--color-text-secondary)]">Status Pesanan Aktif</h4>
                    <div className="space-y-4">
                        {operations.orderFunnel.map((stage) => (
                            <div key={stage.stage} className="flex items-center gap-4">
                                <div className="w-28 text-xs font-medium text-right text-[var(--color-text-secondary)] truncate">
                                    {stage.label}
                                </div>
                                <div className="flex-1 flex items-center gap-3">
                                    <Progress 
                                        value={stage.count} 
                                        max={maxFunnelCount} 
                                        size="lg" 
                                        variant="primary" 
                                        className="flex-1 max-w-[200px]"
                                        barClassName="bg-gradient-to-r from-[var(--color-primary-400)] to-[var(--color-primary-500)]"
                                    />
                                    <span className="text-sm font-bold w-8 text-[var(--color-text-primary)]">{stage.count}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Side: Delayed & Recent */}
                <div className="p-5 md:p-6 flex flex-col gap-6 bg-gradient-to-br from-transparent to-[var(--color-surface-muted)]/50">
                    {/* Delayed Alert */}
                    {operations.delayedOrders.length > 0 && (
                        <div>
                            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-[var(--color-error-600)] dark:text-[var(--color-error-400)]">
                                <FileWarning className="w-4 h-4" />
                                Pesanan Terlambat ({operations.delayedOrders.length})
                            </h4>
                            <div className="space-y-2">
                                {operations.delayedOrders.map(order => (
                                    <div key={order.id} className="bg-[var(--color-surface)] border border-[var(--color-error-200)] dark:border-[var(--color-error-800)] rounded-xl p-3 text-sm flex justify-between items-center shadow-sm transition-all hover:shadow-md">
                                        <div>
                                            <div className="font-semibold text-[var(--color-text-primary)]">{order.orderNumber}</div>
                                            <div className="text-xs text-[var(--color-text-tertiary)] truncate max-w-[120px]">{order.outletName}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[var(--color-error-600)] dark:text-[var(--color-error-400)] font-medium text-xs flex items-center justify-end gap-1 mb-1">
                                                <Clock className="w-3.5 h-3.5" />
                                                Stagnan {Math.floor(order.ageMinutes / 60)}j
                                            </div>
                                            <Link href={`/dashboard/orders/${order.id}`} className="text-xs font-semibold text-[var(--color-primary-600)] hover:text-[var(--color-primary-500)] hover:underline inline-block">
                                                Cek Detail
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recent Active */}
                    <div className="flex-1 flex flex-col">
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="text-sm font-semibold text-[var(--color-text-secondary)]">Pesanan Aktif Terbaru</h4>
                            <Link href="/dashboard/orders?status=active" className="text-xs font-semibold text-[var(--color-primary-600)] hover:text-[var(--color-primary-500)] flex items-center hover:underline group">
                                Lihat Semua <ArrowRight className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </div>
                        <div className="space-y-2 flex-1">
                            {operations.recentActiveOrders.slice(0, operations.delayedOrders.length > 0 ? 3 : 5).map(order => {
                                const badgeCfg = getStatusBadgeConfig(order.status);
                                return (
                                    <Link key={order.id} href={`/dashboard/orders/${order.id}`} className="block bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-3 hover:border-[var(--color-primary-400)] transition-all shadow-sm hover:shadow-md group">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="font-semibold text-sm text-[var(--color-text-primary)] group-hover:text-[var(--color-primary-600)] transition-colors">{order.orderNumber}</div>
                                            <Badge 
                                                variant={badgeCfg.variant} 
                                                className={cn("text-[10px] px-2 py-0.5", badgeCfg.className, !badgeCfg.variant && "border-none")} 
                                                size="xs" 
                                                rounded="full"
                                            >
                                                {order.statusLabel}
                                            </Badge>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <div className="text-xs text-[var(--color-text-tertiary)]">
                                                <span className="font-medium text-[var(--color-text-secondary)]">{order.customerName}</span> <br/>
                                                <span className="text-[10px] flex items-center gap-1 mt-0.5">
                                                    <Clock className="w-3 h-3" />
                                                    {dayjs(order.createdAt).fromNow()}
                                                </span>
                                            </div>
                                            <div className="text-sm font-bold text-[var(--color-text-primary)] bg-[var(--color-gray-50)] dark:bg-[var(--color-gray-900)] px-2 py-1 rounded-md">
                                                {formatRupiah(order.totalAmount)}
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                            {operations.recentActiveOrders.length === 0 && (
                                <div className="text-center py-8 text-sm text-[var(--color-text-tertiary)] flex flex-col items-center justify-center gap-2 h-full bg-[var(--color-gray-50)]/50 dark:bg-[var(--color-gray-900)]/20 rounded-xl border border-dashed border-[var(--color-border)]">
                                    <Activity className="w-8 h-8 text-[var(--color-gray-300)]" />
                                    <span>Tidak ada pesanan aktif.</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default OrderFunnel;
