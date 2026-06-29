import { useCallback, useMemo, useState } from "react";
import { Head, router } from "@inertiajs/react";
import { motion } from "framer-motion";
import { Plus, Shirt } from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { DataView } from "@/Components/DataView";
import { Alert } from "@/Components/Alert";
import PageHeader from "@/Components/Page/PageHeader";
import { LaundryService } from "@/types";
import { LaundryServiceIndexProps } from "./types";
import { createLaundryServiceColumns } from "./columns";
import { createLaundryServiceFilters } from "./filters";
import { laundryServiceService } from "@/Services/laundry_service.service";
import DeleteLaundryServiceModal from "./Partials/DeleteLaundryServiceModal";

function LaundryServicesIndex({
    laundryServices,
    filterOptions,
    filters: serverFilters,
    flash,
}: LaundryServiceIndexProps) {
    const [deleteModal, setDeleteModal] = useState<{
        show: boolean;
        laundryService?: LaundryService;
    }>({ show: false });
    const [isDeleting, setIsDeleting] = useState(false);

    const handleView = useCallback((laundryService: LaundryService) => {
        laundryServiceService.goToView(laundryService.id);
    }, []);

    const handleEdit = useCallback((laundryService: LaundryService) => {
        laundryServiceService.goToEdit(laundryService.id);
    }, []);

    const handleOpenDeleteModal = useCallback(
        (laundryService: LaundryService) => {
            setDeleteModal({ show: true, laundryService });
        },
        [],
    );

    const handleDelete = useCallback((laundryService: LaundryService) => {
        setIsDeleting(true);

        router.delete(route("laundry-services.destroy", laundryService.id), {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteModal({ show: false });
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
        () =>
            createLaundryServiceColumns(
                handleView,
                handleEdit,
                handleOpenDeleteModal,
            ),
        [handleView, handleEdit, handleOpenDeleteModal],
    );

    const filters = useMemo(
        () =>
            createLaundryServiceFilters(
                filterOptions.outlets,
                filterOptions.categories,
                filterOptions.units,
            ),
        [filterOptions.outlets, filterOptions.categories, filterOptions.units],
    );

    const processedInitialFilters = {
        search: serverFilters?.search || "",
        outletId: serverFilters?.outletId,
        categoryId: serverFilters?.categoryId,
        unitId: serverFilters?.unitId,
        isActive: serverFilters?.isActive,
        minPrice: serverFilters?.minPrice,
        maxPrice: serverFilters?.maxPrice,
        minDurationHours: serverFilters?.minDurationHours,
        maxDurationHours: serverFilters?.maxDurationHours,
        minQuantity: serverFilters?.minQuantity,
        sortBy: serverFilters?.sortBy || "createdAt",
        sortDirection: serverFilters?.sortDirection || "desc",
        page: serverFilters?.page || 1,
        perPage: serverFilters?.perPage || 15,
    };

    return (
        <>
            <Head title="Manajemen Layanan Laundry" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="p-6"
            >
                <div className=" mx-auto space-y-6">
                    <PageHeader
                        title="Manajemen Layanan Laundry"
                        subtitle={`Kelola semua layanan laundry Anda (${laundryServices.meta.total} layanan)`}
                        icon={Shirt}
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

                    <DataView<LaundryService>
                        route={route("laundry-services.index")}
                        actionButton={{
                            label: "Tambah Layanan Laundry",
                            href: route("laundry-services.create"),
                            icon: <Plus className="w-4 h-4" />,
                            variant: "primary",
                        }}
                        data={laundryServices.data}
                        meta={laundryServices.meta}
                        columns={columns}
                        filters={filters}
                        initialFilters={processedInitialFilters}
                        enableSorting={true}
                        enablePagination={true}
                        enableFilters={true}
                        showFilterContainer={true}
                        useFilterBar={true}
                        pageSize={processedInitialFilters.perPage}
                        emptyTitle="Belum ada layanan laundry"
                        emptyMessage="Mulai dengan menambahkan layanan laundry pertama Anda"
                        searchPlaceholder="Cari nama layanan atau deskripsi..."
                    />
                </div>
            </motion.div>

            <DeleteLaundryServiceModal
                isOpen={deleteModal.show}
                laundryService={deleteModal.laundryService}
                onClose={handleCloseDeleteModal}
                onConfirm={handleDelete}
                isLoading={isDeleting}
            />
        </>
    );
}

LaundryServicesIndex.layout = withAuthenticatedLayout({
    title: "Layanan Laundry",
    searchable: true,
    breadcrumbs: [
        { label: "Layanan Laundry", href: route("laundry-services.index") },
    ],
});

export default LaundryServicesIndex;
