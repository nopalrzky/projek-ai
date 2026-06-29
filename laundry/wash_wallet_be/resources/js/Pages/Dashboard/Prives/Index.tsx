import { useState, useCallback, useMemo } from "react";
import { Head, router } from "@inertiajs/react";
import { motion } from "framer-motion";
import { Plus, Wallet } from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { DataView } from "@/Components/DataView";
import Alert from "@/Components/Alert";
import { Prive } from "@/types";
import { PriveIndexProps } from "./types";
import { createPriveColumns } from "./columns";
import { createPriveFilters } from "./filters";
import priveService from "@/Services/prive.service";
import PageHeader from "@/Components/Page/PageHeader";
import DeletePriveModal from "./Partials/DeletePriveModal";

function PrivesIndex({
    prives,
    filterOptions,
    filters: serverFilters,
    flash,
}: PriveIndexProps) {
    const [deleteModal, setDeleteModal] = useState<{
        show: boolean;
        prive?: Prive;
    }>({ show: false });
    const [isDeleting, setIsDeleting] = useState(false);

    const handleView = useCallback((prive: Prive) => {
        priveService.goToView(prive.id);
    }, []);

    const handleEdit = useCallback((prive: Prive) => {
        priveService.goToEdit(prive.id);
    }, []);

    const handleDelete = useCallback((prive: Prive) => {
        setIsDeleting(true);

        router.delete(route("prives.destroy", prive.id), {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteModal({ show: false });
            },
            onError: (errors) => {
                console.error("Delete prive error:", errors);
            },
            onFinish: () => {
                setIsDeleting(false);
            },
        });
    }, []);

    const columns = useMemo(
        () =>
            createPriveColumns(handleView, handleEdit, (prive) =>
                setDeleteModal({ show: true, prive }),
            ),
        [handleView, handleEdit],
    );

    const filters = useMemo(
        () =>
            createPriveFilters(
                filterOptions.outlets,
                filterOptions.sourceAccounts,
                filterOptions.equityAccounts,
            ),
        [
            filterOptions.outlets,
            filterOptions.sourceAccounts,
            filterOptions.equityAccounts,
        ],
    );

    const processedInitialFilters = {
        search: serverFilters?.search || "",
        outletId: serverFilters?.outletId,
        sourceAccountId: serverFilters?.sourceAccountId,
        equityAccountId: serverFilters?.equityAccountId,
        startDate: serverFilters?.startDate || "",
        endDate: serverFilters?.endDate || "",
        minAmount: serverFilters?.minAmount,
        maxAmount: serverFilters?.maxAmount,
        sortBy: serverFilters?.sortBy || "date",
        sortDirection: serverFilters?.sortDirection || "desc",
        page: serverFilters?.page || 1,
        perPage: serverFilters?.perPage || 15,
    };

    return (
        <>
            <Head title="Manajemen Prive" />
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="p-6"
            >
                <div className=" mx-auto space-y-6">
                    <PageHeader
                        title="Manajemen Prive"
                        subtitle={`Kelola penarikan modal owner (${prives.meta.total} prive)`}
                        icon={Wallet}
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

                    <DataView<Prive>
                        route={route("prives.index")}
                        actionButton={{
                            label: "Tambah Prive",
                            href: route("prives.create"),
                            icon: <Plus className="w-4 h-4" />,
                            variant: "primary",
                        }}
                        data={prives.data}
                        meta={prives.meta}
                        columns={columns}
                        filters={filters}
                        initialFilters={processedInitialFilters}
                        enableSorting={true}
                        enablePagination={true}
                        enableFilters={true}
                        showFilterContainer={true}
                        useFilterBar={true}
                        pageSize={serverFilters?.perPage || 15}
                        emptyTitle="Belum ada prive"
                        emptyMessage="Mulai dengan menambahkan prive pertama Anda"
                        searchPlaceholder="Cari deskripsi atau keterangan prive..."
                    />
                </div>
            </motion.div>

            <DeletePriveModal
                isOpen={deleteModal.show}
                prive={deleteModal.prive}
                onClose={() => {
                    if (!isDeleting) {
                        setDeleteModal({ show: false });
                    }
                }}
                onConfirm={handleDelete}
                isLoading={isDeleting}
            />
        </>
    );
}

PrivesIndex.layout = withAuthenticatedLayout({
    title: "Manajemen Prive",
    searchable: true,
    breadcrumbs: [{ label: "Prive", href: route("prives.index") }],
});

export default PrivesIndex;
