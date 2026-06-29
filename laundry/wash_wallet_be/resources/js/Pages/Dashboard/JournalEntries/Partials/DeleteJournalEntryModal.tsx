import React from "react";
import { Modal } from "@/Components/Modal";
import { Button } from "@/Components/Button";
import { Alert } from "@/Components/Alert";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { JournalEntry } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

interface DeleteJournalEntryModalProps {
    isOpen: boolean;
    journalEntry?: JournalEntry;
    onClose: () => void;
    onConfirm: (entry: JournalEntry) => void;
    isLoading?: boolean;
}

const DeleteJournalEntryModal: React.FC<DeleteJournalEntryModalProps> = ({
    isOpen,
    journalEntry,
    onClose,
    onConfirm,
    isLoading = false,
}) => {
    const handleConfirm = async () => {
        if (!journalEntry) return;

        if (!isLoading) {
            onConfirm(journalEntry);
        }
    };

    if (!journalEntry) return null;

    const totalDebit =
        journalEntry.journalDetails?.reduce(
            (sum, detail) => sum + (detail.debit || 0),
            0,
        ) || 0;
    const totalCredit =
        journalEntry.journalDetails?.reduce(
            (sum, detail) => sum + (detail.credit || 0),
            0,
        ) || 0;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Hapus Jurnal Entry"
            size="md"
            variant="danger"
            loading={isLoading}
            preventClose={isLoading}
            closeOnOverlayClick={!isLoading}
            closeOnEscape={!isLoading}
        >
            <div className="p-6">
                <Alert
                    variant="error"
                    title="Peringatan"
                    description="Jurnal entry akan dihapus permanen beserta seluruh detail akun terkait."
                    icon={<AlertTriangle className="w-5 h-5" />}
                />

                <div
                    className="p-4 rounded-lg mb-6 space-y-3"
                    style={{
                        backgroundColor: "var(--color-surface-secondary)",
                        borderLeft: "4px solid var(--color-error-500)",
                    }}
                >
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <p
                                className="text-xs font-medium mb-1"
                                style={{ color: "var(--color-text-tertiary)" }}
                            >
                                No. Transaksi
                            </p>
                            <p
                                className="text-sm font-mono font-semibold"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                {journalEntry.transactionNumber}
                            </p>
                        </div>
                        <div>
                            <p
                                className="text-xs font-medium mb-1"
                                style={{ color: "var(--color-text-tertiary)" }}
                            >
                                Tanggal
                            </p>
                            <p
                                className="text-sm font-semibold"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                {formatDate(journalEntry.date, "DD MMMM YYYY")}
                            </p>
                        </div>
                    </div>

                    {journalEntry.description && (
                        <div>
                            <p
                                className="text-xs font-medium mb-1"
                                style={{ color: "var(--color-text-tertiary)" }}
                            >
                                Deskripsi
                            </p>
                            <p
                                className="text-sm"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                {journalEntry.description}
                            </p>
                        </div>
                    )}

                    <div
                        className="grid grid-cols-2 gap-3 pt-3 border-t"
                        style={{ borderColor: "var(--color-border)" }}
                    >
                        <div>
                            <p
                                className="text-xs font-medium mb-1"
                                style={{ color: "var(--color-text-tertiary)" }}
                            >
                                Total Debit
                            </p>
                            <p
                                className="text-sm font-bold"
                                style={{ color: "var(--color-success-600)" }}
                            >
                                {formatCurrency(totalDebit)}
                            </p>
                        </div>
                        <div>
                            <p
                                className="text-xs font-medium mb-1"
                                style={{ color: "var(--color-text-tertiary)" }}
                            >
                                Total Kredit
                            </p>
                            <p
                                className="text-sm font-bold"
                                style={{ color: "var(--color-error-600)" }}
                            >
                                {formatCurrency(totalCredit)}
                            </p>
                        </div>
                    </div>

                    {journalEntry.referenceType && (
                        <div
                            className="pt-3 border-t"
                            style={{ borderColor: "var(--color-border)" }}
                        >
                            <p
                                className="text-xs font-medium mb-1"
                                style={{ color: "var(--color-text-tertiary)" }}
                            >
                                Referensi
                            </p>
                            <p
                                className="text-sm"
                                style={{ color: "var(--color-info-600)" }}
                            >
                                {journalEntry.referenceType}
                                {journalEntry.referenceId &&
                                    ` #${journalEntry.referenceId}`}
                            </p>
                        </div>
                    )}
                </div>

                <div
                    className="p-4 rounded-lg mb-6"
                    style={{
                        backgroundColor: "var(--color-warning-50)",
                        border: "1px solid var(--color-warning-200)",
                    }}
                >
                    <div className="flex items-start gap-3">
                        <AlertTriangle
                            className="w-5 h-5 flex-shrink-0 mt-0.5"
                            style={{ color: "var(--color-warning-600)" }}
                        />
                        <div>
                            <h4
                                className="text-sm font-semibold mb-1"
                                style={{ color: "var(--color-warning-700)" }}
                            >
                                Peringatan Penting
                            </h4>
                            <ul
                                className="text-xs space-y-1"
                                style={{ color: "var(--color-warning-600)" }}
                            >
                                <li>
                                    • Jurnal entry akan dihapus secara permanen
                                </li>
                                <li>
                                    • Semua detail akun terkait akan ikut
                                    terhapus
                                </li>
                                <li>
                                    • Laporan keuangan akan terpengaruh oleh
                                    penghapusan ini
                                </li>
                                <li>
                                    • Pastikan entry ini tidak digunakan dalam
                                    referensi lain
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                        leftIcon={<X className="w-4 h-4" />}
                    >
                        Batal
                    </Button>
                    <Button
                        type="button"
                        variant="danger"
                        onClick={handleConfirm}
                        disabled={isLoading}
                        loading={isLoading}
                        leftIcon={<Trash2 className="w-4 h-4" />}
                    >
                        {isLoading ? "Menghapus..." : "Ya, Hapus Entry"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default DeleteJournalEntryModal;
