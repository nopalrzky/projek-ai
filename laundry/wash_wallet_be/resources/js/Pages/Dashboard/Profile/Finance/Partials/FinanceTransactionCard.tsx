import React from "react";
import { Card } from "@/Components/Card";
import { Button } from "@/Components/Button";
import { ArrowRight, TrendingUp, TrendingDown } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import type { ProfileTransactionItem } from "../../types";

interface FinanceTransactionCardProps {
    transactions: ProfileTransactionItem[];
}

export const FinanceTransactionCard: React.FC<FinanceTransactionCardProps> = ({ transactions }) => {
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
                        Riwayat Transaksi Terbaru
                    </h3>
                </div>

                {transactions.length === 0 ? (
                    <div className="py-8 text-center border border-dashed border-color rounded-lg bg-surface-muted">
                        <p className="text-xs text-secondary">Belum ada riwayat transaksi</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="divide-y divide-color">
                            {transactions.map((tx) => (
                                <div
                                    key={tx.id}
                                    className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3"
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`p-2 rounded-lg ${
                                                tx.isCredit
                                                    ? "bg-success-50 dark:bg-success-950/20 text-success-600 dark:text-success-400"
                                                    : "bg-error-50 dark:bg-error-950/20 text-error-600 dark:text-error-400"
                                            }`}
                                        >
                                            {tx.isCredit ? (
                                                <TrendingUp className="w-4 h-4" />
                                            ) : (
                                                <TrendingDown className="w-4 h-4" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-primary">
                                                {tx.typeLabel}
                                            </p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[10px] font-mono text-tertiary">
                                                    {tx.transactionNumber}
                                                </span>
                                                <span className="text-[10px] text-tertiary">•</span>
                                                <span className="text-[10px] text-secondary">
                                                    {formatDateString(tx.createdAt)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span
                                            className={`text-sm font-bold ${
                                                tx.isCredit
                                                    ? "text-success-600 dark:text-success-400"
                                                    : "text-error-600 dark:text-error-400"
                                            }`}
                                        >
                                            {tx.isCredit ? "+" : ""}
                                            Rp {tx.amount.toLocaleString("id-ID")}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="pt-2 border-t border-color flex justify-end">
                            <Button
                                variant="link"
                                size="xs"
                                href={route("wallet.index")}
                                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                                className="text-secondary hover:text-primary p-0"
                            >
                                Lihat Riwayat Dompet
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
};
