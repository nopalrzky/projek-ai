import React from "react";
import { Modal } from "@/Components/Modal";
import Button from "@/Components/Button/Button";
import { Alert } from "@/Components/Alert";
import Badge from "@/Components/Badge/Badge";
import { Workflow, Trash2, AlertTriangle } from "lucide-react";
import { DeleteEmployeeProcessModalProps } from "../types";
import { formatCurrency } from "@/lib/utils";

const getCommissionTypeLabel = (type?: string) => {
    const labels: Record<string, string> = {
        per_item: "Per Item",
        per_kg: "Per Kg",
        percentage: "Persentase",
        flat: "Nominal Tetap",
    };
    return labels[type || ""] || "-";
};

const DeleteEmployeeProcessModal: React.FC<DeleteEmployeeProcessModalProps> = ({
    isOpen,
    employee,
    employeeProcess,
    onClose,
    onConfirm,
    isLoading,
}) => {
    const handleConfirm = () => {
        if (employeeProcess) {
            onConfirm(employeeProcess);
        }
    };

    if (!employeeProcess) {
        return null;
    }

    const commission = employeeProcess.commission;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Hapus Proses Karyawan"
            size="md"
        >
            <div className="space-y-6">
                <Alert
                    variant="warning"
                    title="Perhatian!"
                    description="Tindakan ini akan menghapus proses beserta komisi yang terkait dari karyawan. Data yang sudah dihapus tidak dapat dikembalikan."
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
                        {/* Employee info */}
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

                        <div
                            className="border-t"
                            style={{ borderColor: "var(--color-border)" }}
                        />

                        {/* Process Info */}
                        <div className="flex items-start gap-3">
                            <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{
                                    backgroundColor: "var(--color-danger-100)",
                                }}
                            >
                                <Workflow
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
                                        {employeeProcess.process?.name ||
                                            "Unknown Process"}
                                    </p>
                                    <Badge
                                        variant={
                                            employeeProcess.isActive
                                                ? "success"
                                                : "secondary"
                                        }
                                        size="sm"
                                    >
                                        {employeeProcess.isActive
                                            ? "Aktif"
                                            : "Tidak Aktif"}
                                    </Badge>
                                </div>

                                {commission ? (
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge variant="info" size="sm">
                                            {getCommissionTypeLabel(
                                                commission.commissionType,
                                            )}
                                        </Badge>
                                        <span
                                            className="text-sm font-medium"
                                            style={{
                                                color: "var(--color-text-secondary)",
                                            }}
                                        >
                                            {commission.commissionType ===
                                            "percentage"
                                                ? `${commission.commissionValue}%`
                                                : formatCurrency(
                                                      commission.commissionValue ||
                                                          0,
                                                  )}
                                        </span>
                                    </div>
                                ) : (
                                    <p
                                        className="text-sm italic"
                                        style={{
                                            color: "var(--color-text-tertiary)",
                                        }}
                                    >
                                        Tidak ada komisi
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3">
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
                        loading={isLoading}
                        disabled={isLoading}
                        leftIcon={<Trash2 className="w-4 h-4" />}
                    >
                        {isLoading ? "Menghapus..." : "Hapus Proses"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default DeleteEmployeeProcessModal;
