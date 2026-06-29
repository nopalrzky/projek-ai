import React from "react";
import { Modal } from "@/Components/Modal";
import { Button } from "@/Components/Button";
import { Alert } from "@/Components/Alert";
import { Trash2, AlertTriangle } from "lucide-react";
import { DeleteExpenseModalProps } from "../types";
import { formatCurrency, formatDate } from "@/lib/utils";

const DeleteExpenseModal: React.FC<DeleteExpenseModalProps> = ({
    isOpen,
    expense,
    onClose,
    onConfirm,
    isLoading = false,
}) => {
    if (!expense) return null;

    const handleConfirm = () => {
        if (!isLoading) {
            onConfirm(expense);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Hapus Pengeluaran"
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
                    title="Peringatan"
                    description="Tindakan ini akan menghapus data pengeluaran secara soft delete. Jurnal terkait dan saldo akun akan disesuaikan."
                    icon={<AlertTriangle className="w-5 h-5" />}
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
                                className="text-sm font-medium"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                Jumlah
                            </span>
                            <span
                                className="text-lg font-bold"
                                style={{ color: "var(--color-error-600)" }}
                            >
                                {formatCurrency(expense.amount)}
                            </span>
                        </div>
                    </div>
                </div>

                <p
                    className="text-sm"
                    style={{ color: "var(--color-text-secondary)" }}
                >
                    Yakin ingin menghapus pengeluaran ini? Data dapat dipulihkan
                    dari menu restore.
                </p>

                <div className="flex justify-end gap-2 mt-6">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Batal
                    </Button>
                    <Button
                        variant="danger"
                        onClick={handleConfirm}
                        disabled={isLoading}
                        loading={isLoading}
                        leftIcon={<Trash2 className="w-4 h-4" />}
                    >
                        {isLoading ? "Menghapus..." : "Hapus"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default DeleteExpenseModal;
