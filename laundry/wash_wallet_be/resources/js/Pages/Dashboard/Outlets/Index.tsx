import { useState, useCallback, useMemo } from "react";
import { Head, router } from "@inertiajs/react";
import { motion } from "framer-motion";
import { Plus, Building2, Upload, Download } from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { DataView } from "@/Components/DataView";
import { Alert } from "@/Components/Alert";
import { Button } from "@/Components/Button";
import PageHeader from "@/Components/Page/PageHeader";
import { OutletIndexProps } from "./types";
import { Outlet } from "@/types";
import { createOutletFilters } from "./filters";
import DeleteOutletModal from "./Partials/DeleteOutletModal";
import outletService from "@/Services/outlet.service";
import { createOutletColumns } from "./columns";

function OutletsIndex({
    outlets,
    filters: serverFilters,
    filterOptions,
    flash,
}: OutletIndexProps) {
    const [deleteModal, setDeleteModal] = useState<{
        show: boolean;
        outlet?: Outlet;
    }>({ show: false });
    const [isDeleting, setIsDeleting] = useState(false);

    const handleView = useCallback((outlet: Outlet) => {
        outletService.goToView(outlet.id);
    }, []);

    const handleEdit = useCallback((outlet: Outlet) => {
        outletService.goToEdit(outlet.id);
    }, []);

    const handleDelete = useCallback((outlet: Outlet) => {
        setIsDeleting(true);

        router.delete(route("outlets.destroy", outlet.id), {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteModal({ show: false });
            },
            onError: (errors) => {
                console.error("Delete outlet error:", errors);
            },
            onFinish: () => {
                setIsDeleting(false);
            },
        });
    }, []);

    const handleImport = useCallback(() => {
        outletService.goToImport();
    }, []);

    const handleExport = useCallback(() => {
        // outletService.exportData();
    }, []);

    const handleCreateClick = useCallback(() => {
        outletService.goToCreate();
    }, []);

    const handleActivate = useCallback((outlet: Outlet) => {
        router.visit(route("outlets.activate.page", outlet.id));
    }, []);

    const columns = useMemo(
        () =>
            createOutletColumns(handleView, handleEdit, (outlet) =>
                setDeleteModal({ show: true, outlet }),
            handleActivate
            ),
        [handleView, handleEdit, handleActivate],
    );

    const filters = useMemo(
        () => createOutletFilters(filterOptions),
        [
            filterOptions.provinces,
            filterOptions.cities,
            filterOptions.districts,
            filterOptions.statusOptions,
        ],
    );

    return (
        <>
            <Head title="Manajemen Outlet" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="p-6"
            >
                <div className="mx-auto space-y-6">
                    <PageHeader
                        title="Manajemen Outlet"
                        subtitle={`Kelola semua outlet laundry Anda (${outlets.meta.total} outlets)`}
                        icon={Building2}
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

                    <DataView<Outlet>
                        route={route("outlets.index")}
                        data={outlets.data}
                        meta={outlets.meta}
                        columns={columns}
                        filters={filters}
                        actions={
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="md"
                                    leftIcon={<Upload className="w-4 h-4" />}
                                    onClick={handleImport}
                                >
                                    Import
                                </Button>
                                <Button
                                    variant="outline"
                                    size="md"
                                    leftIcon={<Download className="w-4 h-4" />}
                                    onClick={handleExport}
                                >
                                    Export
                                </Button>
                                <Button
                                    onClick={handleCreateClick}
                                    leftIcon={<Plus className="w-4 h-4" />}
                                >
                                    Tambah Outlet
                                </Button>
                            </div>
                        }
                        initialFilters={{
                            search: serverFilters?.search || "",
                            status: serverFilters?.status,
                            provinceId: serverFilters?.provinceId,
                            cityId: serverFilters?.cityId,
                            districtId: serverFilters?.districtId,
                            sortBy: serverFilters?.sortBy || "created_at",
                            sortDirection:
                                serverFilters?.sortDirection || "desc",
                            page: serverFilters?.page || 1,
                            perPage: serverFilters?.perPage || 10,
                        }}
                        enableSorting={true}
                        enablePagination={true}
                        enableFilters={true}
                        showFilterContainer={true}
                        useFilterBar={true}
                        filterLayout="grid"
                        pageSize={serverFilters?.perPage || 10}
                        emptyTitle="Belum ada outlet"
                        emptyMessage="Mulai dengan membuat outlet pertama Anda"
                        searchPlaceholder="Cari nama, kode, email, atau telepon outlet..."
                    />
                </div>
            </motion.div>

            <DeleteOutletModal
                isOpen={deleteModal.show}
                outlet={deleteModal.outlet}
                onClose={() => {
                    if (!isDeleting) {
                        setDeleteModal({ show: false });
                    }
                }}
                onConfirm={() => {
                    if (deleteModal.outlet) {
                        handleDelete(deleteModal.outlet);
                    }
                }}
                isLoading={isDeleting}
            />
        </>
    );
}

OutletsIndex.layout = withAuthenticatedLayout({
    title: "Outlet",
    searchable: true,
    breadcrumbs: [{ label: "Outlet", href: route("outlets.index") }],
});

export default OutletsIndex;
