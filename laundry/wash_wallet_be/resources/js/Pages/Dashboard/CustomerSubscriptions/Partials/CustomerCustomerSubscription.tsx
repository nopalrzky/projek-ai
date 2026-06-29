import { Card } from "@/Components/Card";
import { Badge } from "@/Components/Badge";
import { Mail, MapPin, Phone, User } from "lucide-react";
import { CustomerCustomerSubscriptionProps } from "../types";

function CustomerCustomerSubscription({
    subscription,
}: CustomerCustomerSubscriptionProps) {
    const customer = subscription.customer;
    const quotas = subscription.customerQuotas || [];

    return (
        <div className="space-y-6">
            <Card variant="elevated" className="p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: "var(--color-primary-100)" }}
                    >
                        <User
                            className="w-5 h-5"
                            style={{ color: "var(--color-primary-600)" }}
                        />
                    </div>
                    <h3
                        className="text-lg font-semibold"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        Informasi Pelanggan
                    </h3>
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
                            Nama Pelanggan
                        </p>
                        <p
                            className="font-semibold"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            {customer?.name || "-"}
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
                            Status Pelanggan
                        </p>
                        <Badge
                            variant={
                                customer?.isActive ? "success" : "secondary"
                            }
                        >
                            {customer?.statusLabel || "-"}
                        </Badge>
                    </div>

                    <div
                        className="p-4 rounded-lg"
                        style={{
                            backgroundColor: "var(--color-surface-secondary)",
                        }}
                    >
                        <p
                            className="text-xs mb-1 flex items-center gap-1"
                            style={{ color: "var(--color-text-tertiary)" }}
                        >
                            <Phone className="w-3 h-3" />
                            Telepon
                        </p>
                        <p
                            className="font-medium"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            {customer?.phone || "-"}
                        </p>
                    </div>

                    <div
                        className="p-4 rounded-lg"
                        style={{
                            backgroundColor: "var(--color-surface-secondary)",
                        }}
                    >
                        <p
                            className="text-xs mb-1 flex items-center gap-1"
                            style={{ color: "var(--color-text-tertiary)" }}
                        >
                            <Mail className="w-3 h-3" />
                            Email
                        </p>
                        <p
                            className="font-medium"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            {customer?.email || "-"}
                        </p>
                    </div>

                    <div
                        className="p-4 rounded-lg md:col-span-2"
                        style={{
                            backgroundColor: "var(--color-surface-secondary)",
                        }}
                    >
                        <p
                            className="text-xs mb-1 flex items-center gap-1"
                            style={{ color: "var(--color-text-tertiary)" }}
                        >
                            <MapPin className="w-3 h-3" />
                            Alamat
                        </p>
                        <p
                            className="font-medium"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            {customer?.address || "-"}
                        </p>
                    </div>
                </div>
            </Card>

            <Card variant="elevated" className="p-6">
                <h4
                    className="text-base font-semibold mb-4"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    Rincian Kuota Pelanggan
                </h4>

                {quotas.length === 0 ? (
                    <div
                        className="p-8 text-center rounded-lg border"
                        style={{ borderColor: "var(--color-border)" }}
                    >
                        <p style={{ color: "var(--color-text-secondary)" }}>
                            Tidak ada data kuota untuk subscription ini.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {quotas.map((quota) => {
                            const totalQuota = Number(quota.totalQuota || 0);
                            const remainingQuota = Number(
                                quota.remainingQuota || 0,
                            );
                            const usedQuota = totalQuota - remainingQuota;
                            const percent =
                                totalQuota > 0
                                    ? Math.min(
                                          100,
                                          Math.max(
                                              0,
                                              (usedQuota / totalQuota) * 100,
                                          ),
                                      )
                                    : 0;

                            return (
                                <div
                                    key={quota.id}
                                    className="p-4 rounded-lg border"
                                    style={{
                                        borderColor: "var(--color-border)",
                                        backgroundColor:
                                            "var(--color-surface-secondary)",
                                    }}
                                >
                                    <div className="flex items-center justify-between mb-2 gap-3">
                                        <p
                                            className="font-medium"
                                            style={{
                                                color: "var(--color-text-primary)",
                                            }}
                                        >
                                            {quota.laundryService?.name ||
                                                "Layanan"}
                                        </p>
                                        <Badge
                                            variant={
                                                remainingQuota > 0
                                                    ? "success"
                                                    : "warning"
                                            }
                                        >
                                            Sisa {remainingQuota}
                                        </Badge>
                                    </div>

                                    <div
                                        className="h-2 rounded-full overflow-hidden"
                                        style={{
                                            backgroundColor:
                                                "var(--color-surface-tertiary)",
                                        }}
                                    >
                                        <div
                                            className="h-full rounded-full"
                                            style={{
                                                width: `${percent}%`,
                                                backgroundColor:
                                                    "var(--color-primary-500)",
                                            }}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between mt-2">
                                        <p
                                            className="text-xs"
                                            style={{
                                                color: "var(--color-text-secondary)",
                                            }}
                                        >
                                            Terpakai: {usedQuota}
                                        </p>
                                        <p
                                            className="text-xs"
                                            style={{
                                                color: "var(--color-text-secondary)",
                                            }}
                                        >
                                            Total: {totalQuota}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </Card>
        </div>
    );
}

export default CustomerCustomerSubscription;
