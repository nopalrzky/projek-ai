import React from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import { Modal } from "@/Components/Modal";
import { Button } from "@/Components/Button";
import { Alert } from "@/Components/Alert";
import { LaundryServiceDeleteModalProps } from "../types";

const DeleteLaundryServiceModal: React.FC<LaundryServiceDeleteModalProps> = ({
    isOpen,
    laundryService,
    onClose,
    onConfirm,
    isLoading,
}) => {
    const handleConfirm = () => {
        if (laundryService && !isLoading) {
            onConfirm(laundryService);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Hapus Layanan Laundry"
            size="md"
            variant="danger"
            preventClose={isLoading}
            closeOnOverlayClick={!isLoading}
            closeOnEscape={!isLoading}
        >
            <div className="p-6 space-y-4">
                <Alert
                    variant="error"
                    title="Peringatan"
                    description="Layanan laundry yang dihapus tidak dapat dikembalikan dan dapat memengaruhi data transaksi terkait."
                    icon={<AlertTriangle className="w-5 h-5" />}
                />

                <div
                    className="p-4 rounded-lg border"
                    style={{
                        backgroundColor: "var(--color-surface-secondary)",
                        borderColor: "var(--color-border)",
                    }}
                >
                    <div className="flex justify-between items-center">
                        <span
                            className="text-sm"
                            style={{ color: "var(--color-text-secondary)" }}
                        >
                            Nama Layanan
                        </span>
                        <span
                            className="font-medium"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            {laundryService?.name ?? "-"}
                        </span>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
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

export default DeleteLaundryServiceModal;
