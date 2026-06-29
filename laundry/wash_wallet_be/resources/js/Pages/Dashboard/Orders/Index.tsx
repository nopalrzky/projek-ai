import { useCallback, useMemo } from "react";
import { Head } from "@inertiajs/react";
import { motion } from "framer-motion";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { DataView } from "@/Components/DataView";
import { Order } from "@/types";
import { OrderIndexProps } from "./types";
import { createOrderColumns } from "./columns";
import { createOrderFilters } from "./filters";
import { Alert } from "@/Components/Alert";
import PageHeader from "@/Components/Page/PageHeader";
import PageStats from "@/Components/Page/PageStats";
import { ShoppingBag } from "lucide-react";
import orderService from "@/Services/order.service";

function OrdersIndex({
    orders,
    stats,
    filters: serverFilters,
    filterOptions,
    flash,
}: OrderIndexProps) {
    const handleView = useCallback((order: Order) => {
        orderService.goToView(order.id);
    }, []);

    const columns = useMemo(() => createOrderColumns(handleView), [handleView]);

    const filters = useMemo(
        () => createOrderFilters(filterOptions),
        [filterOptions],
    );

    const processedInitialFilters = {
        search: serverFilters?.search || "",
        outletId: serverFilters?.outletId,
        customerId: serverFilters?.customerId,
        employeeId: serverFilters?.employeeId,
        status: serverFilters?.status,
        paymentStatus: serverFilters?.paymentStatus,
        orderDate: {
            from: serverFilters?.orderDateFrom
                ? new Date(serverFilters.orderDateFrom)
                : undefined,
            to: serverFilters?.orderDateTo
                ? new Date(serverFilters.orderDateTo)
                : undefined,
        },
        estimatedCompletion: {
            from: serverFilters?.estimatedCompletionFrom
                ? new Date(serverFilters.estimatedCompletionFrom)
                : undefined,
            to: serverFilters?.estimatedCompletionTo
                ? new Date(serverFilters.estimatedCompletionTo)
                : undefined,
        },
        totalAmount: {
            min: serverFilters?.totalAmountMin,
            max: serverFilters?.totalAmountMax,
        },
        sortBy: serverFilters?.sortBy || "order_date",
        sortDirection: serverFilters?.sortDirection || "desc",
        page: serverFilters?.page || 1,
        perPage: serverFilters?.perPage || 15,
    };

    return (
        <>
            <Head title="Orders Management" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="p-6"
            >
                <div className="mx-auto space-y-6">
                    <PageHeader
                        title="Manajemen Order"
                        subtitle="Kelola semua order dan transaksi laundry"
                        icon={ShoppingBag}
                        animate={true}
                        variant="default"
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
                            title="Error"
                            description={flash.error}
                        />
                    )}

                    <PageStats stats={stats} columns={4} animate={true} />

                    <DataView
                        route={route("orders.index")}
                        data={orders.data}
                        meta={orders.meta}
                        columns={columns}
                        filters={filters}
                        initialFilters={processedInitialFilters}
                        enableSorting={true}
                        enablePagination={true}
                        enableFilters={true}
                        showFilterContainer={true}
                        useFilterBar={true}
                        pageSize={serverFilters?.perPage || 15}
                        emptyTitle="Belum ada order"
                        emptyMessage="Mulai dengan membuat order pertama Anda"
                        searchPlaceholder="Cari nomor order, customer, atau telepon..."
                    />
                </div>
            </motion.div>
        </>
    );
}

OrdersIndex.layout = withAuthenticatedLayout({
    title: "Order",
    searchable: true,
    breadcrumbs: [{ label: "Order", href: route("orders.index") }],
});

export default OrdersIndex;
