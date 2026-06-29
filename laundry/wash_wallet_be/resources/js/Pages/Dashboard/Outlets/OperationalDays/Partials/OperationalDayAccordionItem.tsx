import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Calendar,
    ChevronDown,
    CheckCircle,
    XCircle,
    Clock,
    Package,
    Navigation,
    Plus,
    Settings2,
    Save
} from "lucide-react";
import { Badge } from "@/Components/Badge";
import { Button } from "@/Components/Button";
import { Input } from "@/Components/Input";
import { Alert } from "@/Components/Alert";
import { OperationalDay, CourierSchedule } from "@/types";
import CourierScheduleChip from "../../Courier/Partials/CourierScheduleChip";

interface OperationalDayAccordionItemProps {
    day: OperationalDay;
    isExpanded: boolean;
    onToggle: () => void;

    isCourierUnlocked: boolean;
    isCourierEnabled: boolean;
    courierSchedules: CourierSchedule[];
    isCourierDayDisabled: boolean;
    isUpdatingCourierDay: boolean;
    onAddCourierClick: (day: string, type: "pickup" | "delivery") => void;
    onEditCourierClick: (schedule: CourierSchedule) => void;
    onDeleteCourierClick: (schedule: CourierSchedule) => void;
    onToggleCourierDay: (day: string) => void;

    onSaveOperationalDay: (dayId: number, data: any) => void;
    isSavingOperationalDay: boolean;
}

const dayColors: Record<string, { accent: string; bg: string; text: string }> = {
    monday: { accent: "bg-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-600 dark:text-blue-400" },
    tuesday: { accent: "bg-violet-500", bg: "bg-violet-50 dark:bg-violet-900/20", text: "text-violet-600 dark:text-violet-400" },
    wednesday: { accent: "bg-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-600 dark:text-emerald-400" },
    thursday: { accent: "bg-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20", text: "text-amber-600 dark:text-amber-400" },
    friday: { accent: "bg-rose-500", bg: "bg-rose-50 dark:bg-rose-900/20", text: "text-rose-600 dark:text-rose-400" },
    saturday: { accent: "bg-pink-500", bg: "bg-pink-50 dark:bg-pink-900/20", text: "text-pink-600 dark:text-pink-400" },
    sunday: { accent: "bg-orange-500", bg: "bg-orange-50 dark:bg-orange-900/20", text: "text-orange-600 dark:text-orange-400" },
};

