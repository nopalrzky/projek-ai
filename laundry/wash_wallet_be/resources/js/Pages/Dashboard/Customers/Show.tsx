import { useState } from "react";
import { Head } from "@inertiajs/react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { Tabs } from "@/Components/Tabs";
import { CustomerShowProps } from "./types";
import { Info, Building, ShoppingCart, Star, CreditCard } from "lucide-react";
import CustomerOverview from "./Partials/CustomerOverview";
import CustomerOutlet from "./Partials/CustomerOutlet";
import CustomerPageHeader from "./Partials/CustomerPageHeader";
import CustomerOrders from "./Orders/Index";
import CustomerMembershipContractsIndex from "./MembershipContracts/Index";
import CustomerSubscriptionsIndex from "./CustomerSubscriptions/Index";

function CustomerShow({ customer }: CustomerShowProps) {
    const [activeTab, setActiveTab] = useState(0);

    const tabsConfig = [
        {
            label: "Overview",
            icon: <Info className="w-4 h-4" />,
        },
        {
            label: "Outlet",
            icon: <Building className="w-4 h-4" />,
        },
        {
            label: "Riwayat Pesanan",
            icon: <ShoppingCart className="w-4 h-4" />,
            badge: customer.ordersCount ? customer.ordersCount.toString() : "0",
        },
        {
            label: "Membership",
            icon: <Star className="w-4 h-4" />,
            badge: customer.membershipContractsCount
                ? customer.membershipContractsCount.toString()
                : "0",
        },
        {
            label: "Deposit",
            icon: <CreditCard className="w-4 h-4" />,
            badge: customer.customerSubscriptionsCount
                ? customer.customerSubscriptionsCount.toString()
                : "0",
        },
    ];

    return (
        <>
            <Head title={`Pelanggan: ${customer.name}`} />

            <div className="p-6 space-y-6  mx-auto">
                {/* Customer Header */}
                <CustomerPageHeader customer={customer} />

                {/* Main Content dengan Tabs */}
                <Tabs
                    variant="underline"
                    size="md"
                    tabs={tabsConfig}
                    selectedIndex={activeTab}
                    onChange={setActiveTab}
                    animated={true}
                    className="w-full"
                >
                    {/* Tab 1: Overview */}
                    <CustomerOverview customer={customer} />

                    {/* Tab 2: Outlet */}
                    <CustomerOutlet customer={customer} />

                    {/* Tab 3: Riwayat Pesanan */}
                    <CustomerOrders customer={customer} />

                    {/* Tab 4: Membership */}
                    <CustomerMembershipContractsIndex customer={customer} />

                    {/* Tab 5: Deposit */}
                    <CustomerSubscriptionsIndex customer={customer} />
                </Tabs>
            </div>
        </>
    );
}

CustomerShow.layout = withAuthenticatedLayout({
    title: "Detail Pelanggan",
    searchable: false,
    breadcrumbs: [
        { label: "Pelanggan", href: route("customers.index") },
        { label: "Detail" },
    ],
});

export default CustomerShow;
