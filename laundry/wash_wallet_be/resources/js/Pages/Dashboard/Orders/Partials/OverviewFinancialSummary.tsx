import { Order } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/Card";
import { Progress } from "@/Components/Progress";
import { Button } from "@/Components/Button";
import { Badge } from "@/Components/Badge";
import {
    AlertTriangle,
    Banknote,
    ChevronRight,
    CreditCard,
    Info,
    ReceiptText,
} from "lucide-react";

interface Props {
    order: Order;
    onNavigateTab: (index: number) => void;
}

export default function OverviewFinancialSummary({ order, onNavigateTab }: Props) {
    const lastPayment = order.orderPaymentLogs?.[0];
    const paymentProgress =
        order.totalAmount > 0 ? (order.paidAmount / order.totalAmount) * 100 : 0;
    const roundedPaymentProgress = Math.max(0, Math.min(100, paymentProgress));

    return (
        <Card className="h-full overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)]">
            <CardHeader className="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)] pb-4">
                <CardTitle className="flex items-center justify-between text-base">
                    <span className="flex items-center gap-2 text-[var(--color-text-primary)]">
                        <ReceiptText className="h-4 w-4 text-[var(--color-primary-600)]" />
                        Ringkasan Keuangan
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs text-[var(--color-primary-600)]"
                        onClick={() => onNavigateTab(2)}
                        rightIcon={<ChevronRight className="h-3.5 w-3.5" />}
                    >
                        Detail
                    </Button>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="grid grid-cols-1 divide-y divide-[var(--color-border)] lg:grid-cols-[minmax(0,1.05fr)_minmax(17rem,0.95fr)] lg:divide-x lg:divide-y-0">
                    <div className="space-y-5 p-5">
                        <div>
                            <div className="mb-4 flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-xs font-medium text-[var(--color-text-secondary)]">
                                        Sudah Dibayar
                                    </p>
                                    <p className="mt-1 text-2xl font-bold text-[var(--color-success-600)]">
                                        {order.formattedPaidAmount}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-medium text-[var(--color-text-secondary)]">
                                        Sisa
                                    </p>
                                    <p
                                        className={`mt-1 text-lg font-bold ${
                                            order.remainingAmount > 0
                                                ? "text-[var(--color-error-600)]"
                                                : "text-[var(--color-success-600)]"
                                        }`}
                                    >
                                        {order.formattedRemainingAmount}
                                    </p>
                                </div>
                            </div>
                            <Progress
                                value={roundedPaymentProgress}
                                variant={
                                    order.remainingAmount > 0
                                        ? "warning"
                                        : "success"
                                }
                                size="md"
                            />
                            <div className="mt-2 flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
                                <span>Progress pembayaran</span>
                                <span className="font-semibold text-[var(--color-text-primary)]">
                                    {Math.round(roundedPaymentProgress)}%
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-3">
                                <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                                    <CreditCard className="h-3.5 w-3.5" />
                                    Metode
                                </div>
                                <div className="mt-2">
                                    <Badge variant="secondary" size="sm">
                                        {order.paymentMethod
                                            ? order.paymentMethod.toUpperCase()
                                            : "Belum ditentukan"}
                                    </Badge>
                                </div>
                            </div>
                            <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-3">
                                <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                                    <Banknote className="h-3.5 w-3.5" />
                                    Status
                                </div>
                                <div className="mt-2">
                                    <Badge
                                        variant={order.paymentStatusBadgeVariant}
                                        size="sm"
                                    >
                                        {order.paymentStatusLabel}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        {order.paymentMethod === "cod" && (
                            <div className="flex items-start gap-2 rounded-[var(--radius-md)] border border-[var(--color-info-200)] bg-[var(--color-info-50)] p-3 text-xs text-[var(--color-info-800)]">
                                <Info className="mt-0.5 h-4 w-4 shrink-0" />
                                <span>
                                    Pembayaran akan ditagih saat delivery atau
                                    penyerahan order.
                                </span>
                            </div>
                        )}

                        {order.requiresPaymentBeforeDelivery &&
                            order.remainingAmount > 0 && (
                                <div className="flex items-start gap-2 rounded-[var(--radius-md)] border border-[var(--color-error-200)] bg-[var(--color-error-50)] p-3 text-xs text-[var(--color-error-800)]">
                                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                                    <span>
                                        Order harus lunas sebelum dikirim atau
                                        diserahkan.
                                    </span>
                                </div>
                            )}

                        {lastPayment && (
                            <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-3">
                                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
                                    Pembayaran Terakhir
                                </p>
                                <p className="text-sm text-[var(--color-text-primary)]">
                                    <span className="font-semibold">
                                        {lastPayment.formattedAmount}
                                    </span>
                                    {lastPayment.paymentMethodLabel &&
                                        ` via ${lastPayment.paymentMethodLabel}`}
                                </p>
                                <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                                    {lastPayment.formattedCreatedAt}
                                </p>
                            </div>
                        )}

                        {order.canPay && (
                            <Button
                                fullWidth
                                size="sm"
                                onClick={() => onNavigateTab(2)}
                                leftIcon={<Banknote className="h-4 w-4" />}
                            >
                                Catat Pembayaran
                            </Button>
                        )}
                    </div>

                    <div className="p-5">
                        <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
                            Breakdown Tagihan
                        </h4>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between items-center">
                                <span className="text-[var(--color-text-secondary)]">Subtotal</span>
                                <span>{order.formattedSubtotal}</span>
                            </div>
                            {order.discountAmount > 0 && (
                                <div className="flex justify-between items-center text-[var(--color-error-500)]">
                                    <span>Diskon</span>
                                    <span>-{order.formattedDiscountAmount}</span>
                                </div>
                            )}
                            {order.taxAmount > 0 && (
                                <div className="flex justify-between items-center">
                                    <span className="text-[var(--color-text-secondary)]">Pajak</span>
                                    <span>{order.formattedTaxAmount}</span>
                                </div>
                            )}
                            {order.pickupFee > 0 && (
                                <div className="flex justify-between items-center">
                                    <span className="text-[var(--color-text-secondary)]">Biaya Pickup</span>
                                    <span>{order.formattedPickupFee}</span>
                                </div>
                            )}
                            {order.deliveryFee > 0 && (
                                <div className="flex justify-between items-center">
                                    <span className="text-[var(--color-text-secondary)]">Biaya Delivery</span>
                                    <span>{order.formattedDeliveryFee}</span>
                                </div>
                            )}
                            <div className="mt-1 flex items-center justify-between border-t border-[var(--color-border)] pt-3 font-bold">
                                <span>Total Tagihan</span>
                                <span className="text-base text-[var(--color-primary-600)]">
                                    {order.formattedTotalAmount}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