const OperationalDayAccordionItem: React.FC<OperationalDayAccordionItemProps> = ({
    day,
    isExpanded,
    onToggle,
    isCourierUnlocked,
    isCourierEnabled,
    courierSchedules,
    isCourierDayDisabled,
    isUpdatingCourierDay,
    onAddCourierClick,
    onEditCourierClick,
    onDeleteCourierClick,
    onToggleCourierDay,
    onSaveOperationalDay,
    isSavingOperationalDay
}) => {
    const pickupSchedules = courierSchedules.filter((s) => s.type === "pickup");
    const deliverySchedules = courierSchedules.filter((s) => s.type === "delivery");
    const colors = dayColors[day.dayOfWeek.toLowerCase()] ?? dayColors["monday"];
    const isSetup = day.isConfigured;

    const [formData, setFormData] = useState({
        isOpen: day.isOpen,
        openTime: day.openTime || "",
        closeTime: day.closeTime || "",
    });
    const [errors, setErrors] = useState<{ openTime?: string; closeTime?: string }>({});

    useEffect(() => {
        setFormData({
            isOpen: day.isOpen,
            openTime: day.openTime || "",
            closeTime: day.closeTime || "",
        });
        setErrors({});
    }, [day, isExpanded]);

    const handleIsOpenChange = (checked: boolean) => {
        setFormData((prev) => ({ ...prev, isOpen: checked }));
        if (!checked) setErrors({});
    };

    const validateForm = (): boolean => {
        const newErrors: { openTime?: string; closeTime?: string } = {};

        if (formData.isOpen) {
            if (!formData.openTime) newErrors.openTime = "Jam buka harus diisi";
            if (!formData.closeTime) newErrors.closeTime = "Jam tutup harus diisi";

            if (formData.openTime && formData.closeTime) {
                const openTime = new Date(`2000-01-01T${formData.openTime}`);
                const closeTime = new Date(`2000-01-01T${formData.closeTime}`);
                if (closeTime <= openTime) {
                    newErrors.closeTime = "Jam tutup harus lebih besar dari jam buka";
                }
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = () => {
        if (!validateForm()) return;
        onSaveOperationalDay(day.id, {
            dayOfWeek: day.dayOfWeek,
            isOpen: formData.isOpen,
            openTime: formData.isOpen ? formData.openTime : null,
            closeTime: formData.isOpen ? formData.closeTime : null,
        });
    };

    // Derived states
    const hasUnsavedChanges =
        formData.isOpen !== day.isOpen ||
        formData.openTime !== (day.openTime || "") ||
        formData.closeTime !== (day.closeTime || "");

    return (
        <div
            className={`border rounded-xl mb-3 overflow-hidden transition-all duration-200 ${isExpanded ? "border-primary-200 dark:border-primary-800 shadow-md" : "border-border hover:border-primary-100 dark:hover:border-primary-900"
                }`}
            style={{ backgroundColor: "var(--color-surface)" }}
        >
            {/* Header (Clickable) */}
            <button
                onClick={onToggle}
                className={`w-full px-5 py-4 flex items-center justify-between transition-colors ${isExpanded ? "bg-surface-muted/50" : "hover:bg-surface-muted/30"
                    }`}
            >
                <div className="flex items-center gap-4">
                    {/* Day Icon */}
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors.bg} ${colors.text}`}>
                        <Calendar className="w-5 h-5" />
                    </div>

                    {/* Day Name & Status */}
                    <div className="text-left">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-base" style={{ color: "var(--color-text-primary)" }}>
                                {day.dayLabel}
                            </span>

                            {!isSetup ? (
                                <Badge variant="secondary" size="sm" className="hidden sm:inline-flex text-[10px] py-0">
                                    <Settings2 className="w-3 h-3 mr-1" /> Belum Diatur
                                </Badge>
                            ) : (
                                <Badge variant={day.isOpen ? "success" : "warning"} size="sm" className="hidden sm:inline-flex text-[10px] py-0">
                                    {day.isOpen ? "Buka" : "Tutup"}
                                </Badge>
                            )}
                        </div>

                        {/* Operational Hours preview */}
                        <div className="text-xs mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
                            {isSetup && day.isOpen && day.openTime && day.closeTime ? (
                                <span>{day.openTime.substring(0, 5)} - {day.closeTime.substring(0, 5)}</span>
                            ) : isSetup && !day.isOpen ? (
                                <span>Tutup seharian</span>
                            ) : (
                                <span>Atur jam operasional</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Courier Slot Indicators (only if active) */}
                    {isCourierUnlocked && isCourierEnabled && (
                        <div className="hidden md:flex items-center gap-2">
                            <div className="flex items-center gap-1 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 px-2 py-1 rounded text-xs font-medium border border-primary-100 dark:border-primary-800/50">
                                <Package className="w-3 h-3" /> {pickupSchedules.length}
                            </div>
                            <div className="flex items-center gap-1 bg-success-50 dark:bg-success-900/20 text-success-600 dark:text-success-400 px-2 py-1 rounded text-xs font-medium border border-success-100 dark:border-success-800/50">
                                <Navigation className="w-3 h-3" /> {deliverySchedules.length}
                            </div>
                        </div>
                    )}

                    <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-200 ${isExpanded ? "rotate-180 bg-primary-50 text-primary-600" : "bg-surface-muted text-text-tertiary"
                            }`}
                    >
                        <ChevronDown className="w-5 h-5" />
                    </div>
                </div>
            </button>

            {/* Expandable Body */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-border"
                    >
                        <div className="p-5 space-y-6">

                            {/* SECTION 1: Operational Hours Form */}
                            <div>
                                <h4 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: "var(--color-text-secondary)" }}>
                                    Jam Operasional Outlet
                                </h4>

                                <div className="space-y-4">
                                    <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-border bg-surface-muted/30 hover:bg-surface-muted/50 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={formData.isOpen}
                                            onChange={(e) => handleIsOpenChange(e.target.checked)}
                                            disabled={isSavingOperationalDay}
                                            className="w-5 h-5 rounded border-2 text-primary-600 focus:ring-primary-500"
                                        />
                                        <div className="flex-1">
                                            <span className="font-medium" style={{ color: "var(--color-text-primary)" }}>
                                                Outlet buka pada hari ini
                                            </span>
                                            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
                                                {formData.isOpen ? "Outlet akan beroperasi pada hari ini" : "Outlet tidak beroperasi pada hari ini"}
                                            </p>
                                        </div>
                                    </label>

                                    {formData.isOpen && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
                                                    Jam Buka
                                                </label>
                                                <Input
                                                    type="time"
                                                    value={formData.openTime}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, openTime: e.target.value }))}
                                                    error={errors.openTime}
                                                    disabled={isSavingOperationalDay}
                                                    required
                                                    leftIcon={<Clock className="w-4 h-4" />}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
                                                    Jam Tutup
                                                </label>
                                                <Input
                                                    type="time"
                                                    value={formData.closeTime}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, closeTime: e.target.value }))}
                                                    error={errors.closeTime}
                                                    disabled={isSavingOperationalDay}
                                                    required
                                                    leftIcon={<Clock className="w-4 h-4" />}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {hasUnsavedChanges && (
                                        <div className="flex items-center justify-end">
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                onClick={handleSave}
                                                loading={isSavingOperationalDay}
                                                leftIcon={<Save className="w-4 h-4" />}
                                            >
                                                Simpan Jam Operasional
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Divider */}
                            {isCourierUnlocked && (
                                <div className="border-t border-dashed" style={{ borderColor: "var(--color-border)" }} />
                            )}

                            {/* SECTION 2: Courier Schedule (if feature enabled) */}
                            {isCourierUnlocked && (
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-sm font-bold uppercase tracking-wider" style={{ color: "var(--color-text-secondary)" }}>
                                            Jadwal Kurir
                                        </h4>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className={`h-7 px-2.5 text-[10px] uppercase font-bold tracking-wider rounded-lg transition-all ${isCourierDayDisabled
                                                ? "text-success-600 dark:text-success-400 hover:bg-success-50 dark:hover:bg-success-900/20"
                                                : "text-error-500 hover:bg-error-50 dark:hover:bg-error-900/20"
                                                }`}
                                            onClick={() => onToggleCourierDay(day.dayOfWeek)}
                                            disabled={isUpdatingCourierDay || !isCourierEnabled}
                                        >
                                            {isCourierDayDisabled ? "Aktifkan Kurir Hari Ini" : "Liburkan Kurir Hari Ini"}
                                        </Button>
                                    </div>

                                    {!isCourierEnabled ? (
                                        <Alert
                                            variant="warning"
                                            title="Layanan Kurir Dinonaktifkan"
                                            description="Aktifkan kembali layanan kurir pada panel Kurir untuk mengatur jadwal."
                                        />
                                    ) : isCourierDayDisabled ? (
                                        <div className="bg-surface-muted/50 rounded-lg p-6 text-center border border-dashed border-border">
                                            <p className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>Layanan Kurir Libur</p>
                                            <p className="text-xs mt-1" style={{ color: "var(--color-text-tertiary)" }}>Tidak ada jadwal pickup/delivery untuk hari ini.</p>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="mt-3"
                                                onClick={() => onToggleCourierDay(day.dayOfWeek)}
                                                disabled={isUpdatingCourierDay}
                                            >
                                                Aktifkan Kurir Hari Ini
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Pickup Section */}
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary-600">
                                                        <Package className="w-4 h-4" />
                                                        Pickup
                                                        <Badge variant="primary" size="sm" className="text-[10px] px-1.5 py-0 ml-1">
                                                            {pickupSchedules.length}
                                                        </Badge>
                                                    </div>
                                                    <button
                                                        onClick={() => onAddCourierClick(day.dayOfWeek, "pickup")}
                                                        className="w-7 h-7 rounded-lg flex items-center justify-center text-primary-600 hover:bg-primary-50 transition-colors"
                                                        title="Tambah jadwal pickup"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <div className="flex flex-wrap gap-2 bg-surface-muted/20 p-3 rounded-lg border border-border-light min-h-[60px]">
                                                    {pickupSchedules.length > 0 ? (
                                                        pickupSchedules.map((s) => (
                                                            <CourierScheduleChip
                                                                key={s.id}
                                                                schedule={s}
                                                                onEdit={() => onEditCourierClick(s)}
                                                                onDelete={() => onDeleteCourierClick(s)}
                                                            />
                                                        ))
                                                    ) : (
                                                        <div className="w-full flex items-center justify-center text-xs italic" style={{ color: "var(--color-text-tertiary)" }}>
                                                            Belum ada slot pickup
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Delivery Section */}
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-success-600">
                                                        <Navigation className="w-4 h-4" />
                                                        Delivery
                                                        <Badge variant="success" size="sm" className="text-[10px] px-1.5 py-0 ml-1">
                                                            {deliverySchedules.length}
                                                        </Badge>
                                                    </div>
                                                    <button
                                                        onClick={() => onAddCourierClick(day.dayOfWeek, "delivery")}
                                                        className="w-7 h-7 rounded-lg flex items-center justify-center text-success-600 hover:bg-success-50 transition-colors"
                                                        title="Tambah jadwal delivery"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <div className="flex flex-wrap gap-2 bg-surface-muted/20 p-3 rounded-lg border border-border-light min-h-[60px]">
                                                    {deliverySchedules.length > 0 ? (
                                                        deliverySchedules.map((s) => (
                                                            <CourierScheduleChip
                                                                key={s.id}
                                                                schedule={s}
                                                                onEdit={() => onEditCourierClick(s)}
                                                                onDelete={() => onDeleteCourierClick(s)}
                                                            />
                                                        ))
                                                    ) : (
                                                        <div className="w-full flex items-center justify-center text-xs italic" style={{ color: "var(--color-text-tertiary)" }}>
                                                            Belum ada slot delivery
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default OperationalDayAccordionItem;
