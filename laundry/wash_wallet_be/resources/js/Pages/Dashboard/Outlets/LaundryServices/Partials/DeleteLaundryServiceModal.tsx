import React from "react";
import { Modal } from "@/Components/Modal";
import { Button } from "@/Components/Button";
import { Alert } from "@/Components/Alert";
import { Shirt } from "lucide-react";
import { OutletLaundryServiceDeleteModalProps } from "../types";

const DeleteLaundryServiceModal: React.FC<
    OutletLaundryServiceDeleteModalProps
> = ({ isOpen, laundryService, onClose, onConfirm, isLoading = false }) => {
    if (!laundryService) return null;

    const handleConfirm = () => {
        onConfirm(laundryService);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Hapus Layanan Laundry"
            size="md"
            variant="danger"
            loading={false}
            preventClose={isLoading}
            closeOnOverlayClick={!isLoading}
            closeOnEscape={!isLoading}
        >
            <div className="space-y-4">
                <Alert
                    variant="warning"
                    title="Peringatan"
                    description="Tindakan ini tidak dapat dibatalkan. Layanan yang dihapus akan hilang permanen."
                />

                <div
                    className="p-4 rounded-lg border"
                    style={{
                        backgroundColor: "var(--color-surface-secondary)",
                        borderColor: "var(--color-border)",
                    }}
                >
                    <div className="flex items-start gap-3">
                        <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{
                                backgroundColor: "var(--color-warning-100)",
                            }}
                        >
                            <Shirt
                                className="w-5 h-5"
                                style={{
                                    color: "var(--color-warning-600)",
                                }}
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4
                                className="font-medium"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                {laundryService.name}
                            </h4>
                            {laundryService.outlet && (
                                <p
                                    className="text-sm mt-1"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Outlet: {laundryService.outlet.name} (
                                    {laundryService.outlet.code})
                                </p>
                            )}
                            {laundryService.category && (
                                <p
                                    className="text-sm mt-1"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Kategori: {laundryService.category.name}
                                </p>
                            )}
                            {laundryService.description && (
                                <p
                                    className="text-sm mt-1 line-clamp-2"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    {laundryService.description}
                                </p>
                            )}
                            <div className="flex items-center gap-3 mt-2">
                                <p
                                    className="text-xs"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    Status:{" "}
                                    <span
                                        className="font-medium"
                                        style={{
                                            color: laundryService.isActive
                                                ? "var(--color-success-600)"
                                                : "var(--color-error-600)",
                                        }}
                                    >
                                        {laundryService.isActive
                                            ? "Aktif"
                                            : "Nonaktif"}
                                    </span>
                                </p>
                                {laundryService.price && (
                                    <p
                                        className="text-xs"
                                        style={{
                                            color: "var(--color-text-tertiary)",
                                        }}
                                    >
                                        Harga:{" "}
                                        <span className="font-medium">
                                            Rp{" "}
                                            {laundryService.price.toLocaleString(
                                                "id-ID",
                                            )}
                                        </span>
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    className="text-sm"
                    style={{ color: "var(--color-text-secondary)" }}
                >
                    Apakah Anda yakin ingin menghapus layanan laundry{" "}
                    <span
                        className="font-semibold"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        "{laundryService.name}"
                    </span>
                    ?
                </div>

                <div
                    className="flex items-center justify-end gap-3 pt-4 border-t"
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
                        loading={isLoading}
                        disabled={isLoading}
                    >
                        {isLoading ? "Menghapus..." : "Hapus Layanan"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default DeleteLaundryServiceModal;
