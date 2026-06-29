import { useCallback, useMemo } from "react";
import { Head } from "@inertiajs/react";
import { motion } from "framer-motion";
import { Wallet, Plus } from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { DataView } from "@/Components/DataView";
import { Alert } from "@/Components/Alert";
import PageHeader from "@/Components/Page/PageHeader";
import { WalletWithdrawal } from "@/types";
import { WalletWithdrawalIndexProps } from "./types";
import { createWalletWithdrawalColumns } from "./columns";
import { createWalletWithdrawalFilters } from "./filters";
import { walletWithdrawalService } from "@/Services/wallet_withdrawal.service";

function WalletWithdrawalsIndex({
    withdrawals,
    filters: serverFilters,
    flash,
}: WalletWithdrawalIndexProps) {
    const handleView = useCallback((wdr: WalletWithdrawal) => {
        walletWithdrawalService.goToView(wdr.id);
    }, []);

    const columns = useMemo(
        () => createWalletWithdrawalColumns(handleView),
        [handleView],
    );

    const filterConfigs = useMemo(() => createWalletWithdrawalFilters(), []);

    const processedInitialFilters = {
        search: serverFilters?.search || "",
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
            <Head title="Riwayat Penarikan Saldo" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="p-6"
            >
                <div className=" mx-auto space-y-6">
                    <PageHeader
                        title="Riwayat Penarikan Saldo"
                        subtitle={`Pantau semua status pengajuan penarikan dana pendapatan (${withdrawals.meta.total} penarikan)`}
                        icon={Wallet}
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

                    <DataView<WalletWithdrawal>
                        route={route("wallet-withdrawals.index")}
                        actionButton={{
                            label: "Tarik Saldo",
                            href: route("wallet-withdrawals.create"),
                            icon: <Plus className="w-4 h-4" />,
                            variant: "primary",
                        }}
                        data={withdrawals.data}
                        meta={withdrawals.meta}
                        columns={columns}
                        filters={filterConfigs}
                        initialFilters={processedInitialFilters}
                        enableSorting={true}
                        enablePagination={true}
                        enableFilters={true}
                        showFilterContainer={true}
                        useFilterBar={true}
                        pageSize={
                            serverFilters?.perPage ||
                            withdrawals.meta.perPage ||
                            15
                        }
                        emptyTitle="Belum ada penarikan"
                        emptyMessage="Ajukan penarikan pertama Anda untuk mentransfer saldo ke rekening bank"
                        searchPlaceholder="Cari kode penarikan..."
                    />
                </div>
            </motion.div>
        </>
    );
}

WalletWithdrawalsIndex.layout = withAuthenticatedLayout({
    title: "Riwayat Penarikan Saldo",
    searchable: true,
    breadcrumbs: [
        {
            label: "Riwayat Penarikan",
            href: route("wallet-withdrawals.index"),
        },
    ],
});

export default WalletWithdrawalsIndex;
