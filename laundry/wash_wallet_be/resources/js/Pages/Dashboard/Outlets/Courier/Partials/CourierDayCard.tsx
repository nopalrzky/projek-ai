import React from "react";
import { motion } from "framer-motion";
import {
    Calendar,
    Package,
    Navigation,
    Plus,
    Coffee,
} from "lucide-react";
import { Button } from "@/Components/Button";
import { Badge } from "@/Components/Badge";
import { CourierSchedule } from "@/types";
import CourierScheduleChip from "./CourierScheduleChip";

interface CourierDayCardProps {
    day: string;
    dayLabel: string;
    index: number;
    isDisabled: boolean;
    isUpdatingDays: boolean;
    onToggleDay: (day: string) => void;
    schedules: CourierSchedule[];
    onAddClick: (day: string, type: "pickup" | "delivery") => void;
    onEditClick: (schedule: CourierSchedule) => void;
    onDeleteClick: (schedule: CourierSchedule) => void;
}

const dayColors: Record<string, { accent: string; bg: string; text: string }> = {
    monday:    { accent: "bg-blue-500",   bg: "bg-blue-50 dark:bg-blue-900/20",    text: "text-blue-600 dark:text-blue-400" },
    tuesday:   { accent: "bg-violet-500", bg: "bg-violet-50 dark:bg-violet-900/20", text: "text-violet-600 dark:text-violet-400" },
    wednesday: { accent: "bg-emerald-500",bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-600 dark:text-emerald-400" },
    thursday:  { accent: "bg-amber-500",  bg: "bg-amber-50 dark:bg-amber-900/20",  text: "text-amber-600 dark:text-amber-400" },
    friday:    { accent: "bg-rose-500",   bg: "bg-rose-50 dark:bg-rose-900/20",    text: "text-rose-600 dark:text-rose-400" },
    saturday:  { accent: "bg-pink-500",   bg: "bg-pink-50 dark:bg-pink-900/20",    text: "text-pink-600 dark:text-pink-400" },
    sunday:    { accent: "bg-orange-500", bg: "bg-orange-50 dark:bg-orange-900/20", text: "text-orange-600 dark:text-orange-400" },
};

const CourierDayCard: React.FC<CourierDayCardProps> = ({
    day,
    dayLabel,
    index,
    isDisabled,
    isUpdatingDays,
    onToggleDay,
    schedules,
    onAddClick,
    onEditClick,
    onDeleteClick,
}) => {
    const pickupSchedules = schedules.filter((s) => s.type === "pickup");
    const deliverySchedules = schedules.filter((s) => s.type === "delivery");
    const colors = dayColors[day] ?? dayColors["monday"];
    const totalSlots = schedules.length;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.35 }}
            className="h-full"
        >
            <div
                className={`group h-full rounded-2xl border transition-all duration-300 flex flex-col overflow-hidden ${
                    isDisabled
                        ? "bg-surface-muted/40 border-dashed border-border/70 opacity-70"
                        : "bg-surface border-border hover:shadow-lg hover:border-primary-200 dark:hover:border-primary-800"
                }`}
            >
                {/* Colored top accent bar */}
                <div
                    className={`h-1 w-full ${
                        isDisabled ? "bg-border" : colors.accent
                    } transition-colors`}
                />

                {/* Day Header */}
                <div
                    className={`px-4 py-3 flex items-center justify-between ${
                        isDisabled
                            ? "bg-surface-muted/30"
                            : "bg-surface-muted/40"
                    }`}
                >
                    <div className="flex items-center gap-2.5">
                        <div
                            className={`p-1.5 rounded-lg ${
                                isDisabled
                                    ? "bg-surface-muted text-text-tertiary"
                                    : `${colors.bg} ${colors.text}`
                            }`}
                        >
                            <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                            <span
                                className={`font-bold text-base ${
                                    isDisabled ? "text-text-tertiary" : "text-text-primary"
                                }`}
                            >
                                {dayLabel}
                            </span>
                            {!isDisabled && totalSlots > 0 && (
                                <span className={`ml-2 text-[10px] font-bold ${colors.text}`}>
                                    {totalSlots} slot
                                </span>
                            )}
                        </div>
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        className={`h-7 px-2.5 text-[10px] uppercase font-bold tracking-wider rounded-lg transition-all ${
                            isDisabled
                                ? "text-success-600 dark:text-success-400 hover:bg-success-50 dark:hover:bg-success-900/20 opacity-100"
                                : "text-error-500 hover:bg-error-50 dark:hover:bg-error-900/20 opacity-0 group-hover:opacity-100"
                        }`}
                        onClick={() => onToggleDay(day)}
                        disabled={isUpdatingDays}
                    >
                        {isDisabled ? "Aktifkan" : "Libur"}
                    </Button>
                </div>

                {/* Body */}
                <div className="p-4 space-y-4 flex-grow">
                    {isDisabled ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center space-y-3 animate-fadeIn">
                            <div className="w-14 h-14 rounded-2xl bg-surface-muted flex items-center justify-center text-text-tertiary">
                                <Coffee className="w-7 h-7" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-text-secondary">Hari Libur</p>
                                <p className="text-[10px] text-text-tertiary leading-relaxed mt-0.5">
                                    Tidak ada jadwal kurir hari ini
                                </p>
                            </div>
                            <Button
                                variant="secondary"
                                size="sm"
                                className="h-7 text-[10px] px-3"
                                onClick={() => onToggleDay(day)}
                                disabled={isUpdatingDays}
                            >
                                Aktifkan Hari Ini
                            </Button>
                        </div>
                    ) : (
                        <>
                            {/* Pickup Section */}
                            <section className="space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-text-tertiary">
                                        <Package className="w-3.5 h-3.5 text-primary-500" />
                                        Pickup
                                        {pickupSchedules.length > 0 && (
                                            <Badge variant="info" size="sm" className="text-[9px] px-1.5 py-0 ml-1">
                                                {pickupSchedules.length}
                                            </Badge>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => onAddClick(day, "pickup")}
                                        className="w-6 h-6 rounded-lg flex items-center justify-center text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                                        title="Tambah jadwal pickup"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {pickupSchedules.length > 0 ? (
                                        pickupSchedules.map((s) => (
                                            <CourierScheduleChip
                                                key={s.id}
                                                schedule={s}
                                                onEdit={() => onEditClick(s)}
                                                onDelete={() => onDeleteClick(s)}
                                            />
                                        ))
                                    ) : (
                                        <button
                                            onClick={() => onAddClick(day, "pickup")}
                                            className="flex items-center gap-1 text-[10px] italic text-text-tertiary hover:text-primary-500 transition-colors"
                                        >
                                            <Plus className="w-3 h-3" />
                                            Tambah slot
                                        </button>
                                    )}
                                </div>
                            </section>

                            {/* Divider */}
                            <div className="border-t border-border-light" />

                            {/* Delivery Section */}
                            <section className="space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-text-tertiary">
                                        <Navigation className="w-3.5 h-3.5 text-success-500" />
                                        Delivery
                                        {deliverySchedules.length > 0 && (
                                            <Badge variant="success" size="sm" className="text-[9px] px-1.5 py-0 ml-1">
                                                {deliverySchedules.length}
                                            </Badge>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => onAddClick(day, "delivery")}
                                        className="w-6 h-6 rounded-lg flex items-center justify-center text-success-600 dark:text-success-400 hover:bg-success-50 dark:hover:bg-success-900/20 transition-colors"
                                        title="Tambah jadwal delivery"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {deliverySchedules.length > 0 ? (
                                        deliverySchedules.map((s) => (
                                            <CourierScheduleChip
                                                key={s.id}
                                                schedule={s}
                                                onEdit={() => onEditClick(s)}
                                                onDelete={() => onDeleteClick(s)}
                                            />
                                        ))
                                    ) : (
                                        <button
                                            onClick={() => onAddClick(day, "delivery")}
                                            className="flex items-center gap-1 text-[10px] italic text-text-tertiary hover:text-success-500 transition-colors"
                                        >
                                            <Plus className="w-3 h-3" />
                                            Tambah slot
                                        </button>
                                    )}
                                </div>
                            </section>
                        </>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default CourierDayCard;
