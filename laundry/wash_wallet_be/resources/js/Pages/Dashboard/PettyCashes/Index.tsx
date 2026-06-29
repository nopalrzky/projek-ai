import { useCallback, useMemo, useState } from "react";
import { Head, router } from "@inertiajs/react";
import { Wallet } from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { DataView } from "@/Components/DataView";
import { Alert } from "@/Components/Alert";
import PageHeader from "@/Components/Page/PageHeader";
import { PettyCash } from "@/types";
import { PettyCashIndexProps } from "./types";
import { createPettyCashColumns } from "./columns";
import { createPettyCashFilters } from "./filters";
import { pettyCashService } from "@/Services/petty_cash.service";
import DeletePettyCashModal from "./Partials/DeletePettyCashModal";
import ApprovePettyCashModal from "./Partials/ApprovePettyCashModal";
import RejectPettyCashModal from "./Partials/RejectPettyCashModal";

function PettyCashesIndex({
    pettyCashes,
    filterOptions,
    filters: serverFilters,
    flash,
}: PettyCashIndexProps) {
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [approveModalOpen, setApproveModalOpen] = useState(false);
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [pettyCashToDelete, setPettyCashToDelete] = useState<
        PettyCash | undefined
    >();
    const [pettyCashToApprove, setPettyCashToApprove] = useState<
        PettyCash | undefined
    >();
    const [pettyCashToReject, setPettyCashToReject] = useState<
        PettyCash | undefined
    >();
    const [isDeleting, setIsDeleting] = useState(false);
    const [isApproving, setIsApproving] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);

    const handleView = useCallback((pettyCash: PettyCash) => {
        pettyCashService.goToView(pettyCash.id);
    }, []);

    const handleApprove = useCallback((pettyCash: PettyCash) => {
        setPettyCashToApprove(pettyCash);
        setApproveModalOpen(true);
    }, []);

    const handleReject = useCallback((pettyCash: PettyCash) => {
        setPettyCashToReject(pettyCash);
        setRejectModalOpen(true);
    }, []);

    const handleDelete = useCallback((pettyCash: PettyCash) => {
        setPettyCashToDelete(pettyCash);
        setDeleteModalOpen(true);
    }, []);

    const handleConfirmApprove = useCallback(
        (sourceAccountId: number) => {
            if (!pettyCashToApprove) {
                return;
            }

            setIsApproving(true);
            router.post(
                route("petty-cashes.approve", pettyCashToApprove.id),
                { sourceAccountId },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setApproveModalOpen(false);
                        setPettyCashToApprove(undefined);
                    },
                    onError: (errors) => {
                        console.error("Approve petty cash error:", errors);
                    },
                    onFinish: () => {
                        setIsApproving(false);
                    },
                },
            );
        },
        [pettyCashToApprove],
    );

    const handleConfirmReject = useCallback(
        (reason: string) => {
            if (!pettyCashToReject) {
                return;
            }

            setIsRejecting(true);
            router.post(
                route("petty-cashes.reject", pettyCashToReject.id),
                { reason },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setRejectModalOpen(false);
                        setPettyCashToReject(undefined);
                    },
                    onError: (errors) => {
                        console.error("Reject petty cash error:", errors);
                    },
                    onFinish: () => {
                        setIsRejecting(false);
                    },
                },
            );
        },
        [pettyCashToReject],
    );

    const handleConfirmDelete = useCallback(() => {
        if (!pettyCashToDelete) {
            return;
        }

        setIsDeleting(true);
        router.delete(route("petty-cashes.destroy", pettyCashToDelete.id), {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteModalOpen(false);
                setPettyCashToDelete(undefined);
            },
            onError: (errors) => {
                console.error("Delete petty cash error:", errors);
            },
            onFinish: () => {
                setIsDeleting(false);
            },
        });
    }, [pettyCashToDelete]);

    const handleCloseApproveModal = useCallback(() => {
        if (!isApproving) {
            setApproveModalOpen(false);
            setPettyCashToApprove(undefined);
        }
    }, [isApproving]);

    const handleCloseRejectModal = useCallback(() => {
        if (!isRejecting) {
            setRejectModalOpen(false);
            setPettyCashToReject(undefined);
        }
    }, [isRejecting]);

    const handleCloseDeleteModal = useCallback(() => {
        if (!isDeleting) {
            setDeleteModalOpen(false);
            setPettyCashToDelete(undefined);
        }
    }, [isDeleting]);

    const columns = useMemo(
        () =>
            createPettyCashColumns(
                handleView,
                handleApprove,
                handleReject,
                handleDelete,
            ),
        [handleView, handleApprove, handleReject, handleDelete],
    );

    const filters = useMemo(
        () => createPettyCashFilters(filterOptions.outlets),
        [filterOptions.outlets],
    );

    const processedInitialFilters = {
        search: serverFilters?.search || "",
        outletId: serverFilters?.outletId,
        status: serverFilters?.status || "",
        startDate: serverFilters?.startDate || "",
        endDate: serverFilters?.endDate || "",
        sortBy: serverFilters?.sortBy || "created_at",
        sortDirection: serverFilters?.sortDirection || "desc",
        page: serverFilters?.page || 1,
        perPage: serverFilters?.perPage || 15,
    };

    return (
        <>
            <Head title="Manajemen Kas Kecil" />

            <div className="p-6 space-y-6">
                <PageHeader
                    title="Manajemen Kas Kecil"
                    subtitle="Kelola permintaan kas kecil dari outlet Anda"
                    icon={Wallet}
                />

                {flash?.success && (
                    <Alert variant="success">{flash.success}</Alert>
                )}
                {flash?.error && <Alert variant="error">{flash.error}</Alert>}

                <DataView<PettyCash>
                    route={route("petty-cashes.index")}
                    data={pettyCashes.data}
                    meta={pettyCashes.meta}
                    columns={columns}
                    filters={filters}
                    initialFilters={processedInitialFilters}
                    enableSorting={true}
                    enablePagination={true}
                    enableFilters={true}
                    showFilterContainer={true}
                    useFilterBar={true}
                    pageSize={serverFilters?.perPage || 15}
                    emptyTitle="Belum ada permintaan kas kecil"
                    emptyMessage="Permintaan kas kecil dari outlet akan muncul di sini"
                    searchPlaceholder="Cari kode, outlet, kasir, deskripsi..."
                />
            </div>

            <DeletePettyCashModal
                isOpen={deleteModalOpen}
                pettyCash={pettyCashToDelete}
                onClose={handleCloseDeleteModal}
                onConfirm={handleConfirmDelete}
                isLoading={isDeleting}
            />

            <ApprovePettyCashModal
                isOpen={approveModalOpen}
                pettyCash={pettyCashToApprove}
                accounts={filterOptions.accounts}
                onClose={handleCloseApproveModal}
                onConfirm={handleConfirmApprove}
                isLoading={isApproving}
            />

            <RejectPettyCashModal
                isOpen={rejectModalOpen}
                pettyCash={pettyCashToReject}
                onClose={handleCloseRejectModal}
                onConfirm={handleConfirmReject}
                isLoading={isRejecting}
            />
        </>
    );
}

PettyCashesIndex.layout = withAuthenticatedLayout({
    title: "Kas Kecil",
    searchable: true,
    breadcrumbs: [{ label: "Kas Kecil", href: route("petty-cashes.index") }],
});

export default PettyCashesIndex;
