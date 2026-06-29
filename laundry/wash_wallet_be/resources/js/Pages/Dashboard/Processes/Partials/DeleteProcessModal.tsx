import React from "react";
import { Modal } from "@/Components/Modal";
import { Button } from "@/Components/Button";
import { Alert } from "@/Components/Alert";
import { Cog } from "lucide-react";
import { DeleteProcessModalProps } from "../types";

const DeleteProcessModal: React.FC<DeleteProcessModalProps> = ({
    isOpen,
    process,
    onClose,
    onConfirm,
    isLoading = false,
}) => {
    if (!process) return null;

    const handleConfirm = () => {
        if (!isLoading) {
            onConfirm();
        }
    };

    const hasRelations =
        (process.laundryServicesCount && process.laundryServicesCount > 0) ||
        (process.employeesCount && process.employeesCount > 0);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Hapus Proses"
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
                    description="Tindakan ini tidak dapat dibatalkan. Proses yang dihapus akan hilang permanen."
                />

                {/* Process Info */}
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
                            <Cog
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
                                {process.name}
                            </h4>
                            {process.description && (
                                <p
                                    className="text-sm mt-1 line-clamp-2"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    {process.description}
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
                                            color: process.isActive
                                                ? "var(--color-success-600)"
                                                : "var(--color-error-600)",
                                        }}
                                    >
                                        {process.isActive
                                            ? "Aktif"
                                            : "Nonaktif"}
                                    </span>
                                </p>
                                {process.laundryServicesCount &&
                                    process.laundryServicesCount > 0 && (
                                        <p
                                            className="text-xs"
                                            style={{
                                                color: "var(--color-text-tertiary)",
                                            }}
                                        >
                                            Layanan:{" "}
                                            {process.laundryServicesCount}
                                        </p>
                                    )}
                                {process.employeesCount &&
                                    process.employeesCount > 0 && (
                                        <p
                                            className="text-xs"
                                            style={{
                                                color: "var(--color-text-tertiary)",
                                            }}
                                        >
                                            Karyawan: {process.employeesCount}
                                        </p>
                                    )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Relations Warning */}
                {hasRelations && (
                    <Alert
                        variant="error"
                        title="Perhatian!"
                        description={`Proses ini memiliki ${
                            process.laundryServicesCount || 0
                        } layanan dan ${
                            process.employeesCount || 0
                        } karyawan terkait. Pastikan Anda telah memindahkan atau menghapus relasi tersebut terlebih dahulu.`}
                    />
                )}

                {/* Confirmation Text */}
                <div
                    className="text-sm"
                    style={{ color: "var(--color-text-secondary)" }}
                >
                    Apakah Anda yakin ingin menghapus proses{" "}
                    <span
                        className="font-semibold"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        "{process.name}"
                    </span>
                    ?{" "}
                    {hasRelations && (
                        <span style={{ color: "var(--color-error-600)" }}>
                            Proses ini memiliki layanan dan karyawan terkait
                            yang akan terpengaruh.
                        </span>
                    )}
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
                        {isLoading ? "Menghapus..." : "Hapus Proses"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default DeleteProcessModal;
