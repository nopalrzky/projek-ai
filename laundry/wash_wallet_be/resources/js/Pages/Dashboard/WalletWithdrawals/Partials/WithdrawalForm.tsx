import React, { FormEvent, useState, useEffect } from "react";
import { useForm } from "@inertiajs/react";
import { AlertCircle, Banknote, CreditCard, Save } from "lucide-react";
import { Alert } from "@/Components/Alert";
import { Button } from "@/Components/Button";
import { Form } from "@/Components/Form";
import { Input, SelectInput } from "@/Components/Input";
import { OwnerBankAccount } from "@/types";
import { WithdrawalSummaryCard } from "./WithdrawalSummaryCard";
import { formatCurrency } from "@/lib/utils";

interface WithdrawalFormProps {
    stats: {
        walletBalance: number;
        availableBalance: number;
        pendingWdrTotal: number;
    };
    accounts: OwnerBankAccount[];
    onSubmit: (data: { ownerBankAccountId: number; requestedAmount: number }) => void;
    isLoading: boolean;
}

export const WithdrawalForm: React.FC<WithdrawalFormProps> = ({
    stats,
    accounts,
    onSubmit,
    isLoading,
}) => {
    const defaultAccount = accounts.find((acc) => acc.isDefault) || accounts[0];

    const { data, setData, errors } = useForm({
        ownerBankAccountId: defaultAccount?.id || 0,
        requestedAmount: 0,
    });

    const [selectedAccount, setSelectedAccount] = useState<OwnerBankAccount | undefined>(defaultAccount);

    useEffect(() => {
        const account = accounts.find((acc) => acc.id === Number(data.ownerBankAccountId));
        setSelectedAccount(account);
    }, [data.ownerBankAccountId, accounts]);

    const adminFee = Number(selectedAccount?.withdrawalBank?.adminFee ?? selectedAccount?.adminFee ?? 0);
    const minWdr = Number(selectedAccount?.withdrawalBank?.minWithdrawal ?? 50000);
    const maxWdr = selectedAccount?.withdrawalBank?.maxWithdrawal ? Number(selectedAccount.withdrawalBank.maxWithdrawal) : null;

    const netAmount = data.requestedAmount - adminFee;

    const [validationError, setValidationError] = useState<string | null>(null);

    useEffect(() => {
        if (!data.ownerBankAccountId) {
            setValidationError("Pilih rekening bank tujuan terlebih dahulu.");
            return;
        }
        if (data.requestedAmount <= 0) {
            setValidationError("Nominal penarikan harus lebih dari Rp 0.");
            return;
        }
        if (data.requestedAmount < minWdr) {
            setValidationError(`Minimal penarikan adalah ${formatCurrency(minWdr)}.`);
            return;
        }
        if (maxWdr && data.requestedAmount > maxWdr) {
            setValidationError(`Maksimal penarikan adalah ${formatCurrency(maxWdr)}.`);
            return;
        }
        if (data.requestedAmount > stats.availableBalance) {
            setValidationError("Saldo tersedia tidak mencukupi.");
            return;
        }
        if (netAmount <= 0) {
            setValidationError("Nominal penarikan setelah biaya admin harus lebih dari Rp 0.");
            return;
        }
        setValidationError(null);
    }, [data.requestedAmount, selectedAccount, stats.availableBalance]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (validationError) return;
        onSubmit({
            ownerBankAccountId: Number(data.ownerBankAccountId),
            requestedAmount: Number(data.requestedAmount),
        });
    };

    return (
        <Form onSubmit={handleSubmit} loading={isLoading} className="space-y-6">
            <div className="space-y-4">
                <SelectInput
                    label="Rekening Tujuan"
                    disabled={isLoading}
                    value={data.ownerBankAccountId}
                    onChange={(e) =>
                        setData("ownerBankAccountId", Number(e.target.value))
                    }
                    options={accounts.map((acc) => ({
                        value: acc.id,
                        label: `${acc.withdrawalBank?.bankName || acc.bankName} - ${acc.accountNumber} (${acc.accountHolderName})`,
                        description: `Admin ${formatCurrency(Number(acc.withdrawalBank?.adminFee ?? acc.adminFee ?? 0))}`,
                    }))}
                    placeholder="Pilih rekening tujuan"
                    error={errors.ownerBankAccountId}
                    leftIcon={<CreditCard className="w-5 h-5" />}
                    hint="Rekening aktif milik Anda yang akan menerima dana withdrawal"
                    required
                />

                <Input
                    label="Nominal Penarikan"
                    type="number"
                    min={0}
                    disabled={isLoading}
                    value={data.requestedAmount || ""}
                    onChange={(e) =>
                        setData(
                            "requestedAmount",
                            Math.max(0, Number(e.target.value)),
                        )
                    }
                    placeholder="Contoh: 100000"
                    error={errors.requestedAmount}
                    leftAddon="Rp"
                    leftIcon={<Banknote className="w-5 h-5" />}
                    hint={`Saldo tersedia: ${formatCurrency(stats.availableBalance)}`}
                    required
                />

                <WithdrawalSummaryCard
                    availableBalance={stats.availableBalance}
                    requestedAmount={data.requestedAmount}
                    adminFee={adminFee}
                    netAmount={netAmount}
                />

                {validationError && (
                    <Alert
                        variant="error"
                        title="Penarikan Belum Valid"
                        description={validationError}
                        icon={<AlertCircle className="w-5 h-5" />}
                    />
                )}
            </div>

            <div
                className="flex items-center justify-end gap-2 pt-4 border-t"
                style={{ borderColor: "var(--color-border)" }}
            >
                <Button
                    type="submit"
                    variant="primary"
                    disabled={isLoading || !!validationError}
                    loading={isLoading}
                    leftIcon={!isLoading ? <Save className="w-4 h-4" /> : undefined}
                >
                    Ajukan Penarikan
                </Button>
            </div>
        </Form>
    );
};
