import React from "react";
import { Modal } from "@/Components/Modal";
import { Button } from "@/Components/Button";
import { Alert } from "@/Components/Alert";
import { Layers } from "lucide-react";
import { OutletCategoryDeleteModalProps } from "../types";

const DeleteCategoryModal: React.FC<OutletCategoryDeleteModalProps> = ({
    isOpen,
    category,
    onClose,
    onConfirm,
    isLoading = false,
}) => {
    if (!category) return null;

    const handleConfirm = () => {
        onConfirm(category);
    };

    const hasProducts = (category.laundryServicesCount || 0) > 0;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Hapus Kategori"
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
                    description="Tindakan ini tidak dapat dibatalkan. Kategori yang dihapus akan hilang permanen."
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
                            <Layers
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
                                {category.name}
                            </h4>
                            {category.outlet && (
                                <p
                                    className="text-sm mt-1"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Outlet: {category.outlet.name} (
                                    {category.outlet.code})
                                </p>
                            )}
                            {category.description && (
                                <p
                                    className="text-sm mt-1 line-clamp-2"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    {category.description}
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
                                            color: category.isActive
                                                ? "var(--color-success-600)"
                                                : "var(--color-error-600)",
                                        }}
                                    >
                                        {category.isActive
                                            ? "Aktif"
                                            : "Nonaktif"}
                                    </span>
                                </p>
                                {hasProducts && (
                                    <p
                                        className="text-xs"
                                        style={{
                                            color: "var(--color-text-tertiary)",
                                        }}
                                    >
                                        Produk: {category.laundryServicesCount}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {hasProducts && (
                    <Alert
                        variant="error"
                        title="Perhatian!"
                        description={`Kategori ini memiliki ${category.laundryServicesCount} produk terkait. Pastikan Anda telah memindahkan atau menghapus produk tersebut terlebih dahulu.`}
                    />
                )}

                <div
                    className="text-sm"
                    style={{ color: "var(--color-text-secondary)" }}
                >
                    Apakah Anda yakin ingin menghapus kategori{" "}
                    <span
                        className="font-semibold"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        "{category.name}"
                    </span>
                    ?{" "}
                    {hasProducts && (
                        <span style={{ color: "var(--color-error-600)" }}>
                            Kategori ini memiliki{" "}
                            {category.laundryServicesCount} produk terkait yang
                            akan terpengaruh.
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
                        disabled={isLoading || hasProducts}
                    >
                        {isLoading ? "Menghapus..." : "Hapus Kategori"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default DeleteCategoryModal;
