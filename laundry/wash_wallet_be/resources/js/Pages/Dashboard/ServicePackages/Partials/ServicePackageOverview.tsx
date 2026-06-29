import { Card } from "@/Components/Card";
import { DollarSign, Clock, Package, Users } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { ServicePackageOverviewProps } from "../types";

const ServicePackageOverview = ({
    servicePackage,
}: ServicePackageOverviewProps) => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card variant="elevated" className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p
                                className="text-sm"
                                style={{
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                Harga Paket
                            </p>
                            <p
                                className="text-2xl font-bold mt-1"
                                style={{
                                    color: "var(--color-text-primary)",
                                }}
                            >
                                {formatCurrency(servicePackage.price)}
                            </p>
                        </div>
                        <div
                            className="w-12 h-12 rounded-full flex items-center justify-center"
                            style={{
                                backgroundColor: "var(--color-success-100)",
                            }}
                        >
                            <DollarSign
                                className="w-6 h-6"
                                style={{
                                    color: "var(--color-success-600)",
                                }}
                            />
                        </div>
                    </div>
                </Card>

                <Card variant="elevated" className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p
                                className="text-sm"
                                style={{
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                Masa Berlaku
                            </p>
                            <p
                                className="text-2xl font-bold mt-1"
                                style={{
                                    color: "var(--color-text-primary)",
                                }}
                            >
                                {servicePackage.validityDays || "Selamanya"}
                            </p>
                        </div>
                        <div
                            className="w-12 h-12 rounded-full flex items-center justify-center"
                            style={{
                                backgroundColor: "var(--color-primary-100)",
                            }}
                        >
                            <Clock
                                className="w-6 h-6"
                                style={{
                                    color: "var(--color-primary-600)",
                                }}
                            />
                        </div>
                    </div>
                </Card>

                <Card variant="elevated" className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p
                                className="text-sm"
                                style={{
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                Item Layanan
                            </p>
                            <p
                                className="text-2xl font-bold mt-1"
                                style={{
                                    color: "var(--color-text-primary)",
                                }}
                            >
                                {servicePackage.servicePackageItemsCount || 0}
                            </p>
                        </div>
                        <div
                            className="w-12 h-12 rounded-full flex items-center justify-center"
                            style={{
                                backgroundColor: "var(--color-info-100)",
                            }}
                        >
                            <Package
                                className="w-6 h-6"
                                style={{
                                    color: "var(--color-info-600)",
                                }}
                            />
                        </div>
                    </div>
                </Card>

                <Card variant="elevated" className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p
                                className="text-sm"
                                style={{
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                Pelanggan Aktif
                            </p>
                            <p
                                className="text-2xl font-bold mt-1"
                                style={{
                                    color: "var(--color-text-primary)",
                                }}
                            >
                                {servicePackage.customerSubscriptionsCount || 0}
                            </p>
                        </div>
                        <div
                            className="w-12 h-12 rounded-full flex items-center justify-center"
                            style={{
                                backgroundColor: "var(--color-warning-100)",
                            }}
                        >
                            <Users
                                className="w-6 h-6"
                                style={{
                                    color: "var(--color-warning-600)",
                                }}
                            />
                        </div>
                    </div>
                </Card>
            </div>

            <Card variant="elevated" className="p-6">
                <h3
                    className="text-lg font-semibold mb-4"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    Informasi Paket
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label
                            className="text-sm font-medium"
                            style={{
                                color: "var(--color-text-secondary)",
                            }}
                        >
                            Deskripsi
                        </label>
                        <p
                            className="mt-1"
                            style={{
                                color: "var(--color-text-primary)",
                            }}
                        >
                            {servicePackage.description ||
                                "Tidak ada deskripsi"}
                        </p>
                    </div>
                    <div>
                        <label
                            className="text-sm font-medium"
                            style={{
                                color: "var(--color-text-secondary)",
                            }}
                        >
                            Outlet
                        </label>
                        <p
                            className="mt-1"
                            style={{
                                color: "var(--color-text-primary)",
                            }}
                        >
                            {servicePackage.outlet.name}
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default ServicePackageOverview;
