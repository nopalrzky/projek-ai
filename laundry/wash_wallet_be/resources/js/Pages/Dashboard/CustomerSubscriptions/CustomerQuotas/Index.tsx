import { Card } from "@/Components/Card";
import { Badge } from "@/Components/Badge";
import { Coins, PackageCheck, Scale } from "lucide-react";
import { CustomerQuotasIndexProps } from "./types";

function CustomerQuotasIndex({ subscription }: CustomerQuotasIndexProps) {
    const quotas = subscription.customerQuotas || [];

    const totalQuota = quotas.reduce(
        (sum, item) => sum + Number(item.totalQuota || 0),
        0,
    );
    const totalRemaining = quotas.reduce(
        (sum, item) => sum + Number(item.remainingQuota || 0),
        0,
    );
    const totalUsed = Math.max(0, totalQuota - totalRemaining);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card variant="elevated" className="p-5">
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
                </Card>

                <Card variant="elevated" className="p-5">
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
                </Card>

                <Card variant="elevated" className="p-5">
                    <p
                        className="text-sm"
                        style={{ color: "var(--color-text-secondary)" }}
                    >
                        Kuota Terpakai
                    </p>
                    <h3
                        className="text-xl font-bold mt-1"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        {totalUsed.toLocaleString("id-ID")}
                    </h3>
                </Card>
            </div>

            <Card variant="elevated" className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3
                        className="text-base font-semibold"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        Rincian Penggunaan Per Layanan
                    </h3>
                    <Badge variant="info">{quotas.length} layanan</Badge>
                </div>

                {quotas.length === 0 ? (
                    <div
                        className="p-8 text-center rounded-lg border"
                        style={{ borderColor: "var(--color-border)" }}
                    >
                        <p style={{ color: "var(--color-text-secondary)" }}>
                            Belum ada data kuota layanan pada subscription ini.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {quotas.map((quota) => {
                            const total = Number(quota.totalQuota || 0);
                            const remaining = Number(quota.remainingQuota || 0);
                            const used = Math.max(0, total - remaining);
                            const usagePercent =
                                total > 0
                                    ? Math.min(
                                          100,
                                          Math.max(0, (used / total) * 100),
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
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <div>
                                            <p
                                                className="font-medium"
                                                style={{
                                                    color: "var(--color-text-primary)",
                                                }}
                                            >
                                                {quota.laundryService?.name ||
                                                    "Layanan"}
                                            </p>
                                            <p
                                                className="text-xs mt-1"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                ID Layanan:{" "}
                                                {quota.laundryServiceId}
                                            </p>
                                        </div>

                                        <Badge
                                            variant={
                                                remaining > 0
                                                    ? "success"
                                                    : "warning"
                                            }
                                        >
                                            {remaining > 0
                                                ? "Masih Tersedia"
                                                : "Habis"}
                                        </Badge>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                                        <div
                                            className="p-3 rounded-lg"
                                            style={{
                                                backgroundColor:
                                                    "var(--color-surface)",
                                            }}
                                        >
                                            <p
                                                className="text-xs mb-1"
                                                style={{
                                                    color: "var(--color-text-tertiary)",
                                                }}
                                            >
                                                <span className="inline-flex items-center gap-1">
                                                    <PackageCheck className="w-3.5 h-3.5" />
                                                    Total
                                                </span>
                                            </p>
                                            <p
                                                className="font-semibold"
                                                style={{
                                                    color: "var(--color-text-primary)",
                                                }}
                                            >
                                                {total.toLocaleString("id-ID")}
                                            </p>
                                        </div>

                                        <div
                                            className="p-3 rounded-lg"
                                            style={{
                                                backgroundColor:
                                                    "var(--color-surface)",
                                            }}
                                        >
                                            <p
                                                className="text-xs mb-1"
                                                style={{
                                                    color: "var(--color-text-tertiary)",
                                                }}
                                            >
                                                <span className="inline-flex items-center gap-1">
                                                    <Coins className="w-3.5 h-3.5" />
                                                    Sisa
                                                </span>
                                            </p>
                                            <p
                                                className="font-semibold"
                                                style={{
                                                    color: "var(--color-text-primary)",
                                                }}
                                            >
                                                {remaining.toLocaleString(
                                                    "id-ID",
                                                )}
                                            </p>
                                        </div>

                                        <div
                                            className="p-3 rounded-lg"
                                            style={{
                                                backgroundColor:
                                                    "var(--color-surface)",
                                            }}
                                        >
                                            <p
                                                className="text-xs mb-1"
                                                style={{
                                                    color: "var(--color-text-tertiary)",
                                                }}
                                            >
                                                <span className="inline-flex items-center gap-1">
                                                    <Scale className="w-3.5 h-3.5" />
                                                    Terpakai
                                                </span>
                                            </p>
                                            <p
                                                className="font-semibold"
                                                style={{
                                                    color: "var(--color-text-primary)",
                                                }}
                                            >
                                                {used.toLocaleString("id-ID")} (
                                                {usagePercent.toFixed(1)}%)
                                            </p>
                                        </div>
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
                                                width: `${usagePercent}%`,
                                                backgroundColor:
                                                    remaining > 0
                                                        ? "var(--color-primary-500)"
                                                        : "var(--color-warning-500)",
                                            }}
                                        />
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

export default CustomerQuotasIndex;
