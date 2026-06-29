import { useState } from "react";
import { Head } from "@inertiajs/react";
import { motion } from "framer-motion";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { Tabs } from "@/Components/Tabs";
import { Info, Landmark, User, CreditCard, Activity } from "lucide-react";
import { PayrollShowProps } from "./types";
import PayrollPageHeader from "./Partials/PayrollPageHeader";
import PayrollOverview from "./Partials/PayrollOverview";
import PayrollEmployee from "./Partials/PayrollEmployee";
import PayrollBankAccount from "./Partials/PayrollBankAccount";
import PayrollLogs from "./Partials/PayrollLogs";
import PayrollItemsIndex from "./PayrollItems/Index";

function PayrollShow({ payroll, flash }: PayrollShowProps) {
    const [activeTab, setActiveTab] = useState(0);

    const tabsConfig = [
        {
            label: "Ringkasan",
            icon: <Info className="w-4 h-4" />,
        },
        {
            label: "Komponen",
            icon: <Landmark className="w-4 h-4" />,
            badge: (payroll.payrollDetails?.length ?? 0).toString(),
        },
        {
            label: "Karyawan",
            icon: <User className="w-4 h-4" />,
        },
        {
            label: "Sumber Dana",
            icon: <CreditCard className="w-4 h-4" />,
        },
        {
            label: "Detail Log",
            icon: <Activity className="w-4 h-4" />,
            badge: (
                (payroll.workLogs?.length ?? 0) +
                (payroll.fineLogs?.length ?? 0)
            ).toString(),
        },
    ];

    return (
        <>
            <Head
                title={`Payroll — ${payroll.employeeName} ${payroll.periodLabel}`}
            />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="p-6"
            >
                <div className=" mx-auto space-y-6">
                    <PayrollPageHeader payroll={payroll} />

                    <Tabs
                        variant="underline"
                        size="md"
                        tabs={tabsConfig}
                        selectedIndex={activeTab}
                        onChange={setActiveTab}
                        animated={true}
                        className="w-full"
                    >
                        <PayrollOverview payroll={payroll} flash={flash} />
                        <PayrollItemsIndex payroll={payroll} />
                        <PayrollEmployee payroll={payroll} />
                        <PayrollBankAccount payroll={payroll} />
                        <PayrollLogs payroll={payroll} />
                    </Tabs>
                </div>
            </motion.div>
        </>
    );
}

PayrollShow.layout = withAuthenticatedLayout({
    title: "Detail Payroll",
    searchable: false,
    breadcrumbs: [
        { label: "Payroll", href: route("payrolls.index") },
        { label: "Detail" },
    ],
});

export default PayrollShow;
