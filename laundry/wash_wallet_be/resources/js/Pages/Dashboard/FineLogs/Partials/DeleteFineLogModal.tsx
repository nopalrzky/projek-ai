import React from "react";
import { Modal } from "@/Components/Modal";
import { Button } from "@/Components/Button";
import { Alert } from "@/Components/Alert";
import { Badge } from "@/Components/Badge";
import { AlertTriangle, Paperclip, Trash2 } from "lucide-react";
import { DeleteFineLogModalProps } from "../types";
import { formatCurrency, formatDate } from "@/lib/utils";

const statusLabels = {
    unpaid: "Belum Dibayar",
    paid: "Sudah Dibayar",
    cancelled: "Dibatalkan",
} as const;

const statusVariants = {
    unpaid: "error",
    paid: "success",
    cancelled: "warning",
} as const;

const DeleteFineLogModal: React.FC<DeleteFineLogModalProps> = ({
    isOpen,
    fineLog,
    onClose,
    onConfirm,
    isLoading = false,
}) => {
    if (!fineLog) return null;

    const handleConfirm = () => {
        if (!isLoading) {
            onConfirm(fineLog);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Hapus Denda Karyawan"
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
                    description="Data denda akan dihapus (soft delete), jurnal terkait akan dibatalkan, dan saldo akun disesuaikan kembali."
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
                                Karyawan
                            </span>
                            <span
                                className="font-medium"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                {fineLog.employee?.name ?? "-"}
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
                                {formatDate(fineLog.date, "DD MMMM YYYY")}
                            </span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span
                                className="text-sm font-medium"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                Jumlah Denda
                            </span>
                            <span
                                className="text-lg font-bold"
                                style={{ color: "var(--color-error-600)" }}
                            >
                                {formatCurrency(fineLog.amount)}
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <Badge
                                variant={
                                    statusVariants[
                                        fineLog.status as keyof typeof statusVariants
                                    ]
                                }
                                size="sm"
                            >
                                {
                                    statusLabels[
                                        fineLog.status as keyof typeof statusLabels
                                    ]
                                }
                            </Badge>

                            {fineLog.hasAttachment && (
                                <Badge variant="info" size="sm">
                                    <Paperclip className="w-3 h-3 mr-1" />
                                    Ada Lampiran
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>

                <p
                    className="text-sm"
                    style={{ color: "var(--color-text-secondary)" }}
                >
                    Apakah Anda yakin ingin menghapus denda ini? Data dapat
                    dipulihkan dari menu restore.
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
                        leftIcon={<Trash2 className="w-4 h-4" />}
                        loading={isLoading}
                        disabled={isLoading}
                    >
                        {isLoading ? "Menghapus..." : "Hapus Denda"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default DeleteFineLogModal;
