import { useState } from "react";
import { Head } from "@inertiajs/react";
import { motion } from "framer-motion";
import { Tabs } from "@/Components/Tabs";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { FineShowProps } from "./types";
import { Info, History, Building2 } from "lucide-react";
import FinePageHeader from "./Partials/FinePageHeader";
import FineOverview from "./Partials/FineOverview";
import FineOutlet from "./Partials/FineOutlet";
import FineLogsIndex from "./FineLogs/Index";

function FineShow({ fine }: FineShowProps) {
    const [activeTab, setActiveTab] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const tabsConfig = [
        {
            label: "Overview",
            icon: <Info className="w-4 h-4" />,
        },
        {
            label: "Catatan Denda",
            icon: <History className="w-4 h-4" />,
            badge: fine.fineLogsCount?.toString() || "0",
        },
        {
            label: "Outlet",
            icon: <Building2 className="w-4 h-4" />,
        },
    ];

    return (
        <>
            <Head title={`Denda: ${fine.name}`} />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="p-6 space-y-6  mx-auto"
            >
                <FinePageHeader fine={fine} isLoading={isLoading} />

                <Tabs
                    variant="underline"
                    size="md"
                    tabs={tabsConfig}
                    selectedIndex={activeTab}
                    onChange={setActiveTab}
                    animated={true}
                    className="w-full"
                >
                    <FineOverview fine={fine} />
                    <FineLogsIndex fine={fine} />
                    <FineOutlet fine={fine} />
                </Tabs>
            </motion.div>
        </>
    );
}

FineShow.layout = withAuthenticatedLayout({
    title: "Detail Denda",
    searchable: false,
    breadcrumbs: [
        { label: "Denda", href: route("fines.index") },
        { label: "Detail", href: "#" },
    ],
});

export default FineShow;
