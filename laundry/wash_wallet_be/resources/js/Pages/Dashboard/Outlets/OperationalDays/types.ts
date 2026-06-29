import { Outlet, OperationalDay } from "@/types";

export interface OutletOperationalDaysIndexProps {
    outlet: Outlet;
    isLoading?: boolean;
}

export interface SetupOperationalDayModalProps {
    isOpen: boolean;
    dayOfWeek?: string;
    dayLabel?: string;
    operationalDay: OperationalDay;
    onClose: () => void;
    onConfirm: (data: any) => void;
    isLoading: boolean;
}
