import { Head, router } from "@inertiajs/react";
import { motion } from "framer-motion";
import {
    Archive,
    Calendar,
    Building2,
    FileText,
    Paperclip,
    TrendingUp,
    TrendingDown,
    ArrowRight,
    BookOpen,
    CheckCircle2,
    XCircle,
    Clock,
    User,
} from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { Alert } from "@/Components/Alert";
import { Badge } from "@/Components/Badge";
import { Card } from "@/Components/Card";
import { Button } from "@/Components/Button";
import { DepositShowProps } from "./types";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { useState, useCallback } from "react";
import ApproveDepositModal from "./Partials/ApproveDepositModal";
import RejectDepositModal from "./Partials/RejectDepositModal";

function DepositShow({ deposit, flash }: DepositShowProps) {
    const [approveModal, setApproveModal] = useState(false);
    const [rejectModal, setRejectModal] = useState(false);
    const [isApproving, setIsApproving] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);

    const handleConfirmApprove = useCallback(async () => {
        setIsApproving(true);
        router.post(
            route("deposits.approve", deposit.id),
            {},
            {
                preserveScroll: true,
                onSuccess: () => setApproveModal(false),
                onFinish: () => setIsApproving(false),
            },
        );
    }, [deposit.id]);

    const handleConfirmReject = useCallback(
        async (dep: any, reason: string) => {
            setIsRejecting(true);
            router.post(
                route("deposits.reject", deposit.id),
                { reason },
                {
                    preserveScroll: true,
                    onSuccess: () => setRejectModal(false),
                    onFinish: () => setIsRejecting(false),
                },
            );
        },
        [deposit.id],
    );

    const getStatusInfo = (status: string) => {
        switch (status) {
            case "approved":
                return {
                    label: "Disetujui",
                    variant: "success" as const,
                    icon: CheckCircle2,
                    color: "var(--color-success-600)",
                    bgColor: "var(--color-success-50)",
                    borderColor: "var(--color-success-200)",
                };
            case "rejected":
                return {
                    label: "Ditolak",
                    variant: "error" as const,
                    icon: XCircle,
                    color: "var(--color-error-600)",
                    bgColor: "var(--color-error-50)",
                    borderColor: "var(--color-error-200)",
                };
            default:
                return {
                    label: "Menunggu",
                    variant: "warning" as const,
                    icon: Clock,
                    color: "var(--color-warning-600)",
                    bgColor: "var(--color-warning-50)",
                    borderColor: "var(--color-warning-200)",
                };
        }
    };

    const statusInfo = getStatusInfo(deposit.status);

    return (
        <>
            <Head title={`Detail Setoran - ${deposit.code}`} />

            <div className="min-h-screen p-6 bg-[var(--color-background)]">
                <div className=" mx-auto space-y-6">
                    {/* Header Section */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-[var(--color-primary-100)]">
                                <Archive className="w-8 h-8 text-[var(--color-primary-600)]" />
                            </div>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
                                        Detail Setoran Kas
                                    </h1>
                                    <Badge
                                        variant={statusInfo.variant}
                                        size="md"
                                    >
                                        {statusInfo.label}
                                    </Badge>
                                </div>
                                <p className="text-[var(--color-text-secondary)]">
                                    Kode: {deposit.code} •{" "}
                                    {formatDateTime(deposit.createdAt, "long")}
                                </p>
                            </div>
                        </div>

                        {deposit.status === "pending" && (
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setRejectModal(true)}
                                    leftIcon={<XCircle className="w-4 h-4" />}
                                >
                                    Tolak
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={() => setApproveModal(true)}
                                    leftIcon={
                                        <CheckCircle2 className="w-4 h-4" />
                                    }
                                >
                                    Setujui
                                </Button>
                            </div>
                        )}
                    </motion.div>

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

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column: Info Cards */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Main Info Card */}
                            <Card className="p-6 overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-8 opacity-5">
                                    <Archive className="w-32 h-32" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                                    <div>
                                        <p className="text-sm font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider mb-2">
                                            Total Setoran
                                        </p>
                                        <p className="text-4xl font-bold text-[var(--color-primary-600)]">
                                            {formatCurrency(deposit.amount)}
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <Building2 className="w-5 h-5 mt-0.5 text-[var(--color-text-quaternary)]" />
                                            <div>
                                                <p className="text-sm font-medium text-[var(--color-text-secondary)]">
                                                    Outlet
                                                </p>
                                                <p className="font-semibold text-[var(--color-text-primary)]">
                                                    {deposit.outlet?.name ||
                                                        "-"}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <User className="w-5 h-5 mt-0.5 text-[var(--color-text-quaternary)]" />
                                            <div>
                                                <p className="text-sm font-medium text-[var(--color-text-secondary)]">
                                                    Kasir (Penyetor)
                                                </p>
                                                <p className="font-semibold text-[var(--color-text-primary)]">
                                                    {deposit.cashier?.name ||
                                                        "-"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {deposit.notes && (
                                    <div className="mt-8 pt-6 border-t border-[var(--color-border)]">
                                        <div className="flex items-center gap-2 mb-2 text-[var(--color-text-primary)] font-semibold">
                                            <FileText className="w-4 h-4" />
                                            Catatan
                                        </div>
                                        <p className="text-[var(--color-text-secondary)] italic">
                                            "{deposit.notes}"
                                        </p>
                                    </div>
                                )}
                            </Card>

                            {/* Accounting Flow */}
                            <Card className="p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 rounded-lg bg-[var(--color-primary-100)] text-[var(--color-primary-600)]">
                                        <BookOpen className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-bold text-[var(--color-text-primary)]">
                                        Alur Kas & Akuntansi
                                    </h3>
                                </div>

                                <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-4 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-border)]">
                                    <div className="flex-1 text-center md:text-left">
                                        <Badge variant="error" className="mb-2">
                                            Kredit
                                        </Badge>
                                        <p className="font-bold text-[var(--color-text-primary)]">
                                            {deposit.sourceAccount?.name ||
                                                "Kas Outlet"}
                                        </p>
                                        <p className="text-xs text-[var(--color-text-tertiary)]">
                                            {deposit.sourceAccount?.code || "-"}
                                        </p>
                                    </div>

                                    <div className="flex flex-col items-center">
                                        <ArrowRight className="w-6 h-6 text-[var(--color-text-quaternary)] rotate-90 md:rotate-0" />
                                        <p className="text-[10px] font-bold text-[var(--color-text-quaternary)] uppercase mt-1">
                                            Transfer
                                        </p>
                                    </div>

                                    <div className="flex-1 text-center md:text-right">
                                        <Badge
                                            variant="success"
                                            className="mb-2"
                                        >
                                            Debit
                                        </Badge>
                                        <p className="font-bold text-[var(--color-text-primary)]">
                                            {deposit.destinationAccount?.name ||
                                                "Kas Owner/Bank"}
                                        </p>
                                        <p className="text-xs text-[var(--color-text-tertiary)]">
                                            {deposit.destinationAccount?.code ||
                                                "-"}
                                        </p>
                                    </div>
                                </div>

                                {deposit.journalEntry && (
                                    <div className="mt-4 p-3 rounded-lg bg-[var(--color-info-50)] border border-[var(--color-info-100)] text-[var(--color-info-700)] text-xs flex gap-2 items-start">
                                        <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                                        <span>
                                            Transaksi ini telah dicatat dalam
                                            jurnal akuntansi dengan nomor
                                            referensi{" "}
                                            <strong>
                                                {deposit.journalEntry
                                                    ?.transactionNumber || "-"}
                                            </strong>
                                        </span>
                                    </div>
                                )}
                            </Card>
                        </div>

                        {/* Right Column: Sidebar Info */}
                        <div className="space-y-6">
                            {/* Status Card */}
                            <Card
                                className="p-6 border-l-4"
                                style={{
                                    borderColor: statusInfo.color,
                                    backgroundColor: statusInfo.bgColor,
                                }}
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <statusInfo.icon
                                        className="w-6 h-6"
                                        style={{ color: statusInfo.color }}
                                    />
                                    <h3
                                        className="font-bold"
                                        style={{ color: statusInfo.color }}
                                    >
                                        Status: {statusInfo.label}
                                    </h3>
                                </div>

                                <div className="space-y-3 text-sm">
                                    {deposit.status === "rejected" &&
                                        deposit.rejectionReason && (
                                            <div className="p-3 rounded-lg bg-white/50 border border-red-100">
                                                <p className="font-semibold text-red-600 mb-1">
                                                    Alasan Penolakan:
                                                </p>
                                                <p className="text-red-700">
                                                    {deposit.rejectionReason}
                                                </p>
                                            </div>
                                        )}

                                    {deposit.approvedByUser && (
                                        <div className="flex justify-between items-center text-[var(--color-text-secondary)]">
                                            <span>Diproses Oleh:</span>
                                            <span className="font-semibold text-[var(--color-text-primary)]">
                                                {deposit.approvedByUser.name}
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center text-[var(--color-text-secondary)]">
                                        <span>Dibuat:</span>
                                        <span className="font-semibold text-[var(--color-text-primary)]">
                                            {formatDateTime(
                                                deposit.createdAt,
                                                "short",
                                            )}
                                        </span>
                                    </div>

                                    {(deposit.status === "approved" ||
                                        deposit.status === "rejected") && (
                                        <div className="flex justify-between items-center text-[var(--color-text-secondary)]">
                                            <span>Waktu Proses:</span>
                                            <span className="font-semibold text-[var(--color-text-primary)]">
                                                {formatDateTime(
                                                    deposit.approvedAt,
                                                    "short",
                                                )}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </Card>

                            {/* Attachment Card */}
                            <Card className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <Paperclip className="w-5 h-5 text-[var(--color-text-quaternary)]" />
                                    <h3 className="font-bold text-[var(--color-text-primary)]">
                                        Bukti Setoran
                                    </h3>
                                </div>

                                {deposit.attachmentUrl ? (
                                    <div className="space-y-4">
                                        <div className="aspect-square rounded-xl overflow-hidden bg-[var(--color-surface-hover)] border border-[var(--color-border)]">
                                            <img
                                                src={deposit.attachmentUrl}
                                                alt="Bukti Setoran"
                                                className="w-full h-full object-cover cursor-zoom-in"
                                                onClick={() =>
                                                    deposit.attachmentUrl &&
                                                    window.open(
                                                        deposit.attachmentUrl,
                                                        "_blank",
                                                    )
                                                }
                                            />
                                        </div>
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            size="sm"
                                            onClick={() =>
                                                deposit.attachmentUrl &&
                                                window.open(
                                                    deposit.attachmentUrl,
                                                    "_blank",
                                                )
                                            }
                                            leftIcon={
                                                <Paperclip className="w-4 h-4" />
                                            }
                                        >
                                            Lihat Gambar Penuh
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="p-8 text-center rounded-xl bg-[var(--color-surface-hover)] border border-dashed border-[var(--color-border)]">
                                        <FileText className="w-10 h-10 mx-auto text-[var(--color-text-quaternary)] mb-2" />
                                        <p className="text-xs text-[var(--color-text-tertiary)]">
                                            Tidak ada lampiran foto bukti
                                        </p>
                                    </div>
                                )}
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

            <ApproveDepositModal
                isOpen={approveModal}
                deposit={deposit}
                onClose={() => setApproveModal(false)}
                onConfirm={handleConfirmApprove}
                isLoading={isApproving}
            />

            <RejectDepositModal
                isOpen={rejectModal}
                deposit={deposit}
                onClose={() => setRejectModal(false)}
                onConfirm={handleConfirmReject}
                isLoading={isRejecting}
            />
        </>
    );
}

DepositShow.layout = withAuthenticatedLayout({
    title: "Detail Setoran Kas",
    breadcrumbs: [
        { label: "Setoran Kas", href: route("deposits.index") },
        { label: "Detail", href: "#" },
    ],
});

export default DepositShow;
