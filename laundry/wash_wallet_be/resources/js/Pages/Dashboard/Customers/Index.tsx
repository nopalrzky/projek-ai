import { useCallback, useMemo, useState } from "react";
import { Head, router } from "@inertiajs/react";
import { motion } from "framer-motion";
import { Plus, Users } from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { DataView } from "@/Components/DataView";
import { Alert } from "@/Components/Alert";
import PageHeader from "@/Components/Page/PageHeader";
import PageStats from "@/Components/Page/PageStats";
import { Customer } from "@/types";
import { CustomerIndexProps } from "./types";
import { createCustomerColumns } from "./columns";
import { createCustomerFilters } from "./filters";
import { customerService } from "@/Services/customer.service";
import DeleteCustomerModal from "./Partials/DeleteCustomerModal";

function CustomersIndex({
    customers,
    stats,
    filterOptions,
    filters: serverFilters,
    flash,
}: CustomerIndexProps) {
    const [deleteModal, setDeleteModal] = useState<{
        show: boolean;
        customer?: Customer;
    }>({ show: false });
    const [isDeleting, setIsDeleting] = useState(false);

    const handleView = useCallback((customer: Customer) => {
        customerService.goToView(customer.id);
    }, []);

    const handleEdit = useCallback((customer: Customer) => {
        customerService.goToEdit(customer.id);
    }, []);

    const handleDelete = useCallback((customer: Customer) => {
        setDeleteModal({ show: true, customer });
    }, []);

    const handleConfirmDelete = useCallback((customer: Customer) => {
        setIsDeleting(true);
        router.delete(route("customers.destroy", customer.id), {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteModal({ show: false });
            },
            onError: (errors) => {
                console.error("Delete customer error:", errors);
            },
            onFinish: () => {
                setIsDeleting(false);
            },
        });
    }, []);

    const handleCloseDeleteModal = useCallback(() => {
        if (!isDeleting) {
            setDeleteModal({ show: false });
        }
    }, [isDeleting]);

    const columns = useMemo(
        () => createCustomerColumns(handleView, handleEdit, handleDelete),
        [handleView, handleEdit, handleDelete],
    );

    const filters = useMemo(
        () => createCustomerFilters(filterOptions.outlets),
        [filterOptions.outlets],
    );

    const processedInitialFilters = {
        search: serverFilters?.search || "",
        outletId: serverFilters?.outletId,
        phone: serverFilters?.phone,
        gender: serverFilters?.gender,
        isActive:
            serverFilters?.isActive !== undefined
                ? String(serverFilters.isActive)
                : "",
        createdDate: {
            from: serverFilters?.startDate
                ? new Date(serverFilters.startDate)
                : undefined,
            to: serverFilters?.endDate
                ? new Date(serverFilters.endDate)
                : undefined,
        },
        sortBy: serverFilters?.sortBy || "created_at",
        sortDirection: serverFilters?.sortDirection || "desc",
        page: serverFilters?.page || 1,
        perPage: serverFilters?.perPage || 15,
    };

    return (
        <>
            <Head title="Manajemen Pelanggan" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="p-6"
            >
                <div className=" mx-auto space-y-6">
                    <PageHeader
                        title="Manajemen Pelanggan"
                        subtitle={`Kelola dan pantau seluruh data pelanggan Anda (${customers.meta.total} pelanggan)`}
                        icon={Users}
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

                    <PageStats stats={stats} columns={3} animate={true} />

                    <DataView<Customer>
                        route={route("customers.index")}
                        actionButton={{
                            label: "Tambah Pelanggan",
                            href: route("customers.create"),
                            icon: <Plus className="w-4 h-4" />,
                            variant: "primary",
                        }}
                        data={customers.data}
                        meta={customers.meta}
                        columns={columns}
                        filters={filters}
                        initialFilters={processedInitialFilters}
                        enableSorting={true}
                        enablePagination={true}
                        enableFilters={true}
                        showFilterContainer={true}
                        useFilterBar={true}
                        pageSize={serverFilters?.perPage || 15}
                        emptyTitle="Belum ada pelanggan"
                        emptyMessage="Mulai dengan menambahkan pelanggan pertama Anda"
                        searchPlaceholder="Cari nama, email, atau telepon pelanggan..."
                    />
                </div>
            </motion.div>

            <DeleteCustomerModal
                isOpen={deleteModal.show}
                customer={deleteModal.customer}
                onClose={handleCloseDeleteModal}
                onConfirm={handleConfirmDelete}
                isLoading={isDeleting}
            />
        </>
    );
}

CustomersIndex.layout = withAuthenticatedLayout({
    title: "Manajemen Pelanggan",
    searchable: true,
    breadcrumbs: [{ label: "Pelanggan", href: route("customers.index") }],
});

export default CustomersIndex;
