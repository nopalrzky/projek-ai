import { useState } from "react";
import { Head } from "@inertiajs/react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { Tabs } from "@/Components/Tabs";
import { Info, Users, Building } from "lucide-react";
import { PositionShowProps } from "./types";
import PositionEmployeesIndex from "./EmployeePositions/Index";
import PositionPageHeader from "./Partials/PositionPageHeader";
import PositionOverview from "./Partials/PositionOverview";
import PositionOutlet from "./Partials/PositionOutlet";

const PositionShow = ({ position }: PositionShowProps) => {
    const [activeTab, setActiveTab] = useState(0);

    const tabsConfig = [
        {
            label: "Overview",
            icon: <Info className="w-4 h-4" />,
        },
        {
            label: "Karyawan",
            icon: <Users className="w-4 h-4" />,
            badge: position.employeePositions?.length.toString() || "0",
        },
        {
            label: "Outlet",
            icon: <Building className="w-4 h-4" />,
        },
    ];

    return (
        <>
            <Head title={`Posisi: ${position.name}`} />

            <div className="p-6 space-y-6  mx-auto">
                <PositionPageHeader position={position} />

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
                    <PositionOverview position={position} />

                    {/* Tab 2: Karyawan */}
                    <PositionEmployeesIndex position={position} />

                    {/* Tab 3: Outlet */}
                    <PositionOutlet position={position} />
                </Tabs>
            </div>
        </>
    );
};

PositionShow.layout = withAuthenticatedLayout({
    title: "Detail Posisi",
    searchable: false,
    breadcrumbs: [
        { label: "Posisi", href: route("positions.index") },
        { label: "Detail", href: "#" },
    ],
});

export default PositionShow;
