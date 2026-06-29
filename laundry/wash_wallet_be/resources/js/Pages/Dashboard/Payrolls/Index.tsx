import { useCallback, useMemo, useState } from "react";
import { Head } from "@inertiajs/react";
import { router } from "@inertiajs/react";
import { motion } from "framer-motion";
import { Wallet, Plus } from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { DataView } from "@/Components/DataView";
import { Payroll } from "@/types";
import { PayrollIndexProps } from "./types";
import { createPayrollColumns } from "./columns";
import { createPayrollFilters } from "./filters";
import DeletePayrollModal from "./Partials/DeletePayrollModal";
import payrollService from "@/Services/payroll.service";
import PageHeader from "@/Components/Page/PageHeader";

function PayrollsIndex({
    payrolls,
    outlets,
    filters: serverFilters,
    flash,
}: PayrollIndexProps) {
    const [deleteModal, setDeleteModal] = useState<{
        show: boolean;
        payroll?: Payroll;
    }>({
        show: false,
    });
    const [isDeleting, setIsDeleting] = useState(false);

    const handleViewPayroll = useCallback((payroll: Payroll) => {
        payrollService.goToView(payroll.id);
    }, []);

    const handleDeletePayroll = useCallback((payroll: Payroll) => {
        if (payroll.status !== "draft") {
            alert("Hanya penggajian dengan status Draft yang dapat dihapus");
            return;
        }

        setDeleteModal({ show: true, payroll });
    }, []);

    const handleConfirmDelete = useCallback((payroll: Payroll) => {
        setIsDeleting(true);

        router.delete(route("payrolls.destroy", payroll.id), {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteModal({ show: false });
            },
            onError: (errors) => {
                console.error("Delete error:", errors);
            },
            onFinish: () => {
                setIsDeleting(false);
            },
        });
    }, []);

    const columns = useMemo(
        () => createPayrollColumns(handleViewPayroll, handleDeletePayroll),
        [handleViewPayroll, handleDeletePayroll],
    );

    const filters = useMemo(() => createPayrollFilters(outlets), [outlets]);

    const processedInitialFilters = {
        search: serverFilters?.search || "",
        outletId: serverFilters?.outletId,
        status: serverFilters?.status,
        type: serverFilters?.type,
        paymentMethod: serverFilters?.paymentMethod,
        month: serverFilters?.month,
        year: serverFilters?.year,
        sortBy: serverFilters?.sortBy || "payment_date",
        sortDirection: serverFilters?.sortDirection || "desc",
        page: serverFilters?.page || 1,
        perPage: serverFilters?.perPage || 15,
    };

    return (
        <>
            <Head title="Manajemen Penggajian" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="p-6"
            >
                <div className="mx-auto  space-y-6">
                    <PageHeader
                        title="Manajemen Gaji Karyawan"
                        subtitle={`Kelola penggajian karyawan (${payrolls.meta.total} penggajian)`}
                        icon={Wallet}
                        variant="default"
                    />
                    <DataView
                        route={route("payrolls.index")}
                        data={payrolls.data}
                        meta={payrolls.meta}
                        columns={columns}
                        filters={filters}
                        initialFilters={processedInitialFilters}
                        enableSorting={true}
                        enablePagination={true}
                        enableFilters={true}
                        showFilterContainer={true}
                        useFilterBar={true}
                        pageSize={serverFilters?.perPage || 15}
                        emptyTitle="Belum ada penggajian"
                        emptyMessage="Belum ada data penggajian yang terdaftar dalam sistem"
                        searchPlaceholder="Cari nomor transaksi, karyawan..."
                        actionButton={{
                            label: "Proses Penggajian",
                            href: route("payrolls.create"),
                            icon: <Plus className="w-5 h-5" />,
                            variant: "primary",
                        }}
                    />
                </div>
            </motion.div>

            <DeletePayrollModal
                isOpen={deleteModal.show}
                payroll={deleteModal.payroll}
                onClose={() => {
                    if (!isDeleting) {
                        setDeleteModal({ show: false });
                    }
                }}
                onConfirm={() => {
                    if (deleteModal.payroll) {
                        handleConfirmDelete(deleteModal.payroll);
                    }
                }}
                isLoading={isDeleting}
            />
        </>
    );
}

PayrollsIndex.layout = withAuthenticatedLayout({
    title: "Manajemen Penggajian",
    searchable: true,
    breadcrumbs: [{ label: "Penggajian", href: route("payrolls.index") }],
});

export default PayrollsIndex;
