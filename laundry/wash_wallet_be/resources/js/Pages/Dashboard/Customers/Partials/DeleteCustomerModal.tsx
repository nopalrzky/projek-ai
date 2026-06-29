import React from "react";
import { Modal } from "@/Components/Modal";
import { Button } from "@/Components/Button";
import { Alert } from "@/Components/Alert";
import {
    AlertTriangle,
    User,
    Phone,
    Mail,
    Building2,
    ShoppingBag,
} from "lucide-react";
import { DeleteCustomerModalProps } from "../types";

const DeleteCustomerModal: React.FC<DeleteCustomerModalProps> = ({
    isOpen,
    customer,
    onClose,
    onConfirm,
    isLoading = false,
}) => {
    if (!customer) return null;

    const handleConfirm = () => {
        onConfirm(customer);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Hapus Customer"
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
                    description="Tindakan ini akan menghapus customer secara soft delete. Data dapat dipulihkan jika diperlukan."
                    icon={<AlertTriangle className="w-5 h-5" />}
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
                            <User
                                className="w-5 h-5"
                                style={{ color: "var(--color-warning-600)" }}
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4
                                className="font-medium"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                {customer.name}
                            </h4>

                            <div className="space-y-2 mt-2">
                                {customer.phone && (
                                    <div className="flex items-center gap-2">
                                        <Phone
                                            className="w-4 h-4 flex-shrink-0"
                                            style={{
                                                color: "var(--color-text-tertiary)",
                                            }}
                                        />
                                        <p
                                            className="text-sm"
                                            style={{
                                                color: "var(--color-text-secondary)",
                                            }}
                                        >
                                            {customer.phone}
                                        </p>
                                    </div>
                                )}

                                {customer.email && (
                                    <div className="flex items-center gap-2">
                                        <Mail
                                            className="w-4 h-4 flex-shrink-0"
                                            style={{
                                                color: "var(--color-text-tertiary)",
                                            }}
                                        />
                                        <p
                                            className="text-sm truncate"
                                            style={{
                                                color: "var(--color-text-secondary)",
                                            }}
                                        >
                                            {customer.email}
                                        </p>
                                    </div>
                                )}

                                {customer.outlet && (
                                    <div className="flex items-center gap-2">
                                        <Building2
                                            className="w-4 h-4 flex-shrink-0"
                                            style={{
                                                color: "var(--color-text-tertiary)",
                                            }}
                                        />
                                        <p
                                            className="text-sm"
                                            style={{
                                                color: "var(--color-text-secondary)",
                                            }}
                                        >
                                            {customer.outlet.name} (
                                            {customer.outlet.code})
                                        </p>
                                    </div>
                                )}

                                <div
                                    className="flex items-center gap-4 pt-2 border-t"
                                    style={{
                                        borderColor: "var(--color-border)",
                                    }}
                                >
                                    {customer.gender && (
                                        <p
                                            className="text-xs"
                                            style={{
                                                color: "var(--color-text-tertiary)",
                                            }}
                                        >
                                            {customer.gender === "male"
                                                ? "Laki-laki"
                                                : customer.gender === "female"
                                                  ? "Perempuan"
                                                  : "Lainnya"}
                                        </p>
                                    )}
                                    <span
                                        className="w-1 h-1 rounded-full"
                                        style={{
                                            backgroundColor:
                                                "var(--color-text-tertiary)",
                                        }}
                                    />
                                    <p
                                        className="text-xs"
                                        style={{
                                            color: "var(--color-text-tertiary)",
                                        }}
                                    >
                                        Status:{" "}
                                        {customer.isActive
                                            ? "Aktif"
                                            : "Nonaktif"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {customer.ordersCount !== undefined &&
                    customer.ordersCount > 0 && (
                        <Alert
                            variant="info"
                            title="Informasi Pesanan"
                            description={`Customer ini memiliki ${customer.ordersCount} pesanan terkait. Data pesanan akan tetap tersimpan setelah penghapusan customer.`}
                            icon={<ShoppingBag className="w-5 h-5" />}
                        />
                    )}

                <div
                    className="p-4 rounded-lg border"
                    style={{
                        backgroundColor: "var(--color-surface-secondary)",
                        borderColor: "var(--color-border)",
                    }}
                >
                    <p
                        className="text-sm"
                        style={{ color: "var(--color-text-secondary)" }}
                    >
                        Apakah Anda yakin ingin menghapus customer{" "}
                        <span
                            className="font-semibold"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            "{customer.name}"
                        </span>
                        ? Data dapat dipulihkan jika diperlukan.
                    </p>
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
                        {isLoading ? "Menghapus..." : "Hapus Customer"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default DeleteCustomerModal;
