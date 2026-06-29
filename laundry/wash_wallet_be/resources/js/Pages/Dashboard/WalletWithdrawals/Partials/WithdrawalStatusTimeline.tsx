import React from "react";
import { WalletWithdrawal } from "@/types";
import { formatDate } from "@/lib/utils";
import { Check, Clock, AlertTriangle, XCircle, ArrowRight } from "lucide-react";

interface TimelineStep {
    title: string;
    description?: string | null;
    timestamp?: string | null;
    isActive: boolean;
    isCompleted: boolean;
    icon: React.ReactNode;
    color: string;
}

export const WithdrawalStatusTimeline: React.FC<{ withdrawal: WalletWithdrawal }> = ({
    withdrawal,
}) => {
    const isPending = withdrawal.status === "pending";
    const isProcessing = withdrawal.status === "processing";
    const isPaid = withdrawal.status === "paid";
    const isRejected = withdrawal.status === "rejected";
    const isCancelled = withdrawal.status === "cancelled";

    const steps: TimelineStep[] = [
        {
            title: "Permintaan Diajukan",
            description: `Menunggu verifikasi admin untuk memproses penarikan sebesar Rp ${Number(
                withdrawal.requestedAmount
            ).toLocaleString("id-ID")}`,
            timestamp: withdrawal.createdAt,
            isActive: true,
            isCompleted: !isPending,
            icon: <Clock className="w-4 h-4" />,
            color: "var(--color-primary-600)",
        },
        {
            title: "Sedang Diproses",
            description:
                isProcessing || isPaid
                    ? `Admin sedang melakukan transfer dana ke rekening ${withdrawal.bankName}`
                    : isPending
                    ? "Menunggu peninjauan oleh super admin"
                    : "Langkah dilewati karena pembatalan/penolakan",
            timestamp: withdrawal.processedAt,
            isActive: isProcessing || isPaid,
            isCompleted: isPaid,
            icon: <ArrowRight className="w-4 h-4" />,
            color: "var(--color-info-600, #06b6d4)",
        },
    ];

    if (isRejected) {
        steps.push({
            title: "Penarikan Ditolak",
            description: withdrawal.adminNote || "Pengajuan penarikan dana ditolak oleh admin.",
            timestamp: withdrawal.rejectedAt,
            isActive: true,
            isCompleted: true,
            icon: <XCircle className="w-4 h-4" />,
            color: "var(--color-error, #ef4444)",
        });
    } else if (isCancelled) {
        steps.push({
            title: "Penarikan Dibatalkan",
            description: "Pengajuan penarikan dana dibatalkan oleh pemilik toko.",
            timestamp: withdrawal.cancelledAt,
            isActive: true,
            isCompleted: true,
            icon: <AlertTriangle className="w-4 h-4" />,
            color: "var(--color-text-secondary)",
        });
    } else {
        steps.push({
            title: "Dana Ditransfer",
            description: isPaid
                ? "Dana telah berhasil ditransfer ke rekening Anda. Silakan periksa mutasi rekening."
                : "Menunggu penyelesaian transfer dana",
            timestamp: withdrawal.paidAt,
            isActive: isPaid,
            isCompleted: isPaid,
            icon: <Check className="w-4 h-4" />,
            color: "var(--color-success, #22c55e)",
        });
    }

    return (
        <div className="space-y-6">
            <h4 className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>
                Status Pelacakan
            </h4>
            <div className="relative pl-6 space-y-6">
                <div
                    className="absolute left-[11px] top-2 bottom-2 w-0.5"
                    style={{ backgroundColor: "var(--color-border)" }}
                />

                {steps.map((step, idx) => {
                    const iconBg = step.isCompleted
                        ? step.color
                        : step.isActive
                        ? "var(--color-surface)"
                        : "var(--color-background)";
                    const iconColor = step.isCompleted
                        ? "#ffffff"
                        : step.isActive
                        ? step.color
                        : "var(--color-text-tertiary)";
                    const borderColor = step.isCompleted || step.isActive ? step.color : "var(--color-border)";

                    return (
                        <div key={idx} className="relative flex gap-4">
                            <div
                                className="absolute left-[-21px] top-1.5 w-6.5 h-6.5 rounded-full flex items-center justify-center border-2 text-xs font-semibold z-10"
                                style={{
                                    backgroundColor: iconBg,
                                    borderColor: borderColor,
                                    color: iconColor,
                                }}
                            >
                                {step.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                    <h5
                                        className="text-sm font-bold"
                                        style={{
                                            color: step.isActive
                                                ? "var(--color-text-primary)"
                                                : "var(--color-text-secondary)",
                                        }}
                                    >
                                        {step.title}
                                    </h5>
                                    {step.timestamp && (
                                        <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                                            {formatDate(step.timestamp)}
                                        </span>
                                    )}
                                </div>
                                {step.description && (
                                    <p
                                        className="text-xs mt-1 leading-relaxed"
                                        style={{ color: "var(--color-text-secondary)" }}
                                    >
                                        {step.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
