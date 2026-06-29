import { useCallback, useMemo } from "react";
import { Head } from "@inertiajs/react";
import { motion } from "framer-motion";
import { Plus, Wallet } from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { DataView } from "@/Components/DataView";
import { Alert } from "@/Components/Alert";
import { Topup } from "@/types/topup";
import { TopupIndexProps } from "./types";
import { createTopupColumns } from "./columns";
import { createTopupFilters } from "./filters";
import { topupService } from "@/Services/topup.service";
import PageHeader from "@/Components/Page/PageHeader";
import PageStats from "@/Components/Page/PageStats";

function TopupsIndex({
    topups,
    stats,
    topupType,
    filterOptions,
    filters: serverFilters,
    flash,
}: TopupIndexProps) {
    const handleView = useCallback((topup: Topup) => {
        topupService.show(topup.id);
    }, []);

    const columns = useMemo(
        () => createTopupColumns(handleView, topupType),
        [handleView, topupType],
    );

    const filters = useMemo(
        () => createTopupFilters(filterOptions),
        [filterOptions],
    );

    const processedInitialFilters = {
        search: serverFilters?.search || "",
        status: serverFilters?.status,
        paymentStatus: serverFilters?.paymentStatus,
        startDate: serverFilters?.startDate,
        endDate: serverFilters?.endDate,
        sortBy: serverFilters?.sortBy || "created_at",
        sortDirection: serverFilters?.sortDirection || "desc",
        page: serverFilters?.page || 1,
        perPage: serverFilters?.perPage || 15,
    };

    return (
        <>
            <Head title="Manajemen Topup" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="p-6"
            >
                <div className=" mx-auto space-y-6">
                    <PageHeader
                        title="Manajemen Topup"
                        subtitle="Kelola dan pantau seluruh transaksi topup saldo Anda"
                        icon={Wallet}
                        animate={true}
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

                    <DataView<Topup>
                        actionButton={{
                            label: "Tambah Topup",
                            href: route("topups.create"),
                            icon: <Plus className="w-4 h-4" />,
                            variant: "primary",
                        }}
                        route={route("topups.index")}
                        data={topups.data}
                        meta={topups.meta}
                        columns={columns}
                        filters={filters}
                        initialFilters={processedInitialFilters}
                        enableSorting={true}
                        enablePagination={true}
                        enableFilters={true}
                        showFilterContainer={true}
                        useFilterBar={true}
                        pageSize={
                            serverFilters?.perPage || topups.meta.perPage || 15
                        }
                        emptyTitle="Belum ada topup"
                        emptyMessage="Topup yang dilakukan akan muncul di sini"
                        searchPlaceholder="Cari referensi pembayaran atau provider..."
                    />
                </div>
            </motion.div>
        </>
    );
}

TopupsIndex.layout = withAuthenticatedLayout({
    title: "Topup",
    searchable: true,
    breadcrumbs: [{ label: "Topup", href: route("topups.index") }],
});

export default TopupsIndex;
