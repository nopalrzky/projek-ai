import React from "react";
import { Clock, Edit2, Trash2 } from "lucide-react";
import { CourierSchedule } from "@/types";

interface CourierScheduleChipProps {
    schedule: CourierSchedule;
    onEdit: () => void;
    onDelete: () => void;
}

const CourierScheduleChip: React.FC<CourierScheduleChipProps> = ({
    schedule,
    onEdit,
    onDelete,
}) => {
    return (
        <div
            className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all hover:pr-16 overflow-hidden ${
                schedule.isActive
                    ? "bg-primary-50 border-primary-200 dark:bg-primary-900/20 dark:border-primary-800"
                    : "bg-surface-muted border-border dark:bg-gray-800"
            }`}
        >
            <Clock
                className={`w-3 h-3 ${
                    schedule.isActive
                        ? "text-primary-600 dark:text-primary-400"
                        : "text-text-tertiary"
                }`}
            />
            <span
                className={`text-xs font-medium ${
                    schedule.isActive
                        ? "text-text-primary"
                        : "text-text-secondary line-through"
                }`}
            >
                {schedule.startTime} - {schedule.endTime}
            </span>

            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1 translate-x-full group-hover:translate-x-0 transition-transform pl-2 bg-inherit">
                <button
                    onClick={onEdit}
                    className="p-1 transition-colors text-primary-600 hover:text-primary-700 dark:text-primary-400"
                    title="Edit jadwal"
                >
                    <Edit2 className="w-3 h-3" />
                </button>
                <button
                    onClick={onDelete}
                    className="p-1 transition-colors text-error-600 hover:text-error-700 dark:text-error-400"
                    title="Hapus jadwal"
                >
                    <Trash2 className="w-3 h-3" />
                </button>
            </div>
        </div>
    );
};

export default CourierScheduleChip;
