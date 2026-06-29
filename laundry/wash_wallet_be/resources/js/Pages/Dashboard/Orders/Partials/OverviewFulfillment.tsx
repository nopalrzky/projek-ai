import type { ReactNode } from "react";
import { Order } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/Card";
import { Badge } from "@/Components/Badge";
import {
    AlertTriangle,
    Calendar,
    CheckCircle2,
    MapPin,
    Route,
    Truck,
} from "lucide-react";

interface Props {
    order: Order;
}

const FulfillmentInfo = ({
    icon,
    label,
    value,
    missing,
}: {
    icon: ReactNode;
    label: string;
    value?: string | null;
    missing: string;
}) => (
    <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-3">
        <div className="flex items-start gap-3">
            <span className="mt-0.5 text-[var(--color-text-tertiary)]">
                {icon}
            </span>
            <div className="min-w-0">
                <p className="text-xs font-medium text-[var(--color-text-secondary)]">
                    {label}
                </p>
                {value ? (
                    <p className="mt-1 text-sm font-semibold leading-relaxed text-[var(--color-text-primary)]">
                        {value}
                    </p>
                ) : (
                    <Badge variant="warning" size="xs" className="mt-2">
                        {missing}
                    </Badge>
                )}
            </div>
        </div>
    </div>
);

export default function OverviewFulfillment({ order }: Props) {
    const isWalkIn = order.deliveryType === "walk_in";
    const hasPickup =
        order.deliveryType === "pickup_only" ||
        order.deliveryType === "pickup_and_delivery";
    const hasDelivery =
        order.deliveryType === "delivery_only" ||
        order.deliveryType === "pickup_and_delivery";

    return (
        <Card className="overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)]">
            <CardHeader className="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)] pb-4">
                <CardTitle className="flex items-center justify-between gap-3 text-base">
                    <span className="flex items-center gap-2 text-[var(--color-text-primary)]">
                        <Truck className="h-4 w-4 text-[var(--color-primary-600)]" />
                        Fulfillment
                    </span>
                    <Badge variant="secondary" size="sm">
                        {order.deliveryTypeLabel}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
                {isWalkIn && !hasPickup && !hasDelivery ? (
                    <div className="rounded-[var(--radius-lg)] border border-[var(--color-success-200)] bg-[var(--color-success-50)] p-4 text-[var(--color-success-800)]">
                        <div className="flex items-start gap-3">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-success-100)] text-[var(--color-success-600)]">
                                <CheckCircle2 className="h-5 w-5" />
                            </span>
                            <div>
                                <p className="text-sm font-semibold">
                                    Walk-in Outlet
                                </p>
                                <p className="mt-1 text-xs leading-relaxed">
                                    Pesanan diserahkan dan diambil langsung di
                                    outlet.
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {hasPickup && (
                            <section className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <span className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-primary-50)] text-[var(--color-primary-600)]">
                                        <Route className="h-3.5 w-3.5" />
                                    </span>
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
                                        Pickup
                                    </h4>
                                </div>
                                <FulfillmentInfo
                                    icon={<Calendar className="h-4 w-4" />}
                                    label="Jadwal Pickup"
                                    value={
                                        order.formattedPickupSchedule ||
                                        order.formattedPickupDate
                                    }
                                    missing="Belum dijadwalkan"
                                />
                                <FulfillmentInfo
                                    icon={<MapPin className="h-4 w-4" />}
                                    label="Alamat Pickup"
                                    value={order.pickupAddress}
                                    missing="Alamat belum tersedia"
                                />
                            </section>
                        )}

                        {hasDelivery && (
                            <section className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <span className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-info-50)] text-[var(--color-info-600)]">
                                        <Truck className="h-3.5 w-3.5" />
                                    </span>
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
                                        Delivery
                                    </h4>
                                </div>
                                <FulfillmentInfo
                                    icon={<Calendar className="h-4 w-4" />}
                                    label="Jadwal Delivery"
                                    value={
                                        order.formattedDeliverySchedule ||
                                        order.formattedDeliveryDate
                                    }
                                    missing="Belum dijadwalkan"
                                />
                                <FulfillmentInfo
                                    icon={<MapPin className="h-4 w-4" />}
                                    label="Alamat Delivery"
                                    value={order.deliveryAddress}
                                    missing="Alamat belum tersedia"
                                />
                            </section>
                        )}
                    </div>
                )}

                {order.canScheduleDelivery && !isWalkIn && (
                    <div className="flex items-start gap-2 rounded-[var(--radius-md)] border border-[var(--color-info-200)] bg-[var(--color-info-50)] p-3 text-xs text-[var(--color-info-800)]">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>Pengiriman untuk order ini sudah bisa dijadwalkan.</span>
                    </div>
                )}

                {order.requiresPaymentBeforeDelivery &&
                    order.remainingAmount > 0 &&
                    !isWalkIn && (
                        <div className="flex items-start gap-2 rounded-[var(--radius-md)] border border-[var(--color-error-200)] bg-[var(--color-error-50)] p-3 text-xs text-[var(--color-error-800)]">
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                            <span>
                                Order harus lunas sebelum pengiriman dapat
                                dilakukan.
                            </span>
                        </div>
                    )}
            </CardContent>
        </Card>
    );
}
