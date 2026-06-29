import React, { useState, useMemo, useEffect } from "react";
import { Modal } from "@/Components/Modal";
import { Button } from "@/Components/Button";
import { Alert } from "@/Components/Alert";
import { SelectInput } from "@/Components/Input";
import { ApproveExpenseModalProps } from "../types";
import { CheckCircle } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

const ApproveExpenseModal: React.FC<ApproveExpenseModalProps> = ({
    isOpen,
    expense,
    accounts,
    onClose,
    onConfirm,
    isLoading = false,
}) => {
    const [sourceAccountId, setSourceAccountId] = useState<number | null>(null);

    useEffect(() => {
        if (!isOpen) {
            setSourceAccountId(null);
        }
    }, [isOpen]);

    // Prepare account options for SelectInput
    const accountOptions = useMemo(() => {
        return [
            { value: "", label: "Gunakan akun saat ini" },
            ...accounts.map((account) => ({
                value: account.id.toString(),
                label: `${account.code} - ${account.name}`,
            })),
        ];
    }, [accounts]);

    if (!expense) return null;

    const handleConfirm = () => {
        onConfirm(expense, sourceAccountId || undefined);
    };

    const handleClose = () => {
        setSourceAccountId(null);
        onClose();
    };

    const isEmployeeExpense = expense.creatorType === "employee";

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Setujui Pengeluaran"
            size="md"
            variant="success"
            loading={isLoading}
            preventClose={isLoading}
            closeOnOverlayClick={!isLoading}
            closeOnEscape={!isLoading}
        >
            <div className="space-y-4">
                <Alert
                    variant="warning"
                    title="Konfirmasi"
                    description="Pastikan Anda telah memverifikasi pengeluaran ini sebelum menyetujui."
                />

                <div
                    className="p-4 rounded-lg border"
                    style={{
                        backgroundColor: "var(--color-surface-secondary)",
                        borderColor: "var(--color-border)",
                    }}
                >
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span
                                className="text-sm"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                Kode Pengeluaran
                            </span>
                            <span
                                className="font-medium"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                {expense.code}
                            </span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span
                                className="text-sm"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                Tanggal
                            </span>
                            <span
                                className="font-medium"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                {formatDate(expense.date, "DD MMMM YYYY")}
                            </span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span
                                className="text-sm"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                Outlet
                            </span>
                            <span
                                className="font-medium"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                {expense.outlet?.name}
                            </span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span
                                className="text-sm"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                Dibuat Oleh
                            </span>
                            <div className="flex flex-col items-end">
                                <span
                                    className="font-medium"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {expense.creatorName}
                                </span>
                                <span
                                    className="text-xs"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    {isEmployeeExpense ? "Karyawan" : "User"}
                                </span>
                            </div>
                        </div>

                        <div className="flex justify-between items-start">
                            <span
                                className="text-sm"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                Akun Pengeluaran
                            </span>
                            <div className="flex flex-col items-end">
                                <span
                                    className="font-medium"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {expense.expenseAccount.name}
                                </span>
                                <span
                                    className="text-xs"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    {expense.expenseAccount.code}
                                </span>
                            </div>
                        </div>

                        <div className="flex justify-between items-start">
                            <span
                                className="text-sm"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                Sumber Dana Saat Ini
                            </span>
                            <div className="flex flex-col items-end">
                                <span
                                    className="font-medium"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {expense.sourceAccount.name}
                                </span>
                                <span
                                    className="text-xs"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    {expense.sourceAccount.code}
                                </span>
                            </div>
                        </div>

                        <div
                            className="border-t pt-3 mt-3"
                            style={{ borderColor: "var(--color-border)" }}
                        >
                            <div className="flex justify-between items-center">
                                <span
                                    className="text-sm font-medium"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    Jumlah
                                </span>
                                <span
                                    className="text-lg font-bold"
                                    style={{
                                        color: "var(--color-error-600)",
                                    }}
                                >
                                    {formatCurrency(expense.amount)}
                                </span>
                            </div>
                        </div>

                        {expense.description && (
                            <div className="space-y-1">
                                <span
                                    className="text-sm"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Deskripsi
                                </span>
                                <p
                                    className="text-sm"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {expense.description}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <SelectInput
                        label="Akun Sumber Dana (Opsional)"
                        value={sourceAccountId?.toString() || ""}
                        onChange={(e) =>
                            setSourceAccountId(
                                e.target.value ? Number(e.target.value) : null,
                            )
                        }
                        options={accountOptions}
                        placeholder="Gunakan akun saat ini"
                        disabled={isLoading}
                        hint={
                            isEmployeeExpense
                                ? "Biarkan kosong untuk menggunakan kas outlet (default untuk karyawan)"
                                : "Anda dapat mengubah akun sumber dana jika diperlukan"
                        }
                    />
                </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
                <Button
                    variant="outline"
                    onClick={handleClose}
                    disabled={isLoading}
                >
                    Batal
                </Button>
                <Button
                    variant="success"
                    onClick={handleConfirm}
                    disabled={isLoading}
                    loading={isLoading}
                >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Setujui
                </Button>
            </div>
        </Modal>
    );
};

export default ApproveExpenseModal;
