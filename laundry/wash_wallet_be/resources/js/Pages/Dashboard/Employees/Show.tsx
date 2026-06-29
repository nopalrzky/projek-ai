import { useState } from "react";
import { Head } from "@inertiajs/react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { Tabs } from "@/Components/Tabs";
import {
    Info,
    Briefcase,
    ShoppingCart,
    User,
    DollarSign,
    HandCoins,
    AlertCircle,
} from "lucide-react";
import { EmployeeShowProps } from "./types";
import EmployeePersonalInfo from "./Partials/EmployeePersonalInfoProps";
import EmployeeOverview from "./Partials/EmployeeOverview";
import EmployeeSalariesIndex from "./EmployeeSalaries/Index";
import EmployeePositionsIndex from "./EmployeePositions/Index";
import EmployeeProcessesIndex from "./EmployeeProcesses/Index";
import EmployeeLoansIndex from "./Loans/Index";
import EmployeePageHeader from "./Partials/EmployeePageHeader";
import EmployeeOrdersIndex from "./Orders/Index";
import EmployeeFineLogsIndex from "./FineLogs/Index";

function EmployeeShow({ employee, positions }: EmployeeShowProps) {
    const [activeTab, setActiveTab] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const tabsConfig = [
        {
            label: "Overview",
            icon: <Info className="w-4 h-4" />,
        },
        {
            label: "Informasi Pribadi",
            icon: <User className="w-4 h-4" />,
        },
        {
            label: "Posisi",
            icon: <Briefcase className="w-4 h-4" />,
            badge: employee.employeePositionsCount
                ? employee.employeePositionsCount.toString()
                : "0",
        },
        {
            label: "Proses",
            icon: <Briefcase className="w-4 h-4" />,
            badge: employee.employeeProcessesCount
                ? employee.employeeProcessesCount.toString()
                : "0",
        },
        {
            label: "Gaji",
            icon: <DollarSign className="w-4 h-4" />,
            badge: employee.employeeSalariesCount
                ? employee.employeeSalariesCount.toString()
                : "0",
        },
        {
            label: "Pinjaman",
            icon: <HandCoins className="w-4 h-4" />,
            badge: employee.loansCount ? employee.loansCount.toString() : "0",
        },
        {
            label: "Denda",
            icon: <AlertCircle className="w-4 h-4" />,
            badge: employee.fineLogsCount
                ? employee.fineLogsCount.toString()
                : "0",
        },
        {
            label: "Pesanan",
            icon: <ShoppingCart className="w-4 h-4" />,
            badge: employee.ordersCount ? employee.ordersCount.toString() : "0",
        },
    ];

    return (
        <>
            <Head title={`Karyawan: ${employee.name}`} />

            <div className="p-6 space-y-6  mx-auto">
                <EmployeePageHeader employee={employee} />

                <Tabs
                    variant="underline"
                    size="md"
                    tabs={tabsConfig}
                    selectedIndex={activeTab}
                    onChange={setActiveTab}
                    animated={true}
                    className="w-full"
                >
                    <EmployeeOverview employee={employee} />

                    <EmployeePersonalInfo employee={employee} />

                    <EmployeePositionsIndex
                        employee={employee}
                        positions={positions}
                    />

                    <EmployeeProcessesIndex employee={employee} />

                    <EmployeeSalariesIndex employee={employee} />

                    <EmployeeLoansIndex
                        employee={employee}
                        isLoading={isLoading}
                    />

                    <EmployeeFineLogsIndex
                        employee={employee}
                        isLoading={isLoading}
                    />

                    <EmployeeOrdersIndex
                        employee={employee}
                        isLoading={isLoading}
                    />
                </Tabs>
            </div>
        </>
    );
}

EmployeeShow.layout = (page: any) =>
    withAuthenticatedLayout({
        title: "Detail Karyawan",
        searchable: false,
        breadcrumbs: [
            { label: "Karyawan", href: route("employees.index") },
            { label: page.props.employee.name },
        ],
    })(page);

export default EmployeeShow;
