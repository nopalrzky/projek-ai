import React from "react";
import { Modal } from "@/Components/Modal";
import { Button } from "@/Components/Button";
import { Alert } from "@/Components/Alert";
import { Package } from "lucide-react";
import { OutletServicePackageDeleteModalProps } from "../types";

const DeleteServicePackageModal: React.FC<
    OutletServicePackageDeleteModalProps
> = ({ isOpen, servicePackage, onClose, onConfirm, isLoading = false }) => {
    if (!servicePackage) return null;

    const handleConfirm = () => {
        onConfirm(servicePackage);
    };

    const hasSubscriptions =
        (servicePackage.customerSubscriptionsCount || 0) > 0;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Hapus Paket Layanan"
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
                    description="Tindakan ini tidak dapat dibatalkan. Paket layanan yang dihapus akan hilang permanen."
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
                            <Package
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
                                {servicePackage.name}
                            </h4>
                            {servicePackage.outlet && (
                                <p
                                    className="text-sm mt-1"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Outlet: {servicePackage.outlet.name} (
                                    {servicePackage.outlet.code})
                                </p>
                            )}
                            {servicePackage.description && (
                                <p
                                    className="text-sm mt-1 line-clamp-2"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    {servicePackage.description}
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
                                            color: servicePackage.isActive
                                                ? "var(--color-success-600)"
                                                : "var(--color-error-600)",
                                        }}
                                    >
                                        {servicePackage.isActive
                                            ? "Aktif"
                                            : "Nonaktif"}
                                    </span>
                                </p>
                                {servicePackage.price && (
                                    <p
                                        className="text-xs"
                                        style={{
                                            color: "var(--color-text-tertiary)",
                                        }}
                                    >
                                        Harga:{" "}
                                        <span className="font-medium">
                                            Rp{" "}
                                            {servicePackage.price.toLocaleString(
                                                "id-ID",
                                            )}
                                        </span>
                                    </p>
                                )}
                                {servicePackage.servicePackageItemsCount !==
                                    undefined && (
                                    <p
                                        className="text-xs"
                                        style={{
                                            color: "var(--color-text-tertiary)",
                                        }}
                                    >
                                        Item:{" "}
                                        {
                                            servicePackage.servicePackageItemsCount
                                        }
                                    </p>
                                )}
                                {hasSubscriptions && (
                                    <p
                                        className="text-xs"
                                        style={{
                                            color: "var(--color-text-tertiary)",
                                        }}
                                    >
                                        Langganan:{" "}
                                        {
                                            servicePackage.customerSubscriptionsCount
                                        }
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                {hasSubscriptions && (
                    <Alert
                        variant="error"
                        title="Perhatian!"
                        description={`Paket ini memiliki ${servicePackage.customerSubscriptionsCount} langganan aktif. Pastikan Anda telah menyelesaikan atau memindahkan langganan tersebut terlebih dahulu.`}
                    />
                )}

                <div
                    className="text-sm"
                    style={{ color: "var(--color-text-secondary)" }}
                >
                    Apakah Anda yakin ingin menghapus paket layanan{" "}
                    <span
                        className="font-semibold"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        "{servicePackage.name}"
                    </span>
                    ?{" "}
                    {hasSubscriptions && (
                        <span style={{ color: "var(--color-error-600)" }}>
                            Paket ini memiliki{" "}
                            {servicePackage.customerSubscriptionsCount}{" "}
                            langganan yang akan terpengaruh.
                        </span>
                    )}
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
                        disabled={isLoading || hasSubscriptions}
                    >
                        {isLoading ? "Menghapus..." : "Hapus Paket"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default DeleteServicePackageModal;
