import { Head } from "@inertiajs/react";
import { Info, Store, Calendar } from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { Tabs } from "@/Components/Tabs";
import { MembershipPlanShowProps } from "./types";
import MembershipPlanPageHeader from "./Partials/MembershipPlanPageHeader";
import MembershipPlanOverview from "./Partials/MembershipPlanOverview";
import MembershipPlanOutlet from "./Partials/MembershipPlanOutlet";
import MembershipContractsIndex from "./MembershipContracts/Index";

function MembershipPlanShow({ membershipPlan }: MembershipPlanShowProps) {
    const tabs = [
        {
            label: "Overview",
            icon: <Info className="w-4 h-4" />,
        },
        {
            label: "Outlet",
            icon: <Store className="w-4 h-4" />,
        },
        {
            label: "Kontrak Member",
            icon: <Calendar className="w-4 h-4" />,
            badge: `${membershipPlan.membershipContractsCount || 0}`,
            badgeVariant: "primary" as const,
        },
    ];

    return (
        <>
            <Head title={`${membershipPlan.name} - Detail Paket Membership`} />

            <div
                className="min-h-screen p-6"
                style={{ backgroundColor: "var(--color-background)" }}
            >
                <div className=" mx-auto space-y-6">
                    <MembershipPlanPageHeader membershipPlan={membershipPlan} />

                    <Tabs
                        tabs={tabs}
                        variant="underline"
                        defaultIndex={0}
                        fullWidth={false}
                    >
                        <MembershipPlanOverview
                            membershipPlan={membershipPlan}
                        />

                        <MembershipPlanOutlet outlet={membershipPlan.outlet} />

                        <MembershipContractsIndex
                            membershipPlan={membershipPlan}
                            isLoading={false}
                        />
                    </Tabs>
                </div>
            </div>
        </>
    );
}

MembershipPlanShow.layout = (page: any) =>
    withAuthenticatedLayout({
        title: "Detail Paket Membership",
        breadcrumbs: [
            {
                label: "Paket Membership",
                href: route("membership-plans.index"),
            },
            { label: "Detail Paket" },
        ],
    })(page);

export default MembershipPlanShow;
