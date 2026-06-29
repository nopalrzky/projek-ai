import React from "react";
import { Modal } from "@/Components/Modal";
import Button from "@/Components/Button/Button";
import { Alert } from "@/Components/Alert";
import Badge from "@/Components/Badge/Badge";
import { Briefcase, Trash2, AlertTriangle } from "lucide-react";
import { DeleteEmployeePositionModalProps } from "../types";

const DeleteEmployeePositionModal: React.FC<
    DeleteEmployeePositionModalProps
> = ({ isOpen, employee, employeePosition, onClose, onConfirm, isLoading }) => {
    const handleConfirm = () => {
        if (employeePosition) {
            onConfirm(employeePosition);
        }
    };

    if (!employeePosition) {
        return null;
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Hapus Posisi Karyawan"
            size="md"
        >
            <div className="space-y-6">
                <Alert
                    variant="warning"
                    title="Perhatian!"
                    description="Tindakan ini akan menghapus posisi dari karyawan. Data yang sudah dihapus tidak dapat dikembalikan."
                    icon={<AlertTriangle className="w-5 h-5" />}
                />

                <div
                    className="p-4 rounded-lg"
                    style={{
                        backgroundColor: "var(--color-surface-secondary)",
                        border: "1px solid var(--color-border)",
                    }}
                >
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-full flex items-center justify-center font-semibold"
                                style={{
                                    backgroundColor: "var(--color-primary-100)",
                                    color: "var(--color-primary-600)",
                                }}
                            >
                                {employee.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p
                                    className="font-medium"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {employee.name}
                                </p>
                                <p
                                    className="text-sm"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    @{employee.username}
                                </p>
                            </div>
                        </div>

                        {/* Divider */}
                        <div
                            className="border-t"
                            style={{ borderColor: "var(--color-border)" }}
                        />

                        {/* Position Info */}
                        <div className="flex items-start gap-3">
                            <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{
                                    backgroundColor: "var(--color-danger-100)",
                                }}
                            >
                                <Briefcase
                                    className="w-5 h-5"
                                    style={{
                                        color: "var(--color-danger-600)",
                                    }}
                                />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <p
                                        className="font-semibold"
                                        style={{
                                            color: "var(--color-text-primary)",
                                        }}
                                    >
                                        {employeePosition.position?.name ||
                                            "Unknown Position"}
                                    </p>
                                    <Badge
                                        variant={
                                            employeePosition.isActive
                                                ? "success"
                                                : "secondary"
                                        }
                                        size="sm"
                                    >
                                        {employeePosition.isActive
                                            ? "Aktif"
                                            : "Tidak Aktif"}
                                    </Badge>
                                </div>
                                <p
                                    className="text-sm"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    {employeePosition.position?.description ||
                                        "Tidak ada deskripsi"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Confirmation Message */}
                <div
                    className="p-4 rounded-lg"
                    style={{
                        backgroundColor: "var(--color-danger-50)",
                        border: "1px solid var(--color-danger-200)",
                    }}
                >
                    <p
                        className="text-sm"
                        style={{ color: "var(--color-danger-700)" }}
                    >
                        Apakah Anda yakin ingin menghapus posisi{" "}
                        <strong>{employeePosition.position?.name}</strong> dari
                        karyawan <strong>{employee.name}</strong>?
                    </p>
                </div>

                {/* Actions */}
                <div
                    className="flex items-center justify-end gap-3 pt-4 border-t"
                    style={{ borderColor: "var(--color-border)" }}
                >
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Batal
                    </Button>
                    <Button
                        type="button"
                        variant="danger"
                        onClick={handleConfirm}
                        disabled={isLoading}
                        loading={isLoading}
                        leftIcon={<Trash2 className="w-4 h-4" />}
                    >
                        {isLoading ? "Menghapus..." : "Ya, Hapus"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default DeleteEmployeePositionModal;
