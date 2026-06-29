"use client";

import { Head, usePage } from "@inertiajs/react";
import { Tabs } from "@/Components/Tabs";
import { Alert } from "@/Components/Alert";
import { useOutletTabs } from "@/Hooks/useOutletTabs";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { lazy, Suspense } from "react";
import type {
    OutletShowProps,
    OutletOverviewStats,
    OutletOverviewCharts,
    OrderSummary,
    OperationalChecklistItem,
    OutletOverviewMeta,
} from "./types";
import {
    Info,
    Users,
    History,
    Briefcase,
    Layers,
    ShieldAlert,
    CreditCard,
    Zap,
    Truck,
    Settings,
    Package,
} from "lucide-react";
import OutletPageHeader from "./Partials/OutletPageHeader";
import OutletCategoriesIndex from "./Categories/Index";
import OutletCustomersIndex from "./Customers/Index";
import OutletEmployeesIndex from "./Employees/Index";
import OutletLaundryServicesIndex from "./LaundryServices/Index";
import OutletOperationalDaysIndex from "./OperationalDays/Index";
import OutletPositionIndex from "./Positions/Index";
import OutletFinesIndex from "./Fines/Index";
import OutletMembershipPlansIndex from "./MembershipPlans/Index";
import OutletServicePackagesIndex from "./ServicePackages/Index";
import OutletFeaturesIndex from "./OutletFeatures/Index";
import OutletCourierTab from "./Courier/Index";
import OutletSettingsTab from "./Partials/OutletSettingsTab";

const OutletOverview = lazy(() => import("./Partials/OutletOverview"));

const OutletShow = ({
    outlet,
    overviewStats,
    overviewCharts,
    recentOrders,
    operationalChecklist,
    overviewMeta,
}: OutletShowProps) => {
    const { activeTab, handleTabChange } = useOutletTabs(outlet.id);
    const { flash } = usePage<any>().props;

    const tabsConfig = [
        {
            label: "Overview",
            icon: <Info className="w-4 h-4" />,
        },
        {
            label: "Fitur & Aktivasi",
            icon: <Zap className="w-4 h-4" />,
            badge: outlet.outletFeaturesCount
                ? outlet.outletFeaturesCount.toString()
                : "0",
        },
        {
            label: "Jam Kerja",
            icon: <History className="w-4 h-4" />,
        },
        {
            label: "Kurir",
            icon: <Truck className="w-4 h-4" />,
        },
        {
            label: "Posisi",
            icon: <Briefcase className="w-4 h-4" />,
            badge: outlet.positionsCount
                ? outlet.positionsCount.toString()
                : "0",
        },
        {
            label: "Karyawan",
            icon: <Users className="w-4 h-4" />,
            badge: outlet.employeesCount
                ? outlet.employeesCount.toString()
                : "0",
        },
        {
            label: "Pelanggan",
            icon: <Users className="w-4 h-4" />,
            badge: outlet.customersCount
                ? outlet.customersCount.toString()
                : "0",
        },
        {
            label: "Kategori",
            icon: <Layers className="w-4 h-4" />,
            badge: outlet.categoriesCount
                ? outlet.categoriesCount.toString()
                : "0",
        },
        {
            label: "Layanan",
            icon: <Layers className="w-4 h-4" />,
            badge: outlet.laundryServicesCount
                ? outlet.laundryServicesCount.toString()
                : "0",
        },
        {
            label: "Denda",
            icon: <ShieldAlert className="w-4 h-4" />,
            badge: outlet.finesCount ? outlet.finesCount.toString() : "0",
        },
        {
            label: "Membership",
            icon: <CreditCard className="w-4 h-4" />,
            badge: outlet.membershipPlansCount
                ? outlet.membershipPlansCount.toString()
                : "0",
        },
        {
            label: "Paket Deposit",
            icon: <Package className="w-4 h-4" />,
            badge: outlet.servicePackagesCount
                ? outlet.servicePackagesCount.toString()
                : "0",
        },

        {
            label: "Pengaturan",
            icon: <Settings className="w-4 h-4" />,
        },
    ];
    return (
        <>
            <Head title={`Outlet: ${outlet.name}`} />

            <div className="p-4 md:p-6 space-y-4 md:space-y-6  mx-auto">
                <OutletPageHeader outlet={outlet} />

                {flash?.success && (
                    <Alert
                        variant="success"
                        title="Berhasil"
                        description={flash.success}
                    />
                )}

                {flash?.error && (
                    <Alert
                        variant="error"
                        title="Error"
                        description={flash.error}
                    />
                )}

                <Tabs
                    variant="underline"
                    size="md"
                    tabs={tabsConfig}
                    selectedIndex={activeTab}
                    onChange={handleTabChange}
                    animated={true}
                    scrollable={true}
                    className="w-full"
                >
                    {activeTab === 0 ? (
                        <Suspense fallback={<div className="h-96 loading-skeleton" />}>
                            <OutletOverview
                                outlet={outlet}
                                overviewStats={overviewStats}
                                overviewCharts={overviewCharts}
                                recentOrders={recentOrders}
                                operationalChecklist={operationalChecklist}
                                overviewMeta={overviewMeta}
                            />
                        </Suspense>
                    ) : (
                        <div />
                    )}

                    {activeTab === 1 ? (
                        <OutletFeaturesIndex outlet={outlet} />
                    ) : (
                        <div />
                    )}

                    {activeTab === 2 ? (
                        <OutletOperationalDaysIndex
                            outlet={outlet}
                            isLoading={false}
                        />
                    ) : (
                        <div />
                    )}

                    {activeTab === 3 ? (
                        <OutletCourierTab outlet={outlet} />
                    ) : (
                        <div />
                    )}

                    {activeTab === 4 ? (
                        <OutletPositionIndex outlet={outlet} isLoading={false} />
                    ) : (
                        <div />
                    )}

                    {activeTab === 5 ? (
                        <OutletEmployeesIndex outlet={outlet} isLoading={false} />
                    ) : (
                        <div />
                    )}

                    {activeTab === 6 ? (
                        <OutletCustomersIndex outlet={outlet} isLoading={false} />
                    ) : (
                        <div />
                    )}

                    {activeTab === 7 ? (
                        <OutletCategoriesIndex outlet={outlet} isLoading={false} />
                    ) : (
                        <div />
                    )}

                    {activeTab === 8 ? (
                        <OutletLaundryServicesIndex
                            outlet={outlet}
                            isLoading={false}
                        />
                    ) : (
                        <div />
                    )}

                    {activeTab === 9 ? (
                        <OutletFinesIndex outlet={outlet} isLoading={false} />
                    ) : (
                        <div />
                    )}
                    
                    {activeTab === 10 ? (
                        <OutletMembershipPlansIndex
                            outlet={outlet}
                            isLoading={false}
                        />
                    ) : (
                        <div />
                    )}

                    {activeTab === 11 ? (
                        <OutletServicePackagesIndex
                            outlet={outlet}
                            isLoading={false}
                        />
                    ) : (
                        <div />
                    )}

                    {activeTab === 12 ? (
                        <OutletSettingsTab outlet={outlet} />
                    ) : (
                        <div />
                    )}
                </Tabs>
            </div>
        </>
    );
};

OutletShow.layout = (page: any) =>
    withAuthenticatedLayout({
        title: "Detail Outlet",
        searchable: false,
        breadcrumbs: [
            { label: "Outlet", href: route("outlets.index") },
            { label: page.props.outlet.name },
        ],
    })(page);

export default OutletShow;
