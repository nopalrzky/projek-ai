import React from "react";
import { Modal } from "@/Components/Modal";
import { Button } from "@/Components/Button";
import { Alert } from "@/Components/Alert";
import { Users, Phone, MapPin, Clock } from "lucide-react";
import { DeleteEmployeeModalProps } from "../types";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/Components/Badge";

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

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Hapus Karyawan"
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
                    description="Tindakan ini tidak dapat dibatalkan. Karyawan yang dihapus akan hilang permanen."
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
                            className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-semibold flex-shrink-0"
                            style={{
                                backgroundColor: "var(--color-warning-100)",
                                color: "var(--color-warning-600)",
                            }}
                        >
                            {employee.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                                <h4
                                    className="font-medium"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {employee.name}
                                </h4>
                                <Badge
                                    variant={
                                        employee.isActive ? "success" : "error"
                                    }
                                    size="sm"
                                >
                                    {employee.isActive ? "Aktif" : "Nonaktif"}
                                </Badge>
                            </div>
                            <p
                                className="text-sm mb-2"
                                style={{
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                @{employee.username}
                            </p>

                            {employee.outlet && (
                                <p
                                    className="text-sm mb-2"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Outlet: {employee.outlet.name} (
                                    {employee.outlet.code})
                                </p>
                            )}

                            <div className="space-y-1.5 mt-2">
                                {employee.phone && (
                                    <div className="flex items-center gap-2">
                                        <Phone
                                            className="w-3.5 h-3.5"
                                            style={{
                                                color: "var(--color-text-quaternary)",
                                            }}
                                        />
                                        <span
                                            className="text-xs"
                                            style={{
                                                color: "var(--color-text-tertiary)",
                                            }}
                                        >
                                            {employee.phone}
                                        </span>
                                    </div>
                                )}

                                {employee.address && (
                                    <div className="flex items-center gap-2">
                                        <MapPin
                                            className="w-3.5 h-3.5"
                                            style={{
                                                color: "var(--color-text-quaternary)",
                                            }}
                                        />
                                        <span
                                            className="text-xs line-clamp-1"
                                            style={{
                                                color: "var(--color-text-tertiary)",
                                            }}
                                            title={employee.address}
                                        >
                                            {employee.address}
                                        </span>
                                    </div>
                                )}

                                {employee.startDate && (
                                    <div className="flex items-center gap-2">
                                        <Clock
                                            className="w-3.5 h-3.5"
                                            style={{
                                                color: "var(--color-text-quaternary)",
                                            }}
                                        />
                                        <span
                                            className="text-xs"
                                            style={{
                                                color: "var(--color-text-tertiary)",
                                            }}
                                        >
                                            Bergabung{" "}
                                            {formatDate(employee.startDate)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    className="text-sm"
                    style={{ color: "var(--color-text-secondary)" }}
                >
                    Apakah Anda yakin ingin menghapus karyawan{" "}
                    <span
                        className="font-semibold"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        "{employee.name}"
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
                        {isLoading ? "Menghapus..." : "Hapus Karyawan"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default DeleteEmployeeModal;
