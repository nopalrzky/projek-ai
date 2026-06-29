import { useCallback, useMemo } from "react";
import { Head } from "@inertiajs/react";
import { motion } from "framer-motion";
import { Coins } from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { DataView } from "@/Components/DataView";
import { Alert } from "@/Components/Alert";
import { CoinTransaction } from "@/types";
import { CoinTransactionIndexProps } from "./types";
import { createCoinTransactionColumns } from "./columns";
import { createCoinTransactionFilters } from "./filters";
import { coinTransactionService } from "@/Services/coin_transaction.service";
import PageHeader from "@/Components/Page/PageHeader";
import PageStats from "@/Components/Page/PageStats";

function CoinTransactionsIndex({
    transactions,
    stats,
    filterOptions,
    filters: serverFilters,
    flash,
}: CoinTransactionIndexProps) {
    const handleView = useCallback((transaction: CoinTransaction) => {
        coinTransactionService.goToView(transaction.id);
    }, []);

    const columns = useMemo(
        () => createCoinTransactionColumns(handleView),
        [handleView],
    );

    const filters = useMemo(
        () =>
            createCoinTransactionFilters(
                filterOptions.typeOptions,
                filterOptions.statusOptions,
            ),
        [filterOptions.typeOptions, filterOptions.statusOptions],
    );

    const processedInitialFilters = {
        search: serverFilters?.search || "",
        type: serverFilters?.type || "",
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
            <Head title="Transaksi Coin" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="p-6"
            >
                <div className=" mx-auto space-y-6">
                    <PageHeader
                        title="Transaksi Coin"
                        subtitle={`Riwayat dan detail seluruh transaksi coin Anda (${transactions.meta.total} transaksi)`}
                        icon={Coins}
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

                    <PageStats stats={stats} columns={4} animate={true} />

                    <DataView<CoinTransaction>
                        route={route("coin-transactions.index")}
                        data={transactions.data}
                        meta={transactions.meta}
                        columns={columns}
                        filters={filters}
                        initialFilters={processedInitialFilters}
                        enableSorting={true}
                        enablePagination={true}
                        enableFilters={true}
                        showFilterContainer={true}
                        useFilterBar={true}
                        pageSize={serverFilters?.perPage || 15}
                        emptyTitle="Belum ada transaksi coin"
                        emptyMessage="Transaksi coin akan muncul di sini setelah topup atau aktivitas lainnya"
                        searchPlaceholder="Cari nomor transaksi atau deskripsi..."
                    />
                </div>
            </motion.div>
        </>
    );
}

CoinTransactionsIndex.layout = withAuthenticatedLayout({
    title: "Transaksi Coin",
    searchable: true,
    breadcrumbs: [
        { label: "Transaksi Coin", href: route("coin-transactions.index") },
    ],
});

export default CoinTransactionsIndex;
