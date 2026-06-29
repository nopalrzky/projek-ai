import React from "react";
import { Modal } from "@/Components/Modal";
import { Button } from "@/Components/Button";
import { Alert } from "@/Components/Alert";
import { Badge } from "@/Components/Badge";
import { AlertTriangle, Trash2 } from "lucide-react";
import { DeleteSettingModalProps } from "../types";

const DeleteSettingModal: React.FC<DeleteSettingModalProps> = ({
    isOpen,
    setting,
    onClose,
    onConfirm,
    isLoading = false,
}) => {
    if (!setting) return null;

    const handleClose = () => {
        if (!isLoading) {
            onClose();
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Hapus Pengaturan"
            size="md"
            variant="danger"
            loading={isLoading}
            preventClose={isLoading}
            closeOnOverlayClick={!isLoading}
            closeOnEscape={!isLoading}
        >
            <div className="space-y-4">
                <Alert
                    variant="warning"
                    icon={<AlertTriangle />}
                    title="Konfirmasi Penghapusan"
                    description="Pastikan Anda benar-benar ingin menghapus pengaturan ini. Outlet yang menggunakan setting ini akan kehilangan nilainya."
                />

                <div
                    className="p-4 rounded-lg border"
                    style={{ borderColor: "var(--color-border)" }}
                >
                    <div className="space-y-3">
                        <div>
                            <p
                                className="text-xs font-semibold mb-1"
                                style={{ color: "var(--color-text-tertiary)" }}
                            >
                                KEY
                            </p>
                            <Badge
                                variant="outline"
                                className="font-mono"
                                style={{ borderColor: "var(--color-border)" }}
                            >
                                {setting.key}
                            </Badge>
                        </div>

                        {setting.name && (
                            <div>
                                <p
                                    className="text-xs font-semibold mb-1"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    NAMA
                                </p>
                                <p
                                    className="text-sm"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {setting.name}
                                </p>
                            </div>
                        )}

                        {setting.description && (
                            <div>
                                <p
                                    className="text-xs font-semibold mb-1"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    DESKRIPSI
                                </p>
                                <p
                                    className="text-sm"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    {setting.description}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4">
                    <Button
                        variant="ghost"
                        onClick={handleClose}
                        disabled={isLoading}
                    >
                        Batal
                    </Button>
                    <Button
                        variant="danger"
                        leftIcon={<Trash2 className="w-4 h-4" />}
                        loading={isLoading}
                        onClick={() => onConfirm(setting)}
                        disabled={isLoading}
                    >
                        {isLoading ? "Menghapus..." : "Hapus Pengaturan"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default DeleteSettingModal;
