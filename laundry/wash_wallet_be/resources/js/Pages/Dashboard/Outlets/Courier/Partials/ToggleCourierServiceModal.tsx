import React from "react";
import { Modal } from "@/Components/Modal";
import { Button } from "@/Components/Button";
import { Alert } from "@/Components/Alert";

interface ToggleCourierServiceModalProps {
    isOpen: boolean;
    service?: any;
    onClose: () => void;
    onConfirm: (service: any) => void;
    isLoading?: boolean;
}

const ToggleCourierServiceModal: React.FC<ToggleCourierServiceModalProps> = ({
    isOpen,
    service,
    onClose,
    onConfirm,
    isLoading = false,
}) => {
    if (!service) return null;

    const activating = !service.supportsCourier;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={activating ? "Aktifkan Kurir" : "Nonaktifkan Kurir"}
            variant={activating ? "success" : "warning"}
            preventClose={isLoading}
            closeOnOverlayClick={!isLoading}
            closeOnEscape={!isLoading}
        >
            <div className="space-y-4">
                <Alert
                    variant={activating ? "info" : "warning"}
                    title={activating ? "Aktifkan layanan untuk kurir" : "Nonaktifkan layanan untuk kurir"}
                    description={activating ? "Layanan ini akan tersedia untuk diantar/dijemput kurir outlet." : "Layanan ini tidak akan tersedia untuk kurir setelah dinonaktifkan."}
                />

                <div>
                    <h4 className="font-semibold text-text-primary">{service.name}</h4>
                    <div className="text-sm text-text-secondary mt-1">
                        Kategori: {service.category?.name || "-"} • Status: {service.isActive ? "Aktif" : "Nonaktif"}
                    </div>
                </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
                <Button variant="outline" onClick={onClose} disabled={isLoading}>
                    Batal
                </Button>
                <Button variant={activating ? "success" : "warning"} onClick={() => onConfirm(service)} loading={isLoading}>
                    {isLoading ? "Memproses..." : activating ? "Aktifkan Kurir" : "Nonaktifkan Kurir"}
                </Button>
            </div>
        </Modal>
    );
};

export default ToggleCourierServiceModal;
