import { Outlet, CourierSchedule } from "@/types";

export interface CourierScheduleIndexProps {
    outlet: Outlet;
    isLoading?: boolean;
}

export interface CourierScheduleCreateProps {
    outlet: Outlet;
}

export interface CourierScheduleEditProps {
    outlet: Outlet;
    schedule: CourierSchedule;
}

export interface CourierScheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    outletId: number;
    dayOfWeek?: string;
    schedule?: CourierSchedule;
}

export interface CourierScheduleDeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (schedule: CourierSchedule) => void;
    schedule: CourierSchedule | null;
    isLoading?: boolean;
}

export interface EditSettingsProps {
    outlet: Outlet;
}