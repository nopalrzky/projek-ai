import { useState } from "react";
import { Head } from "@inertiajs/react";
import { motion } from "framer-motion";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { Tabs } from "@/Components/Tabs";
import FineLogPageHeader from "./Partials/FineLogPageHeader";
import FineLogOverview from "./Partials/FineLogOverview";
import FineLogEmployee from "./Partials/FineLogEmployee";
import { Info, User } from "lucide-react";
import { FineLogShowProps } from "./types";

function FineLogShow({ fineLog }: FineLogShowProps) {
    const [activeTab, setActiveTab] = useState(0);

    const tabsConfig = [
        {
            id: "overview",
            label: "Ringkasan",
            icon: <Info className="w-4 h-4" />,
        },
        {
            id: "employee",
            label: "Karyawan",
            icon: <User className="w-4 h-4" />,
        },
    ];

    return (
        <>
            <Head
                title={`Denda - ${fineLog.employee?.name || "Detail"} - ${
                    fineLog.fine?.name || ""
                }`}
            />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="p-6"
            >
                <div className=" mx-auto space-y-6">
                    <FineLogPageHeader fineLog={fineLog} />

                    <Tabs
                        variant="underline"
                        size="md"
                        tabs={tabsConfig}
                        selectedIndex={activeTab}
                        onChange={setActiveTab}
                        animated={true}
                        className="w-full"
                    >
                        <FineLogOverview fineLog={fineLog} />
                        <FineLogEmployee fineLog={fineLog} />
                    </Tabs>
                </div>
            </motion.div>
        </>
    );
}

FineLogShow.layout = withAuthenticatedLayout({
    title: "Detail Denda",
    searchable: false,
    breadcrumbs: [
        { label: "Denda", href: route("fine-logs.index") },
        { label: "Detail", href: "#" },
    ],
});

export default FineLogShow;
