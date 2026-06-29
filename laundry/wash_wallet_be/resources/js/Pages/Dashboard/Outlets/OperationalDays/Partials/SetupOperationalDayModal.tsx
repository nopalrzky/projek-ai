import React, { useState, useEffect } from "react";
import { Modal } from "@/Components/Modal";
import { Button } from "@/Components/Button";
import { Input } from "@/Components/Input";
import { Alert } from "@/Components/Alert";
import { Badge } from "@/Components/Badge";
import { Clock, CheckCircle, XCircle } from "lucide-react";
import { SetupOperationalDayModalProps } from "../types";

const SetupOperationalDayModal: React.FC<SetupOperationalDayModalProps> = ({
    isOpen,
    operationalDay,
    onClose,
    onConfirm,
    isLoading,
}) => {
    const [formData, setFormData] = useState({
        dayOfWeek: operationalDay.dayOfWeek,
        isOpen: operationalDay.isOpen,
        openTime: operationalDay.openTime || "",
        closeTime: operationalDay.closeTime || "",
    });

    const [errors, setErrors] = useState<{
        openTime?: string;
        closeTime?: string;
    }>({});

    useEffect(() => {
        setFormData({
            dayOfWeek: operationalDay.dayOfWeek,
            isOpen: operationalDay.isOpen,
            openTime: operationalDay.openTime || "",
            closeTime: operationalDay.closeTime || "",
        });
        setErrors({});
    }, [operationalDay]);

    const validateForm = (): boolean => {
        const newErrors: { openTime?: string; closeTime?: string } = {};

        if (formData.isOpen) {
            if (!formData.openTime) {
                newErrors.openTime = "Jam buka harus diisi";
            }

            if (!formData.closeTime) {
                newErrors.closeTime = "Jam tutup harus diisi";
            }

            if (formData.openTime && formData.closeTime) {
                const openTime = new Date(`2000-01-01T${formData.openTime}`);
                const closeTime = new Date(`2000-01-01T${formData.closeTime}`);

                if (closeTime <= openTime) {
                    newErrors.closeTime =
                        "Jam tutup harus lebih besar dari jam buka";
                }
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validateForm()) return;

        onConfirm({
            dayOfWeek: formData.dayOfWeek,
            isOpen: formData.isOpen,
            openTime: formData.isOpen ? formData.openTime : null,
            closeTime: formData.isOpen ? formData.closeTime : null,
        });
    };

    const handleIsOpenChange = (checked: boolean) => {
        setFormData((prev) => ({
            ...prev,
            isOpen: checked,
        }));

        if (!checked) {
            setErrors({});
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Atur Jam Operasional - ${operationalDay.dayLabel}`}
            size="md"
            loading={isLoading}
            preventClose={isLoading}
        >
            <div className="space-y-6">
                <div
                    className="p-4 rounded-lg border"
                    style={{
                        backgroundColor: "var(--color-surface-secondary)",
                        borderColor: "var(--color-border)",
                    }}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div
                                className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                                    formData.isOpen
                                        ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                        : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                                }`}
                            >
                                {operationalDay.dayLabel.charAt(0)}
                            </div>
                            <div>
                                <h4
                                    className="text-lg font-semibold"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {operationalDay.dayLabel}
                                </h4>
                                <p
                                    className="text-sm"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    {operationalDay.dayOfWeek}
                                </p>
                            </div>
                        </div>

                        <Badge
                            variant={formData.isOpen ? "success" : "warning"}
                            size="lg"
                        >
                            {formData.isOpen ? (
                                <div className="flex items-center gap-1">
                                    <CheckCircle className="w-4 h-4" />
                                    Buka
                                </div>
                            ) : (
                                <div className="flex items-center gap-1">
                                    <XCircle className="w-4 h-4" />
                                    Tutup
                                </div>
                            )}
                        </Badge>
                    </div>
                </div>

                <div
                    className="p-4 rounded-lg border"
                    style={{
                        backgroundColor: "var(--color-surface-secondary)",
                        borderColor: "var(--color-border)",
                    }}
                >
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.isOpen}
                            onChange={(e) =>
                                handleIsOpenChange(e.target.checked)
                            }
                            disabled={isLoading}
                            className="w-5 h-5 rounded border-2"
                        />
                        <div className="flex-1">
                            <span
                                className="font-medium"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                Outlet buka pada hari ini
                            </span>
                            <p
                                className="text-sm mt-1"
                                style={{ color: "var(--color-text-tertiary)" }}
                            >
                                {formData.isOpen
                                    ? "Outlet akan beroperasi pada hari ini"
                                    : "Outlet tidak beroperasi pada hari ini"}
                            </p>
                        </div>
                    </label>
                </div>

                {formData.isOpen && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label
                                    className="block text-sm font-medium mb-2"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Jam Buka
                                </label>
                                <Input
                                    type="time"
                                    value={formData.openTime}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            openTime: e.target.value,
                                        }))
                                    }
                                    error={errors.openTime}
                                    disabled={isLoading}
                                    required
                                    leftIcon={<Clock className="w-4 h-4" />}
                                />
                            </div>

                            <div>
                                <label
                                    className="block text-sm font-medium mb-2"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Jam Tutup
                                </label>
                                <Input
                                    type="time"
                                    value={formData.closeTime}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            closeTime: e.target.value,
                                        }))
                                    }
                                    error={errors.closeTime}
                                    disabled={isLoading}
                                    required
                                    leftIcon={<Clock className="w-4 h-4" />}
                                />
                            </div>
                        </div>

                        <Alert
                            variant="info"
                            title="Informasi"
                            description="Pastikan jam tutup lebih besar dari jam buka. Format waktu 24 jam (HH:MM)."
                        />
                    </div>
                )}

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
                        variant="primary"
                        onClick={handleSubmit}
                        loading={isLoading}
                        disabled={isLoading}
                    >
                        {isLoading ? "Menyimpan..." : "Simpan"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default SetupOperationalDayModal;
