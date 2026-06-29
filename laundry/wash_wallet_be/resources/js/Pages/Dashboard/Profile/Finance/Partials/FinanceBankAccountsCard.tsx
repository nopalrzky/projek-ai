import React from "react";
import { Card } from "@/Components/Card";
import { Badge } from "@/Components/Badge";
import { Button } from "@/Components/Button";
import { Alert } from "@/Components/Alert";
import { CreditCard, Plus, ArrowRight, AlertTriangle } from "lucide-react";
import type { ProfileBankAccountSummary } from "../../types";

interface FinanceBankAccountsCardProps {
    bankAccounts: ProfileBankAccountSummary[];
}

export const FinanceBankAccountsCard: React.FC<FinanceBankAccountsCardProps> = ({ bankAccounts }) => {
    return (
        <Card className="relative overflow-hidden">
            <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-base font-semibold text-primary">
                            Rekening Bank Withdrawal
                        </h3>
                        <p className="mt-1 text-xs text-secondary">
                            Rekening aktif yang dipakai untuk penarikan saldo
                            pendapatan.
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="xs"
                        href={route("bank-accounts.create")}
                        leftIcon={<Plus className="w-3 h-3" />}
                    >
                        Tambah
                    </Button>
                </div>

                {bankAccounts.length === 0 ? (
                    <div className="space-y-4 rounded-lg border border-dashed border-color bg-surface-muted p-4">
                        <Alert
                            variant="warning"
                            showIcon
                            icon={<AlertTriangle className="w-4 h-4" />}
                            title="Rekening Belum Ditambahkan"
                            description="Anda harus menambahkan rekening bank aktif sebelum dapat melakukan penarikan saldo pendapatan."
                        />
                        <Button
                            variant="primary"
                            size="sm"
                            className="w-full"
                            href={route("bank-accounts.create")}
                            leftIcon={<Plus className="w-4 h-4" />}
                        >
                            Hubungkan Rekening
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {bankAccounts.map((account) => (
                            <div
                                key={account.id}
                                className="flex items-center justify-between gap-4 rounded-lg border border-color bg-surface-muted p-4"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-info-50 text-info-600 dark:bg-info-950/20 dark:text-info-400">
                                        <CreditCard className="w-4 h-4" />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-semibold text-primary">
                                                {account.bankName}
                                            </p>
                                            {account.isDefault && (
                                                <Badge
                                                    variant="primary"
                                                    size="xs"
                                                >
                                                    Utama
                                                </Badge>
                                            )}
                                            {account.isActive && (
                                                <Badge
                                                    variant="success"
                                                    size="xs"
                                                >
                                                    Aktif
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-xs text-secondary font-mono">
                                            {account.accountNumberMasked} •{" "}
                                            {account.accountHolderName}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <div className="pt-2 border-t border-color flex justify-end">
                            <Button
                                variant="link"
                                size="xs"
                                href={route("bank-accounts.index")}
                                rightIcon={
                                    <ArrowRight className="w-3.5 h-3.5" />
                                }
                                className="text-secondary hover:text-primary p-0"
                            >
                                Kelola Rekening
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
};
