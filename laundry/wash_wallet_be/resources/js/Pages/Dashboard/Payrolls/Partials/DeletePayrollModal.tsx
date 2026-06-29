import React from "react";
import { Modal } from "@/Components/Modal";
import { Button } from "@/Components/Button";
import { AlertTriangle } from "lucide-react";
import { DeletePayrollModalProps } from "../types";
import { formatCurrency } from "@/lib/utils";

const DeletePayrollModal: React.FC<DeletePayrollModalProps> = ({
    isOpen,
    payroll,
    onClose,
    onConfirm,
    isLoading = false,
}) => {
    const handleConfirm = () => {
        if (!isLoading) {
            onConfirm();
        }
    };

    if (!payroll) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Hapus Penggajian"
            size="md"
            loading={isLoading}
            preventClose={isLoading}
            closeOnOverlayClick={!isLoading}
            closeOnEscape={!isLoading}
        >
            <div className="space-y-4">
                <div
                    className="flex items-start gap-4 p-4 rounded-lg border"
                    style={{
                        backgroundColor: "var(--color-error-50)",
                        borderColor: "var(--color-error-200)",
                    }}
                >
                    <AlertTriangle
                        className="w-6 h-6 flex-shrink-0 mt-0.5"
                        style={{ color: "var(--color-error-600)" }}
                    />
                    <div className="flex-1">
                        <h4
                            className="text-sm font-semibold mb-2"
                            style={{ color: "var(--color-error-700)" }}
                        >
                            Peringatan: Tindakan Tidak Dapat Dibatalkan
                        </h4>
                        <p
                            className="text-sm mb-3"
                            style={{ color: "var(--color-error-600)" }}
                        >
                            Anda akan menghapus penggajian berikut:
                        </p>
                        <div
                            className="p-3 rounded-lg mb-3"
                            style={{
                                backgroundColor: "var(--color-surface)",
                                border: "1px solid var(--color-border)",
                            }}
                        >
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span
                                        style={{
                                            color: "var(--color-text-secondary)",
                                        }}
                                    >
                                        No. Transaksi
                                    </span>
                                    <span
                                        className="font-medium"
                                        style={{
                                            color: "var(--color-text-primary)",
                                        }}
                                    >
                                        {payroll.transactionNumber}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span
                                        style={{
                                            color: "var(--color-text-secondary)",
                                        }}
                                    >
                                        Karyawan
                                    </span>
                                    <span
                                        className="font-medium"
                                        style={{
                                            color: "var(--color-text-primary)",
                                        }}
                                    >
                                        {payroll.employeeName}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span
                                        style={{
                                            color: "var(--color-text-secondary)",
                                        }}
                                    >
                                        Periode
                                    </span>
                                    <span
                                        className="font-medium"
                                        style={{
                                            color: "var(--color-text-primary)",
                                        }}
                                    >
                                        {payroll.periodLabel}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span
                                        style={{
                                            color: "var(--color-text-secondary)",
                                        }}
                                    >
                                        Gaji Bersih
                                    </span>
                                    <span
                                        className="font-semibold"
                                        style={{
                                            color: "var(--color-primary-600)",
                                        }}
                                    >
                                        {formatCurrency(payroll.netSalary)}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <ul
                            className="list-disc list-inside space-y-1 text-sm"
                            style={{ color: "var(--color-error-600)" }}
                        >
                            <li>
                                Data penggajian akan dihapus secara permanen
                            </li>
                            <li>Jurnal akuntansi terkait akan dibatalkan</li>
                            <li>Data yang dihapus tidak dapat dipulihkan</li>
                        </ul>
                    </div>
                </div>

                <div
                    className="flex justify-end gap-3 pt-4 border-t"
                    style={{ borderColor: "var(--color-border)" }}
                >
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
                    >
                        {isLoading ? "Menghapus..." : "Ya, Hapus Penggajian"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default DeletePayrollModal;
