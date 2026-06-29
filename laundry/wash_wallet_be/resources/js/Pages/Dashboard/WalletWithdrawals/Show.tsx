import { useState } from "react";
import { Head, router } from "@inertiajs/react";
import { motion } from "framer-motion";
import { ArrowLeft, Building2, Calendar, FileText, Ban, Download, CheckCircle2 } from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import PageHeader from "@/Components/Page/PageHeader";
import { Button } from "@/Components/Button";
import { Card } from "@/Components/Card";
import { Badge } from "@/Components/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { WithdrawalStatusTimeline } from "./Partials/WithdrawalStatusTimeline";
import { CancelWithdrawalModal } from "./Partials/CancelWithdrawalModal";
import { WalletWithdrawalShowProps } from "./types";
import { WalletWithdrawal } from "@/types";

const STATUS_CONFIG: Record<
    string,
    { variant: "warning" | "info" | "success" | "error" | "secondary"; label: string }
> = {
    pending: { variant: "warning", label: "Menunggu" },
    processing: { variant: "info", label: "Diproses" },
    paid: { variant: "success", label: "Dibayar" },
    rejected: { variant: "error", label: "Ditolak" },
    cancelled: { variant: "secondary", label: "Dibatalkan" },
};

function WalletWithdrawalShow({ withdrawal }: WalletWithdrawalShowProps) {
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);

    const handleCancelConfirm = (wdr: WalletWithdrawal) => {
        setIsCancelling(true);
        router.post(
            route("wallet-withdrawals.cancel", wdr.id),
            {},
            {
                onFinish: () => {
                    setIsCancelling(false);
                    setIsCancelModalOpen(false);
                },
            }
        );
    };

    const statusConfig = STATUS_CONFIG[withdrawal.status] || {
        variant: "warning",
        label: withdrawal.statusLabel || withdrawal.status,
    };

    const showCancelButton = withdrawal.status === "pending";

    return (
        <>
            <Head title={`Detail Penarikan - ${withdrawal.code}`} />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="p-6 space-y-6"
            >
                <div className="flex items-center justify-between">
                    <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={<ArrowLeft className="w-4 h-4" />}
                        onClick={() => router.visit(route("wallet-withdrawals.index"))}
                    >
                        Kembali ke Daftar
                    </Button>

                    {showCancelButton && (
                        <Button
                            variant="danger"
                            size="sm"
                            leftIcon={<Ban className="w-4 h-4" />}
                            onClick={() => setIsCancelModalOpen(true)}
                        >
                            Batalkan Penarikan
                        </Button>
                    )}
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <PageHeader
                        title={`Penarikan ${withdrawal.code}`}
                        subtitle={`Rincian pengajuan penarikan dana pendapatan Anda.`}
                        icon={FileText}
                        animate={false}
                    />
                    <div>
                        <Badge variant={statusConfig.variant} size="lg">
                            {statusConfig.label}
                        </Badge>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="p-6 space-y-6">
                            <h3 className="text-base font-bold" style={{ color: "var(--color-text-primary)" }}>
                                Rekening Bank Tujuan
                            </h3>
                            <div className="flex items-start gap-3 p-4 rounded-xl border" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)" }}>
                                <Building2 className="w-5 h-5 mt-0.5 text-primary-500" style={{ color: "var(--color-primary-500)" }} />
                                <div className="space-y-1.5 flex-1 min-w-0">
                                    <h4 className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>
                                        {withdrawal.bankName}
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs" style={{ color: "var(--color-text-secondary)" }}>
                                        <div>
                                            <p className="font-semibold text-[10px] uppercase tracking-wider text-tertiary">Nomor Rekening</p>
                                            <p className="mt-0.5 font-mono text-sm" style={{ color: "var(--color-text-primary)" }}>{withdrawal.accountNumber}</p>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-[10px] uppercase tracking-wider text-tertiary">Nama Pemilik</p>
                                            <p className="mt-0.5 text-sm" style={{ color: "var(--color-text-primary)" }}>{withdrawal.accountHolderName}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <h3 className="text-base font-bold" style={{ color: "var(--color-text-primary)" }}>
                                Rincian Dana
                            </h3>
                            <div className="border rounded-xl divide-y text-sm" style={{ borderColor: "var(--color-border)" }}>
                                <div className="flex justify-between p-4">
                                    <span style={{ color: "var(--color-text-secondary)" }}>Nominal Penarikan (Gross)</span>
                                    <span className="font-semibold" style={{ color: "var(--color-text-primary)" }}>{formatCurrency(withdrawal.requestedAmount)}</span>
                                </div>
                                <div className="flex justify-between p-4">
                                    <span style={{ color: "var(--color-text-secondary)" }}>Biaya Admin Bank</span>
                                    <span className="text-red-500 font-semibold">-{formatCurrency(withdrawal.adminFee)}</span>
                                </div>
                                <div className="flex justify-between p-4 bg-gray-50/50" style={{ backgroundColor: "rgba(var(--color-primary-50-rgb), 0.1)" }}>
                                    <span className="font-bold" style={{ color: "var(--color-text-primary)" }}>Jumlah Bersih Diterima (Net)</span>
                                    <span className="text-base font-bold text-green-600" style={{ color: "var(--color-primary-600)" }}>{formatCurrency(withdrawal.netAmount)}</span>
                                </div>
                            </div>
                        </Card>

                        {withdrawal.status === "paid" && withdrawal.proofUrl && (
                            <Card className="p-6 space-y-4">
                                <h3 className="text-base font-bold flex items-center gap-2" style={{ color: "var(--color-text-primary)" }}>
                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                    Bukti Transfer
                                </h3>
                                <div className="p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderColor: "var(--color-border)" }}>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-green-50 border border-green-200">
                                            <FileText className="w-6 h-6 text-green-600" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>Bukti Pembayaran Tersedia</p>
                                            <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>Ditransfer pada {formatDate(withdrawal.paidAt || "")}</p>
                                        </div>
                                    </div>
                                    <a
                                        href={withdrawal.proofUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-lg border hover:bg-gray-50 transition-colors gap-2"
                                        style={{ borderColor: "var(--color-border)", color: "var(--color-text-primary)" }}
                                    >
                                        <Download className="w-4 h-4" />
                                        Unduh / Lihat Bukti
                                    </a>
                                </div>
                                {withdrawal.adminNote && (
                                    <div className="p-4 rounded-xl text-xs bg-gray-50 border" style={{ borderColor: "var(--color-border)" }}>
                                        <p className="font-semibold mb-1" style={{ color: "var(--color-text-primary)" }}>Catatan Admin:</p>
                                        <p style={{ color: "var(--color-text-secondary)" }}>{withdrawal.adminNote}</p>
                                    </div>
                                )}
                            </Card>
                        )}

                        {withdrawal.status === "rejected" && withdrawal.adminNote && (
                            <Card className="p-6 space-y-3 border-red-200" style={{ borderColor: "rgba(239, 68, 68, 0.2)", backgroundColor: "rgba(239, 68, 68, 0.02)" }}>
                                <h3 className="text-base font-bold text-red-600 flex items-center gap-2">
                                    <Ban className="w-5 h-5" />
                                    Alasan Penolakan
                                </h3>
                                <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                                    {withdrawal.adminNote}
                                </p>
                            </Card>
                        )}
                    </div>

                    <div className="space-y-6">
                        <Card className="p-6">
                            <WithdrawalStatusTimeline withdrawal={withdrawal} />
                        </Card>
                    </div>
                </div>
            </motion.div>

            <CancelWithdrawalModal
                isOpen={isCancelModalOpen}
                withdrawal={withdrawal}
                onClose={() => setIsCancelModalOpen(false)}
                onConfirm={handleCancelConfirm}
                isLoading={isCancelling}
            />
        </>
    );
}

WalletWithdrawalShow.layout = withAuthenticatedLayout({
    title: "Detail Penarikan",
    breadcrumbs: [
        { label: "Wallet", href: route("wallet.index") },
        { label: "Withdrawals", href: route("wallet-withdrawals.index") },
        { label: "Detail Penarikan", href: "#" },
    ],
});

export default WalletWithdrawalShow;
