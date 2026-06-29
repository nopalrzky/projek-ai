import React from "react";
import { AlertTriangle, DollarSign, Users, CalendarClock } from "lucide-react";
import { Modal } from "@/Components/Modal";
import { Button } from "@/Components/Button";
import { Alert } from "@/Components/Alert";
import { Badge } from "@/Components/Badge";
import { DeleteSalaryModalProps } from "../types";

const DeleteSalaryModal: React.FC<DeleteSalaryModalProps> = ({
    isOpen,
    salary,
    onClose,
    onConfirm,
    isLoading,
}) => {
    if (!salary) return null;

    const hasEmployees = salary.employeeSalariesCount > 0;

    const typeLabels = {
        daily: "Harian",
        monthly: "Bulanan",
        hourly: "Per Jam",
        once: "Sekali",
        overtime: "Lembur",
        allowance: "Tunjangan",
    };

    const typeVariants = {
        daily: "info" as const,
        monthly: "primary" as const,
        hourly: "warning" as const,
        once: "secondary" as const,
        overtime: "error" as const,
        allowance: "success" as const,
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={isLoading ? () => {} : onClose}
            title="Hapus Komponen Gaji"
            size="md"
            variant="danger"
            closeOnOverlayClick={!isLoading}
            closeOnEscape={!isLoading}
            footer={
                <div className="flex items-center justify-end gap-3">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Batal
                    </Button>
                    <Button
                        variant="danger"
                        onClick={onConfirm}
                        disabled={hasEmployees || isLoading}
                        loading={isLoading}
                        leftIcon={<AlertTriangle className="w-4 h-4" />}
                    >
                        Ya, Hapus Komponen
                    </Button>
                </div>
            }
        >
            <div className="space-y-4">
                {/* Salary Component Info */}
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-start space-x-3">
                        <div
                            className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center"
                            style={{
                                backgroundColor: "var(--color-primary-100)",
                            }}
                        >
                            <DollarSign
                                className="w-6 h-6"
                                style={{ color: "var(--color-primary-600)" }}
                            />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3
                                className="font-medium text-lg"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                {salary.name}
                            </h3>

                            <div className="flex items-center gap-2 mt-2">
                                <Badge
                                    variant={typeVariants[salary.type]}
                                    size="sm"
                                >
                                    <div className="flex items-center gap-1">
                                        <CalendarClock className="w-3 h-3" />
                                        {typeLabels[salary.type]}
                                    </div>
                                </Badge>

                                <Badge
                                    variant={
                                        hasEmployees ? "warning" : "secondary"
                                    }
                                    size="sm"
                                >
                                    <div className="flex items-center gap-1">
                                        <Users className="w-3 h-3" />
                                        {salary.employeeSalariesCount} Karyawan
                                    </div>
                                </Badge>
                            </div>

                            {salary.description && (
                                <p
                                    className="text-sm mt-2"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    {salary.description}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Warning Messages */}
                {hasEmployees ? (
                    <Alert
                        variant="error"
                        title="Tidak dapat menghapus komponen gaji"
                        description={`Komponen gaji ini masih digunakan oleh ${salary.employeeSalariesCount} karyawan. Hapus atau ubah komponen gaji karyawan tersebut terlebih dahulu sebelum menghapus komponen ini.`}
                    />
                ) : (
                    <Alert
                        variant="warning"
                        title="Peringatan"
                        description="Tindakan ini tidak dapat dibatalkan. Komponen gaji yang dihapus akan hilang secara permanen dari sistem."
                    />
                )}

                {/* Additional Info */}
                <div
                    className="p-4 rounded-lg border"
                    style={{
                        backgroundColor: hasEmployees
                            ? "var(--color-error-50)"
                            : "var(--color-warning-50)",
                        borderColor: hasEmployees
                            ? "var(--color-error-200)"
                            : "var(--color-warning-200)",
                    }}
                >
                    <div className="flex items-start gap-3">
                        <AlertTriangle
                            className="w-5 h-5 mt-0.5 flex-shrink-0"
                            style={{
                                color: hasEmployees
                                    ? "var(--color-error-600)"
                                    : "var(--color-warning-600)",
                            }}
                        />
                        <div className="flex-1">
                            <h4
                                className="font-medium text-sm mb-1"
                                style={{
                                    color: hasEmployees
                                        ? "var(--color-error-900)"
                                        : "var(--color-warning-900)",
                                }}
                            >
                                {hasEmployees
                                    ? "Komponen Gaji Sedang Digunakan"
                                    : "Pastikan Data Sudah Benar"}
                            </h4>
                            <p
                                className="text-sm"
                                style={{
                                    color: hasEmployees
                                        ? "var(--color-error-800)"
                                        : "var(--color-warning-800)",
                                }}
                            >
                                {hasEmployees
                                    ? "Komponen gaji ini sedang digunakan dalam perhitungan gaji karyawan. Menghapusnya dapat mempengaruhi data gaji yang ada."
                                    : "Setelah dihapus, Anda tidak dapat mengembalikan data komponen gaji ini. Pastikan Anda benar-benar ingin menghapusnya."}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Confirmation Text */}
                <div className="text-center pt-2">
                    <p
                        className="text-sm font-medium"
                        style={{ color: "var(--color-text-secondary)" }}
                    >
                        {hasEmployees
                            ? "Komponen gaji ini tidak dapat dihapus karena masih digunakan."
                            : "Apakah Anda yakin ingin menghapus komponen gaji ini?"}
                    </p>
                </div>
            </div>
        </Modal>
    );
};

export default DeleteSalaryModal;
