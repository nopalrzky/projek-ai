import React, { useState, useEffect, useMemo } from "react";
import { useForm } from "@inertiajs/react";
import { Modal } from "@/Components/Modal";
import { Form } from "@/Components/Form";
import { CheckboxInput, SelectInput } from "@/Components/Input";
import { Button } from "@/Components/Button";
import { Alert } from "@/Components/Alert";
import { Badge } from "@/Components/Badge";
import { Briefcase, Save, Info } from "lucide-react";
import { EditEmployeePositionModalProps } from "../types";
import { EmployeePositionFormData } from "@/types";

const EditEmployeePositionModal: React.FC<EditEmployeePositionModalProps> = ({
    isOpen,
    employee,
    employeePosition,
    positions,
    onClose,
    onSuccess,
}) => {
    const [showSuccess, setShowSuccess] = useState(false);

    const { data, setData, put, processing, errors, reset } =
        useForm<EmployeePositionFormData>({
            positionId: employeePosition.position?.id || 0,
            isActive: employeePosition.isActive ?? true,
        });

    useEffect(() => {
        if (isOpen && employeePosition) {
            setData({
                positionId: employeePosition.position?.id || 0,
                isActive: employeePosition.isActive ?? true,
            });
            setShowSuccess(false);
        } else if (!isOpen) {
            reset();
            setShowSuccess(false);
        }
    }, [isOpen, employeePosition]);

    const availablePositions = useMemo(() => {
        if (
            !employee.employeePositions ||
            !Array.isArray(employee.employeePositions)
        ) {
            return positions;
        }

        const existingPositionIds = new Set(
            employee.employeePositions
                .filter((ep) => ep.id !== employeePosition.id)
                .map((ep) => ep.positionId || ep.position?.id)
                .filter(Boolean),
        );

        return positions.filter(
            (position) => !existingPositionIds.has(position.id),
        );
    }, [employee.employeePositions, positions, employeePosition.id]);

    const selectedPosition = availablePositions.find(
        (p) => p.id === data.positionId,
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!data.positionId) {
            return;
        }

        put(
            route("employees.employee-positions.update", {
                employeeId: employee.id,
                employeePositionId: employeePosition.id,
            }),
            {
                preserveScroll: true,
                onSuccess: () => {
                    setShowSuccess(true);
                    setTimeout(() => {
                        onSuccess?.();
                        onClose();
                        reset();
                    }, 1500);
                },
                onError: (errors) => {
                    console.error("Error updating employee position:", errors);
                },
            },
        );
    };

    const hasChanges =
        data.positionId !== employeePosition.position?.id ||
        data.isActive !== employeePosition.isActive;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Edit Posisi Karyawan"
            size="lg"
        >
            <Form onSubmit={handleSubmit} className="space-y-6">
                {showSuccess && (
                    <Alert
                        variant="success"
                        title="Berhasil!"
                        description="Posisi karyawan berhasil diperbarui."
                    />
                )}

                <div
                    className="p-4 rounded-lg"
                    style={{
                        backgroundColor: "var(--color-surface-secondary)",
                        border: "1px solid var(--color-border)",
                    }}
                >
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
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                {employee.name}
                            </p>
                            <p
                                className="text-sm"
                                style={{
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                @{employee.username} •{" "}
                                {employee.outlet?.name || "-"}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div
                        className="flex items-center gap-2 pb-3 border-b"
                        style={{ borderColor: "var(--color-border)" }}
                    >
                        <Briefcase
                            className="w-5 h-5"
                            style={{ color: "var(--color-primary-600)" }}
                        />
                        <h3
                            className="font-semibold"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            Pilih Posisi
                        </h3>
                    </div>

                    <SelectInput
                        label="Posisi"
                        value={data.positionId.toString()}
                        onChange={(e) =>
                            setData("positionId", parseInt(e.target.value))
                        }
                        options={[
                            { value: "0", label: "-- Pilih Posisi --" },
                            ...availablePositions.map((position) => ({
                                value: position.id.toString(),
                                label: position.outlet
                                    ? `${position.name} (${position.outlet.name})`
                                    : position.name,
                            })),
                        ]}
                        error={errors.positionId}
                        required
                        disabled={processing}
                        hint="Pilih posisi yang berbeda jika ingin mengubahnya"
                    />

                    {selectedPosition && (
                        <div
                            className="p-4 rounded-lg"
                            style={{
                                backgroundColor: "var(--color-primary-50)",
                                border: "1px solid var(--color-primary-200)",
                            }}
                        >
                            <div className="flex items-start gap-3">
                                <div
                                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                                    style={{
                                        backgroundColor:
                                            "var(--color-primary-100)",
                                    }}
                                >
                                    <Briefcase
                                        className="w-5 h-5"
                                        style={{
                                            color: "var(--color-primary-600)",
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
                                            {selectedPosition.name}
                                            {selectedPosition.outlet && (
                                                <span className="text-xs font-normal ml-1.5 opacity-70">
                                                    (
                                                    {
                                                        selectedPosition.outlet
                                                            .name
                                                    }
                                                    )
                                                </span>
                                            )}
                                        </p>
                                        <Badge
                                            variant={
                                                selectedPosition.isActive
                                                    ? "success"
                                                    : "secondary"
                                            }
                                            size="sm"
                                        >
                                            {selectedPosition.isActive
                                                ? "Aktif"
                                                : "Tidak Aktif"}
                                        </Badge>
                                        {data.positionId !==
                                            employeePosition.position?.id && (
                                            <Badge variant="warning" size="sm">
                                                Diubah
                                            </Badge>
                                        )}
                                    </div>
                                    <p
                                        className="text-sm"
                                        style={{
                                            color: "var(--color-text-secondary)",
                                        }}
                                    >
                                        {selectedPosition.description ||
                                            "Tidak ada deskripsi"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {data.positionId !== employeePosition.position?.id &&
                        employeePosition.position && (
                            <div
                                className="p-3 rounded-lg"
                                style={{
                                    backgroundColor: "var(--color-warning-50)",
                                    border: "1px solid var(--color-warning-200)",
                                }}
                            >
                                <div className="flex items-start gap-2">
                                    <Info
                                        className="w-4 h-4 mt-0.5 flex-shrink-0"
                                        style={{
                                            color: "var(--color-warning-600)",
                                        }}
                                    />
                                    <div className="flex-1">
                                        <p
                                            className="text-sm font-medium"
                                            style={{
                                                color: "var(--color-warning-700)",
                                            }}
                                        >
                                            Posisi sebelumnya:{" "}
                                            {employeePosition.position.name}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                </div>

                <div className="space-y-4">
                    <div
                        className="flex items-center gap-2 pb-3 border-b"
                        style={{ borderColor: "var(--color-border)" }}
                    >
                        <Info
                            className="w-5 h-5"
                            style={{ color: "var(--color-info-600)" }}
                        />
                        <h3
                            className="font-semibold"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            Status Posisi
                        </h3>
                    </div>

                    <div
                        className="p-4 rounded-lg"
                        style={{
                            backgroundColor: "var(--color-surface-secondary)",
                            border: "1px solid var(--color-border)",
                        }}
                    >
                        <CheckboxInput
                            label="Aktifkan Posisi"
                            checked={data.isActive}
                            onChange={(checked: boolean) =>
                                setData("isActive", checked)
                            }
                            disabled={processing}
                            hint="Centang jika posisi ini aktif untuk karyawan"
                        />
                    </div>

                    {data.isActive !== employeePosition.isActive && (
                        <div
                            className="p-3 rounded-lg"
                            style={{
                                backgroundColor: data.isActive
                                    ? "var(--color-success-50)"
                                    : "var(--color-warning-50)",
                                border: `1px solid ${
                                    data.isActive
                                        ? "var(--color-success-200)"
                                        : "var(--color-warning-200)"
                                }`,
                            }}
                        >
                            <p
                                className="text-sm"
                                style={{
                                    color: data.isActive
                                        ? "var(--color-success-700)"
                                        : "var(--color-warning-700)",
                                }}
                            >
                                Status akan diubah menjadi:{" "}
                                <strong>
                                    {data.isActive ? "Aktif" : "Tidak Aktif"}
                                </strong>
                            </p>
                        </div>
                    )}
                </div>

                <Alert
                    variant="info"
                    title="Informasi"
                    description="Perubahan posisi dan status akan langsung berlaku setelah disimpan. Pastikan data yang dimasukkan sudah sesuai."
                />

                <div
                    className="flex items-center justify-end gap-3 pt-4 border-t"
                    style={{ borderColor: "var(--color-border)" }}
                >
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={processing}
                    >
                        Batal
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={processing || !data.positionId || !hasChanges}
                        loading={processing}
                        leftIcon={<Save className="w-4 h-4" />}
                    >
                        {processing ? "Menyimpan..." : "Simpan Perubahan"}
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default EditEmployeePositionModal;
