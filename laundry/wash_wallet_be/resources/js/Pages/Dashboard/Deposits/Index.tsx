import { useCallback, useMemo, useState } from "react";
import { Head, router } from "@inertiajs/react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { DataView } from "@/Components/DataView";
import { Alert } from "@/Components/Alert";
import PageHeader from "@/Components/Page/PageHeader";
import { Deposit } from "@/types";
import { DepositIndexProps } from "./types";
import { createDepositColumns } from "./columns";
import { createDepositFilters } from "./filters";
import { depositService } from "@/Services/deposit.service";
import DeleteDepositModal from "./Partials/DeleteDepositModal";
import ApproveDepositModal from "./Partials/ApproveDepositModal";
import RejectDepositModal from "./Partials/RejectDepositModal";
import { motion } from "framer-motion";
import { Archive } from "lucide-react";

function DepositsIndex({
    deposits,
    filterOptions,
    filters: serverFilters,
    flash,
}: DepositIndexProps) {
    const [deleteModal, setDeleteModal] = useState<{
        show: boolean;
        deposit?: Deposit;
    }>({ show: false });
    const [approveModal, setApproveModal] = useState<{
        show: boolean;
        deposit?: Deposit;
    }>({ show: false });
    const [rejectModal, setRejectModal] = useState<{
        show: boolean;
        deposit?: Deposit;
    }>({ show: false });
    const [isDeleting, setIsDeleting] = useState(false);
    const [isApproving, setIsApproving] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);

    const handleView = useCallback((deposit: Deposit) => {
        depositService.goToView(deposit.id);
    }, []);

    const handleApprove = useCallback((deposit: Deposit) => {
        setApproveModal({ show: true, deposit });
    }, []);

    const handleReject = useCallback((deposit: Deposit) => {
        setRejectModal({ show: true, deposit });
    }, []);

    const handleDelete = useCallback((deposit: Deposit) => {
        setDeleteModal({ show: true, deposit });
    }, []);

    const handleConfirmApprove = useCallback(async (deposit: Deposit) => {
        setIsApproving(true);
        router.post(
            route("deposits.approve", deposit.id),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setApproveModal({ show: false });
                },
                onError: (errors) => {
                    console.error("Approve deposit error:", errors);
                },
                onFinish: () => {
                    setIsApproving(false);
                },
            },
        );
    }, []);

    const handleConfirmReject = useCallback(
        async (deposit: Deposit, reason: string) => {
            setIsRejecting(true);
            router.post(
                route("deposits.reject", deposit.id),
                { reason },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setRejectModal({ show: false });
                    },
                    onError: (errors) => {
                        console.error("Reject deposit error:", errors);
                    },
                    onFinish: () => {
                        setIsRejecting(false);
                    },
                },
            );
        },
        [],
    );

    const handleConfirmDelete = useCallback(async (deposit: Deposit) => {
        setIsDeleting(true);
        router.delete(route("deposits.destroy", deposit.id), {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteModal({ show: false });
            },
            onError: (errors) => {
                console.error("Delete deposit error:", errors);
            },
            onFinish: () => {
                setIsDeleting(false);
            },
        });
    }, []);

    const handleCloseApproveModal = useCallback(() => {
        if (!isApproving) {
            setApproveModal({ show: false });
        }
    }, [isApproving]);

    const handleCloseRejectModal = useCallback(() => {
        if (!isRejecting) {
            setRejectModal({ show: false });
        }
    }, [isRejecting]);

    const handleCloseDeleteModal = useCallback(() => {
        if (!isDeleting) {
            setDeleteModal({ show: false });
        }
    }, [isDeleting]);

    const columns = useMemo(
        () =>
            createDepositColumns(
                handleView,
                handleApprove,
                handleReject,
                handleDelete,
            ),
        [handleView, handleApprove, handleReject, handleDelete],
    );

    const filters = useMemo(
        () => createDepositFilters(filterOptions.outlets),
        [filterOptions.outlets],
    );

    const processedInitialFilters = {
        search: serverFilters?.search || "",
        outletId: serverFilters?.outletId,
        status: serverFilters?.status || "",
        startDate: serverFilters?.startDate || undefined,
        endDate: serverFilters?.endDate || undefined,
        sortBy: serverFilters?.sortBy || "created_at",
        sortDirection: serverFilters?.sortDirection || "desc",
        page: serverFilters?.page || 1,
        perPage: serverFilters?.perPage || 15,
    };

    return (
        <>
            <Head title="Manajemen Setoran Kas" />
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="p-6"
            >
                <div className=" mx-auto space-y-6">
                    <PageHeader
                        title="Manajemen Setoran Kas"
                        subtitle="Kelola setoran kas dari outlet, termasuk persetujuan, penolakan, dan penghapusan."
                        icon={Archive}
                        animate={true}
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

                    <DataView<Deposit>
                        route={route("deposits.index")}
                        data={deposits.data}
                        meta={deposits.meta}
                        columns={columns}
                        filters={filters}
                        initialFilters={processedInitialFilters}
                        enableSorting={true}
                        enablePagination={true}
                        enableFilters={true}
                        showFilterContainer={true}
                        useFilterBar={true}
                        pageSize={serverFilters?.perPage || 15}
                        emptyTitle="Belum ada data setoran"
                        emptyMessage="Setoran kas dari outlet akan muncul di sini"
                        searchPlaceholder="Cari kode setoran, outlet, kasir..."
                    />
                </div>
            </motion.div>

            <DeleteDepositModal
                isOpen={deleteModal.show}
                deposit={deleteModal.deposit}
                onClose={handleCloseDeleteModal}
                onConfirm={handleConfirmDelete}
                isLoading={isDeleting}
            />

            <ApproveDepositModal
                isOpen={approveModal.show}
                deposit={approveModal.deposit}
                onClose={handleCloseApproveModal}
                onConfirm={handleConfirmApprove}
                isLoading={isApproving}
            />

            <RejectDepositModal
                isOpen={rejectModal.show}
                deposit={rejectModal.deposit}
                onClose={handleCloseRejectModal}
                onConfirm={handleConfirmReject}
                isLoading={isRejecting}
            />
        </>
    );
}

DepositsIndex.layout = withAuthenticatedLayout({
    title: "Setoran Kas",
    searchable: true,
    breadcrumbs: [{ label: "Setoran Kas", href: route("deposits.index") }],
});

export default DepositsIndex;
