import { Outlet } from ".";

export interface CourierSchedule {
    id: number;
    outletId: number;
    dayOfWeek: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
    dayLabel: string;
    type: 'pickup' | 'delivery';
    typeLabel: string;
    startTime: string;
    endTime: string;
    isActive: boolean;
    outlet?: Outlet;
    createdAt: string;
    updatedAt: string;
}
