import { useCallback, useMemo, useState } from "react";
import { Head, router } from "@inertiajs/react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { DataView } from "@/Components/DataView";
import { Expense } from "@/types";
import { ExpenseIndexProps } from "./types";
import { createExpenseColumns } from "./columns";
import { createExpenseFilters } from "./filters";
import expenseService from "@/Services/expense.service";
import PageHeader from "@/Components/Page/PageHeader";
import { Alert } from "@/Components/Alert";
import DeleteExpenseModal from "./Partials/DeleteExpenseModal";
import ApproveExpenseModal from "./Partials/ApproveExpenseModal";
import RejectExpenseModal from "./Partials/RejectExpenseModal";
import AttachmentPreviewModal from "./Partials/AttachmentPreviewModal";

function ExpensesIndex({
    expenses,
    filterOptions: { outlets, expenseAccounts, sourceAccounts },
    filters: serverFilters,
    flash,
}: ExpenseIndexProps) {
    const [deleteModal, setDeleteModal] = useState<{
        show: boolean;
        expense?: Expense;
    }>({ show: false });
    const [approveModal, setApproveModal] = useState<{
        show: boolean;
        expense?: Expense;
    }>({ show: false });
    const [rejectModal, setRejectModal] = useState<{
        show: boolean;
        expense?: Expense;
    }>({ show: false });
    const [isDeleting, setIsDeleting] = useState(false);
    const [isApproving, setIsApproving] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);
    const [attachmentPreview, setAttachmentPreview] = useState<{
        show: boolean;
        expense?: Expense;
        url?: string;
    }>({ show: false });

    const handleView = useCallback((expense: Expense) => {
        expenseService.goToView(expense.id);
    }, []);

    const handleEdit = useCallback((expense: Expense) => {
        expenseService.goToEdit(expense.id);
    }, []);

    const handleApprove = useCallback((expense: Expense) => {
        setApproveModal({ show: true, expense });
    }, []);

    const handleReject = useCallback((expense: Expense) => {
        setRejectModal({ show: true, expense });
    }, []);

    const handleOpenAttachmentPreview = useCallback((expense: Expense) => {
        setAttachmentPreview({
            show: true,
            expense,
            url: expense.attachmentUrl ?? expense.attachment,
        });
    }, []);

    const handleConfirmApprove = useCallback(
        (expense: Expense, sourceAccountId?: number) => {
            setIsApproving(true);
            router.post(
                route("expenses.approve", expense.id),
                { sourceAccountId },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setApproveModal({ show: false });
                    },
                    onFinish: () => {
                        setIsApproving(false);
                    },
                },
            );
        },
        [],
    );

    const handleConfirmReject = useCallback(
        (expense: Expense, reason: string) => {
            setIsRejecting(true);
            router.post(
                route("expenses.reject", expense.id),
                { rejectionReason: reason },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setRejectModal({ show: false });
                    },
                    onFinish: () => {
                        setIsRejecting(false);
                    },
                },
            );
        },
        [],
    );

    const handleDelete = useCallback((expense: Expense) => {
        setIsDeleting(true);
        router.delete(route("expenses.destroy", expense.id), {
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

    const handleOpenDeleteModal = useCallback((expense: Expense) => {
        setDeleteModal({ show: true, expense });
    }, []);

    const columns = useMemo(
        () =>
            createExpenseColumns(
                handleView,
                handleEdit,
                handleOpenDeleteModal,
                handleApprove,
                handleReject,
                handleOpenAttachmentPreview,
            ),
        [
            handleView,
            handleEdit,
            handleOpenDeleteModal,
            handleApprove,
            handleReject,
            handleOpenAttachmentPreview,
        ],
    );

    const filters = useMemo(
        () => createExpenseFilters(outlets, expenseAccounts, sourceAccounts),
        [outlets, expenseAccounts, sourceAccounts],
    );

    const processedInitialFilters = {
        search: serverFilters?.search || "",
        outletId: serverFilters?.outletId,
        expenseAccountId: serverFilters?.expenseAccountId,
        sourceAccountId: serverFilters?.sourceAccountId,
        startDate: serverFilters?.startDate || "",
        endDate: serverFilters?.endDate || "",
        minAmount: serverFilters?.minAmount,
        maxAmount: serverFilters?.maxAmount,
        hasAttachment: serverFilters?.hasAttachment,
        sortBy: serverFilters?.sortBy || "date",
        sortDirection: serverFilters?.sortDirection || "desc",
        page: serverFilters?.page || 1,
        perPage: serverFilters?.perPage || 15,
    };

    return (
        <>
            <Head title="Manajemen Pengeluaran" />
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="p-6"
            >
                <div className=" mx-auto space-y-6">
                    <PageHeader
                        title="Manajemen Pengeluaran"
                        subtitle={`Kelola dan pantau seluruh data pengeluaran Anda (${expenses.meta.total} pengeluaran)`}
                        icon={Plus}
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
                        route={route("expenses.index")}
                        actionButton={{
                            label: "Tambah Pengeluaran",
                            href: route("expenses.create"),
                            icon: <Plus className="w-4 h-4" />,
                            variant: "primary",
                        }}
                        data={expenses.data}
                        meta={expenses.meta}
                        columns={columns}
                        filters={filters}
                        initialFilters={processedInitialFilters}
                        enableSorting={true}
                        enablePagination={true}
                        enableFilters={true}
                        showFilterContainer={true}
                        useFilterBar={true}
                        pageSize={processedInitialFilters.perPage}
                        emptyTitle="Belum ada pengeluaran"
                        emptyMessage="Mulai dengan mencatat pengeluaran pertama Anda"
                        searchPlaceholder="Cari deskripsi pengeluaran..."
                    />
                </div>
            </motion.div>

            <DeleteExpenseModal
                isOpen={deleteModal.show}
                expense={deleteModal.expense}
                onClose={handleCloseDeleteModal}
                onConfirm={handleDelete}
                isLoading={isDeleting}
            />

            <ApproveExpenseModal
                isOpen={approveModal.show}
                expense={approveModal.expense}
                accounts={sourceAccounts}
                onClose={handleCloseApproveModal}
                onConfirm={handleConfirmApprove}
                isLoading={isApproving}
            />

            <RejectExpenseModal
                isOpen={rejectModal.show}
                expense={rejectModal.expense}
                onClose={handleCloseRejectModal}
                onConfirm={handleConfirmReject}
                isLoading={isRejecting}
            />

            <AttachmentPreviewModal
                isOpen={attachmentPreview.show}
                expense={attachmentPreview.expense}
                onClose={() =>
                    setAttachmentPreview({
                        show: false,
                        expense: undefined,
                        url: undefined,
                    })
                }
            />
        </>
    );
}

ExpensesIndex.layout = withAuthenticatedLayout({
    title: "Manajemen Pengeluaran",
    searchable: true,
    breadcrumbs: [{ label: "Pengeluaran", href: route("expenses.index") }],
});

export default ExpensesIndex;
