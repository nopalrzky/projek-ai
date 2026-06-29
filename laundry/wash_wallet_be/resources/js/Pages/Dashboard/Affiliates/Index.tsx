import { useCallback, useMemo, useState } from "react";
import { Head } from "@inertiajs/react";
import { motion } from "framer-motion";
import { Share2, Copy, Check, Gift } from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { DataView } from "@/Components/DataView";
import { Alert } from "@/Components/Alert";
import PageHeader from "@/Components/Page/PageHeader";
import PageStats from "@/Components/Page/PageStats";
import { AffiliateIndexProps } from "./types";
import { createAffiliateColumns } from "./columns";
import { createAffiliateFilters } from "./filters";
import { Card, CardContent } from "@/Components/Card";
import { Button } from "@/Components/Button";

function AffiliatesIndex({
    user,
    referrals,
    summary,
    filters: serverFilters,
    flash,
}: AffiliateIndexProps) {
    const [copiedReferral, setCopiedReferral] = useState(false);
    const columns = useMemo(() => createAffiliateColumns(), []);
    const filters = useMemo(() => createAffiliateFilters(), []);

    const handleCopyReferralCode = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(user.referralCode || "");
            setCopiedReferral(true);
            setTimeout(() => setCopiedReferral(false), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    }, [user.referralCode]);

    const stats = useMemo(
        () => [
            {
                label: "Total Referral",
                value: summary.totalReferrals.toLocaleString("id-ID"),
                subValue:
                    summary.totalReferrals > 0
                        ? `${summary.totalReferrals} orang telah bergabung`
                        : "Belum ada referral",
                icon: "Users",
                variant: "primary" as const,
            },
            {
                label: "Total Komisi Diterima",
                value: summary.totalCommission.toLocaleString("id-ID"),
                unit: "Coin",
                subValue:
                    summary.totalCommission > 0
                        ? `≈ Rp ${(summary.totalCommission * 1000).toLocaleString("id-ID")}`
                        : "Belum ada komisi",
                icon: "Coins",
                variant: "warning" as const,
            },
        ],
        [summary.totalReferrals, summary.totalCommission],
    );

    return (
        <>
            <Head title="Program Afiliasi" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="p-6"
            >
                <div className=" mx-auto space-y-6">
                    <PageHeader
                        title="Program Afiliasi"
                        subtitle={`Kelola referral dan dapatkan komisi dari setiap topup (${summary.totalReferrals} referral)`}
                        icon={Share2}
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

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                    >
                        <Card className="border-2">
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div
                                            className="p-3 rounded-xl flex-shrink-0"
                                            style={{
                                                backgroundColor:
                                                    "var(--color-primary-500)",
                                            }}
                                        >
                                            <Gift className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <h3
                                                className="text-lg font-semibold mb-1"
                                                style={{
                                                    color: "var(--color-primary-900)",
                                                }}
                                            >
                                                Kode Referral Anda
                                            </h3>
                                            <p
                                                className="text-sm mb-3"
                                                style={{
                                                    color: "var(--color-primary-700)",
                                                }}
                                            >
                                                Bagikan kode ini untuk
                                                mendapatkan komisi
                                            </p>
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <div
                                                    className="px-4 py-3 rounded-lg border-2 border-dashed"
                                                    style={{
                                                        borderColor:
                                                            "var(--color-primary-300)",
                                                        backgroundColor:
                                                            "var(--color-surface)",
                                                    }}
                                                >
                                                    <span
                                                        className="text-2xl font-bold font-mono tracking-wider"
                                                        style={{
                                                            color: "var(--color-primary-700)",
                                                        }}
                                                    >
                                                        {user.referralCode ||
                                                            "-"}
                                                    </span>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="primary"
                                                    size="md"
                                                    onClick={
                                                        handleCopyReferralCode
                                                    }
                                                    disabled={
                                                        !user.referralCode
                                                    }
                                                    leftIcon={
                                                        copiedReferral ? (
                                                            <Check className="w-4 h-4" />
                                                        ) : (
                                                            <Copy className="w-4 h-4" />
                                                        )
                                                    }
                                                >
                                                    {copiedReferral
                                                        ? "Tersalin!"
                                                        : "Salin"}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <PageStats stats={stats} columns={2} animate={true} />

                    {/* Referrals List */}
                    <div>
                        <h2
                            className="text-xl font-bold mb-4"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            Daftar Referral Anda
                        </h2>
                        <DataView
                            route={route("affiliates.index")}
                            data={referrals.data}
                            meta={referrals.meta}
                            columns={columns}
                            filters={filters}
                            initialFilters={{
                                search: serverFilters?.search || "",
                                status: serverFilters?.status,
                                sortBy: serverFilters?.sortBy || "created_at",
                                sortDirection:
                                    serverFilters?.sortDirection || "desc",
                                page: serverFilters?.page || 1,
                                perPage: serverFilters?.perPage || 15,
                            }}
                            enableSorting={true}
                            enableFilters={true}
                            showFilterContainer={true}
                            useFilterBar={true}
                            pageSize={serverFilters?.perPage || 15}
                            emptyTitle="Belum ada referral"
                            emptyMessage="Bagikan kode referral Anda untuk mendapatkan komisi dari setiap topup yang dilakukan oleh referral Anda."
                            searchPlaceholder="Cari nama, email, atau nomor HP..."
                        />
                    </div>
                </div>
            </motion.div>
        </>
    );
}

AffiliatesIndex.layout = withAuthenticatedLayout({
    title: "Program Afiliasi",
    searchable: true,
    breadcrumbs: [
        { label: "Program Afiliasi", href: route("affiliates.index") },
    ],
});

export default AffiliatesIndex;
