import { useCallback, useMemo, useState } from "react";
import { Head, router } from "@inertiajs/react";
import { Plus, Cog } from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { DataView } from "@/Components/DataView";
import { Alert } from "@/Components/Alert";
import PageHeader from "@/Components/Page/PageHeader";
import { Process } from "@/types";
import { ProcessIndexProps } from "./types";
import { createProcessColumns } from "./columns";
import { createProcessFilters } from "./filters";
import { processService } from "@/Services/process.service";
import DeleteProcessModal from "./Partials/DeleteProcessModal";

function ProcessesIndex({
    processes,
    filterOptions,
    filters: serverFilters,
    flash,
}: ProcessIndexProps) {
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [processToDelete, setProcessToDelete] = useState<
        Process | undefined
    >();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleView = useCallback((process: Process) => {
        processService.goToView(process.id);
    }, []);

    const handleEdit = useCallback((process: Process) => {
        processService.goToEdit(process.id);
    }, []);

    const handleDelete = useCallback((process: Process) => {
        setProcessToDelete(process);
        setDeleteModalOpen(true);
    }, []);

    const handleConfirmDelete = useCallback(() => {
        if (!processToDelete) {
            return;
        }

        setIsDeleting(true);

        router.delete(route("processes.destroy", processToDelete.id), {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteModalOpen(false);
                setProcessToDelete(undefined);
            },
            onError: (errors) => {
                console.error("Delete process error:", errors);
            },
            onFinish: () => {
                setIsDeleting(false);
            },
        });
    }, [processToDelete]);

    const handleCloseDeleteModal = useCallback(() => {
        if (!isDeleting) {
            setDeleteModalOpen(false);
            setProcessToDelete(undefined);
        }
    }, [isDeleting]);

    const columns = useMemo(
        () => createProcessColumns(handleView, handleEdit, handleDelete),
        [handleView, handleEdit, handleDelete],
    );

    const filters = useMemo(() => createProcessFilters(), []);

    const processedInitialFilters = {
        search: serverFilters?.search || "",
        isActive:
            serverFilters?.isActive !== undefined ? serverFilters.isActive : "",
        sortBy: serverFilters?.sortBy || "created_at",
        sortDirection: serverFilters?.sortDirection || "desc",
        page: serverFilters?.page || 1,
        perPage: serverFilters?.perPage || 15,
    };

    return (
        <>
            <Head title="Manajemen Proses" />

            <div className="p-6">
                <div className=" mx-auto space-y-6">
                    <PageHeader
                        title="Manajemen Proses"
                        subtitle={`Kelola proses layanan laundry (${processes.meta.total} proses)`}
                        icon={Cog}
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

                    <DataView<Process>
                        route={route("processes.index")}
                        data={processes.data}
                        meta={processes.meta}
                        columns={columns}
                        filters={filters}
                        initialFilters={processedInitialFilters}
                        enableSorting={true}
                        enablePagination={true}
                        enableFilters={true}
                        showFilterContainer={true}
                        useFilterBar={true}
                        pageSize={serverFilters?.perPage || 15}
                        emptyTitle="Belum ada proses"
                        emptyMessage="Mulai dengan menambahkan proses pertama untuk mengelola alur kerja laundry Anda"
                        searchPlaceholder="Cari nama proses atau deskripsi..."
                        actionButton={{
                            label: "Tambah Proses",
                            href: route("processes.create"),
                            icon: <Plus className="w-4 h-4" />,
                            variant: "primary",
                        }}
                    />
                </div>
            </div>

            {deleteModalOpen && processToDelete && (
                <DeleteProcessModal
                    isOpen={deleteModalOpen}
                    process={processToDelete}
                    onClose={handleCloseDeleteModal}
                    onConfirm={handleConfirmDelete}
                    isLoading={isDeleting}
                />
            )}
        </>
    );
}

ProcessesIndex.layout = withAuthenticatedLayout({
    title: "Manajemen Proses",
    searchable: true,
    breadcrumbs: [{ label: "Proses", href: route("processes.index") }],
});

export default ProcessesIndex;
