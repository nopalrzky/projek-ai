import React, { useEffect } from "react";
import { useForm } from "@inertiajs/react";
import { Clock, Truck, Save, Info } from "lucide-react";
import { Modal } from "@/Components/Modal";
import { Button } from "@/Components/Button";
import { TimeInput } from "@/Components/Input";
import { CourierScheduleModalProps } from "../types";

const CourierScheduleModal = ({
    isOpen,
    onClose,
    outletId,
    dayOfWeek,
    schedule,
}: CourierScheduleModalProps) => {
    const isEdit = !!schedule;

    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm({
            dayOfWeek: dayOfWeek || (schedule?.dayOfWeek ?? "monday"),
            type: schedule?.type ?? "pickup",
            startTime: schedule?.startTime ?? "08:00",
            endTime: schedule?.endTime ?? "10:00",
            isActive: schedule?.isActive ?? true,
        });

    useEffect(() => {
        if (isOpen) {
            setData({
                dayOfWeek: dayOfWeek || (schedule?.dayOfWeek ?? "monday"),
                type: schedule?.type ?? "pickup",
                startTime: schedule?.startTime ?? "08:00",
                endTime: schedule?.endTime ?? "10:00",
                isActive: schedule?.isActive ?? true,
            });
            clearErrors();
        }
    }, [isOpen, schedule, dayOfWeek]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEdit && schedule) {
            put(
                route("outlets.courier-schedules.update", [
                    outletId,
                    schedule.id,
                ]),
                {
                    preserveScroll: true,
                    preserveState: true,
                    onSuccess: () => {
                        onClose();
                    },
                },
            );
        } else {
            post(route("outlets.courier-schedules.store", outletId), {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    onClose();
                    reset();
                },
            });
        }
    };

    const dayLabels: Record<string, string> = {
        monday: "Senin",
        tuesday: "Selasa",
        wednesday: "Rabu",
        thursday: "Kamis",
        friday: "Jumat",
        saturday: "Sabtu",
        sunday: "Minggu",
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEdit ? "Edit Jadwal Kurir" : "Tambah Jadwal Kurir"}
            size="md"
        >
            <form onSubmit={handleSubmit} className="space-y-6 py-2">
                <div className="bg-surface-muted/50 p-4 rounded-lg border border-border flex items-start gap-3">
                    <div
                        className={`p-2 rounded-lg ${isEdit ? "bg-info-50 text-info-600" : "bg-primary-50 text-primary-600"}`}
                    >
                        {isEdit ? (
                            <Info className="w-5 h-5" />
                        ) : (
                            <Truck className="w-5 h-5" />
                        )}
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-text-primary">
                            Jadwal{" "}
                            {data.type === "pickup"
                                ? "Ambil (Pickup)"
                                : "Antar (Delivery)"}
                        </h4>
                        <p className="text-xs text-text-secondary mt-0.5">
                            {isEdit ? "Perbarui" : "Tambahkan"} jadwal untuk
                            hari{" "}
                            <span className="font-bold text-text-primary">
                                {dayLabels[data.dayOfWeek]}
                            </span>
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TimeInput
                        label="Jam Mulai"
                        value={data.startTime}
                        onValueChange={(val) => setData("startTime", val ?? "")}
                        error={errors.startTime}
                        disabled={processing}
                        leftIcon={<Clock className="w-4 h-4" />}
                    />
                    <TimeInput
                        label="Jam Selesai"
                        value={data.endTime}
                        onValueChange={(val) => setData("endTime", val ?? "")}
                        error={errors.endTime}
                        disabled={processing}
                        leftIcon={<Clock className="w-4 h-4" />}
                    />
                </div>

                <div className="flex items-center gap-2 p-3 bg-warning-50 text-warning-700 rounded-lg text-xs">
                    <Info className="w-4 h-4 flex-shrink-0" />
                    <span>
                        Pastikan rentang waktu tidak tumpang tindih dengan
                        jadwal lain di hari yang sama.
                    </span>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onClose}
                        disabled={processing}
                    >
                        Batal
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        loading={processing}
                        leftIcon={<Save className="w-4 h-4" />}
                    >
                        {isEdit ? "Simpan Perubahan" : "Simpan Jadwal"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default CourierScheduleModal;
