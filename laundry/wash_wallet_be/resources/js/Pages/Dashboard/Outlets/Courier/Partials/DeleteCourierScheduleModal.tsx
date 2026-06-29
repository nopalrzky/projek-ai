import React from "react";
import { Modal } from "@/Components/Modal";
import { Button } from "@/Components/Button";
import { Alert } from "@/Components/Alert";
import { Clock, Calendar, Truck } from "lucide-react";
import { CourierScheduleDeleteModalProps } from "../types";

const DeleteCourierScheduleModal: React.FC<CourierScheduleDeleteModalProps> = ({
    isOpen,
    schedule,
    onClose,
    onConfirm,
    isLoading = false,
}) => {
    if (!schedule) return null;

    const handleConfirm = () => {
        onConfirm(schedule);
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
            title="Hapus Jadwal Kurir"
            size="md"
            variant="danger"
            loading={false}
            preventClose={isLoading}
            closeOnOverlayClick={!isLoading}
            closeOnEscape={!isLoading}
        >
            <div className="space-y-4">
                <Alert
                    variant="warning"
                    title="Peringatan"
                    description="Tindakan ini tidak dapat dibatalkan. Slot jadwal yang dihapus akan hilang dari sistem."
                />

                <div className="p-4 rounded-lg border bg-surface-secondary border-border">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-error-100">
                            <Clock className="w-5 h-5 text-error-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-text-primary">
                                {dayLabels[schedule.dayOfWeek]} -{" "}
                                {schedule.startTime} s/d {schedule.endTime}
                            </h4>
                            <div className="flex flex-col gap-1 mt-2">
                                <div className="flex items-center gap-2 text-sm text-text-secondary">
                                    <Truck className="w-4 h-4" />
                                    <span>Tipe: {schedule.typeLabel}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-text-secondary">
                                    <Calendar className="w-4 h-4" />
                                    <span>Hari: {schedule.dayLabel}</span>
                                </div>
                            </div>
                            <div className="mt-3">
                                <span
                                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                        schedule.isActive
                                            ? "bg-success-100 text-success-600"
                                            : "bg-surface-muted text-text-tertiary"
                                    }`}
                                >
                                    {schedule.isActive ? "Aktif" : "Nonaktif"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-sm text-text-secondary">
                    Apakah Anda yakin ingin menghapus jadwal kurir untuk hari{" "}
                    <span className="font-semibold text-text-primary">
                        {dayLabels[schedule.dayOfWeek]} ({schedule.startTime} -{" "}
                        {schedule.endTime})
                    </span>
                    ?
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
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
                    >
                        {isLoading ? "Menghapus..." : "Hapus Jadwal"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default DeleteCourierScheduleModal;
