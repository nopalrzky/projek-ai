import { Card } from "@/Components/Card";
import { Badge } from "@/Components/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CalendarClock, Coins, Package, Percent, Wallet } from "lucide-react";
import { CustomerSubscriptionOverviewProps } from "../types";

function CustomerSubscriptionOverview({
    subscription,
}: CustomerSubscriptionOverviewProps) {
    const customerQuotas = subscription.customerQuotas || [];
    const totalQuota = customerQuotas.reduce(
        (sum, item) => sum + Number(item.totalQuota || 0),
        0,
    );
    const totalRemaining = customerQuotas.reduce(
        (sum, item) => sum + Number(item.remainingQuota || 0),
        0,
    );
    const totalUsed = totalQuota - totalRemaining;
    const usagePercent =
        totalQuota > 0 ? Math.max(0, (totalUsed / totalQuota) * 100) : 0;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <Card className="p-5" variant="elevated">
                    <div className="flex items-start justify-between">
                        <div>
                            <p
                                className="text-sm"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                Harga Deposit
                            </p>
                            <h3
                                className="text-xl font-bold mt-1"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                {formatCurrency(subscription.pricePaid || 0)}
                            </h3>
                        </div>
                        <div
                            className="p-2.5 rounded-lg"
                            style={{
                                backgroundColor: "var(--color-success-100)",
                            }}
                        >
                            <Wallet
                                className="w-5 h-5"
                                style={{ color: "var(--color-success-600)" }}
                            />
                        </div>
                    </div>
                </Card>

                <Card className="p-5" variant="elevated">
                    <div className="flex items-start justify-between">
                        <div>
                            <p
                                className="text-sm"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                Total Kuota
                            </p>
                            <h3
                                className="text-xl font-bold mt-1"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                {totalQuota.toLocaleString("id-ID")}
                            </h3>
                        </div>
                        <div
                            className="p-2.5 rounded-lg"
                            style={{
                                backgroundColor: "var(--color-primary-100)",
                            }}
                        >
                            <Package
                                className="w-5 h-5"
                                style={{ color: "var(--color-primary-600)" }}
                            />
                        </div>
                    </div>
                </Card>

                <Card className="p-5" variant="elevated">
                    <div className="flex items-start justify-between">
                        <div>
                            <p
                                className="text-sm"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                Sisa Kuota
                            </p>
                            <h3
                                className="text-xl font-bold mt-1"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                {totalRemaining.toLocaleString("id-ID")}
                            </h3>
                        </div>
                        <div
                            className="p-2.5 rounded-lg"
                            style={{
                                backgroundColor: "var(--color-info-100)",
                            }}
                        >
                            <Coins
                                className="w-5 h-5"
                                style={{ color: "var(--color-info-600)" }}
                            />
                        </div>
                    </div>
                </Card>

                <Card className="p-5" variant="elevated">
                    <div className="flex items-start justify-between">
                        <div>
                            <p
                                className="text-sm"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                Terpakai
                            </p>
                            <h3
                                className="text-xl font-bold mt-1"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                {usagePercent.toFixed(1)}%
                            </h3>
                        </div>
                        <div
                            className="p-2.5 rounded-lg"
                            style={{
                                backgroundColor: "var(--color-warning-100)",
                            }}
                        >
                            <Percent
                                className="w-5 h-5"
                                style={{ color: "var(--color-warning-600)" }}
                            />
                        </div>
                    </div>
                </Card>
            </div>

            <Card variant="elevated" className="p-6 space-y-5">
                <div className="flex items-center justify-between">
                    <h3
                        className="text-lg font-semibold"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        Ringkasan Deposit
                    </h3>
                    <Badge
                        variant={subscription.statusBadgeVariant || "secondary"}
                    >
                        {subscription.statusLabel || subscription.status}
                    </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                        className="p-4 rounded-lg"
                        style={{
                            backgroundColor: "var(--color-surface-secondary)",
                        }}
                    >
                        <p
                            className="text-xs mb-1"
                            style={{ color: "var(--color-text-tertiary)" }}
                        >
                            Tanggal Pembelian
                        </p>
                        <p
                            className="font-medium"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            {formatDate(subscription.purchaseDate, "long")}
                        </p>
                    </div>

                    <div
                        className="p-4 rounded-lg"
                        style={{
                            backgroundColor: "var(--color-surface-secondary)",
                        }}
                    >
                        <p
                            className="text-xs mb-1"
                            style={{ color: "var(--color-text-tertiary)" }}
                        >
                            Masa Berlaku
                        </p>
                        <div className="flex items-center gap-2">
                            <CalendarClock
                                className="w-4 h-4"
                                style={{ color: "var(--color-text-secondary)" }}
                            />
                            <p
                                className="font-medium"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                {subscription.isUnlimited
                                    ? "Tidak terbatas"
                                    : formatDate(
                                          subscription.expiredAt,
                                          "long",
                                      )}
                            </p>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}

export default CustomerSubscriptionOverview;
