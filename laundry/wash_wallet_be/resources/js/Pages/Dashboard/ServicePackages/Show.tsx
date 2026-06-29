import { useState } from "react";
import { Head } from "@inertiajs/react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { Tabs } from "@/Components/Tabs";
import { Card } from "@/Components/Card";
import { Badge } from "@/Components/Badge";
import { Info, Package, Users, Calendar } from "lucide-react";
import { ServicePackageShowProps } from "./types";
import CustomerSubscriptionsIndex from "./CustomerSubscriptions/Index";
import ServicePackageOverview from "./Partials/ServicePackageOverview";
import ServicePackageItemsIndex from "./ServicePackageItems/Index";

function ServicePackageShow({ servicePackage }: ServicePackageShowProps) {
    const [activeTab, setActiveTab] = useState(0);

    const tabsConfig = [
        {
            label: "Overview",
            icon: <Info className="w-4 h-4" />,
        },
        {
            label: "Item Paket",
            icon: <Package className="w-4 h-4" />,
            badge: servicePackage.servicePackageItemsCount?.toString() || "0",
        },
        {
            label: "Pelanggan",
            icon: <Users className="w-4 h-4" />,
            badge: servicePackage.customerSubscriptionsCount?.toString() || "0",
        },
    ];

    return (
        <>
            <Head title={`Paket Layanan: ${servicePackage.name}`} />

            <div className="p-6 space-y-6  mx-auto">
                <Card variant="elevated" className="p-6">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-4">
                            <div
                                className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center text-xl font-bold"
                                style={{
                                    backgroundColor: "var(--color-primary-100)",
                                    color: "var(--color-primary-600)",
                                }}
                            >
                                <Package className="w-8 h-8" />
                            </div>
                            <div>
                                <div className="flex items-center space-x-3">
                                    <h1
                                        className="text-2xl font-bold"
                                        style={{
                                            color: "var(--color-text-primary)",
                                        }}
                                    >
                                        {servicePackage.name}
                                    </h1>
                                    <Badge
                                        variant={
                                            servicePackage.isActive
                                                ? "success"
                                                : "secondary"
                                        }
                                    >
                                        {servicePackage.isActive
                                            ? "Aktif"
                                            : "Tidak Aktif"}
                                    </Badge>
                                </div>
                                <p
                                    className="mt-1"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    {servicePackage.outlet.name}
                                </p>
                                <div className="flex items-center space-x-4 mt-2 text-sm">
                                    <span
                                        className="flex items-center"
                                        style={{
                                            color: "var(--color-text-tertiary)",
                                        }}
                                    >
                                        <Calendar className="w-4 h-4 mr-1" />
                                        Dibuat{" "}
                                        {new Date(
                                            servicePackage.createdAt,
                                        ).toLocaleDateString("id-ID")}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                <Tabs
                    variant="underline"
                    size="md"
                    tabs={tabsConfig}
                    selectedIndex={activeTab}
                    onChange={setActiveTab}
                    animated={true}
                    className="w-full"
                >
                    <ServicePackageOverview servicePackage={servicePackage} />

                    <ServicePackageItemsIndex servicePackage={servicePackage} />

                    <CustomerSubscriptionsIndex
                        servicePackage={servicePackage}
                    />
                </Tabs>
            </div>
        </>
    );
}

ServicePackageShow.layout = withAuthenticatedLayout({
    title: "Detail Paket Layanan",
    searchable: false,
    breadcrumbs: [
        { label: "Paket Layanan", href: route("service-packages.index") },
        { label: "Detail", href: "#" },
    ],
});

export default ServicePackageShow;
