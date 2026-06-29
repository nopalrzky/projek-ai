import { Card } from "@/Components/Card";
import { Badge } from "@/Components/Badge";
import { formatDateTime } from "@/lib/utils";
import { Activity, ClipboardList, Package } from "lucide-react";
import { QuotaUsageLogsIndexProps } from "./types";

function QuotaUsageLogsIndex({ subscription }: QuotaUsageLogsIndexProps) {
    const usageLogs = [...(subscription.quotaUsageLogs || [])].sort((a, b) => {
        const left = new Date(a.createdAt || 0).getTime();
        const right = new Date(b.createdAt || 0).getTime();
        return right - left;
    });

    const totalUsed = usageLogs.reduce(
        (sum, log) => sum + Number(log.amountUsed || 0),
        0,
    );

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card variant="elevated" className="p-5">
                    <p
                        className="text-sm"
                        style={{ color: "var(--color-text-secondary)" }}
                    >
                        Total Event Penggunaan
                    </p>
                    <h3
                        className="text-xl font-bold mt-1"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        {usageLogs.length.toLocaleString("id-ID")}
                    </h3>
                </Card>

                <Card variant="elevated" className="p-5">
                    <p
                        className="text-sm"
                        style={{ color: "var(--color-text-secondary)" }}
                    >
                        Total Kuota Terpakai
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
                        Riwayat Penggunaan Deposit
                    </h3>
                    <Badge variant="info">{usageLogs.length} log</Badge>
                </div>

                {usageLogs.length === 0 ? (
                    <div
                        className="p-8 text-center rounded-lg border"
                        style={{ borderColor: "var(--color-border)" }}
                    >
                        <p style={{ color: "var(--color-text-secondary)" }}>
                            Belum ada histori penggunaan untuk subscription ini.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {usageLogs.map((log) => (
                            <div
                                key={log.id}
                                className="p-4 rounded-lg border"
                                style={{
                                    borderColor: "var(--color-border)",
                                    backgroundColor:
                                        "var(--color-surface-secondary)",
                                }}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Activity
                                                className="w-4 h-4"
                                                style={{
                                                    color: "var(--color-primary-600)",
                                                }}
                                            />
                                            <p
                                                className="font-medium"
                                                style={{
                                                    color: "var(--color-text-primary)",
                                                }}
                                            >
                                                {log.laundryServiceName ||
                                                    "Layanan"}
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2 text-xs">
                                            <span
                                                className="inline-flex items-center gap-1"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                <ClipboardList className="w-3.5 h-3.5" />
                                                Order: {log.orderNumber || "-"}
                                            </span>

                                            <span
                                                className="inline-flex items-center gap-1"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                <Package className="w-3.5 h-3.5" />
                                                Qty Item:{" "}
                                                {log.orderItemQuantity ?? "-"}
                                            </span>
                                        </div>

                                        <p
                                            className="text-xs"
                                            style={{
                                                color: "var(--color-text-tertiary)",
                                            }}
                                        >
                                            {formatDateTime(
                                                log.createdAt,
                                                "long",
                                            )}
                                        </p>
                                    </div>

                                    <Badge variant="warning">
                                        -
                                        {Number(
                                            log.amountUsed || 0,
                                        ).toLocaleString("id-ID")}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
}

export default QuotaUsageLogsIndex;
