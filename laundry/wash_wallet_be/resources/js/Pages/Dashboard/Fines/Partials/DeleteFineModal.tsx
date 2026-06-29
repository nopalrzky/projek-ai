import React from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import { Modal } from "@/Components/Modal";
import { Button } from "@/Components/Button";
import { Alert } from "@/Components/Alert";
import { formatCurrency } from "@/lib/utils";
import { DeleteFineModalProps } from "../types";

const DeleteFineModal: React.FC<DeleteFineModalProps> = ({
    isOpen,
    fine,
    onClose,
    onConfirm,
    isLoading,
}) => {
    const handleConfirm = () => {
        if (fine && !isLoading) {
            onConfirm(fine);
        }
    };

    const hasLogs = (fine?.fineLogsCount ?? 0) > 0;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Hapus Jenis Denda"
            size="md"
            variant="danger"
            loading={isLoading}
            preventClose={isLoading}
            closeOnOverlayClick={!isLoading}
            closeOnEscape={!isLoading}
        >
            {fine && (
                <div className="space-y-4">
                    <Alert
                        variant={hasLogs ? "warning" : "error"}
                        title={hasLogs ? "Tidak dapat menghapus" : "Peringatan"}
                        description={
                            hasLogs
                                ? `Denda ini tidak dapat dihapus karena sudah digunakan dalam ${fine.fineLogsCount} catatan penerapan denda.`
                                : "Tindakan ini akan menghapus data jenis denda secara permanen dan tidak dapat dibatalkan."
                        }
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
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Nama Denda
                                </span>
                                <span
                                    className="font-medium"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {fine.name}
                                </span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span
                                    className="text-sm"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Nominal
                                </span>
                                <span
                                    className="text-lg font-bold"
                                    style={{ color: "var(--color-error-600)" }}
                                >
                                    {formatCurrency(fine.amount)}
                                </span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span
                                    className="text-sm"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Jumlah Penggunaan
                                </span>
                                <span
                                    className="font-medium"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {fine.fineLogsCount} kali
                                </span>
                            </div>
                        </div>
                    </div>

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
                            disabled={hasLogs || isLoading}
                            loading={isLoading}
                            leftIcon={<Trash2 className="w-4 h-4" />}
                        >
                            {isLoading ? "Menghapus..." : "Hapus"}
                        </Button>
                    </div>
                </div>
            )}
        </Modal>
    );
};

export default DeleteFineModal;
