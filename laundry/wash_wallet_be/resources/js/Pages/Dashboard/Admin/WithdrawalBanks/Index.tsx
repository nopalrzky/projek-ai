import { useCallback, useMemo, useState } from "react";
import { Head, router } from "@inertiajs/react";
import { motion } from "framer-motion";
import { CreditCard, Plus } from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { DataView } from "@/Components/DataView";
import { Alert } from "@/Components/Alert";
import PageHeader from "@/Components/Page/PageHeader";
import { WithdrawalBank } from "@/types";
import { WithdrawalBankIndexProps } from "./types";
import { createWithdrawalBankColumns } from "./columns";
import { DeleteWithdrawalBankModal } from "./Partials/DeleteWithdrawalBankModal";

function WithdrawalBanksIndex({ banks, filters: serverFilters, flash }: WithdrawalBankIndexProps) {
    const [deleteModal, setDeleteModal] = useState<{
        show: boolean;
        bank?: WithdrawalBank;
    }>({ show: false });
    const [isDeleting, setIsDeleting] = useState(false);

    const handleEdit = useCallback((bank: WithdrawalBank) => {
        router.visit(route("admin.withdrawal-banks.edit", bank.id));
    }, []);

    const handleDelete = useCallback((bank: WithdrawalBank) => {
        setDeleteModal({ show: true, bank });
    }, []);

    const handleCloseDeleteModal = useCallback(() => {
        if (!isDeleting) {
            setDeleteModal({ show: false });
        }
    }, [isDeleting]);

    const handleConfirmDelete = useCallback((bank: WithdrawalBank) => {
        setIsDeleting(true);
        router.delete(route("admin.withdrawal-banks.destroy", bank.id), {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteModal({ show: false });
            },
            onFinish: () => {
                setIsDeleting(false);
            },
        });
    }, []);

    const columns = useMemo(
        () => createWithdrawalBankColumns(handleEdit, handleDelete),
        [handleEdit, handleDelete]
    );

    const processedInitialFilters = {
        search: serverFilters?.search || "",
        sortBy: serverFilters?.sortBy || "created_at",
        sortDirection: serverFilters?.sortDirection || "desc",
        page: serverFilters?.page || 1,
        perPage: serverFilters?.perPage || 15,
    };

    return (
        <>
            <Head title="Kelola Bank Master" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="p-6"
            >
                <div className="mx-auto space-y-6">
                    <PageHeader
                        title="Kelola Bank Master"
                        subtitle="Kelola konfigurasi bank, biaya administrasi transfer, dan batas nominal penarikan saldo."
                        icon={CreditCard}
                        animate={true}
                    />

                    {flash?.success && (
                        <Alert variant="success" title="Berhasil" description={flash.success} />
                    )}
                    {flash?.error && (
                        <Alert variant="error" title="Error" description={flash.error} />
                    )}

                    <DataView<WithdrawalBank>
                        route={route("admin.withdrawal-banks.index")}
                        actionButton={{
                            label: "Tambah Bank",
                            href: route("admin.withdrawal-banks.create"),
                            icon: <Plus className="w-4 h-4" />,
                            variant: "primary",
                        }}
                        data={banks.data}
                        meta={banks.meta}
                        columns={columns}
                        initialFilters={processedInitialFilters}
                        enableSorting={true}
                        enablePagination={true}
                        enableFilters={false}
                        pageSize={processedInitialFilters.perPage}
                        emptyTitle="Belum ada bank"
                        emptyMessage="Konfigurasikan daftar bank master untuk pertama kalinya"
                        searchPlaceholder="Cari nama bank..."
                    />
                </div>
            </motion.div>

            <DeleteWithdrawalBankModal
                isOpen={deleteModal.show}
                bank={deleteModal.bank}
                onClose={handleCloseDeleteModal}
                onConfirm={handleConfirmDelete}
                isLoading={isDeleting}
            />
        </>
    );
}

WithdrawalBanksIndex.layout = withAuthenticatedLayout({
    title: "Kelola Bank Master",
    breadcrumbs: [{ label: "Bank Master", href: route("admin.withdrawal-banks.index") }],
});

export default WithdrawalBanksIndex;
