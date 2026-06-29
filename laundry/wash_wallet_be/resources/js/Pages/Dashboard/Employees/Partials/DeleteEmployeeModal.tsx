import React from "react";
import { Modal } from "@/Components/Modal";
import { Button } from "@/Components/Button";
import { Alert } from "@/Components/Alert";
import { Badge } from "@/Components/Badge";
import { AlertTriangle, Trash2, User } from "lucide-react";
import { DeleteEmployeeModalProps } from "../types";
import { formatDate, resolveStorageUrl } from "@/lib/utils";

const DeleteEmployeeModal: React.FC<DeleteEmployeeModalProps> = ({
    isOpen,
    employee,
    onClose,
    onConfirm,
    isLoading = false,
}) => {
    if (!employee) return null;

    const handleConfirm = () => {
        onConfirm(employee);
    };

    const avatarUrl = resolveStorageUrl(employee.avatar);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Hapus Karyawan"
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
                    description="Tindakan ini akan menghapus data karyawan secara permanen dan tidak dapat dibatalkan."
                    icon={<AlertTriangle className="w-5 h-5" />}
                />

                <div
                    className="p-4 rounded-lg border"
                    style={{
                        backgroundColor: "var(--color-surface-secondary)",
                        borderColor: "var(--color-border)",
                    }}
                >
                    <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                            {avatarUrl ? (
                                <img
                                    src={avatarUrl}
                                    alt={employee.name}
                                    className="w-12 h-12 rounded-full object-cover border-2"
                                    style={{
                                        borderColor: "var(--color-border)",
                                    }}
                                />
                            ) : (
                                <div
                                    className="w-12 h-12 rounded-full flex items-center justify-center border-2"
                                    style={{
                                        backgroundColor:
                                            "var(--color-primary-100)",
                                        borderColor: "var(--color-border)",
                                    }}
                                >
                                    <User
                                        className="w-6 h-6"
                                        style={{
                                            color: "var(--color-primary-600)",
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <h4
                                className="font-medium truncate"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                {employee.name}
                            </h4>
                            <p
                                className="text-sm truncate"
                                style={{
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                @{employee.username}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                                <Badge
                                    variant={
                                        employee.isActive
                                            ? "success"
                                            : "secondary"
                                    }
                                    className="text-xs"
                                >
                                    {employee.isActive ? "Aktif" : "Nonaktif"}
                                </Badge>
                                {employee.outlet && (
                                    <Badge
                                        variant="secondary"
                                        className="text-xs"
                                    >
                                        {employee.outlet.name}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    <div
                        className="pt-3 mt-3 border-t"
                        style={{ borderColor: "var(--color-border)" }}
                    >
                        <p
                            className="text-xs"
                            style={{ color: "var(--color-text-tertiary)" }}
                        >
                            Mulai kerja:{" "}
                            {formatDate(employee.startDate, "DD MMMM YYYY")}
                        </p>
                    </div>
                </div>

                <p
                    className="text-sm"
                    style={{ color: "var(--color-text-secondary)" }}
                >
                    Apakah Anda yakin ingin menghapus karyawan{" "}
                    <span
                        className="font-semibold"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        {employee.name}
                    </span>
                    ?
                </p>

                <div className="flex items-center justify-end gap-3 pt-4">
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
                        leftIcon={<Trash2 className="w-4 h-4" />}
                        loading={isLoading}
                        disabled={isLoading}
                    >
                        {isLoading ? "Menghapus..." : "Hapus Karyawan"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default DeleteEmployeeModal;
