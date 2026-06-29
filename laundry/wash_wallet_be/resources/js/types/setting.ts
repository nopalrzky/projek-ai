import { OutletSetting } from ".";

export interface Setting {
    id: number;
    key: string;
    name: string;
    description: string | null;
    outletSettings: OutletSetting[];
    createdAt: string;
    updatedAt: string;
}
