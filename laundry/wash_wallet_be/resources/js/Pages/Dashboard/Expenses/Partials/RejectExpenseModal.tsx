import React, { useEffect, useState } from "react";
import { Modal } from "@/Components/Modal";
import { Button } from "@/Components/Button";
import { Alert } from "@/Components/Alert";
import { TextAreaInput } from "@/Components/Input";
import { RejectExpenseModalProps } from "../types";
import { XCircle } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

const RejectExpenseModal: React.FC<RejectExpenseModalProps> = ({
    isOpen,
    expense,
    onClose,
    onConfirm,
    isLoading = false,
}) => {
    const [reason, setReason] = useState("");

    useEffect(() => {
        if (!isOpen) {
            setReason("");
        }
    }, [isOpen]);

    if (!expense) return null;

    const handleConfirm = () => {
        if (!reason.trim()) return;
        onConfirm(expense, reason);
    };

    const handleClose = () => {
        setReason("");
        onClose();
    };

    const isEmployeeExpense = expense.creatorType === "employee";

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Tolak Pengeluaran"
            size="md"
            variant="danger"
            loading={isLoading}
            preventClose={isLoading}
            closeOnOverlayClick={!isLoading}
            closeOnEscape={!isLoading}
        >
            <div className="space-y-4">
                <Alert
                    variant="error"
                    title="Alasan Penolakan"
                    description="Berikan alasan yang jelas mengapa pengeluaran ini ditolak."
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
                    <label
                        className="text-sm font-medium"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        Alasan Penolakan <span className="text-red-500">*</span>
                    </label>
                    <TextAreaInput
                        value={reason}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                            setReason(e.target.value)
                        }
                        placeholder="Masukkan alasan penolakan..."
                        rows={4}
                        maxLength={500}
                        disabled={isLoading}
                    />
                    <div className="flex justify-between items-center">
                        <p
                            className="text-xs"
                            style={{ color: "var(--color-text-tertiary)" }}
                        >
                            {isEmployeeExpense
                                ? "Alasan ini akan dikirimkan ke karyawan"
                                : "Alasan ini akan dicatat untuk referensi"}
                        </p>
                        <span
                            className="text-xs"
                            style={{ color: "var(--color-text-tertiary)" }}
                        >
                            {reason.length}/500
                        </span>
                    </div>
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
                    variant="danger"
                    onClick={handleConfirm}
                    disabled={isLoading || !reason.trim()}
                    loading={isLoading}
                >
                    <XCircle className="w-4 h-4 mr-2" />
                    Tolak
                </Button>
            </div>
        </Modal>
    );
};

export default RejectExpenseModal;
