import React from "react";
import { Card } from "@/Components/Card";
import { Button } from "@/Components/Button";
import { Coins, Wallet, ArrowUpRight } from "lucide-react";
import type { ProfileFinanceSummary } from "../../types";

interface FinanceBalanceCardProps {
    finance: ProfileFinanceSummary;
}

export const FinanceBalanceCard: React.FC<FinanceBalanceCardProps> = ({ finance }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="relative overflow-hidden">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium text-secondary">
                            Saldo Koin (Fitur)
                        </span>
                        <div className="p-2 rounded-lg bg-warning-50 text-warning-600 dark:bg-warning-950/20 dark:text-warning-400">
                            <Coins className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <h4 className="text-2xl font-bold text-primary">
                            {finance.coinBalance.toLocaleString("id-ID")}
                        </h4>
                        <p className="text-xs text-secondary">
                            Koin digunakan untuk mengaktifkan fitur premium outlet Anda.
                        </p>
                    </div>
                    <div className="mt-6">
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            href={route("topups.index")}
                            leftIcon={<ArrowUpRight className="w-4 h-4" />}
                        >
                            Topup Koin
                        </Button>
                    </div>
                </div>
            </Card>

            <Card className="relative overflow-hidden">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium text-secondary">
                            Saldo Pendapatan
                        </span>
                        <div className="p-2 rounded-lg bg-success-50 text-success-600 dark:bg-success-950/20 dark:text-success-400">
                            <Wallet className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <h4 className="text-2xl font-bold text-primary">
                            Rp {finance.walletBalance.toLocaleString("id-ID")}
                        </h4>
                        <div className="flex flex-col gap-1 mt-2 text-xs text-secondary">
                            <div className="flex justify-between">
                                <span>Tersedia untuk ditarik:</span>
                                <span className="font-semibold text-success-600 dark:text-success-400">
                                    Rp {finance.availableBalance.toLocaleString("id-ID")}
                                </span>
                            </div>
                            {finance.pendingWdrTotal > 0 && (
                                <div className="flex justify-between">
                                    <span>Tertahan (Sedang ditarik):</span>
                                    <span className="font-semibold text-warning-600 dark:text-warning-400">
                                        Rp {finance.pendingWdrTotal.toLocaleString("id-ID")}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="mt-6">
                        <Button
                            variant="primary"
                            size="sm"
                            className="w-full"
                            href={route("wallet-withdrawals.create")}
                            disabled={finance.availableBalance <= 0}
                        >
                            Tarik Saldo
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};
