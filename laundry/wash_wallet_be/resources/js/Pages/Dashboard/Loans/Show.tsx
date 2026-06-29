import { useState } from "react";
import { Head } from "@inertiajs/react";
import { motion } from "framer-motion";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";

import { Tabs } from "@/Components/Tabs";
import { LoanShowProps } from "./types";
import LoanPageHeader from "./Partials/LoanPageHeader";
import LoanLogsIndex from "./LoanLogs/Index";
import LoanEmployee from "./Partials/LoanEmployee";
import LoanOverview from "./Partials/LoanOverview";
import { DollarSign, Info, User } from "lucide-react";

function LoanShow({ loan, flash }: LoanShowProps) {
    const [activeTab, setActiveTab] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

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
        {
            id: "payments",
            label: "Pembayaran",
            icon: <DollarSign className="w-4 h-4" />,
        },
    ];

    return (
        <>
            <Head title={`Kasbon - ${loan.employee?.name || "Detail"}`} />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="p-6"
            >
                <div className=" mx-auto space-y-6">
                    <LoanPageHeader loan={loan} isLoading={isLoading} />

                    <Tabs
                        variant="underline"
                        size="md"
                        tabs={tabsConfig}
                        selectedIndex={activeTab}
                        onChange={setActiveTab}
                        animated={true}
                        className="w-full"
                    >
                        <LoanOverview loan={loan} />
                        <LoanEmployee loan={loan} />
                        <LoanLogsIndex
                            loan={loan}
                            loanLogs={loan.loanLogs || []}
                        />
                    </Tabs>
                </div>
            </motion.div>
        </>
    );
}

LoanShow.layout = withAuthenticatedLayout({
    title: "Detail Kasbon",
    searchable: false,
    breadcrumbs: [
        { label: "Kasbon", href: route("loans.index") },
        { label: "Detail", href: "#" },
    ],
});

export default LoanShow;
