import React, { useEffect } from "react";
import { useForm } from "@inertiajs/react";
import { Clock, Truck, Save } from "lucide-react";
import { Modal } from "@/Components/Modal";
import { Button } from "@/Components/Button";
import { TimeInput } from "@/Components/Input";

interface AddScheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    outletId: number;
    dayOfWeek: string;
    type: "pickup" | "delivery";
}

const AddScheduleModal = ({
    isOpen,
    onClose,
    outletId,
    dayOfWeek,
    type,
}: AddScheduleModalProps) => {
    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm({
            dayOfWeek: dayOfWeek,
            type: type,
            startTime: "08:00",
            endTime: "10:00",
            isActive: true,
        });

    useEffect(() => {
        if (isOpen) {
            setData({
                dayOfWeek: dayOfWeek,
                type: type,
                startTime: "08:00",
                endTime: "10:00",
                isActive: true,
            });
            clearErrors();
        }
    }, [isOpen, dayOfWeek, type]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("outlets.courier-schedules.store", outletId), {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                onClose();
                reset();
            },
        });
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
            title="Tambahkan Jadwal"
            size="md"
        >
            <form onSubmit={handleSubmit} className="space-y-6 py-2">
                <div className="bg-surface-muted/50 p-4 rounded-lg border border-border flex items-start gap-3">
                    <div className="p-2 bg-primary-50 text-primary-600 rounded-lg dark:bg-primary-900/30 dark:text-primary-400">
                        <Truck className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-text-primary">
                            Jadwal{" "}
                            {type === "pickup"
                                ? "Ambil (Pickup)"
                                : "Antar (Delivery)"}
                        </h4>
                        <p className="text-xs text-text-secondary mt-0.5">
                            Tambahkan jadwal untuk hari{" "}
                            <span className="font-bold text-text-primary">
                                {dayLabels[dayOfWeek]}
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
                        Simpan Jadwal
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default AddScheduleModal;
