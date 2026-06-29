import { useCallback, useMemo, useState } from "react";
import { Head, router } from "@inertiajs/react";
import { motion } from "framer-motion";
import { BookOpen, Plus } from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { DataView } from "@/Components/DataView";
import { Alert } from "@/Components/Alert";
import PageHeader from "@/Components/Page/PageHeader";
import { JournalEntry } from "@/types";
import { JournalEntryIndexProps } from "./types";
import { createJournalEntryColumns } from "./columns";
import { createJournalEntryFilters } from "./filters";
import DeleteJournalEntryModal from "./Partials/DeleteJournalEntryModal";
import journalEntryService from "@/Services/journal_entry.service";

function JournalEntriesIndex({
    journalEntries,
    filterOptions,
    filters: serverFilters,
    flash,
}: JournalEntryIndexProps) {
    const [deleteModal, setDeleteModal] = useState<{
        show: boolean;
        journalEntry?: JournalEntry;
    }>({    
        show: false,
    });
    const [isDeleting, setIsDeleting] = useState(false);

    const handleViewEntry = useCallback((entry: JournalEntry) => {
        journalEntryService.goToView(entry.id);
    }, []);

    const handleEditEntry = useCallback((entry: JournalEntry) => {
        if (!entry.isManual) {
            return;
        }

        journalEntryService.goToEdit(entry.id);
    }, []);

    const handleDeleteEntry = useCallback((entry: JournalEntry) => {
        if (!entry.isManual) {
            return;
        }

        setDeleteModal({ show: true, journalEntry: entry });
    }, []);

    const handleConfirmDelete = useCallback((entry: JournalEntry) => {
        setIsDeleting(true);

        router.delete(route("journal-entries.destroy", entry.id), {
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
            createJournalEntryColumns(
                handleViewEntry,
                handleEditEntry,
                handleDeleteEntry,
            ),
        [handleViewEntry, handleEditEntry, handleDeleteEntry],
    );

    const filters = useMemo(
        () => createJournalEntryFilters(filterOptions.outlets),
        [filterOptions.outlets],
    );

    const processedInitialFilters = useMemo(
        () => ({
            search: serverFilters?.search || "",
            outletId: serverFilters?.outletId,
            isManual:
                serverFilters?.isManual === undefined ||
                serverFilters?.isManual === null
                    ? ""
                    : serverFilters.isManual
                      ? "1"
                      : "0",
            referenceType: serverFilters?.referenceType,
            dateFrom: serverFilters?.dateFrom || "",
            dateTo: serverFilters?.dateTo || "",
            minAmount: serverFilters?.minAmount,
            maxAmount: serverFilters?.maxAmount,
            balanced:
                serverFilters?.balanced === undefined ||
                serverFilters?.balanced === null
                    ? ""
                    : serverFilters.balanced
                      ? "1"
                      : "0",
            sortBy: serverFilters?.sortBy || "date",
            sortDirection: serverFilters?.sortDirection || "desc",
            page: serverFilters?.page || 1,
            perPage: serverFilters?.perPage || 15,
        }),
        [serverFilters],
    );

    return (
        <>
            <Head title="Jurnal Umum" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="p-6"
            >
                <div className=" mx-auto space-y-6">
                    <PageHeader
                        title="Jurnal Umum"
                        subtitle={`Kelola dan pantau seluruh jurnal umum Anda (${journalEntries.meta.total} entries)`}
                        icon={BookOpen}
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
                        route={route("journal-entries.index")}
                        data={journalEntries.data}
                        meta={journalEntries.meta}
                        columns={columns}
                        filters={filters}
                        initialFilters={processedInitialFilters}
                        actionButton={{
                            label: "Tambah Entry Manual",
                            href: route("journal-entries.create"),
                            icon: <Plus className="w-4 h-4" />,
                            variant: "primary",
                        }}
                        enableSorting={true}
                        enablePagination={true}
                        enableFilters={true}
                        showFilterContainer={true}
                        useFilterBar={true}
                        pageSize={processedInitialFilters.perPage}
                        emptyTitle="Belum ada jurnal umum"
                        emptyMessage="Belum ada jurnal umum yang terdaftar dalam sistem"
                        searchPlaceholder="Cari nomor transaksi atau deskripsi..."
                    />
                </div>
            </motion.div>

            <DeleteJournalEntryModal
                isOpen={deleteModal.show}
                journalEntry={deleteModal.journalEntry}
                onClose={handleCloseDeleteModal}
                onConfirm={handleConfirmDelete}
                isLoading={isDeleting}
            />
        </>
    );
}

JournalEntriesIndex.layout = withAuthenticatedLayout({
    title: "Jurnal Umum",
    searchable: true,
    breadcrumbs: [
        { label: "Jurnal Umum", href: route("journal-entries.index") },
    ],
});

export default JournalEntriesIndex;
