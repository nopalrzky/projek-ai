import { useCallback, useMemo, useState } from "react";
import { Head, router } from "@inertiajs/react";
import { motion } from "framer-motion";
import { AlertCircle, Plus } from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { DataView } from "@/Components/DataView";
import { Alert } from "@/Components/Alert";
import PageHeader from "@/Components/Page/PageHeader";
import { FineLog } from "@/types";
import { FineLogIndexProps } from "./types";
import { createFineLogColumns } from "./columns";
import { createFineLogFilters } from "./filters";
import fineLogService from "@/Services/fine_log.service";
import DeleteFineLogModal from "./Partials/DeleteFineLogModal";

function FineLogsIndex({
    fineLogs,
    employees,
    outlets,
    fines,
    filters: serverFilters,
    flash,
}: FineLogIndexProps) {
    const [deleteModal, setDeleteModal] = useState<{
        show: boolean;
        fineLog?: FineLog;
    }>({ show: false });
    const [isDeleting, setIsDeleting] = useState(false);

    const handleView = useCallback((fineLog: FineLog) => {
        fineLogService.goToView(fineLog.id);
    }, []);

    const handleEdit = useCallback((fineLog: FineLog) => {
        fineLogService.goToEdit(fineLog.id);
    }, []);

    const handleDelete = useCallback((fineLog: FineLog) => {
        setDeleteModal({ show: true, fineLog });
    }, []);

    const handleConfirmDelete = useCallback((fineLog: FineLog) => {
        setIsDeleting(true);
        router.delete(route("fine-logs.destroy", fineLog.id), {
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
        () => createFineLogColumns(handleView, handleEdit, handleDelete),
        [handleView, handleEdit, handleDelete],
    );

    const filters = useMemo(
        () => createFineLogFilters(employees, outlets, fines),
        [employees, outlets, fines],
    );

    const processedInitialFilters = {
        search: serverFilters?.search || "",
        employeeId: serverFilters?.employeeId,
        outletId: serverFilters?.outletId,
        fineId: serverFilters?.fineId,
        status: serverFilters?.status,
        dateFrom: serverFilters?.dateFrom || "",
        dateTo: serverFilters?.dateTo || "",
        minAmount: serverFilters?.minAmount,
        maxAmount: serverFilters?.maxAmount,
        sortBy: serverFilters?.sortBy || "date",
        sortDirection: serverFilters?.sortDirection || "desc",
        page: serverFilters?.page || 1,
        perPage: serverFilters?.perPage || 15,
    };

    return (
        <>
            <Head title="Manajemen Denda Karyawan" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="p-6"
            >
                <div className=" mx-auto space-y-6">
                    <PageHeader
                        title="Manajemen Denda Karyawan"
                        subtitle={`Kelola catatan denda dan pelanggaran karyawan (${fineLogs.meta.total} catatan)`}
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

                    <DataView
                        route={route("fine-logs.index")}
                        data={fineLogs.data}
                        meta={fineLogs.meta}
                        columns={columns}
                        filters={filters}
                        initialFilters={processedInitialFilters}
                        enableSorting={true}
                        enablePagination={true}
                        enableFilters={true}
                        showFilterContainer={true}
                        useFilterBar={true}
                        pageSize={processedInitialFilters.perPage}
                        emptyTitle="Belum ada catatan denda"
                        emptyMessage="Belum ada catatan denda karyawan yang tercatat"
                        searchPlaceholder="Cari karyawan, jenis denda, atau outlet..."
                        actionButton={{
                            label: "Tambah Denda",
                            href: route("fine-logs.create"),
                            icon: <Plus className="w-4 h-4" />,
                            variant: "primary",
                        }}
                    />
                </div>
            </motion.div>

            <DeleteFineLogModal
                isOpen={deleteModal.show}
                fineLog={deleteModal.fineLog}
                onClose={handleCloseDeleteModal}
                onConfirm={handleConfirmDelete}
                isLoading={isDeleting}
            />
        </>
    );
}

FineLogsIndex.layout = withAuthenticatedLayout({
    title: "Manajemen Denda Karyawan",
    searchable: true,
    breadcrumbs: [{ label: "Denda Karyawan", href: route("fine-logs.index") }],
});

export default FineLogsIndex;
