import { useState, useEffect, useRef } from "react";
import { Head, router } from "@inertiajs/react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { Tabs } from "@/Components/Tabs";
import { Info, Receipt, CreditCard, History, Clock } from "lucide-react";
import { TopupShowProps } from "./types";
import TopupPageHeader from "./Partials/TopupPageHeader";
import TopupOverview from "./Partials/TopupOverview";
import TopupPaymentDetails from "./Partials/TopupPaymentDetails";
import { Alert } from "@/Components/Alert";

function TopupShow({ topup }: TopupShowProps) {
    const [activeTab, setActiveTab] = useState(0);
    const pollingTimer = useRef<NodeJS.Timeout | null>(null);
    const startTime = useRef<number>(Date.now());
    const MAX_POLLING_DURATION = 5 * 60 * 1000;

    useEffect(() => {
        // Only poll if status is pending
        if (topup.status === "pending") {
            const poll = () => {
                const now = Date.now();
                if (now - startTime.current > MAX_POLLING_DURATION) {
                    console.log("Polling timeout reached");
                    return;
                }

                router.reload({
                    only: ["topup"],
                    preserveScroll: true,
                    onSuccess: (page: any) => {
                        const updatedTopup = page.props.topup as any;
                        if (updatedTopup.status !== "pending") {
                            if (pollingTimer.current)
                                clearInterval(pollingTimer.current);
                        }
                    },
                } as any);
            };

            pollingTimer.current = setInterval(poll, 5000); // 5 seconds
        }

        return () => {
            if (pollingTimer.current) clearInterval(pollingTimer.current);
        };
    }, [topup.status, topup.id]);

    const tabsConfig = [
        {
            label: "Overview",
            icon: <Info className="w-4 h-4" />,
        },
        {
            label: "Detail Pembayaran",
            icon: <CreditCard className="w-4 h-4" />,
        },
    ];

    const topupTypeName = topup.isMasterTopup ? "Master Topup" : "Outlet Topup";

    return (
        <>
            <Head title={`${topupTypeName} - ${topup.formattedAmountMoney}`} />

            <div className="p-6 space-y-6  mx-auto">
                {topup.status === "pending" && (
                    <Alert
                        variant="info"
                        title="Status Pembayaran Dipantau Otomatis"
                        description="Halaman ini akan diperbarui secara otomatis ketika pembayaran Anda terkonfirmasi. Jangan tutup halaman ini jika ingin melihat instruksi."
                        icon={<Clock className="w-5 h-5 animate-pulse" />}
                    />
                )}

                <TopupPageHeader
                    topup={topup}
                    topupType={topup.isMasterTopup ? "master" : "outlet"}
                />

                <Tabs
                    variant="underline"
                    size="md"
                    tabs={tabsConfig}
                    selectedIndex={activeTab}
                    onChange={setActiveTab}
                    animated={true}
                    className="w-full"
                >
                    <TopupOverview topup={topup} />

                    <TopupPaymentDetails topup={topup} />
                </Tabs>
            </div>
        </>
    );
}

TopupShow.layout = withAuthenticatedLayout({
    title: "Detail Topup",
    searchable: false,
    breadcrumbs: [
        { label: "Topup", href: route("topups.index") },
        { label: "Detail", href: "#" },
    ],
});

export default TopupShow;
