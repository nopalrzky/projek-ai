import React from "react";
import {
    AlertTriangle,
    DollarSign,
    User,
    Calendar,
    CreditCard,
} from "lucide-react";
import { Modal } from "@/Components/Modal";
import { Button } from "@/Components/Button";
import { Alert } from "@/Components/Alert";
import { Badge } from "@/Components/Badge";
import { LoanDeleteModalProps } from "../types";
import { formatCurrency } from "@/lib/utils";

const DeleteLoanModal: React.FC<LoanDeleteModalProps> = ({
    isOpen,
    loan,
    onClose,
    onConfirm,
    isLoading = false,
}) => {
    if (!loan) return null;

    const handleConfirm = () => {
        if (!isLoading) {
            onConfirm(loan);
        }
    };

    const loanLogsCount = (loan.loanLogs ?? []).length;
    const hasPayments = loanLogsCount > 0;
    const isPaid = loan.isPaid;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Hapus Kasbon"
            size="md"
            variant="danger"
            loading={isLoading}
            preventClose={isLoading}
            closeOnOverlayClick={!isLoading}
            closeOnEscape={!isLoading}
            footer={
                <div className="flex items-center justify-end gap-3">
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
                        disabled={hasPayments || isLoading}
                        loading={isLoading}
                        leftIcon={<AlertTriangle className="w-4 h-4" />}
                    >
                        {isLoading ? "Menghapus..." : "Ya, Hapus Kasbon"}
                    </Button>
                </div>
            }
        >
            <div className="space-y-4">
                {/* Loan Info */}
                <div className="space-y-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                    {/* Employee Info */}
                    <div className="flex items-center space-x-3">
                        <div
                            className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center"
                            style={{
                                backgroundColor: "var(--color-primary-100)",
                            }}
                        >
                            <User
                                className="w-6 h-6"
                                style={{ color: "var(--color-primary-600)" }}
                            />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3
                                className="font-medium text-lg"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                {loan.employee?.name}
                            </h3>
                            <div
                                className="text-sm"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                {loan.employee?.id}
                            </div>
                        </div>
                    </div>

                    {/* Loan Details */}
                    <div
                        className="grid grid-cols-2 gap-4 pt-4 border-t"
                        style={{ borderColor: "var(--color-border)" }}
                    >
                        {/* Amount */}
                        <div className="space-y-1">
                            <div
                                className="text-xs font-medium"
                                style={{ color: "var(--color-text-tertiary)" }}
                            >
                                Jumlah Kasbon
                            </div>
                            <div className="flex items-center gap-2">
                                <DollarSign
                                    className="w-4 h-4"
                                    style={{
                                        color: "var(--color-text-quaternary)",
                                    }}
                                />
                                <span
                                    className="font-semibold"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {formatCurrency(loan.amount)}
                                </span>
                            </div>
                        </div>

                        {/* Remaining */}
                        <div className="space-y-1">
                            <div
                                className="text-xs font-medium"
                                style={{ color: "var(--color-text-tertiary)" }}
                            >
                                Sisa Pembayaran
                            </div>
                            <div className="flex items-center gap-2">
                                <CreditCard
                                    className="w-4 h-4"
                                    style={{
                                        color:
                                            loan.remainingAmount > 0
                                                ? "var(--color-error-500)"
                                                : "var(--color-success-500)",
                                    }}
                                />
                                <span
                                    className="font-semibold"
                                    style={{
                                        color:
                                            loan.remainingAmount > 0
                                                ? "var(--color-error-500)"
                                                : "var(--color-success-500)",
                                    }}
                                >
                                    {formatCurrency(loan.remainingAmount)}
                                </span>
                            </div>
                        </div>

                        {/* Loan Date */}
                        <div className="space-y-1">
                            <div
                                className="text-xs font-medium"
                                style={{ color: "var(--color-text-tertiary)" }}
                            >
                                Tanggal Kasbon
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar
                                    className="w-4 h-4"
                                    style={{
                                        color: "var(--color-text-quaternary)",
                                    }}
                                />
                                <span
                                    className="text-sm"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    {new Date(loan.loanDate).toLocaleDateString(
                                        "id-ID",
                                        {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                        },
                                    )}
                                </span>
                            </div>
                        </div>

                        {/* Repayment Type */}
                        <div className="space-y-1">
                            <div
                                className="text-xs font-medium"
                                style={{ color: "var(--color-text-tertiary)" }}
                            >
                                Tipe Pembayaran
                            </div>
                            <Badge
                                variant={
                                    loan.repaymentType === "full"
                                        ? "primary"
                                        : loan.repaymentType === "installment"
                                          ? "info"
                                          : "warning"
                                }
                                size="sm"
                            >
                                {loan.repaymentType === "full"
                                    ? "Lunas"
                                    : loan.repaymentType === "installment"
                                      ? "Cicilan"
                                      : "Sekali Bayar"}
                            </Badge>
                        </div>
                    </div>

                    {/* Payment Status */}
                    {hasPayments && (
                        <div
                            className="pt-4 border-t"
                            style={{ borderColor: "var(--color-border)" }}
                        >
                            <div className="flex items-center justify-between">
                                <span
                                    className="text-sm font-medium"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Riwayat Pembayaran
                                </span>
                                <Badge variant="info" size="sm">
                                    {loanLogsCount} pembayaran
                                </Badge>
                            </div>
                        </div>
                    )}

                    {/* Note */}
                    {loan.note && (
                        <div
                            className="pt-4 border-t"
                            style={{ borderColor: "var(--color-border)" }}
                        >
                            <div
                                className="text-xs font-medium mb-1"
                                style={{ color: "var(--color-text-tertiary)" }}
                            >
                                Catatan
                            </div>
                            <p
                                className="text-sm"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                {loan.note}
                            </p>
                        </div>
                    )}
                </div>

                {/* Warning Messages */}
                {hasPayments ? (
                    <Alert
                        variant="error"
                        title="Tidak dapat menghapus kasbon"
                        description={`Kasbon ini tidak dapat dihapus karena sudah memiliki ${loanLogsCount} riwayat pembayaran. Anda perlu menghapus semua riwayat pembayaran terlebih dahulu.`}
                    />
                ) : isPaid ? (
                    <Alert
                        variant="warning"
                        title="Kasbon sudah lunas"
                        description="Kasbon ini sudah lunas. Pastikan Anda yakin ingin menghapusnya."
                    />
                ) : (
                    <Alert
                        variant="warning"
                        title="Peringatan"
                        description="Tindakan ini tidak dapat dibatalkan. Data kasbon yang dihapus akan hilang secara permanen dari sistem."
                    />
                )}

                {/* Confirmation Text */}
                <div className="text-center">
                    <p
                        className="text-sm"
                        style={{ color: "var(--color-text-secondary)" }}
                    >
                        {hasPayments
                            ? "Kasbon ini tidak dapat dihapus karena memiliki riwayat pembayaran."
                            : "Apakah Anda yakin ingin menghapus kasbon ini?"}
                    </p>
                </div>
            </div>
        </Modal>
    );
};

export default DeleteLoanModal;
