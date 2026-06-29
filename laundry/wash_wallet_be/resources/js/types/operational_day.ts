import { Outlet } from ".";

export interface OperationalDay {
    id: number;
    outletId: number;
    dayOfWeek: string;
    dayLabel: string;
    isOpen: boolean;
    openTime: string | null;
    closeTime: string | null;
    isConfigured: boolean;
    status: string;
    duration: number | null;
    notes?: string | null;
    createdAt: string;
    updatedAt: string;
    outlet: Outlet;
}

/**
 * Operational day form data interface
 */
export interface OperationalDayFormData {
    outletId: number;
    dayOfWeek: string;
    isOpen: boolean;
    openTime?: string;
    closeTime?: string;
}

/**
 * Day of week enum
 */
export enum DayOfWeek {
    MONDAY = "monday",
    TUESDAY = "tuesday",
    WEDNESDAY = "wednesday",
    THURSDAY = "thursday",
    FRIDAY = "friday",
    SATURDAY = "saturday",
    SUNDAY = "sunday",
}

/**
 * Day of week labels
 */
export const DayOfWeekLabels: Record<DayOfWeek, string> = {
    [DayOfWeek.MONDAY]: "Senin",
    [DayOfWeek.TUESDAY]: "Selasa",
    [DayOfWeek.WEDNESDAY]: "Rabu",
    [DayOfWeek.THURSDAY]: "Kamis",
    [DayOfWeek.FRIDAY]: "Jumat",
    [DayOfWeek.SATURDAY]: "Sabtu",
    [DayOfWeek.SUNDAY]: "Minggu",
};

/**
 * Operational day filter interface
 */
export interface OperationalDayFilters {
    outletId?: number;
    dayOfWeek?: string;
    isOpen?: boolean;
}

/**
 * Bulk operational days update
 */
export interface BulkOperationalDaysData {
    outletId: number;
    operationalDays: OperationalDayFormData[];
}
