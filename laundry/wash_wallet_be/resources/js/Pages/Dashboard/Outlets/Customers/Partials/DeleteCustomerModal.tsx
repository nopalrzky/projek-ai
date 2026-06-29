import React from "react";
import { Modal } from "@/Components/Modal";
import { Button } from "@/Components/Button";
import { Alert } from "@/Components/Alert";
import { AlertTriangle, Users, Phone, MapPin } from "lucide-react";
import { DeleteCustomerModalProps } from "../types";

const DeleteCustomerModal: React.FC<DeleteCustomerModalProps> = ({
    isOpen,
    customer,
    onClose,
    onConfirm,
    isLoading,
}) => {
    if (!customer) return null;

    const handleConfirm = () => {
        onConfirm(customer);
    };

    const hasOrders = (customer.ordersCount || 0) > 0;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Hapus Pelanggan"
            className="max-w-md"
        >
            <div className="space-y-4">
                {/* Warning Alert */}
                <Alert
                    variant={hasOrders ? "error" : "warning"}
                    title={hasOrders ? "Tidak Dapat Dihapus" : "Peringatan"}
                    description={
                        hasOrders
                            ? "Pelanggan ini memiliki riwayat pesanan dan tidak dapat dihapus."
                            : "Tindakan ini tidak dapat dibatalkan. Pelanggan yang dihapus akan hilang permanen."
                    }
                    icon={<AlertTriangle className="w-5 h-5" />}
                />

                {/* Customer Info */}
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
                                backgroundColor: "var(--color-primary-100)",
                            }}
                        >
                            <Users
                                className="w-5 h-5"
                                style={{
                                    color: "var(--color-primary-600)",
                                }}
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4
                                className="font-medium"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                             {customer.name}
                            </h4>

                            {customer.phone && (
                                <div
                                    className="flex items-center gap-2 text-sm mt-1"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    <Phone className="w-3 h-3" />
                                    {customer.phone}
                                </div>
                            )}

                            {customer.address && (
                                <div
                                    className="flex items-start gap-2 text-sm mt-1"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    <MapPin className="w-3 h-3 mt-0.5" />
                                    <span className="line-clamp-2">
                                        {customer.address}
                                    </span>
                                </div>
                            )}

                            {hasOrders && (
                                <div
                                    className="text-sm mt-2 px-2 py-1 rounded"
                                    style={{
                                        backgroundColor:
                                            "var(--color-error-100)",
                                        color: "var(--color-error-700)",
                                    }}
                                >
                                    {customer.ordersCount} pesanan terdaftar
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Confirmation Text */}
                {!hasOrders && (
                    <div
                        className="text-sm"
                        style={{ color: "var(--color-text-secondary)" }}
                    >
                        Apakah Anda yakin ingin menghapus pelanggan{" "}
                        <span
                            className="font-medium"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            "{customer.name}"
                        </span>
                        ?
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        {hasOrders ? "Tutup" : "Batal"}
                    </Button>
                    {!hasOrders && (
                        <Button
                            variant="danger"
                            onClick={handleConfirm}
                            loading={isLoading}
                            disabled={isLoading}
                        >
                            {isLoading ? "Menghapus..." : "Hapus Pelanggan"}
                        </Button>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default DeleteCustomerModal;
