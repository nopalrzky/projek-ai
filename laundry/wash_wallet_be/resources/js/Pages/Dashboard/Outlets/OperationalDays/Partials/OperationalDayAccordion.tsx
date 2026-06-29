import React, { useState } from "react";
import { router } from "@inertiajs/react";
import { Outlet, OperationalDay, CourierSchedule } from "@/types";
import outletService from "@/Services/outlet.service";

import OperationalDayAccordionItem from "./OperationalDayAccordionItem";
import AddScheduleModal from "../../Courier/Partials/AddScheduleModal";
import CourierScheduleModal from "../../Courier/Partials/CourierScheduleModal";
import DeleteCourierScheduleModal from "../../Courier/Partials/DeleteCourierScheduleModal";

interface OperationalDayAccordionProps {
    outlet: Outlet;
    operationalDays: OperationalDay[];
}

const OperationalDayAccordion: React.FC<OperationalDayAccordionProps> = ({
    outlet,
    operationalDays,
}) => {
    const [expandedDay, setExpandedDay] = useState<string | null>(null);

    const courierFeature = outlet.outletFeatures?.find(
        (f: any) => f.feature.key === "courier_schedule"
    );
    const isCourierUnlocked = courierFeature?.status === "active";
    const isCourierEnabled = outlet.isCourierEnabled ?? true;
    const disabledDays = outlet.courierSetting?.disabledDays || [];

    const [isUpdatingCourierDay, setIsUpdatingCourierDay] = useState(false);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [addModalContext, setAddModalContext] = useState<{ day: string; type: "pickup" | "delivery" }>({ day: "monday", type: "pickup" });

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState<CourierSchedule | undefined>(undefined);
    const [selectedDay, setSelectedDay] = useState<string>("monday");

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingSchedule, setDeletingSchedule] = useState<CourierSchedule | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [savingDayId, setSavingDayId] = useState<number | null>(null);

    const toggleExpand = (day: string) => {
        setExpandedDay(prev => prev === day ? null : day);
    };

    const getSchedulesForDay = (day: string) => {
        return outlet.courierSchedules?.filter((s: CourierSchedule) => s.dayOfWeek === day) || [];
    };

    const handleToggleCourierDay = (day: string) => {
        const isCurrentlyDisabled = disabledDays.includes(day);
        let newDisabledDays = [];

        if (isCurrentlyDisabled) {
            newDisabledDays = disabledDays.filter((d: string) => d !== day);
        } else {
            newDisabledDays = [...disabledDays, day];
        }

        setIsUpdatingCourierDay(true);
        outletService.updateCourierDisabledDays(outlet.id, newDisabledDays, {
            onFinish: () => setIsUpdatingCourierDay(false),
        });
    };

    const handleAddCourierClick = (day: string, type: "pickup" | "delivery") => {
        setAddModalContext({ day, type });
        setIsAddModalOpen(true);
    };

    const handleEditCourierClick = (schedule: CourierSchedule) => {
        setEditingSchedule(schedule);
        setSelectedDay(schedule.dayOfWeek);
        setIsEditModalOpen(true);
    };

    const handleDeleteCourierClick = (schedule: CourierSchedule) => {
        setDeletingSchedule(schedule);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDeleteCourier = (schedule: CourierSchedule) => {
        setIsDeleting(true);
        outletService.destroyCourierSchedule(outlet.id, schedule.id, {
            onFinish: () => {
                setIsDeleting(false);
                setIsDeleteModalOpen(false);
                setDeletingSchedule(null);
            },
        });
    };

    const handleSaveOperationalDay = (dayId: number, data: any) => {
        setSavingDayId(dayId);

        const isNewOperationalDay = dayId === 0;

        const requestOptions = {
            onSuccess: () => {
                setSavingDayId(null);
            },
            onError: (errors: Record<string, string>) => {
                console.error("Error updating schedule:", errors);
                alert("Gagal memperbarui jadwal operasional. Silakan coba lagi.");
                setSavingDayId(null);
            },
        };

        if (isNewOperationalDay) {
            router.post(
                route("outlets.operational-days.store", { outletId: outlet.id }),
                data,
                requestOptions
            );
            return;
        }

        router.put(
            route("outlets.operational-days.update", {
                outletId: outlet.id,
                operationalDayId: dayId,
            }),
            data,
            requestOptions
        );
    };

    return (
        <div className="space-y-3">
            {operationalDays.map((day) => {
                const dayKey = day.dayOfWeek.toLowerCase();
                const schedules = getSchedulesForDay(dayKey);
                const isCourierDayDisabled = disabledDays.includes(dayKey);

                return (
                    <OperationalDayAccordionItem
                        key={dayKey}
                        day={day}
                        isExpanded={expandedDay === dayKey}
                        onToggle={() => toggleExpand(dayKey)}

                        isCourierUnlocked={isCourierUnlocked}
                        isCourierEnabled={isCourierEnabled}
                        courierSchedules={schedules}
                        isCourierDayDisabled={isCourierDayDisabled}
                        isUpdatingCourierDay={isUpdatingCourierDay}
                        onAddCourierClick={handleAddCourierClick}
                        onEditCourierClick={handleEditCourierClick}
                        onDeleteCourierClick={handleDeleteCourierClick}
                        onToggleCourierDay={handleToggleCourierDay}

                        onSaveOperationalDay={handleSaveOperationalDay}
                        isSavingOperationalDay={savingDayId === day.id}
                    />
                );
            })}

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
                onConfirm={handleConfirmDeleteCourier}
                isLoading={isDeleting}
            />
        </div>
    );
};

export default OperationalDayAccordion;
