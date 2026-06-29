import { useState } from "react";
import { Head, router } from "@inertiajs/react";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Ban, Landmark, FileText, Download } from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import PageHeader from "@/Components/Page/PageHeader";
import { Button } from "@/Components/Button";
import { Card } from "@/Components/Card";
import { Badge } from "@/Components/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { WithdrawalDetailCard } from "./Partials/WithdrawalDetailCard";
import { WithdrawalStatusTimeline } from "../../WalletWithdrawals/Partials/WithdrawalStatusTimeline";
import { ProcessWithdrawalModal } from "./Partials/ProcessWithdrawalModal";
import { MarkPaidModal } from "./Partials/MarkPaidModal";
import { RejectWithdrawalModal } from "./Partials/RejectWithdrawalModal";
import { AdminWalletWithdrawalShowProps } from "./types";
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

function AdminWalletWithdrawalShow({ withdrawal }: AdminWalletWithdrawalShowProps) {
    const [activeModal, setActiveModal] = useState<"process" | "paid" | "reject" | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const handleProcessConfirm = (wdr: WalletWithdrawal) => {
        setSubmitting(true);
        router.post(
            route("admin.wallet-withdrawals.process", wdr.id),
            {},
            {
                onFinish: () => {
                    setSubmitting(false);
                    setActiveModal(null);
                },
            }
        );
    };

    const handlePaidConfirm = (wdr: WalletWithdrawal, data: { proof: File | null; adminNote: string }) => {
        setSubmitting(true);
        router.post(
            route("admin.wallet-withdrawals.mark-paid", wdr.id),
            data,
            {
                onFinish: () => {
                    setSubmitting(false);
                    setActiveModal(null);
                },
            }
        );
    };

    const handleRejectConfirm = (wdr: WalletWithdrawal, data: { reason: string }) => {
        setSubmitting(true);
        router.post(
            route("admin.wallet-withdrawals.reject", wdr.id),
            data,
            {
                onFinish: () => {
                    setSubmitting(false);
                    setActiveModal(null);
                },
            }
        );
    };

    const statusConfig = STATUS_CONFIG[withdrawal.status] || {
        variant: "warning",
        label: withdrawal.statusLabel || withdrawal.status,
    };

    return (
        <>
            <Head title={`Kelola Penarikan - ${withdrawal.code}`} />

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
                        onClick={() => router.visit(route("admin.wallet-withdrawals.index"))}
                    >
                        Kembali ke Antrean
                    </Button>

                    <div className="flex gap-2">
                        {withdrawal.status === "pending" && (
                            <>
                                <Button
                                    variant="danger"
                                    size="sm"
                                    leftIcon={<Ban className="w-4 h-4" />}
                                    onClick={() => setActiveModal("reject")}
                                >
                                    Tolak Pengajuan
                                </Button>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    leftIcon={<Landmark className="w-4 h-4" />}
                                    onClick={() => setActiveModal("process")}
                                >
                                    Proses & Verifikasi
                                </Button>
                            </>
                        )}
                        {withdrawal.status === "processing" && (
                            <>
                                <Button
                                    variant="danger"
                                    size="sm"
                                    leftIcon={<Ban className="w-4 h-4" />}
                                    onClick={() => setActiveModal("reject")}
                                >
                                    Tolak Pengajuan
                                </Button>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    leftIcon={<CheckCircle2 className="w-4 h-4" />}
                                    onClick={() => setActiveModal("paid")}
                                >
                                    Tandai Sudah Ditransfer
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <PageHeader
                        title={`Persetujuan Penarikan ${withdrawal.code}`}
                        subtitle="Tinjau berkas permohonan penarikan dana dari owner dan selesaikan transaksi."
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
                        <WithdrawalDetailCard withdrawal={withdrawal} />

                        {withdrawal.status === "paid" && withdrawal.proofUrl && (
                            <Card className="p-6 space-y-4">
                                <h3 className="text-base font-bold flex items-center gap-2" style={{ color: "var(--color-text-primary)" }}>
                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                    Bukti Transfer Terlampir
                                </h3>
                                <div className="p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderColor: "var(--color-border)" }}>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-green-50 border border-green-200">
                                            <FileText className="w-6 h-6 text-green-600" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>Berkas Bukti Transfer</p>
                                            <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>Diunggah pada {formatDate(withdrawal.paidAt || "")}</p>
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
                                        Buka Bukti Transfer
                                    </a>
                                </div>
                                {withdrawal.adminNote && (
                                    <div className="p-4 rounded-xl text-xs bg-gray-50 border" style={{ borderColor: "var(--color-border)" }}>
                                        <p className="font-semibold mb-1" style={{ color: "var(--color-text-primary)" }}>Catatan Penarikan:</p>
                                        <p style={{ color: "var(--color-text-secondary)" }}>{withdrawal.adminNote}</p>
                                    </div>
                                )}
                            </Card>
                        )}

                        {withdrawal.status === "rejected" && withdrawal.adminNote && (
                            <Card className="p-6 space-y-3 border-red-200" style={{ borderColor: "rgba(239, 68, 68, 0.2)", backgroundColor: "rgba(239, 68, 68, 0.02)" }}>
                                <h3 className="text-base font-bold text-red-600 flex items-center gap-2">
                                    <Ban className="w-5 h-5" />
                                    Alasan Penolakan Pengajuan
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

            <ProcessWithdrawalModal
                isOpen={activeModal === "process"}
                withdrawal={withdrawal}
                onClose={() => setActiveModal(null)}
                onConfirm={handleProcessConfirm}
                isLoading={submitting}
            />

            <MarkPaidModal
                isOpen={activeModal === "paid"}
                withdrawal={withdrawal}
                onClose={() => setActiveModal(null)}
                onConfirm={handlePaidConfirm}
                isLoading={submitting}
            />

            <RejectWithdrawalModal
                isOpen={activeModal === "reject"}
                withdrawal={withdrawal}
                onClose={() => setActiveModal(null)}
                onConfirm={handleRejectConfirm}
                isLoading={submitting}
            />
        </>
    );
}

AdminWalletWithdrawalShow.layout = withAuthenticatedLayout({
    title: "Detail Verifikasi Penarikan",
    breadcrumbs: [
        { label: "Antrean Penarikan", href: route("admin.wallet-withdrawals.index") },
        { label: "Verifikasi Penarikan", href: "#" },
    ],
});

export default AdminWalletWithdrawalShow;
