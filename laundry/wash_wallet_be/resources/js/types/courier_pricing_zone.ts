import { BaseFilters, BaseSortOptions, CourierSetting } from ".";

export type LocationType = "district" | "village";

export interface CourierPricingZone {
    id: number;
    courierSettingId: number;
    locationType: LocationType;
    locationId: string;
    locationName: string;
    parentDistrictId?: string | null;
    fee: number;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
    courierSetting?: CourierSetting;
}

export interface CourierPricingZoneFilters extends BaseFilters {
    courierSettingId?: number;
    locationType?: LocationType;
}

export interface CourierPricingZoneSortOptions extends BaseSortOptions {
    column: "locationName" | "fee" | "sortOrder";
}

export interface CourierPricingZoneFormData {
    id?: number | null;
    courierSettingId: number;
    locationType: LocationType;
    locationId: string;
    locationName: string;
    parentDistrictId?: string | null;
    fee: number;
    sortOrder: number;
    [key: string]: any;
}
