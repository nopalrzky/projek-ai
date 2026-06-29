import { useCallback, useMemo } from "react";
import { Head, router } from "@inertiajs/react";
import { motion } from "framer-motion";
import { Wallet } from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { DataView } from "@/Components/DataView";
import { Alert } from "@/Components/Alert";
import PageHeader from "@/Components/Page/PageHeader";
import { WalletWithdrawal } from "@/types";
import { AdminWalletWithdrawalIndexProps } from "./types";
import { createAdminWalletWithdrawalColumns } from "./columns";
import { createAdminWalletWithdrawalFilters } from "./filters";

function AdminWalletWithdrawalsIndex({ withdrawals, filters: serverFilters, flash }: AdminWalletWithdrawalIndexProps) {
    const handleView = useCallback((wdr: WalletWithdrawal) => {
        router.visit(route("admin.wallet-withdrawals.show", wdr.id));
    }, []);

    const columns = useMemo(() => createAdminWalletWithdrawalColumns(handleView), [handleView]);
    const filterConfigs = useMemo(() => createAdminWalletWithdrawalFilters(), []);

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
            <Head title="Kelola Penarikan Dana Owner" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="p-6"
            >
                <div className="mx-auto space-y-6">
                    <PageHeader
                        title="Kelola Penarikan Dana"
                        subtitle="Proses pengajuan dan verifikasi bukti transfer penarikan dana pendapatan dari para owner."
                        icon={Wallet}
                        animate={true}
                    />

                    {flash?.success && (
                        <Alert variant="success" title="Berhasil" description={flash.success} />
                    )}
                    {flash?.error && (
                        <Alert variant="error" title="Error" description={flash.error} />
                    )}

                    <DataView<WalletWithdrawal>
                        route={route("admin.wallet-withdrawals.index")}
                        data={withdrawals.data}
                        meta={withdrawals.meta}
                        columns={columns}
                        filters={filterConfigs}
                        initialFilters={processedInitialFilters}
                        enableSorting={true}
                        enablePagination={true}
                        enableFilters={true}
                        pageSize={processedInitialFilters.perPage}
                        emptyTitle="Tidak ada pengajuan"
                        emptyMessage="Belum ada data pengajuan penarikan dana owner"
                        searchPlaceholder="Cari kode penarikan atau nama owner..."
                    />
                </div>
            </motion.div>
        </>
    );
}

AdminWalletWithdrawalsIndex.layout = withAuthenticatedLayout({
    title: "Kelola Penarikan Dana",
    breadcrumbs: [{ label: "Penarikan Dana Owner", href: route("admin.wallet-withdrawals.index") }],
});

export default AdminWalletWithdrawalsIndex;
