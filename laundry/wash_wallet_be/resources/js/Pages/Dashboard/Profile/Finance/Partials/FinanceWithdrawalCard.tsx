import React from "react";
import { Card } from "@/Components/Card";
import { Badge } from "@/Components/Badge";
import { Button } from "@/Components/Button";
import { ArrowUpRight, ArrowRight, HelpCircle } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import type { ProfileFinanceSummary } from "../../types";

interface FinanceWithdrawalCardProps {
    finance: ProfileFinanceSummary;
}

export const FinanceWithdrawalCard: React.FC<FinanceWithdrawalCardProps> = ({ finance }) => {
    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case "pending":
                return "warning";
            case "processing":
                return "info";
            case "paid":
                return "success";
            case "rejected":
            case "cancelled":
                return "danger";
            default:
                return "secondary";
        }
    };

    const formatDateString = (dateString: string) => {
        try {
            return format(new Date(dateString), "dd MMM yyyy, HH:mm", { locale: id });
        } catch {
            return dateString;
        }
    };

    return (
        <Card>
            <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold text-primary">
                        Status & Riwayat Penarikan
                    </h3>
                    <Button
                        variant="outline"
                        size="xs"
                        href={route("wallet-withdrawals.create")}
                        disabled={finance.availableBalance <= 0}
                        leftIcon={<ArrowUpRight className="w-3 h-3" />}
                    >
                        Tarik
                    </Button>
                </div>

                <div className="grid grid-cols-4 gap-2 mb-6 text-center">
                    <div className="p-2.5 rounded-lg bg-warning-50 dark:bg-warning-950/20">
                        <p className="text-sm font-bold text-warning-700 dark:text-warning-400">
                            {finance.totalWithdrawals.pending}
                        </p>
                        <p className="text-[10px] font-medium text-warning-600 dark:text-warning-500 uppercase mt-0.5">
                            Pending
                        </p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-info-50 dark:bg-info-950/20">
                        <p className="text-sm font-bold text-info-700 dark:text-info-400">
                            {finance.totalWithdrawals.processing}
                        </p>
                        <p className="text-[10px] font-medium text-info-600 dark:text-info-500 uppercase mt-0.5">
                            Proses
                        </p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-success-50 dark:bg-success-950/20">
                        <p className="text-sm font-bold text-success-700 dark:text-success-400">
                            {finance.totalWithdrawals.paid}
                        </p>
                        <p className="text-[10px] font-medium text-success-600 dark:text-success-500 uppercase mt-0.5">
                            Selesai
                        </p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-error-50 dark:bg-error-950/20">
                        <p className="text-sm font-bold text-error-700 dark:text-error-400">
                            {finance.totalWithdrawals.rejected}
                        </p>
                        <p className="text-[10px] font-medium text-error-600 dark:text-error-500 uppercase mt-0.5">
                            Ditolak
                        </p>
                    </div>
                </div>

                <div className="space-y-3">
                    <p className="text-xs font-semibold text-secondary uppercase tracking-wider">
                        3 Penarikan Terakhir
                    </p>

                    {finance.recentWithdrawals.length === 0 ? (
                        <div className="py-6 text-center border border-dashed border-color rounded-lg bg-surface-muted">
                            <p className="text-xs text-secondary">Belum ada riwayat penarikan</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {finance.recentWithdrawals.map((wdr) => (
                                <div
                                    key={wdr.id}
                                    className="p-3 border border-color rounded-lg bg-surface-muted flex items-center justify-between"
                                >
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-mono font-semibold text-primary">
                                                {wdr.code}
                                            </span>
                                            <Badge
                                                variant={getStatusBadgeVariant(wdr.status)}
                                                size="xs"
                                            >
                                                {wdr.statusLabel}
                                            </Badge>
                                        </div>
                                        <p className="text-[10px] text-secondary">
                                            {formatDateString(wdr.createdAt)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-primary">
                                            Rp {wdr.requestedAmount.toLocaleString("id-ID")}
                                        </p>
                                        <p className="text-[10px] text-secondary">
                                            Net: Rp {wdr.netAmount.toLocaleString("id-ID")}
                                        </p>
                                    </div>
                                </div>
                            ))}

                            <div className="pt-2 border-t border-color flex justify-end">
                                <Button
                                    variant="link"
                                    size="xs"
                                    href={route("wallet-withdrawals.index")}
                                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                                    className="text-secondary hover:text-primary p-0"
                                >
                                    Lihat Semua Penarikan
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
};
