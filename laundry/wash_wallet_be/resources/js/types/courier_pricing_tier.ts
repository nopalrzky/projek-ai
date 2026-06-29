import { BaseFilters, BaseSortOptions, CourierSetting } from ".";

export interface CourierPricingTier {
    id: number;
    courierSettingId: number;
    minKm: number;
    maxKm: number;
    fee: number;
    perKmFee?: number | null;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
    courierSetting?: CourierSetting;
}

export interface CourierPricingTierFilters extends BaseFilters {
    courierSettingId?: number;
}

export interface CourierPricingTierSortOptions extends BaseSortOptions {
    column: "minKm" | "maxKm" | "fee" | "sortOrder";
}

export interface CourierPricingTierFormData {
    courierSettingId: number;
    minKm: number;
    maxKm: number;
    fee: number;
    perKmFee?: number | null;
    sortOrder: number;
    [key: string]: any;
}
