import React from "react";
import { Modal } from "@/Components/Modal";
import { Button } from "@/Components/Button";
import { Alert } from "@/Components/Alert";
import { UserPlus } from "lucide-react";
import { DeletePositionModalProps } from "../types";

const DeletePositionModal: React.FC<DeletePositionModalProps> = ({
    isOpen,
    position,
    onClose,
    onConfirm,
    isLoading = false,
}) => {
    if (!position) return null;

    const handleConfirm = () => {
        onConfirm(position);
    };

    const hasEmployees = (position.employeesCount || 0) > 0;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Hapus Posisi"
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
                    description="Tindakan ini tidak dapat dibatalkan. Posisi yang dihapus akan hilang permanen."
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
                            <UserPlus
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
                                {position.name}
                            </h4>
                            {position.outlet && (
                                <p
                                    className="text-sm mt-1"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Outlet: {position.outlet.name} (
                                    {position.outlet.code})
                                </p>
                            )}
                            {position.description && (
                                <p
                                    className="text-sm mt-1 line-clamp-2"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    {position.description}
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
                                            color: position.isActive
                                                ? "var(--color-success-600)"
                                                : "var(--color-error-600)",
                                        }}
                                    >
                                        {position.isActive
                                            ? "Aktif"
                                            : "Nonaktif"}
                                    </span>
                                </p>
                                {hasEmployees && (
                                    <p
                                        className="text-xs"
                                        style={{
                                            color: "var(--color-text-tertiary)",
                                        }}
                                    >
                                        Karyawan: {position.employeesCount}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {hasEmployees && (
                    <Alert
                        variant="error"
                        title="Perhatian!"
                        description={`Posisi ini memiliki ${position.employeesCount} karyawan terkait. Pastikan Anda telah memindahkan atau menghapus karyawan tersebut terlebih dahulu.`}
                    />
                )}

                <div
                    className="text-sm"
                    style={{ color: "var(--color-text-secondary)" }}
                >
                    Apakah Anda yakin ingin menghapus posisi{" "}
                    <span
                        className="font-semibold"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        "{position.name}"
                    </span>
                    ?{" "}
                    {hasEmployees && (
                        <span style={{ color: "var(--color-error-600)" }}>
                            Posisi ini memiliki {position.employeesCount}{" "}
                            karyawan terkait yang akan terpengaruh.
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
                        disabled={isLoading || hasEmployees}
                    >
                        {isLoading ? "Menghapus..." : "Hapus Posisi"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default DeletePositionModal;
