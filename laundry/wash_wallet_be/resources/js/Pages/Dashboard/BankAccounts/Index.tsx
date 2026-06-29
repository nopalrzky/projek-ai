import { useCallback, useMemo, useState } from "react";
import { Head, router } from "@inertiajs/react";
import { motion } from "framer-motion";
import { CreditCard, Plus } from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { DataView } from "@/Components/DataView";
import { Alert } from "@/Components/Alert";
import PageHeader from "@/Components/Page/PageHeader";
import { OwnerBankAccount } from "@/types";
import { BankAccountIndexProps } from "./types";
import { createBankAccountColumns } from "./columns";
import { createBankAccountFilters } from "./filters";
import DeleteBankAccountModal from "./Partials/DeleteBankAccountModal";
import { ownerBankAccountService } from "@/Services/owner_bank_account.service";

function BankAccountsIndex({
    accounts,
    filters: serverFilters,
    flash,
}: BankAccountIndexProps) {
    const [deleteModal, setDeleteModal] = useState<{
        show: boolean;
        account?: OwnerBankAccount;
    }>({ show: false });
    const [isDeleting, setIsDeleting] = useState(false);

    const handleEdit = useCallback((account: OwnerBankAccount) => {
        ownerBankAccountService.goToEdit(account.id);
    }, []);

    const handleDelete = useCallback((account: OwnerBankAccount) => {
        setDeleteModal({ show: true, account });
    }, []);

    const handleCloseDeleteModal = useCallback(() => {
        if (!isDeleting) {
            setDeleteModal({ show: false });
        }
    }, [isDeleting]);

    const handleConfirmDelete = useCallback((account: OwnerBankAccount) => {
        setIsDeleting(true);

        router.delete(route("bank-accounts.destroy", account.id), {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteModal({ show: false });
            },
            onError: (errors) => {
                console.error("Delete bank account error:", errors);
            },
            onFinish: () => {
                setIsDeleting(false);
            },
        });
    }, []);

    const handleSetDefault = useCallback((account: OwnerBankAccount) => {
        router.post(route("bank-accounts.set-default", account.id), {}, {
            preserveScroll: true,
        });
    }, []);

    const columns = useMemo(
        () =>
            createBankAccountColumns(
                handleEdit,
                handleDelete,
                handleSetDefault,
            ),
        [handleEdit, handleDelete, handleSetDefault],
    );

    const filters = useMemo(() => createBankAccountFilters(), []);

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
            <Head title="Daftar Rekening Bank" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="p-6"
            >
                <div className=" mx-auto space-y-6">
                    <PageHeader
                        title="Rekening Bank Saya"
                        subtitle={`Kelola rekening bank tujuan penarikan saldo pendapatan (${accounts.meta.total} rekening)`}
                        icon={CreditCard}
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

                    <DataView<OwnerBankAccount>
                        route={route("bank-accounts.index")}
                        actionButton={{
                            label: "Tambah Rekening",
                            href: route("bank-accounts.create"),
                            icon: <Plus className="w-4 h-4" />,
                            variant: "primary",
                        }}
                        data={accounts.data}
                        meta={accounts.meta}
                        columns={columns}
                        filters={filters}
                        initialFilters={processedInitialFilters}
                        enableSorting={true}
                        enablePagination={true}
                        enableFilters={true}
                        showFilterContainer={true}
                        useFilterBar={true}
                        pageSize={
                            serverFilters?.perPage ||
                            accounts.meta.perPage ||
                            15
                        }
                        emptyTitle="Belum ada rekening"
                        emptyMessage="Daftarkan rekening bank Anda untuk mulai menarik saldo pendapatan"
                        searchPlaceholder="Cari bank, nomor rekening, atau nama pemilik..."
                    />
                </div>
            </motion.div>

            <DeleteBankAccountModal
                isOpen={deleteModal.show}
                account={deleteModal.account}
                onClose={handleCloseDeleteModal}
                onConfirm={handleConfirmDelete}
                isLoading={isDeleting}
            />
        </>
    );
}

BankAccountsIndex.layout = withAuthenticatedLayout({
    title: "Daftar Rekening Bank",
    searchable: true,
    breadcrumbs: [
        { label: "Rekening Bank", href: route("bank-accounts.index") },
    ],
});

export default BankAccountsIndex;
