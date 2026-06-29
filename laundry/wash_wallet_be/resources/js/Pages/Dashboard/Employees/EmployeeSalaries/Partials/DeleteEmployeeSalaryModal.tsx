import React from "react";
import { Modal } from "@/Components/Modal";
import { Alert } from "@/Components/Alert";
import { Button } from "@/Components/Button";
import { AlertTriangle, DollarSign, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { DeleteEmployeeSalaryModalProps } from "../types";

const getSalaryTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
        monthly: "Bulanan",
        daily: "Harian",
        hourly: "Per Jam",
        once: "Sekali",
        overtime: "Lembur",
        allowance: "Tunjangan",
    };
    return labels[type] || type;
};

const DeleteEmployeeSalaryModal: React.FC<DeleteEmployeeSalaryModalProps> = ({
    isOpen,
    employeeSalary,
    employee,
    onClose,
    onConfirm,
    isLoading = false,
}) => {
    if (!employeeSalary) return null;

    const handleConfirm = () => {
        onConfirm(employeeSalary);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Hapus Komponen Gaji"
            className="max-w-md"
        >
            <div className="space-y-4">
                {/* Warning Alert */}
                <Alert
                    variant="warning"
                    title="Peringatan"
                    description="Tindakan ini tidak dapat dibatalkan. Menghapus komponen gaji akan mempengaruhi perhitungan total gaji karyawan."
                    icon={<AlertTriangle className="w-5 h-5" />}
                />

                {/* Salary Info */}
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
                            <DollarSign
                                className="w-5 h-5"
                                style={{ color: "var(--color-primary-600)" }}
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4
                                className="font-medium"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                {employeeSalary.salary?.name}
                            </h4>

                            {employeeSalary.salary?.description && (
                                <div
                                    className="text-sm mt-1"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    {employeeSalary.salary.description}
                                </div>
                            )}

                            <div className="flex items-center gap-4 mt-2">
                                <div
                                    className="text-sm"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Jumlah:{" "}
                                    <span
                                        className="font-medium"
                                        style={{
                                            color: "var(--color-text-primary)",
                                        }}
                                    >
                                        {formatCurrency(
                                            employeeSalary.amount || 0,
                                        )}
                                    </span>
                                </div>
                                <div
                                    className="text-sm"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Tipe:{" "}
                                    <span
                                        className="font-medium"
                                        style={{
                                            color: "var(--color-text-primary)",
                                        }}
                                    >
                                        {getSalaryTypeLabel(
                                            employeeSalary.salary?.type || "",
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Confirmation Text */}
                <div
                    className="text-sm"
                    style={{ color: "var(--color-text-secondary)" }}
                >
                    Apakah Anda yakin ingin menghapus komponen gaji{" "}
                    <span
                        className="font-medium"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        "{employeeSalary.salary?.name}"
                    </span>{" "}
                    dari{" "}
                    <span
                        className="font-medium"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        {employee.name}
                    </span>
                    ?
                </div>

                {/* Action Buttons */}
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
                        loading={isLoading}
                        disabled={isLoading}
                        leftIcon={<Trash2 className="w-4 h-4" />}
                    >
                        {isLoading ? "Menghapus..." : "Hapus Gaji"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default DeleteEmployeeSalaryModal;
