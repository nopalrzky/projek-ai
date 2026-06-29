import { Card } from "@/Components/Card";
import { Badge } from "@/Components/Badge";
import { formatCurrency } from "@/lib/utils";
import { Box, PackageOpen } from "lucide-react";
import { CustomerSubscriptionServicePackageProps } from "../types";

function CustomerSubscriptionServicePackage({
    subscription,
}: CustomerSubscriptionServicePackageProps) {
    const servicePackage = subscription.servicePackage;
    const items = servicePackage?.servicePackageItems || [];

    return (
        <div className="space-y-6">
            <Card variant="elevated" className="p-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h3
                            className="text-lg font-semibold"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            {servicePackage?.name || "Paket Deposit"}
                        </h3>
                        <p
                            className="text-sm mt-1"
                            style={{ color: "var(--color-text-secondary)" }}
                        >
                            {servicePackage?.description ||
                                "Paket ini tidak memiliki deskripsi."}
                        </p>
                    </div>

                    <Badge
                        variant={
                            servicePackage?.isActive ? "success" : "secondary"
                        }
                    >
                        {servicePackage?.isActive ? "Aktif" : "Nonaktif"}
                    </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
                    <div
                        className="p-4 rounded-lg"
                        style={{
                            backgroundColor: "var(--color-surface-secondary)",
                        }}
                    >
                        <p
                            className="text-xs"
                            style={{ color: "var(--color-text-tertiary)" }}
                        >
                            Harga Paket
                        </p>
                        <p
                            className="font-semibold mt-1"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            {formatCurrency(servicePackage?.price || 0)}
                        </p>
                    </div>

                    <div
                        className="p-4 rounded-lg"
                        style={{
                            backgroundColor: "var(--color-surface-secondary)",
                        }}
                    >
                        <p
                            className="text-xs"
                            style={{ color: "var(--color-text-tertiary)" }}
                        >
                            Masa Berlaku Paket
                        </p>
                        <p
                            className="font-semibold mt-1"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            {servicePackage?.validityDays
                                ? `${servicePackage.validityDays} hari`
                                : "Tidak dibatasi"}
                        </p>
                    </div>

                    <div
                        className="p-4 rounded-lg"
                        style={{
                            backgroundColor: "var(--color-surface-secondary)",
                        }}
                    >
                        <p
                            className="text-xs"
                            style={{ color: "var(--color-text-tertiary)" }}
                        >
                            Jumlah Item Layanan
                        </p>
                        <p
                            className="font-semibold mt-1"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            {items.length}
                        </p>
                    </div>
                </div>
            </Card>

            <Card variant="elevated" className="p-6">
                <div className="flex items-center gap-2 mb-4">
                    <PackageOpen
                        className="w-5 h-5"
                        style={{ color: "var(--color-primary-600)" }}
                    />
                    <h4
                        className="text-base font-semibold"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        Detail Layanan Dalam Paket
                    </h4>
                </div>

                {items.length === 0 ? (
                    <div
                        className="p-8 text-center rounded-lg border"
                        style={{ borderColor: "var(--color-border)" }}
                    >
                        <p style={{ color: "var(--color-text-secondary)" }}>
                            Belum ada item layanan pada paket ini.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className="p-4 rounded-lg border flex items-center justify-between"
                                style={{
                                    borderColor: "var(--color-border)",
                                    backgroundColor:
                                        "var(--color-surface-secondary)",
                                }}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className="p-2 rounded-lg"
                                        style={{
                                            backgroundColor:
                                                "var(--color-primary-100)",
                                        }}
                                    >
                                        <Box
                                            className="w-4 h-4"
                                            style={{
                                                color: "var(--color-primary-600)",
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <p
                                            className="font-medium"
                                            style={{
                                                color: "var(--color-text-primary)",
                                            }}
                                        >
                                            {item.laundryService?.name ||
                                                "Layanan"}
                                        </p>
                                        <p
                                            className="text-xs"
                                            style={{
                                                color: "var(--color-text-secondary)",
                                            }}
                                        >
                                            Unit:{" "}
                                            {item.laundryService?.unit?.name ||
                                                "-"}
                                        </p>
                                    </div>
                                </div>

                                <Badge variant="info">
                                    Kuota: {item.quantity}
                                </Badge>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
}

export default CustomerSubscriptionServicePackage;
