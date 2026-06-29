import { useState, useCallback } from "react";
import { Head } from "@inertiajs/react";
import { Tabs } from "@/Components/Tabs";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { MembershipContractShowProps } from "./types";
import { Eye, Users, Building2 } from "lucide-react";
import MembershipContractPageHeader from "./Partials/MembershipContractPageHeader";
import MembershipContractOverview from "./Partials/MembershipContractOverview";
import MembershipContractCustomer from "./Partials/MembershipContractCustomer";
import MembershipContractOutlet from "./Partials/MembershipContractOutlet";

function MembershipContractShow({
    membershipContract,
}: MembershipContractShowProps) {
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
            label: "Pelanggan",
            icon: <Users className="w-4 h-4" />,
        },
        {
            label: "Outlet",
            icon: <Building2 className="w-4 h-4" />,
        },
    ];

    return (
        <>
            <Head
                title={`Kontrak: ${membershipContract.customer.name} - ${membershipContract.membershipPlan.name}`}
            />

            <div className="p-6 space-y-6  mx-auto">
                <MembershipContractPageHeader
                    membershipContract={membershipContract}
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
                    <MembershipContractOverview
                        membershipContract={membershipContract}
                    />
                    <MembershipContractCustomer
                        customer={membershipContract.customer}
                    />
                    <MembershipContractOutlet
                        outlet={membershipContract.outlet}
                    />
                </Tabs>
            </div>
        </>
    );
}

MembershipContractShow.layout = withAuthenticatedLayout({
    title: "Detail Kontrak Membership",
    searchable: false,
    breadcrumbs: [
        {
            label: "Kontrak Membership",
            href: route("membership-contracts.index"),
        },
        { label: "Detail Kontrak" },
    ],
});

export default MembershipContractShow;
