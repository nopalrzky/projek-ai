import React from "react";
import { Modal } from "@/Components/Modal";
import { Button } from "@/Components/Button";
import { Alert } from "@/Components/Alert";
import { DeletePettyCashModalProps } from "../types";
import { Trash, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const DeletePettyCashModal: React.FC<DeletePettyCashModalProps> = ({
    isOpen,
    pettyCash,
    onClose,
    onConfirm,
    isLoading = false,
}) => {
    if (!pettyCash) return null;

    const handleConfirm = () => {
        if (!isLoading) {
            onConfirm();
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Hapus Permintaan Kas Kecil"
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
                    description="Tindakan ini akan menghapus data permintaan kas kecil secara permanen dan tidak dapat dibatalkan."
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
                                Kode Permintaan
                            </span>
                            <span
                                className="font-medium"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                {pettyCash.code}
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
                                {pettyCash.outlet?.name}
                            </span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span
                                className="text-sm"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                Kasir
                            </span>
                            <span
                                className="font-medium"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                {pettyCash.cashier?.name}
                            </span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span
                                className="text-sm"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                Status
                            </span>
                            <span
                                className="font-medium capitalize"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                {pettyCash.status === "pending"
                                    ? "Menunggu"
                                    : pettyCash.status === "approved"
                                      ? "Disetujui"
                                      : "Ditolak"}
                            </span>
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
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {formatCurrency(pettyCash.amount)}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <span
                                className="text-sm"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                Deskripsi
                            </span>
                            <p
                                className="text-sm"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                {pettyCash.description}
                            </p>
                        </div>
                    </div>
                </div>

                <p
                    className="text-sm"
                    style={{ color: "var(--color-text-secondary)" }}
                >
                    Yakin ingin menghapus permintaan kas kecil ini? Data yang
                    sudah dihapus tidak dapat dikembalikan.
                </p>
            </div>

            <div className="flex justify-end gap-2 mt-6">
                <Button variant="ghost" onClick={onClose} disabled={isLoading}>
                    Batal
                </Button>
                <Button
                    variant="danger"
                    onClick={handleConfirm}
                    disabled={isLoading}
                    loading={isLoading}
                >
                    <Trash className="w-4 h-4 mr-2" />
                    Ya, Hapus
                </Button>
            </div>
        </Modal>
    );
};

export default DeletePettyCashModal;
