import React from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import {
    Calendar,
    Package,
    Navigation,
    Clock,
    Plus,
    TrendingUp,
} from "lucide-react";
import { Card } from "@/Components/Card";
import { CourierSchedule } from "@/types";
import outletService from "@/Services/outlet.service";
import AddScheduleModal from "./AddScheduleModal";
import CourierScheduleModal from "./CourierScheduleModal";
import DeleteCourierScheduleModal from "./DeleteCourierScheduleModal";
import CourierDayCard from "./CourierDayCard";
import CourierStatChip from "./CourierStatChip";

const CourierScheduleSection = ({ outlet }: { outlet: any }) => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [addModalContext, setAddModalContext] = useState<{
        day: string;
        type: "pickup" | "delivery";
    }>({ day: "monday", type: "pickup" });

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState<
        CourierSchedule | undefined
    >(undefined);
    const [selectedDay, setSelectedDay] = useState<string>("monday");

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingSchedule, setDeletingSchedule] =
        useState<CourierSchedule | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const days = [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
    ];

    const dayLabels: Record<string, string> = {
        monday: "Senin",
        tuesday: "Selasa",
        wednesday: "Rabu",
        thursday: "Kamis",
        friday: "Jumat",
        saturday: "Sabtu",
        sunday: "Minggu",
    };

    const getSchedulesForDay = (day: string) => {
        return (
            outlet.courierSchedules?.filter(
                (s: CourierSchedule) => s.dayOfWeek === day,
            ) || []
        );
    };

    const handleAddClick = (day: string, type: "pickup" | "delivery") => {
        setAddModalContext({ day, type });
        setIsAddModalOpen(true);
    };

    const handleEditClick = (schedule: CourierSchedule) => {
        setEditingSchedule(schedule);
        setSelectedDay(schedule.dayOfWeek);
        setIsEditModalOpen(true);
    };

    const handleDeleteClick = (schedule: CourierSchedule) => {
        setDeletingSchedule(schedule);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = (schedule: CourierSchedule) => {
        setIsDeleting(true);
        outletService.destroyCourierSchedule(outlet.id, schedule.id, {
            onFinish: () => {
                setIsDeleting(false);
                setIsDeleteModalOpen(false);
                setDeletingSchedule(null);
            },
        });
    };

    const [isUpdatingDays, setIsUpdatingDays] = useState(false);
    const disabledDays = outlet.courierSetting?.disabledDays || [];

    const handleToggleDay = (day: string) => {
        const isCurrentlyDisabled = disabledDays.includes(day);
        let newDisabledDays = [];

        if (isCurrentlyDisabled) {
            newDisabledDays = disabledDays.filter((d: string) => d !== day);
        } else {
            newDisabledDays = [...disabledDays, day];
        }

        setIsUpdatingDays(true);
        outletService.updateCourierDisabledDays(outlet.id, newDisabledDays, {
            onFinish: () => setIsUpdatingDays(false),
        });
    };

    const totalSchedules = outlet.courierSchedules?.length ?? 0;
    const totalPickup =
        outlet.courierSchedules?.filter(
            (s: CourierSchedule) => s.type === "pickup",
        ).length ?? 0;
    const totalDelivery =
        outlet.courierSchedules?.filter(
            (s: CourierSchedule) => s.type === "delivery",
        ).length ?? 0;
    const activeDays = days.filter((d) => !disabledDays.includes(d)).length;

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
        >
            <Card className="border-border shadow-md overflow-hidden">
                <div className="relative overflow-hidden bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 dark:from-gray-800 dark:via-gray-900 dark:to-black p-6 pb-8">
                    <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white/15 backdrop-blur-sm border border-white/20 text-white shadow-lg">
                                <Calendar className="w-7 h-7" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">
                                    Jadwal Operasional
                                </h3>
                                <p className="text-sm text-white/60">
                                    Atur slot waktu pengambilan dan pengantaran
                                    per hari
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 mt-6 grid grid-cols-4 gap-3">
                        <CourierStatChip
                            icon={<TrendingUp className="w-3.5 h-3.5" />}
                            label="Hari Aktif"
                            value={`${activeDays}/7`}
                        />
                        <CourierStatChip
                            icon={<Clock className="w-3.5 h-3.5" />}
                            label="Total Slot"
                            value={String(totalSchedules)}
                        />
                        <CourierStatChip
                            icon={<Package className="w-3.5 h-3.5" />}
                            label="Pickup"
                            value={String(totalPickup)}
                        />
                        <CourierStatChip
                            icon={<Navigation className="w-3.5 h-3.5" />}
                            label="Delivery"
                            value={String(totalDelivery)}
                        />
                    </div>
                </div>

                {totalSchedules === 0 && (
                    <div className="mx-6 -mt-4 relative z-10">
                        <div className="rounded-2xl bg-info-50 dark:bg-info-900/20 border border-info-200 dark:border-info-800/50 p-3.5 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-info-100 dark:bg-info-800/40 text-info-600 dark:text-info-400 flex items-center justify-center shrink-0">
                                <Plus className="w-4 h-4" />
                            </div>
                            <p className="text-xs text-info-700 dark:text-info-300 font-medium">
                                Belum ada jadwal. Klik tombol{" "}
                                <span className="font-black">+</span> pada tiap
                                hari untuk menambahkan slot pickup atau
                                delivery.
                            </p>
                        </div>
                    </div>
                )}

                <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                        {days.map((day, index) => {
                            const isDisabled = disabledDays.includes(day);
                            const schedules = getSchedulesForDay(day);

                            return (
                                <CourierDayCard
                                    key={day}
                                    day={day}
                                    dayLabel={dayLabels[day]}
                                    index={index}
                                    isDisabled={isDisabled}
                                    isUpdatingDays={isUpdatingDays}
                                    onToggleDay={handleToggleDay}
                                    schedules={schedules}
                                    onAddClick={handleAddClick}
                                    onEditClick={handleEditClick}
                                    onDeleteClick={handleDeleteClick}
                                />
                            );
                        })}
                    </div>
                </div>

                <AddScheduleModal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    outletId={outlet.id}
                    dayOfWeek={addModalContext.day}
                    type={addModalContext.type}
                />

                <CourierScheduleModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    outletId={outlet.id}
                    dayOfWeek={selectedDay}
                    schedule={editingSchedule}
                />

                <DeleteCourierScheduleModal
                    isOpen={isDeleteModalOpen}
                    schedule={deletingSchedule}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleConfirmDelete}
                    isLoading={isDeleting}
                />
            </Card>
        </motion.div>
    );
};

export default CourierScheduleSection;
