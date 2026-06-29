import React, { useState, useEffect, useMemo } from "react";
import { useForm } from "@inertiajs/react";
import { Modal } from "@/Components/Modal";
import { Form } from "@/Components/Form";
import { SelectInput } from "@/Components/Input";
import { Button } from "@/Components/Button";
import { Alert } from "@/Components/Alert";
import { Badge } from "@/Components/Badge";
import { Briefcase, Save } from "lucide-react";
import { CreateEmployeePositionModalProps } from "../types";
import { EmployeePositionFormData } from "@/types";

const CreateEmployeePositionModal: React.FC<
    CreateEmployeePositionModalProps
> = ({ isOpen, employee, positions, onClose, onSuccess }) => {
    const [showSuccess, setShowSuccess] = useState(false);

    const { data, setData, post, processing, errors, reset } =
        useForm<EmployeePositionFormData>({
            positionId: 0,
            isActive: true,
        });

    useEffect(() => {
        if (isOpen) {
            reset();
            setShowSuccess(false);
        }
    }, [isOpen]);

    const availablePositions = useMemo(() => {
        if (
            !employee.employeePositions ||
            !Array.isArray(employee.employeePositions)
        ) {
            return positions;
        }

        const existingPositionIds = new Set(
            employee.employeePositions
                .map((ep) => ep.positionId || ep.position?.id)
                .filter(Boolean),
        );

        return positions.filter(
            (position) => !existingPositionIds.has(position.id),
        );
    }, [employee.employeePositions, positions]);

    const selectedPosition = availablePositions.find(
        (p) => p.id === data.positionId,
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!data.positionId) {
            return;
        }

        post(
            route("employees.employee-positions.store", {
                employeeId: employee.id,
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
                    console.error("Error creating employee position:", errors);
                },
            },
        );
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Tambah Posisi Karyawan"
            size="lg"
        >
            <Form onSubmit={handleSubmit} className="space-y-6">
                {showSuccess && (
                    <Alert
                        variant="success"
                        title="Berhasil!"
                        description="Posisi karyawan berhasil ditambahkan."
                    />
                )}

                {availablePositions.length === 0 && (
                    <Alert
                        variant="warning"
                        title="Tidak Ada Posisi Tersedia"
                        description="Semua posisi sudah dimiliki oleh karyawan ini. Silakan hapus posisi yang ada terlebih dahulu jika ingin menambahkan posisi baru."
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
                            {
                                value: "0",
                                label:
                                    availablePositions.length === 0
                                        ? "-- Tidak Ada Posisi Tersedia --"
                                        : "-- Pilih Posisi --",
                            },
                            ...availablePositions.map((position) => ({
                                value: position.id.toString(),
                                label: position.outlet
                                    ? `${position.name} (${position.outlet.name})`
                                    : position.name,
                            })),
                        ]}
                        error={errors.positionId}
                        required
                        disabled={processing || availablePositions.length === 0}
                        hint={
                            availablePositions.length === 0
                                ? "Tidak ada posisi yang tersedia untuk ditambahkan"
                                : "Pilih posisi yang akan diberikan kepada karyawan"
                        }
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
                                                    ({selectedPosition.outlet.name})
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
                </div>

                <Alert
                    variant="info"
                    title="Informasi"
                    description="Posisi yang ditambahkan akan otomatis aktif untuk karyawan. Pastikan Anda memilih posisi yang sesuai."
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
                        disabled={
                            processing ||
                            !data.positionId ||
                            availablePositions.length === 0
                        }
                        loading={processing}
                        leftIcon={<Save className="w-4 h-4" />}
                    >
                        {processing ? "Menyimpan..." : "Simpan"}
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default CreateEmployeePositionModal;
