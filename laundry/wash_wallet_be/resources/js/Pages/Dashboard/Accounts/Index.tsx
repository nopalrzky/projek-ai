import { useState, useCallback, useMemo } from "react";
import { Head, router } from "@inertiajs/react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import AccountTreeTable from "./Partials/AccountTreeTable";
import CreateAccountModal from "./Partials/CreateAccountModal";
import EditAccountModal from "./Partials/EditAccountModal";
import DeleteAccountModal from "./Partials/DeleteAccountModal";
import { Button } from "@/Components/Button";
import { Plus, Wallet } from "lucide-react";
import { Account } from "@/types";
import { AccountIndexProps } from "./types";
import PageHeader from "@/Components/Page/PageHeader";

function AccountsIndex({
    accounts,
    filters: initialFilters,
    accountTypes,
}: AccountIndexProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [createModal, setCreateModal] = useState<{
        show: boolean;
        parentId?: number;
        parentName?: string;
        parentCode?: string;
        parentType?: string;
    }>({
        show: false,
    });

    const [editModal, setEditModal] = useState<{
        show: boolean;
        account?: Account;
    }>({
        show: false,
    });

    const [deleteModal, setDeleteModal] = useState<{
        show: boolean;
        account?: Account;
    }>({
        show: false,
    });

    const totalAccounts = useMemo(() => {
        const countAccounts = (accs: Account[]): number => {
            return accs.reduce((total, account) => {
                return (
                    total +
                    1 +
                    (account.children ? countAccounts(account.children) : 0)
                );
            }, 0);
        };
        return countAccounts(accounts);
    }, [accounts]);

    const handleCreate = useCallback(
        (
            parentId?: number,
            parentName?: string,
            parentCode?: string,
            parentType?: string,
        ) => {
            setCreateModal({
                show: true,
                parentId,
                parentName,
                parentCode,
                parentType,
            });
        },
        [],
    );

    const handleEdit = useCallback((account: Account) => {
        setEditModal({ show: true, account });
    }, []);

    const handleDelete = useCallback(async (account: Account) => {
        try {
            setIsDeleting(true);

            router.delete(route("accounts.destroy", account.id), {
                preserveScroll: true,
                onSuccess: () => {
                    setDeleteModal({ show: false });
                    setIsDeleting(false);
                },
                onError: (errors) => {
                    console.error("Delete account error:", errors);
                    setIsDeleting(false);
                },
                onFinish: () => {
                    setIsDeleting(false);
                },
            });
        } catch (error) {
            console.error("Delete account error:", error);
            setIsDeleting(false);
        }
    }, []);

    return (
        <>
            <Head title="Manajemen Akun (COA)" />

            <div className="p-6">
                <div className=" mx-auto space-y-6">
                    <PageHeader
                        title="Manajemen Akun (COA)"
                        subtitle={`Kelola daftar akun untuk pencatatan transaksi. Total akun: ${totalAccounts}`}
                        icon={Wallet}
                        actions={
                            <Button
                                variant="primary"
                                onClick={() => handleCreate()}
                                leftIcon={<Plus />}
                            >
                                Tambah Akun
                            </Button>
                        }
                    />
                    <AccountTreeTable
                        accounts={accounts}
                        isLoading={isLoading}
                        onCreateChild={handleCreate}
                        onEdit={handleEdit}
                        onDelete={(account: Account) =>
                            setDeleteModal({ show: true, account })
                        }
                    />
                </div>
            </div>

            <CreateAccountModal
                isOpen={createModal.show}
                parentId={createModal.parentId}
                parentName={createModal.parentName}
                parentCode={createModal.parentCode}
                parentType={createModal.parentType}
                accountTypes={accountTypes}
                onClose={() => setCreateModal({ show: false })}
            />

            <EditAccountModal
                isOpen={editModal.show}
                account={editModal.account}
                accountTypes={accountTypes}
                onClose={() => setEditModal({ show: false })}
            />

            <DeleteAccountModal
                isOpen={deleteModal.show}
                account={deleteModal.account}
                onClose={() => setDeleteModal({ show: false })}
                onConfirm={() => {
                    if (deleteModal.account) {
                        handleDelete(deleteModal.account);
                    }
                }}
                isLoading={isDeleting}
            />
        </>
    );
}

AccountsIndex.layout = withAuthenticatedLayout({
    title: "Akun",
    searchable: true,
    breadcrumbs: [{ label: "Akun", href: route("accounts.index") }],
});

export default AccountsIndex;
