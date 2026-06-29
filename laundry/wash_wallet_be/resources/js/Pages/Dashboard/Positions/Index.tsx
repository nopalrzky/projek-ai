import { useCallback, useMemo, useState } from "react";
import { Head, router } from "@inertiajs/react";
import { motion } from "framer-motion";
import { Briefcase, Plus } from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { DataView } from "@/Components/DataView";
import { Alert } from "@/Components/Alert";
import PageHeader from "@/Components/Page/PageHeader";
import { Position } from "@/types";
import { PositionIndexProps } from "./types";
import { createPositionColumns } from "./columns";
import { createPositionFilters } from "./filters";
import DeletePositionModal from "./Partials/DeletePositionModal";
import positionService from "@/Services/position.service";

const PositionsIndex = ({
    positions,
    filterOptions,
    filters: serverFilters,
    flash,
}: PositionIndexProps) => {
    const [deleteModal, setDeleteModal] = useState<{
        show: boolean;
        position?: Position;
    }>({ show: false });
    const [isDeleting, setIsDeleting] = useState(false);

    const handleViewPosition = useCallback((position: Position) => {
        positionService.goToShow(position.id);
    }, []);

    const handleEditPosition = useCallback((position: Position) => {
        positionService.goToEdit(position.id);
    }, []);

    const handleDeletePosition = useCallback((position: Position) => {
        setIsDeleting(true);

        router.delete(route("positions.destroy", position.id), {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteModal({ show: false });
            },
            onError: (errors) => {
                console.error("Delete position error:", errors);
            },
            onFinish: () => {
                setIsDeleting(false);
            },
        });
    }, []);

    const handleViewOutlet = useCallback((outlet: Position["outlet"]) => {
        if (outlet) {
            router.visit(route("outlets.show", outlet.id));
        }
    }, []);

    const columns = useMemo(
        () =>
            createPositionColumns(
                handleViewPosition,
                handleEditPosition,
                (position) => {
                    setDeleteModal({ show: true, position });
                },
                handleViewOutlet,
            ),
        [handleViewPosition, handleEditPosition, handleViewOutlet],
    );

    const filters = useMemo(
        () => createPositionFilters(filterOptions.outlets),
        [filterOptions.outlets],
    );

    const processedInitialFilters = {
        search: serverFilters?.search || "",
        outletId: serverFilters?.outletId,
        isActive: serverFilters?.isActive,
        sortBy: serverFilters?.sortBy || "createdAt",
        sortDirection: serverFilters?.sortDirection || "desc",
        page: serverFilters?.page || 1,
        perPage: serverFilters?.perPage || 15,
    };

    return (
        <>
            <Head title="Manajemen Posisi" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="p-6"
            >
                <div className=" mx-auto space-y-6">
                    <PageHeader
                        title="Manajemen Posisi"
                        subtitle={`Kelola posisi dan jabatan di semua outlet (${positions.meta.total} posisi)`}
                        icon={Briefcase}
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

                    <DataView<Position>
                        route={route("positions.index")}
                        actionButton={{
                            label: "Tambah Posisi",
                            href: route("positions.create"),
                            icon: <Plus className="w-4 h-4" />,
                            variant: "primary",
                        }}
                        data={positions.data}
                        meta={positions.meta}
                        columns={columns}
                        filters={filters}
                        initialFilters={processedInitialFilters}
                        enableSorting={true}
                        enablePagination={true}
                        enableFilters={true}
                        showFilterContainer={true}
                        useFilterBar={true}
                        pageSize={serverFilters?.perPage || 15}
                        emptyTitle="Belum ada posisi"
                        emptyMessage="Mulai dengan menambahkan posisi pertama Anda"
                        searchPlaceholder="Cari nama posisi atau deskripsi..."
                    />
                </div>
            </motion.div>

            <DeletePositionModal
                isOpen={deleteModal.show}
                position={deleteModal.position}
                onClose={() => {
                    if (!isDeleting) {
                        setDeleteModal({ show: false });
                    }
                }}
                onConfirm={() => {
                    if (deleteModal.position) {
                        handleDeletePosition(deleteModal.position);
                    }
                }}
                isLoading={isDeleting}
            />
        </>
    );
};

PositionsIndex.layout = withAuthenticatedLayout({
    title: "Manajemen Posisi",
    searchable: true,
    breadcrumbs: [{ label: "Posisi", href: route("positions.index") }],
});

export default PositionsIndex;
