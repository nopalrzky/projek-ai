import { useMemo } from "react";
import { Head } from "@inertiajs/react";
import { motion } from "framer-motion";
import { Wallet } from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { DataView } from "@/Components/DataView";
import { Alert } from "@/Components/Alert";
import PageHeader from "@/Components/Page/PageHeader";
import { WalletTransaction } from "@/types";
import { WalletIndexProps } from "./types";
import { createWalletTransactionColumns } from "./columns";
import { createWalletTransactionFilters } from "./filters";
import { WalletBalanceOverview } from "./Partials/WalletBalanceOverview";

function WalletIndex({
    stats,
    transactions,
    filters: serverFilters,
    flash,
}: WalletIndexProps) {
    const columns = useMemo(() => createWalletTransactionColumns(), []);
    const filterConfig = useMemo(() => createWalletTransactionFilters(), []);

    const processedInitialFilters = {
        search: serverFilters?.search || "",
        type: serverFilters?.type || "",
        startDate: serverFilters?.startDate || "",
        endDate: serverFilters?.endDate || "",
        sortBy: serverFilters?.sortBy || "created_at",
        sortDirection: serverFilters?.sortDirection || "desc",
        page: serverFilters?.page || 1,
        perPage: serverFilters?.perPage || 15,
    };

    return (
        <>
            <Head title="Dompet Pendapatan" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="p-6"
            >
                <div className=" mx-auto space-y-6">
                    <PageHeader
                        title="Dompet Pendapatan"
                        subtitle={`Kelola saldo pendapatan dan riwayat transaksi dompet (${transactions.meta.total} transaksi)`}
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

                    <WalletBalanceOverview
                        walletBalance={stats.walletBalance}
                        availableBalance={stats.availableBalance}
                        pendingWdrTotal={stats.pendingWdrTotal}
                    />

                    <DataView<WalletTransaction>
                        route={route("wallet.index")}
                        data={transactions.data}
                        meta={transactions.meta}
                        columns={columns}
                        filters={filterConfig}
                        initialFilters={processedInitialFilters}
                        enableSorting={true}
                        enablePagination={true}
                        enableFilters={true}
                        showFilterContainer={true}
                        useFilterBar={true}
                        pageSize={
                            serverFilters?.perPage ||
                            transactions.meta.perPage ||
                            15
                        }
                        emptyTitle="Belum ada transaksi"
                        emptyMessage="Riwayat transaksi dompet Anda akan muncul di sini"
                        searchPlaceholder="Cari nomor transaksi atau deskripsi..."
                    />
                </div>
            </motion.div>
        </>
    );
}

WalletIndex.layout = withAuthenticatedLayout({
    title: "Dompet Pendapatan",
    searchable: true,
    breadcrumbs: [{ label: "Dompet Pendapatan", href: route("wallet.index") }],
});

export default WalletIndex;
