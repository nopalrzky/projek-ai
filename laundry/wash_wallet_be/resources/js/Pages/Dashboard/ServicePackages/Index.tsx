import { useCallback, useMemo, useState } from "react";
import { Head, router } from "@inertiajs/react";
import { motion } from "framer-motion";
import { Package, Plus } from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { DataView } from "@/Components/DataView";
import { Alert } from "@/Components/Alert";
import PageHeader from "@/Components/Page/PageHeader";
import { ServicePackage } from "@/types";
import { ServicePackageIndexProps } from "./types";
import { createServicePackageColumns } from "./columns";
import { createServicePackageFilters } from "./filters";
import DeleteServicePackageModal from "./Partials/DeleteServicePackageModal";
import servicePackageService from "@/Services/service_package.service";

function ServicePackagesIndex({
    servicePackages,
    filterOptions,
    filters: serverFilters,
    flash,
}: ServicePackageIndexProps) {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [servicePackageToDelete, setServicePackageToDelete] =
        useState<ServicePackage | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleView = useCallback((servicePackage: ServicePackage) => {
        servicePackageService.goToView(servicePackage.id);
    }, []);

    const handleEdit = useCallback((servicePackage: ServicePackage) => {
        servicePackageService.goToEdit(servicePackage.id);
    }, []);

    const handleDelete = useCallback(() => {
        if (!servicePackageToDelete) return;

        router.delete(
            route("service-packages.destroy", servicePackageToDelete.id),
            {
                preserveScroll: true,
                onStart: () => setIsDeleting(true),
                onSuccess: () => {
                    setIsDeleteModalOpen(false);
                    setServicePackageToDelete(null);
                },
                onError: (errors) => {
                    console.error("Delete service package error:", errors);
                },
                onFinish: () => {
                    setIsDeleting(false);
                },
            },
        );
    }, [servicePackageToDelete]);

    const handleOpenDeleteModal = useCallback(
        (servicePackage: ServicePackage) => {
            setServicePackageToDelete(servicePackage);
            setIsDeleteModalOpen(true);
        },
        [],
    );

    const handleCloseDeleteModal = useCallback(() => {
        if (isDeleting) return;

        setIsDeleteModalOpen(false);
        setServicePackageToDelete(null);
    }, [isDeleting]);

    const columns = useMemo(
        () =>
            createServicePackageColumns(
                handleView,
                handleEdit,
                handleOpenDeleteModal,
            ),
        [handleView, handleEdit, handleOpenDeleteModal],
    );

    const filters = useMemo(
        () => createServicePackageFilters(filterOptions.outlets),
        [filterOptions.outlets],
    );

    const processedInitialFilters = {
        search: serverFilters?.search || "",
        outletId: serverFilters?.outletId,
        isActive: serverFilters?.isActive,
        minPrice: serverFilters?.minPrice,
        maxPrice: serverFilters?.maxPrice,
        minValidityDays: serverFilters?.minValidityDays,
        maxValidityDays: serverFilters?.maxValidityDays,
        sortBy: serverFilters?.sortBy || "createdAt",
        sortDirection: serverFilters?.sortDirection || "desc",
        page: serverFilters?.page || 1,
        perPage: serverFilters?.perPage || 15,
    };

    return (
        <>
            <Head title="Manajemen Paket Deposit" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="p-6"
            >
                <div className=" mx-auto space-y-6">
                    <PageHeader
                        title="Manajemen Paket Deposit"
                        subtitle={`Kelola paket bundling layanan laundry (${servicePackages.meta.total} paket)`}
                        icon={Package}
                        animate={true}
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

                    <DataView<ServicePackage>
                        route={route("service-packages.index")}
                        actionButton={{
                            label: "Tambah Paket Deposit",
                            href: route("service-packages.create"),
                            icon: <Plus className="w-4 h-4" />,
                            variant: "primary",
                        }}
                        data={servicePackages.data}
                        meta={servicePackages.meta}
                        columns={columns}
                        filters={filters}
                        initialFilters={processedInitialFilters}
                        enableSorting={true}
                        enablePagination={true}
                        enableFilters={true}
                        showFilterContainer={true}
                        useFilterBar={true}
                        pageSize={
                            serverFilters?.perPage ||
                            servicePackages.meta.perPage ||
                            15
                        }
                        emptyTitle="Belum ada paket deposit"
                        emptyMessage="Mulai dengan menambahkan paket deposit pertama Anda"
                        searchPlaceholder="Cari nama paket atau deskripsi..."
                    />
                </div>
            </motion.div>

            <DeleteServicePackageModal
                isOpen={isDeleteModalOpen}
                servicePackage={servicePackageToDelete || undefined}
                onClose={handleCloseDeleteModal}
                onConfirm={handleDelete}
                isLoading={isDeleting}
            />
        </>
    );
}

ServicePackagesIndex.layout = withAuthenticatedLayout({
    title: "Manajemen Paket Deposit",
    searchable: true,
    breadcrumbs: [
        { label: "Paket Deposit", href: route("service-packages.index") },
    ],
});

export default ServicePackagesIndex;
