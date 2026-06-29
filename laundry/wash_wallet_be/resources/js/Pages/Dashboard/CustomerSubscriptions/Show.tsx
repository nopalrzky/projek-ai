import { useState } from "react";
import { Head } from "@inertiajs/react";
import { motion } from "framer-motion";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { Tabs } from "@/Components/Tabs";
import { Alert } from "@/Components/Alert";
import { Info, Package, User, WalletCards, History } from "lucide-react";
import { CustomerSubscriptionShowProps } from "./types";
import CustomerSubscriptionPageHeader from "./Partials/CustomerSubscriptionPageHeader";
import CustomerSubscriptionOverview from "./Partials/CustomerSubscriptionOverview";
import CustomerSubscriptionServicePackage from "./Partials/CustomerSubscriptionServicePackage";
import CustomerCustomerSubscription from "./Partials/CustomerCustomerSubscription";
import CustomerQuotasIndex from "./CustomerQuotas/Index";
import QuotaUsageLogsIndex from "./QuotaUsageLogs/Index";

function CustomerSubscriptionShow({
    subscription,
    flash,
}: CustomerSubscriptionShowProps) {
    const [activeTab, setActiveTab] = useState(0);
    const customerQuotasCount = subscription.customerQuotas?.length || 0;
    const usageLogsCount = subscription.quotaUsageLogs?.length || 0;

    const tabsConfig = [
        {
            label: "Overview",
            icon: <Info className="w-4 h-4" />,
        },
        {
            label: "Penggunaan Kuota",
            icon: <WalletCards className="w-4 h-4" />,
            badge: customerQuotasCount.toString(),
        },
        {
            label: "Riwayat Penggunaan",
            icon: <History className="w-4 h-4" />,
            badge: usageLogsCount.toString(),
        },
        {
            label: "Paket Layanan",
            icon: <Package className="w-4 h-4" />,
            badge:
                subscription.servicePackage?.servicePackageItemsCount?.toString() ||
                subscription.servicePackage?.servicePackageItems?.length?.toString() ||
                "0",
        },
        {
            label: "Pelanggan",
            icon: <User className="w-4 h-4" />,
        },
    ];

    return (
        <>
            <Head
                title={`Deposit ${subscription.subscriptionCode || "Detail"}`}
            />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="p-6"
            >
                <div className=" mx-auto space-y-6">
                    <CustomerSubscriptionPageHeader
                        subscription={subscription}
                    />

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
                            title="Terjadi Kesalahan"
                            description={flash.error}
                        />
                    )}

                    {subscription.status === "expired" && (
                        <Alert
                            variant="warning"
                            title="Deposit Sudah Kadaluarsa"
                            description="Paket deposit ini sudah melewati masa aktif dan tidak dapat digunakan kembali."
                        />
                    )}

                    {subscription.status === "exhausted" && (
                        <Alert
                            variant="info"
                            title="Deposit Sudah Habis"
                            description="Semua kuota pada paket deposit ini telah digunakan pelanggan."
                        />
                    )}

                    <Tabs
                        variant="underline"
                        size="md"
                        tabs={tabsConfig}
                        selectedIndex={activeTab}
                        onChange={setActiveTab}
                        animated={true}
                        className="w-full"
                    >
                        <CustomerSubscriptionOverview
                            subscription={subscription}
                        />
                        <CustomerQuotasIndex subscription={subscription} />
                        <QuotaUsageLogsIndex subscription={subscription} />
                        <CustomerSubscriptionServicePackage
                            subscription={subscription}
                        />
                        <CustomerCustomerSubscription
                            subscription={subscription}
                        />
                    </Tabs>
                </div>
            </motion.div>
        </>
    );
}

CustomerSubscriptionShow.layout = withAuthenticatedLayout({
    title: "Detail Deposit Pelanggan",
    searchable: false,
    breadcrumbs: [
        {
            label: "Deposit Pelanggan",
            href: route("customer-subscriptions.index"),
        },
        { label: "Detail" },
    ],
});

export default CustomerSubscriptionShow;
