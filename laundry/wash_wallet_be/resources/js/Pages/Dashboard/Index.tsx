import React, { Suspense, useState } from "react";
import { Head, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { DashboardIndexProps, DashboardPeriod } from "./types";
import DashboardHeader from "./Partials/DashboardHeader";
import MoneySummary from "./Partials/MoneySummary";
import KpiGrid from "./Partials/KpiGrid";
import ActionCenter from "./Partials/ActionCenter";
import OrderFunnel from "./Partials/OrderFunnel";
import SetupChecklist from "./Partials/SetupChecklist";
import { SectionLabel } from "@/Components/Page";
import { Loading } from "@/Components/State";

const RevenueExpenseTrend = React.lazy(
    () => import("./Partials/RevenueExpenseTrend"),
);
const OutletPerformance = React.lazy(
    () => import("./Partials/OutletPerformance"),
);
const CustomerMembership = React.lazy(
    () => import("./Partials/CustomerMembership"),
);
const HrPayroll = React.lazy(() => import("./Partials/HrPayroll"));
const ActivityFeed = React.lazy(() => import("./Partials/ActivityFeed"));

const LoadingSkeleton: React.FC<{ height: string }> = ({ height }) => (
    <div className={`w-full ${height} flex items-center justify-center rounded-xl border`} style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
        <Loading type="spinner" />
    </div>
);

const DashboardIndex: React.FC<DashboardIndexProps> = ({
    dashboard,
    outlets,
}) => {
    const {
        meta,
        filters,
        kpis,
        money,
        actionCenter,
        operations,
        finance,
        outlets: outletSummary,
        customers,
        membership,
        hrPayroll,
        activityFeed,
        setupChecklist,
    } = dashboard;

    const [isUpdating, setIsUpdating] = useState(false);

    const handleFilterChange = (
        period: DashboardPeriod,
        outletId: number | null,
    ) => {
        setIsUpdating(true);
        router.get(
            route("dashboard"),
            { period, outlet_id: outletId },
            {
                preserveState: true,
                preserveScroll: true,
                only: ["dashboard"],
                onFinish: () => setIsUpdating(false),
            },
        );
    };

    return (
        <AuthenticatedLayout title="Owner Dashboard">
            <Head title="Owner Dashboard" />

            <div
                className="pointer-events-none fixed inset-0 overflow-hidden"
                style={{ zIndex: 0 }}
                aria-hidden="true"
            >
                <div
                    className="glow-orb glow-orb-primary"
                    style={{
                        top: "-18rem",
                        left: "-18rem",
                        opacity: "var(--orb-opacity-min)",
                        width: "38rem",
                        height: "38rem",
                    }}
                />
                <div
                    className="glow-orb glow-orb-secondary"
                    style={{
                        bottom: "-14rem",
                        right: "-14rem",
                        opacity: "var(--orb-opacity-min)",
                        width: "34rem",
                        height: "34rem",
                    }}
                />
            </div>

            <div
                className="relative mx-auto py-6 sm:px-6 lg:px-8"
                style={{ zIndex: 1 }}
            >
                {setupChecklist && (
                    <div className="mb-6 animate-fadeInUp">
                        <SetupChecklist items={setupChecklist} />
                    </div>
                )}

                <section className="mb-8 animate-fadeInUp">
                    <DashboardHeader
                        period={meta.period}
                        outletId={filters.outletId}
                        outlets={outlets}
                        generatedAt={meta.generatedAt}
                        onFilterChange={handleFilterChange}
                        isUpdating={isUpdating}
                    />
                </section>

                <section
                    className="mb-8 space-y-4 animate-fadeInUp"
                    style={{ animationDelay: "60ms" }}
                >
                    <SectionLabel label="Angka Kritis" />
                    <div
                        className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-3"
                        style={{
                            opacity: isUpdating ? 0.6 : 1,
                            transition: "opacity var(--transition-normal)",
                        }}
                    >
                        <div className="lg:col-span-1">
                            <MoneySummary money={money} />
                        </div>
                        <div className="lg:col-span-2">
                            <KpiGrid kpis={kpis} />
                        </div>
                    </div>
                </section>

                <section
                    className="mb-8 space-y-4 animate-fadeInUp"
                    style={{ animationDelay: "120ms" }}
                >
                    <SectionLabel label="Denyut Operasional" />
                    <div
                        className="grid grid-cols-1 lg:grid-cols-3 gap-5"
                        style={{
                            opacity: isUpdating ? 0.6 : 1,
                            transition: "opacity var(--transition-normal)",
                        }}
                    >
                        <div className="lg:col-span-1">
                            <ActionCenter actions={actionCenter} />
                        </div>
                        <div className="lg:col-span-2">
                            <OrderFunnel operations={operations} />
                        </div>
                    </div>
                </section>

                <section
                    className="mb-8 space-y-4 animate-fadeInUp"
                    style={{ animationDelay: "180ms" }}
                >
                    <SectionLabel label="Analisis Lanjutan" />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        <Suspense fallback={<LoadingSkeleton height="h-72" />}>
                            <RevenueExpenseTrend
                                finance={finance}
                                period={meta.period}
                            />
                        </Suspense>
                        <Suspense fallback={<LoadingSkeleton height="h-72" />}>
                            <OutletPerformance summary={outletSummary} />
                        </Suspense>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        <Suspense fallback={<LoadingSkeleton height="h-72" />}>
                            <CustomerMembership
                                customers={customers}
                                membership={membership}
                            />
                        </Suspense>
                        <Suspense fallback={<LoadingSkeleton height="h-72" />}>
                            <HrPayroll hrPayroll={hrPayroll} />
                        </Suspense>
                    </div>
                </section>

                <section
                    className="animate-fadeInUp"
                    style={{ animationDelay: "240ms" }}
                >
                    <SectionLabel label="Riwayat Aktivitas" />
                    <div className="mt-4">
                        <Suspense fallback={<LoadingSkeleton height="h-48" />}>
                            <ActivityFeed activities={activityFeed} />
                        </Suspense>
                    </div>
                </section>
            </div>
        </AuthenticatedLayout>
    );
};

export default DashboardIndex;
