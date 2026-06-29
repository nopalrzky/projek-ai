import React from "react";
import { WalletWithdrawal } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Building2, User, Landmark, HelpCircle, FileText } from "lucide-react";
import { Badge } from "@/Components/Badge";

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

export const WithdrawalDetailCard: React.FC<{ withdrawal: WalletWithdrawal }> = ({
    withdrawal,
}) => {
    const statusConfig = STATUS_CONFIG[withdrawal.status] || {
        variant: "warning",
        label: withdrawal.statusLabel || withdrawal.status,
    };

    return (
        <div
            className="p-6 rounded-2xl border space-y-6 shadow-sm"
            style={{
                backgroundColor: "var(--color-surface)",
                borderColor: "var(--color-border)",
            }}
        >
            <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: "var(--color-border)" }}>
                <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                        Kode Penarikan
                    </h3>
                    <p className="text-xl font-bold mt-0.5" style={{ color: "var(--color-text-primary)" }}>
                        {withdrawal.code}
                    </p>
                </div>
                <Badge variant={statusConfig.variant} size="lg">
                    {statusConfig.label}
                </Badge>
            </div>

            <div className="space-y-4">
                <div className="flex items-start gap-3">
                    <User className="w-5 h-5 mt-0.5 text-gray-400" />
                    <div className="space-y-0.5">
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Informasi Owner
                        </h4>
                        <p className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>
                            {withdrawal.user?.name}
                        </p>
                        <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                            {withdrawal.user?.email}
                        </p>
                    </div>
                </div>

                <div className="flex items-start gap-3 pt-2">
                    <Building2 className="w-5 h-5 mt-0.5 text-gray-400" />
                    <div className="space-y-0.5 flex-1 min-w-0">
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Rekening Bank Tujuan
                        </h4>
                        <p className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>
                            {withdrawal.bankName}
                        </p>
                        <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                            Norek: {withdrawal.accountNumber}
                        </p>
                        <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                            a.n. {withdrawal.accountHolderName}
                        </p>
                    </div>
                </div>

                <div className="flex items-start gap-3 pt-2">
                    <Landmark className="w-5 h-5 mt-0.5 text-gray-400" />
                    <div className="space-y-0.5 flex-1">
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Rincian Keuangan
                        </h4>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs pt-1.5">
                            <span style={{ color: "var(--color-text-secondary)" }}>Nominal Penarikan:</span>
                            <span className="font-semibold text-right" style={{ color: "var(--color-text-primary)" }}>
                                {formatCurrency(withdrawal.requestedAmount)}
                            </span>
                            <span style={{ color: "var(--color-text-secondary)" }}>Biaya Admin Bank:</span>
                            <span className="text-red-500 text-right font-semibold">
                                -{formatCurrency(withdrawal.adminFee)}
                            </span>
                            <span className="font-bold pt-1.5 border-t" style={{ color: "var(--color-text-primary)", borderColor: "var(--color-border)" }}>
                                Dana Bersih:
                            </span>
                            <span className="font-bold text-right pt-1.5 border-t text-green-600" style={{ color: "var(--color-primary-600)", borderColor: "var(--color-border)" }}>
                                {formatCurrency(withdrawal.netAmount)}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-start gap-3 pt-2">
                    <HelpCircle className="w-5 h-5 mt-0.5 text-gray-400" />
                    <div className="space-y-0.5">
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Tanggal Pengajuan
                        </h4>
                        <p className="text-xs" style={{ color: "var(--color-text-primary)" }}>
                            {formatDate(withdrawal.createdAt)}
                        </p>
                    </div>
                </div>

                {withdrawal.processedByUser && (
                    <div className="flex items-start gap-3 pt-2">
                        <User className="w-5 h-5 mt-0.5 text-gray-400" />
                        <div className="space-y-0.5">
                            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                Diproses Oleh
                            </h4>
                            <p className="text-xs" style={{ color: "var(--color-text-primary)" }}>
                                {withdrawal.processedByUser.name}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
