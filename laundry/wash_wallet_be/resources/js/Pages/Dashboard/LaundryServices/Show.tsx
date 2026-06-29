import { useState, useCallback } from "react";
import { Head } from "@inertiajs/react";
import { Tabs } from "@/Components/Tabs";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { LaundryServiceShowProps } from "./types";
import { Eye, ListOrdered, Package, ShoppingCart } from "lucide-react";
import LaundryServicePageHeader from "./Partials/LaundryServicePageHeader";
import LaundryServiceOverview from "./Partials/LaundryServiceOverview";
import LaundryServiceProcessesIndex from "./LaundryServiceProcesses/Index";
import LaundryServicePackageItemsIndex from "./ServicePackageItems/Index";
import LaundryServiceOrderItemsIndex from "./OrderItems/Index";

const LaundryServiceShow = ({ laundryService }: LaundryServiceShowProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState(0);

    const handleTabChange = useCallback((index: number) => {
        setActiveTab(index);
    }, []);

    const tabsConfig = [
        {
            label: "Ringkasan",
            icon: <Eye className="w-4 h-4" />,
        },
        {
            label: "Proses Layanan",
            icon: <ListOrdered className="w-4 h-4" />,
            badge: laundryService.laundryServiceProcessesCount
                ? laundryService.laundryServiceProcessesCount.toString()
                : "0",
        },
        {
            label: "Bagian Paket",
            icon: <Package className="w-4 h-4" />,
            badge: laundryService.servicePackageItemsCount
                ? laundryService.servicePackageItemsCount.toString()
                : "0",
        },
        {
            label: "Order",
            icon: <ShoppingCart className="w-4 h-4" />,
            badge: laundryService.orderItemsCount
                ? laundryService.orderItemsCount.toString()
                : "0",
        },
    ];
    return (
        <>
            <Head title={`Layanan: ${laundryService.name}`} />

            <div className="p-6 space-y-6  mx-auto">
                <LaundryServicePageHeader
                    laundryService={laundryService}
                    isLoading={isLoading}
                />

                <Tabs
                    variant="underline"
                    size="md"
                    tabs={tabsConfig}
                    selectedIndex={activeTab}
                    onChange={handleTabChange}
                    animated={true}
                    className="w-full"
                >
                    <LaundryServiceOverview laundryService={laundryService} />
                    <LaundryServiceProcessesIndex
                        laundryService={laundryService}
                        isLoading={isLoading}
                    />
                    <LaundryServicePackageItemsIndex
                        laundryService={laundryService}
                        isLoading={isLoading}
                    />
                    <LaundryServiceOrderItemsIndex
                        laundryService={laundryService}
                        isLoading={isLoading}
                    />
                </Tabs>
            </div>
        </>
    );
};

LaundryServiceShow.layout = (page: any) =>
    withAuthenticatedLayout({
        title: "Detail Layanan",
        searchable: false,
        breadcrumbs: [
            { label: "Layanan Laundry", href: route("laundry-services.index") },
            {
                label: page.props.laundryService.name,
            },
        ],
    })(page);

export default LaundryServiceShow;
