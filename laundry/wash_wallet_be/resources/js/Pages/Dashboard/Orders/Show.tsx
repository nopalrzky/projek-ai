import { useState } from "react";
import { Head } from "@inertiajs/react";
import { motion } from "framer-motion";
import { Tabs } from "@/Components/Tabs";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { OrderShowProps } from "./types";
import { Info, DollarSign, History, Settings, Package } from "lucide-react";
import OrderPageHeader from "./Partials/OrderPageHeader";
import OrderOverview from "./Partials/OrderOverview";
import OrderPayments from "./Partials/OrderPayments";
import OrderStatusHistory from "./Partials/OrderStatusHistory";
import OrderSettings from "./Partials/OrderSettings";
import OrderItemsIndex from "./OrderItems/Index";
import OrderCustomer from "./Partials/OrderCustomer";
import OrderEmployee from "./Partials/OrderEmployee";
import { User, Users } from "lucide-react";

function OrderShow({ order }: OrderShowProps) {
    const [activeTab, setActiveTab] = useState(0);

    const tabsConfig = [
        {
            label: "Overview",
            icon: <Info className="w-4 h-4" />,
        },
        {
            label: "Items",
            icon: <Package className="w-4 h-4" />,
            badge: order.orderItemsCount?.toString() || "0",
        },
        {
            label: "Pembayaran",
            icon: <DollarSign className="w-4 h-4" />,
        },
        {
            label: "Riwayat Status",
            icon: <History className="w-4 h-4" />,
        },
        {
            label: "Pelanggan",
            icon: <User className="w-4 h-4" />,
        },
        {
            label: "Karyawan",
            icon: <Users className="w-4 h-4" />,
        },
        {
            label: "Pengaturan",
            icon: <Settings className="w-4 h-4" />,
        },
    ];

    return (
        <>
            <Head title={`Order: ${order.orderNumber}`} />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="p-6 space-y-6  mx-auto"
            >
                <OrderPageHeader order={order} />

                <Tabs
                    variant="underline"
                    size="md"
                    tabs={tabsConfig}
                    selectedIndex={activeTab}
                    onChange={setActiveTab}
                    animated={true}
                    className="w-full"
                >
                    <OrderOverview order={order} onNavigateTab={setActiveTab} />
                    <OrderItemsIndex
                        orderItems={order.orderItems}
                        order={order}
                    />
                    <OrderPayments order={order} />
                    <OrderStatusHistory order={order} />
                    <OrderCustomer order={order} />
                    <OrderEmployee order={order} />
                    <OrderSettings order={order} />
                </Tabs>
            </motion.div>
        </>
    );
}

OrderShow.layout = (page: any) =>
    withAuthenticatedLayout({
        title: "Order",
        searchable: false,
        breadcrumbs: [
            { label: "Order", href: route("orders.index") },
            { label: `Order #${page.props.order.orderNumber}` },
        ],
    })(page);

export default OrderShow;
