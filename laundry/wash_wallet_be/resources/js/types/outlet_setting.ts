import { Outlet, Setting } from ".";

export interface OutletSetting {
    id: number;
    outletId: number;
    settingId: number;
    value: string;
    createdAt: string;
    updatedAt: string;
    outlet?: Outlet;
    setting?: Setting;
    [key: string]: any;
}
