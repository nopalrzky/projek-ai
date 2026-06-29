import { useCallback, useMemo, useState } from "react";
import { Head, router } from "@inertiajs/react";
import { motion } from "framer-motion";
import { Activity, ActivityIcon } from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { DataView } from "@/Components/DataView";
import { Alert } from "@/Components/Alert";
import PageHeader from "@/Components/Page/PageHeader";
import { CustomerSubscription } from "@/types";
import { CustomerSubscriptionIndexProps } from "./types";
import { createCustomerSubscriptionColumns } from "./columns";
import { createCustomerSubscriptionFilters } from "./filters";
import DeleteCustomerSubscriptionModal from "./Partials/DeleteCustomerSubscriptionModal";
import { customerSubscriptionService } from "@/Services/customer-subscription.service";

function CustomerSubscriptionsIndex({
    customerSubscriptions,
    filterOptions,
    filters: serverFilters,
    flash,
}: CustomerSubscriptionIndexProps) {
    const [deleteModal, setDeleteModal] = useState<{
        show: boolean;
        subscription?: CustomerSubscription;
    }>({ show: false });
    const [isDeleting, setIsDeleting] = useState(false);

    const handleView = useCallback((subscription: CustomerSubscription) => {
        customerSubscriptionService.goToView(subscription.id);
    }, []);

    const handleEdit = useCallback((subscription: CustomerSubscription) => {
        customerSubscriptionService.goToEdit(subscription.id);
    }, []);

    const handleDelete = useCallback((subscription: CustomerSubscription) => {
        setDeleteModal({ show: true, subscription });
    }, []);

    const handleConfirmDelete = useCallback(
        (subscription: CustomerSubscription) => {
            setIsDeleting(true);

            router.delete(
                route("customer-subscriptions.destroy", subscription.id),
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setDeleteModal({ show: false });
                    },
                    onError: (errors) => {
                        console.error(
                            "Delete customer subscription error:",
                            errors,
                        );
                    },
                    onFinish: () => {
                        setIsDeleting(false);
                    },
                },
            );
        },
        [],
    );

    const handleCloseDeleteModal = useCallback(() => {
        if (!isDeleting) {
            setDeleteModal({ show: false });
        }
    }, [isDeleting]);

    const columns = useMemo(
        () =>
            createCustomerSubscriptionColumns(
                handleView,
                handleEdit,
                handleDelete,
            ),
        [handleView, handleEdit, handleDelete],
    );

    const filters = useMemo(
        () =>
            createCustomerSubscriptionFilters(
                filterOptions?.customers || [],
                filterOptions?.servicePackages || [],
                filterOptions?.statusOptions || [],
            ),
        [
            filterOptions?.customers,
            filterOptions?.servicePackages,
            filterOptions?.statusOptions,
        ],
    );

    const processedInitialFilters = {
        search: serverFilters?.search || "",
        customerId: serverFilters?.customerId,
        servicePackageId: serverFilters?.servicePackageId,
        status: serverFilters?.status || "",
        purchaseDate: {
            from: serverFilters?.purchaseDateFrom
                ? new Date(serverFilters.purchaseDateFrom)
                : undefined,
            to: serverFilters?.purchaseDateTo
                ? new Date(serverFilters.purchaseDateTo)
                : undefined,
        },
        expiredAt: {
            from: serverFilters?.expiredAtFrom
                ? new Date(serverFilters.expiredAtFrom)
                : undefined,
            to: serverFilters?.expiredAtTo
                ? new Date(serverFilters.expiredAtTo)
                : undefined,
        },
        sortBy: serverFilters?.sortBy || "created_at",
        sortDirection: serverFilters?.sortDirection || "desc",
        page: serverFilters?.page || 1,
        perPage: serverFilters?.perPage || 15,
    };

    return (
        <>
            <Head title="Manajemen Langganan Pelanggan" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="p-6"
            >
                <div className=" mx-auto space-y-6">
                    <PageHeader
                        title="Manajemen Langganan Pelanggan"
                        subtitle={`Kelola langganan pelanggan (${customerSubscriptions.meta.total} langganan)`}
                        icon={Activity}
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

                    <DataView<CustomerSubscription>
                        route={route("customer-subscriptions.index")}
                        actionButton={{
                            label: "Tambah Langganan Pelanggan",
                            href: route("customer-subscriptions.create"),
                            icon: <ActivityIcon className="w-4 h-4" />,
                            variant: "primary",
                        }}
                        data={customerSubscriptions.data}
                        meta={customerSubscriptions.meta}
                        columns={columns}
                        filters={filters}
                        initialFilters={processedInitialFilters}
                        enableSorting={true}
                        enablePagination={true}
                        enableFilters={true}
                        showFilterContainer={true}
                        useFilterBar={true}
                        pageSize={serverFilters?.perPage || 15}
                        emptyTitle="Belum ada subscription"
                        emptyMessage="Mulai dengan menambahkan subscription pertama untuk pelanggan Anda"
                        searchPlaceholder="Cari kode subscription, nama customer, atau paket..."
                    />
                </div>
            </motion.div>

            <DeleteCustomerSubscriptionModal
                isOpen={deleteModal.show}
                subscription={deleteModal.subscription}
                onClose={handleCloseDeleteModal}
                onConfirm={handleConfirmDelete}
                isLoading={isDeleting}
            />
        </>
    );
}

CustomerSubscriptionsIndex.layout = withAuthenticatedLayout({
    title: "Manajemen Langganan Pelanggan",
    searchable: true,
    breadcrumbs: [
        {
            label: "Langganan Pelanggan",
            href: route("customer-subscriptions.index"),
        },
    ],
});

export default CustomerSubscriptionsIndex;
