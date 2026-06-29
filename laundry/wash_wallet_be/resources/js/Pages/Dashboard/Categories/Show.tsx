import { useState } from "react";
import { Head } from "@inertiajs/react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { Tabs } from "@/Components/Tabs";
import { Info, Package, Building } from "lucide-react";
import { CategoryShowProps } from "./types";
import CategoryPageHeader from "./Partials/CategoryPageHeader";
import CategoryOverview from "./Partials/CategoryOverview";
import CategoryLaundryServicesIndex from "./LaundryServices/Index";
import CategoryOutlet from "./Partials/CategoryOutlet";

function CategoryShow({ category }: CategoryShowProps) {
    const [activeTab, setActiveTab] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

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
            label: "Layanan",
            icon: <Package className="w-4 h-4" />,
            badge: category.laundryServices?.length
                ? category.laundryServices.length.toString()
                : "0",
        },
    ];

    return (
        <>
            <Head title={`Kategori: ${category.name}`} />

            <div className="p-6 space-y-6  mx-auto">
                <CategoryPageHeader category={category} isLoading={isLoading} />
                <Tabs
                    variant="underline"
                    size="md"
                    tabs={tabsConfig}
                    selectedIndex={activeTab}
                    onChange={setActiveTab}
                    animated={true}
                    className="w-full"
                >
                    <CategoryOverview
                        category={category}
                        laundryServices={category.laundryServices || []}
                    />

                    <CategoryOutlet outlet={category.outlet} />

                    <CategoryLaundryServicesIndex
                        category={category}
                        laundryServices={category.laundryServices || []}
                        isLoading={false}
                    />
                </Tabs>
            </div>
        </>
    );
}

CategoryShow.layout = (page: any) =>
    withAuthenticatedLayout({
        title: "Detail Kategori",
        searchable: false,
        breadcrumbs: [
            { label: "Kategori", href: route("categories.index") },
            { label: page.props.category.name },
        ],
    })(page);

export default CategoryShow;
