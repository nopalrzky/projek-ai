import { useCallback, useMemo, useState } from "react";
import { Head, router } from "@inertiajs/react";
import { motion } from "framer-motion";
import { AlertCircle, Plus } from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { DataView } from "@/Components/DataView";
import { Alert } from "@/Components/Alert";
import PageHeader from "@/Components/Page/PageHeader";
import { Fine } from "@/types";
import { FineIndexProps } from "./types";
import { createFineColumns } from "./columns";
import { createFineFilters } from "./filters";
import DeleteFineModal from "./Partials/DeleteFineModal";
import fineService from "@/Services/fine.service";

function FinesIndex({
    fines,
    filterOptions,
    filters: serverFilters,
    flash,
}: FineIndexProps) {
    const [deleteModal, setDeleteModal] = useState<{
        show: boolean;
        fine?: Fine;
    }>({ show: false });
    const [isDeleting, setIsDeleting] = useState(false);

    const handleView = useCallback((fine: Fine) => {
        fineService.goToView(fine.id);
    }, []);

    const handleEdit = useCallback((fine: Fine) => {
        fineService.goToEdit(fine.id);
    }, []);

    const handleOpenDeleteModal = useCallback((fine: Fine) => {
        setDeleteModal({ show: true, fine });
    }, []);

    const handleDelete = useCallback((fine: Fine) => {
        setIsDeleting(true);

        router.delete(route("fines.destroy", fine.id), {
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
        () => createFineColumns(handleView, handleEdit, handleOpenDeleteModal),
        [handleView, handleEdit, handleOpenDeleteModal],
    );

    const filters = useMemo(
        () => createFineFilters(filterOptions.outlets),
        [filterOptions.outlets],
    );

    const processedInitialFilters = {
        search: serverFilters?.search || "",
        outletId: serverFilters?.outletId,
        minAmount: serverFilters?.minAmount,
        maxAmount: serverFilters?.maxAmount,
        sortBy: serverFilters?.sortBy || "createdAt",
        sortDirection: serverFilters?.sortDirection || "desc",
        page: serverFilters?.page || 1,
        perPage: serverFilters?.perPage || 15,
    };

    return (
        <>
            <Head title="Manajemen Jenis Denda" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="p-6"
            >
                <div className=" mx-auto space-y-6">
                    <PageHeader
                        title="Manajemen Jenis Denda"
                        subtitle={`Kelola master jenis denda dan sanksi karyawan (${fines.meta.total} jenis denda)`}
                        icon={AlertCircle}
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

                    <DataView<Fine>
                        route={route("fines.index")}
                        actionButton={{
                            label: "Tambah Jenis Denda",
                            href: route("fines.create"),
                            icon: <Plus className="w-4 h-4" />,
                            variant: "primary",
                        }}
                        data={fines.data}
                        meta={fines.meta}
                        columns={columns}
                        filters={filters}
                        initialFilters={processedInitialFilters}
                        enableSorting={true}
                        enablePagination={true}
                        enableFilters={true}
                        showFilterContainer={true}
                        useFilterBar={true}
                        pageSize={processedInitialFilters.perPage}
                        emptyTitle="Belum ada jenis denda"
                        emptyMessage="Mulai dengan menambahkan jenis denda pertama Anda"
                        searchPlaceholder="Cari nama denda atau deskripsi..."
                    />
                </div>
            </motion.div>

            <DeleteFineModal
                isOpen={deleteModal.show}
                fine={deleteModal.fine}
                onClose={handleCloseDeleteModal}
                onConfirm={handleDelete}
                isLoading={isDeleting}
            />
        </>
    );
}

FinesIndex.layout = withAuthenticatedLayout({
    title: "Manajemen Jenis Denda",
    searchable: true,
    breadcrumbs: [{ label: "Jenis Denda", href: route("fines.index") }],
});

export default FinesIndex;
