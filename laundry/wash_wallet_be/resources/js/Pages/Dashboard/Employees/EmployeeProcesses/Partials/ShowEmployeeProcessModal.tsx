import React from "react";
import { Modal } from "@/Components/Modal";
import Button from "@/Components/Button/Button";
import Badge from "@/Components/Badge/Badge";
import { Workflow, User, CalendarDays, Target, Gift } from "lucide-react";
import { ShowEmployeeProcessModalProps } from "../types";
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

const formatDate = (date?: string | null) => {
    if (!date) {
        return "-";
    }

    return new Date(date).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
};

const ShowEmployeeProcessModal: React.FC<ShowEmployeeProcessModalProps> = ({
    isOpen,
    employee,
    employeeProcess,
    onClose,
}) => {
    if (!employeeProcess) {
        return null;
    }

    const commission = employeeProcess.commission;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Detail Proses Karyawan"
            size="lg"
        >
            <div className="space-y-6">
                <div
                    className="p-4 rounded-lg"
                    style={{
                        backgroundColor: "var(--color-surface-secondary)",
                        border: "1px solid var(--color-border)",
                    }}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                            <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center"
                                style={{
                                    backgroundColor: "var(--color-primary-100)",
                                }}
                            >
                                <User
                                    className="w-5 h-5"
                                    style={{
                                        color: "var(--color-primary-600)",
                                    }}
                                />
                            </div>
                            <div>
                                <p
                                    className="text-xs"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    Karyawan
                                </p>
                                <p
                                    className="font-semibold"
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

                        <div className="flex items-start gap-3">
                            <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center"
                                style={{
                                    backgroundColor: "var(--color-primary-100)",
                                }}
                            >
                                <Workflow
                                    className="w-5 h-5"
                                    style={{
                                        color: "var(--color-primary-600)",
                                    }}
                                />
                            </div>
                            <div>
                                <p
                                    className="text-xs"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    Proses
                                </p>
                                <p
                                    className="font-semibold"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {employeeProcess.process?.name ||
                                        "Unknown Process"}
                                </p>
                                <div className="mt-1">
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
                            </div>
                        </div>

                        <div className="flex items-start gap-3 md:col-span-2">
                            <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center"
                                style={{
                                    backgroundColor: "var(--color-info-100)",
                                }}
                            >
                                <CalendarDays
                                    className="w-5 h-5"
                                    style={{ color: "var(--color-info-600)" }}
                                />
                            </div>
                            <div>
                                <p
                                    className="text-xs"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    Tanggal Ditambahkan
                                </p>
                                <p
                                    className="font-medium"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {formatDate(employeeProcess.assignedAt)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    className="p-4 rounded-lg"
                    style={{
                        backgroundColor: "var(--color-surface)",
                        border: "1px solid var(--color-border)",
                    }}
                >
                    <h4
                        className="font-semibold mb-4"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        Informasi Komisi
                    </h4>

                    {!commission ? (
                        <p
                            className="text-sm italic"
                            style={{
                                color: "var(--color-text-tertiary)",
                            }}
                        >
                            Proses ini belum memiliki komisi.
                        </p>
                    ) : (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p
                                        className="text-xs mb-1"
                                        style={{
                                            color: "var(--color-text-tertiary)",
                                        }}
                                    >
                                        Tipe Komisi
                                    </p>
                                    <Badge variant="info" size="sm">
                                        {getCommissionTypeLabel(
                                            commission.commissionType,
                                        )}
                                    </Badge>
                                </div>

                                <div>
                                    <p
                                        className="text-xs mb-1"
                                        style={{
                                            color: "var(--color-text-tertiary)",
                                        }}
                                    >
                                        Nilai Komisi
                                    </p>
                                    <p
                                        className="font-semibold"
                                        style={{
                                            color: "var(--color-text-primary)",
                                        }}
                                    >
                                        {commission.commissionType ===
                                        "percentage"
                                            ? `${commission.commissionValue}%`
                                            : formatCurrency(
                                                  commission.commissionValue ||
                                                      0,
                                              )}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-start gap-2">
                                    <Target
                                        className="w-4 h-4 mt-0.5"
                                        style={{
                                            color: "var(--color-warning-600)",
                                        }}
                                    />
                                    <div>
                                        <p
                                            className="text-xs"
                                            style={{
                                                color: "var(--color-text-tertiary)",
                                            }}
                                        >
                                            Target
                                        </p>
                                        <p
                                            className="font-medium"
                                            style={{
                                                color: "var(--color-text-primary)",
                                            }}
                                        >
                                            {commission.hasTarget
                                                ? `${commission.targetThreshold ?? 0}`
                                                : "Tidak digunakan"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2">
                                    <Gift
                                        className="w-4 h-4 mt-0.5"
                                        style={{
                                            color: "var(--color-success-600)",
                                        }}
                                    />
                                    <div>
                                        <p
                                            className="text-xs"
                                            style={{
                                                color: "var(--color-text-tertiary)",
                                            }}
                                        >
                                            Bonus Target
                                        </p>
                                        <p
                                            className="font-medium"
                                            style={{
                                                color: "var(--color-text-primary)",
                                            }}
                                        >
                                            {commission.hasTarget
                                                ? formatCurrency(
                                                      commission.bonusAmount ||
                                                          0,
                                                  )
                                                : "-"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-end">
                    <Button variant="outline" onClick={onClose}>
                        Tutup
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default ShowEmployeeProcessModal;
