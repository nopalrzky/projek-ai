import { useCallback, useMemo, useState } from "react";
import { Head, router } from "@inertiajs/react";
import { motion } from "framer-motion";
import { DollarSign, Plus } from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { DataView } from "@/Components/DataView";
import { Alert } from "@/Components/Alert";
import PageHeader from "@/Components/Page/PageHeader";
import { Loan } from "@/types";
import { LoanIndexProps } from "./types";
import { createLoanColumns } from "./columns";
import { createLoanFilters } from "./filters";
import DeleteLoanModal from "./Partials/DeleteLoanModal";
import loanService from "@/Services/loan.service";

function LoansIndex({
    loans,
    filterOptions,
    filters: serverFilters,
    flash,
}: LoanIndexProps) {
    const [deleteModal, setDeleteModal] = useState<{
        show: boolean;
        loan?: Loan;
    }>({
        show: false,
    });
    const [isDeleting, setIsDeleting] = useState(false);

    const handleViewLoan = useCallback((loan: Loan) => {
        loanService.goToView(loan.id);
    }, []);

    const handleEditLoan = useCallback((loan: Loan) => {
        loanService.goToEdit(loan.id);
    }, []);

    const handleDeleteLoan = useCallback((loan: Loan) => {
        if (loan.status !== "ongoing") {
            return;
        }

        if (loan.remainingAmount < loan.amount) {
            return;
        }

        setDeleteModal({ show: true, loan });
    }, []);

    const handleConfirmDelete = useCallback((loan: Loan) => {
        setIsDeleting(true);

        router.delete(route("loans.destroy", loan.id), {
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
            createLoanColumns(handleViewLoan, handleEditLoan, handleDeleteLoan),
        [handleViewLoan, handleEditLoan, handleDeleteLoan],
    );

    const filters = useMemo(
        () => createLoanFilters(filterOptions.employees, filterOptions.outlets),
        [filterOptions.employees, filterOptions.outlets],
    );

    const processedInitialFilters = {
        search: serverFilters?.search || "",
        outletId: serverFilters?.outletId,
        employeeId: serverFilters?.employeeId,
        status: serverFilters?.status,
        repaymentType: serverFilters?.repaymentType,
        loanDateFrom: serverFilters?.loanDateFrom || "",
        loanDateTo: serverFilters?.loanDateTo || "",
        minAmount: serverFilters?.minAmount,
        maxAmount: serverFilters?.maxAmount,
        minRemainingAmount: serverFilters?.minRemainingAmount,
        maxRemainingAmount: serverFilters?.maxRemainingAmount,
        sortBy: serverFilters?.sortBy || "loanDate",
        sortDirection: serverFilters?.sortDirection || "desc",
        page: serverFilters?.page || 1,
        perPage: serverFilters?.perPage || 15,
    };

    return (
        <>
            <Head title="Manajemen Kasbon" />

            <motion.div
                className="p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="mx-auto  space-y-6">
                    <PageHeader
                        title="Manajemen Kasbon"
                        subtitle={`Kelola kasbon karyawan (${loans.meta.total} kasbon)`}
                        icon={DollarSign}
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
                        route={route("loans.index")}
                        actionButton={{
                            label: "Tambah Kasbon",
                            href: route("loans.create"),
                            icon: <Plus className="w-4 h-4" />,
                            variant: "primary",
                        }}
                        data={loans.data}
                        meta={loans.meta}
                        columns={columns}
                        filters={filters}
                        initialFilters={processedInitialFilters}
                        enableSorting={true}
                        enablePagination={true}
                        enableFilters={true}
                        showFilterContainer={true}
                        useFilterBar={true}
                        pageSize={processedInitialFilters.perPage}
                        emptyTitle="Belum ada kasbon"
                        emptyMessage="Belum ada kasbon yang terdaftar dalam sistem"
                        searchPlaceholder="Cari nama karyawan atau catatan..."
                    />
                </div>
            </motion.div>

            <DeleteLoanModal
                isOpen={deleteModal.show}
                loan={deleteModal.loan}
                onClose={handleCloseDeleteModal}
                onConfirm={handleConfirmDelete}
                isLoading={isDeleting}
            />
        </>
    );
}

LoansIndex.layout = withAuthenticatedLayout({
    title: "Manajemen Kasbon",
    searchable: true,
    breadcrumbs: [{ label: "Kasbon", href: route("loans.index") }],
});

export default LoansIndex;
