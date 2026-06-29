import React from "react";
import { Modal } from "@/Components/Modal";
import { Button } from "@/Components/Button";
import { Alert } from "@/Components/Alert";
import { Badge } from "@/Components/Badge";
import { Package, AlertTriangle, TrendingUp, Layers } from "lucide-react";
import { LaundryService } from "@/types";

interface DeleteLaundryServiceModalProps {
    isOpen: boolean;
    laundryService: LaundryService | null;
    categoryName?: string;
    onClose: () => void;
    onConfirm: (service: LaundryService) => void;
    isLoading?: boolean;
}

const DeleteLaundryServiceModal: React.FC<DeleteLaundryServiceModalProps> = ({
    isOpen,
    laundryService,
    categoryName,
    onClose,
    onConfirm,
    isLoading = false,
}) => {
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
            loading={isLoading}
            preventClose={isLoading}
            closeOnOverlayClick={!isLoading}
            closeOnEscape={!isLoading}
        >
            <div className="space-y-4">
                {/* Warning Alert */}
                <Alert
                    variant="warning"
                    title="Peringatan"
                    description="Tindakan ini tidak dapat dibatalkan. Layanan yang dihapus akan hilang permanen dari kategori."
                />

                {/* Laundry Service Info */}
                <div
                    className="p-4 rounded-lg border"
                    style={{
                        backgroundColor: "var(--color-surface-secondary)",
                        borderColor: "var(--color-border)",
                    }}
                >
                    <div className="flex items-start gap-3">
                        <div
                            className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{
                                backgroundColor: "var(--color-warning-100)",
                            }}
                        >
                            <Package
                                className="w-6 h-6"
                                style={{
                                    color: "var(--color-warning-600)",
                                }}
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4
                                className="font-semibold text-lg"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                {laundryService.name}
                            </h4>

                            {/* Category */}
                            {(categoryName || laundryService.category) && (
                                <div className="flex items-center gap-2 mt-1">
                                    <Layers
                                        className="w-3.5 h-3.5"
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
                                        Kategori:{" "}
                                        {categoryName ||
                                            laundryService.category?.name}
                                    </p>
                                </div>
                            )}

                            {/* Description */}
                            {laundryService.description && (
                                <p
                                    className="text-sm mt-2 line-clamp-2"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    {laundryService.description}
                                </p>
                            )}

                            {/* Info Row */}
                            <div className="flex flex-wrap items-center gap-3 mt-3">
                                {/* Unit */}
                                {laundryService.unit && (
                                    <Badge variant="secondary" size="sm">
                                        {laundryService.unit.symbol} -{" "}
                                        {laundryService.unit.name}
                                    </Badge>
                                )}

                                {/* Status */}
                                <Badge
                                    variant={
                                        laundryService.isActive
                                            ? "success"
                                            : "secondary"
                                    }
                                    size="sm"
                                >
                                    {laundryService.isActive
                                        ? "Aktif"
                                        : "Nonaktif"}
                                </Badge>

                                {/* Variants Count */}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Information */}
                <div
                    className="p-4 rounded-lg border"
                    style={{
                        backgroundColor: "var(--color-info-50)",
                        borderColor: "var(--color-info-200)",
                    }}
                >
                    <div className="flex items-start gap-3">
                        <div
                            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                            style={{
                                backgroundColor: "var(--color-info-100)",
                            }}
                        >
                            <AlertTriangle
                                className="w-4 h-4"
                                style={{
                                    color: "var(--color-info-600)",
                                }}
                            />
                        </div>
                        <div>
                            <h4
                                className="text-sm font-semibold mb-1"
                                style={{
                                    color: "var(--color-info-700)",
                                }}
                            >
                                Yang Akan Terjadi:
                            </h4>
                            <ul
                                className="text-xs space-y-1"
                                style={{
                                    color: "var(--color-info-600)",
                                }}
                            >
                                <li>
                                    • Layanan akan dihapus permanen dari
                                    kategori
                                </li>

                                <li>
                                    • Data historis transaksi lama tetap
                                    tersimpan
                                </li>
                                <li>
                                    • Layanan tidak dapat dipulihkan setelah
                                    dihapus
                                </li>
                                <li>
                                    • Transaksi baru tidak dapat menggunakan
                                    layanan ini
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Confirmation Text */}
                <div
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--color-text-secondary)" }}
                >
                    Apakah Anda yakin ingin menghapus layanan{" "}
                    <span
                        className="font-semibold"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        "{laundryService.name}"
                    </span>{" "}
                    dari kategori{" "}
                    <span
                        className="font-semibold"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        "{categoryName || laundryService.category?.name}"
                    </span>
                    ?
                </div>

                {/* Action Buttons */}
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
