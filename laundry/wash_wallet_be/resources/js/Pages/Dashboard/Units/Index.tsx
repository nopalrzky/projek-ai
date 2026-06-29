import { useCallback, useMemo, useState } from "react";
import { Head, router } from "@inertiajs/react";
import { motion } from "framer-motion";
import { Plus, Package } from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { DataView } from "@/Components/DataView";
import { Alert } from "@/Components/Alert";
import PageHeader from "@/Components/Page/PageHeader";
import { UnitIndexProps } from "./types";
import { Unit } from "@/types";
import { createUnitColumns } from "./columns";
import DeleteUnitModal from "./Partials/DeleteUnitModal";
import unitService from "@/Services/unit.service";

function UnitsIndex({ units, filters: serverFilters, flash }: UnitIndexProps) {
    const [deleteModal, setDeleteModal] = useState<{
        show: boolean;
        unit?: Unit;
    }>({ show: false });
    const [isDeleting, setIsDeleting] = useState(false);

    const handleView = useCallback((unit: Unit) => {
        unitService.goToView(unit.id);
    }, []);

    const handleEdit = useCallback((unit: Unit) => {
        unitService.goToEdit(unit.id);
    }, []);

    const handleOpenDeleteModal = useCallback((unit: Unit) => {
        setDeleteModal({ show: true, unit });
    }, []);

    const handleCloseDeleteModal = useCallback(() => {
        if (isDeleting) {
            return;
        }

        setDeleteModal({ show: false });
    }, [isDeleting]);

    const handleDelete = useCallback((unit: Unit) => {
        router.delete(route("units.destroy", unit.id), {
            preserveScroll: true,
            onStart: () => {
                setIsDeleting(true);
            },
            onSuccess: () => {
                setDeleteModal({ show: false });
            },
            onError: (errors) => {
                console.error("Delete unit error:", errors);
            },
            onFinish: () => {
                setIsDeleting(false);
            },
        });
    }, []);

    const columns = useMemo(
        () => createUnitColumns(handleView, handleEdit, handleOpenDeleteModal),
        [handleView, handleEdit, handleOpenDeleteModal],
    );

    const processedInitialFilters = {
        search: serverFilters.search || "",
        sortBy: serverFilters.sortBy || "created_at",
        sortDirection: serverFilters.sortDirection || "desc",
        page: units.meta.currentPage || 1,
        perPage: units.meta.perPage || 15,
    };

    return (
        <>
            <Head title="Manajemen Unit" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="p-6"
            >
                <div className=" mx-auto space-y-6">
                    <PageHeader
                        title="Manajemen Unit"
                        subtitle={`Kelola semua satuan unit untuk layanan laundry (${units.meta.total} unit)`}
                        icon={Package}
                        variant="default"
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

                    <DataView
                        route={route("units.index")}
                        actionButton={{
                            label: "Tambah Unit",
                            href: route("units.create"),
                            icon: <Plus className="w-4 h-4" />,
                            variant: "primary",
                        }}
                        data={units.data}
                        meta={units.meta}
                        columns={columns}
                        initialFilters={processedInitialFilters}
                        enableSorting={true}
                        enablePagination={true}
                        showFilterContainer={true}
                        useFilterBar={true}
                        filterLayout="grid"
                        pageSize={units.meta.perPage || 15}
                        emptyTitle="Belum ada unit"
                        emptyMessage="Mulai dengan membuat unit satuan pertama Anda"
                        searchPlaceholder="Cari nama, simbol, atau deskripsi unit..."
                    />
                </div>
            </motion.div>

            <DeleteUnitModal
                isOpen={deleteModal.show}
                unit={deleteModal.unit}
                onClose={handleCloseDeleteModal}
                onConfirm={handleDelete}
                isLoading={isDeleting}
            />
        </>
    );
}

UnitsIndex.layout = withAuthenticatedLayout({
    title: "Unit",
    searchable: true,
    breadcrumbs: [{ label: "Unit", href: route("units.index") }],
});

export default UnitsIndex;
