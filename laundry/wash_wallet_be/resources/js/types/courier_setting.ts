import {
    BaseFilters,
    BaseSortOptions,
    Outlet,
    CourierPricingTier,
    CourierPricingZone,
} from ".";

export type PricingMethod =
    | "flat_rate"
    | "distance_based"
    | "zone_based"
    | "tiered";
export type MerchantSubsidyType = "percentage" | "fixed_amount";
export type FreeShippingMode = "none" | "min_order" | "all";

export interface CourierSetting {
    id: number;
    outletId: number;
    isCourierEnabled: boolean;
    pricingMethod: PricingMethod;
    flatFee?: number | null;
    baseFee?: number | null;
    perKmFee?: number | null;
    defaultPrice?: number | null;
    freeRadiusKm?: number | null;
    minFee?: number | null;
    maxFee?: number | null;
    maxDistanceKm?: number | null;
    surgeEnabled: boolean;
    surgeMultiplier?: number | null;
    nightSurcharge?: number | null;
    nightStartTime?: string | null;
    nightEndTime?: string | null;
    weekendSurcharge?: number | null;
    merchantSubsidy?: number | null;
    merchantSubsidyType?: MerchantSubsidyType | null;
    freeShippingEnabled: boolean;
    unconditionalFreeShippingEnabled?: boolean;
    freeShippingMode?: FreeShippingMode;
    minOrderFreeShipping?: number | null;
    pickupFee?: number | null;
    deliveryFee?: number | null;
    createdAt: string;
    updatedAt: string;
    outlet?: Outlet;
    pricingTiers?: CourierPricingTier[];
    pricingZones?: CourierPricingZone[];
    disabledDays?: string[];
}

export interface CourierSettingFilters extends BaseFilters {
    outletId?: number;
    pricingMethod?: PricingMethod;
}

export interface CourierSettingSortOptions extends BaseSortOptions {
    column: "pricingMethod" | "createdAt" | "updatedAt";
}

export interface CourierSettingFormData {
    courierSettingId: number;
    outletId: number;
    pricingMethod: PricingMethod;
    flatFee?: number | null;
    baseFee?: number | null;
    perKmFee?: number | null;
    defaultPrice?: number | null;
    freeRadiusKm?: number | null;
    minFee?: number | null;
    maxFee?: number | null;
    maxDistanceKm?: number | null;
    surgeEnabled: boolean;
    surgeMultiplier?: number | null;
    nightSurcharge?: number | null;
    nightStartTime?: string | null;
    nightEndTime?: string | null;
    weekendSurcharge?: number | null;
    merchantSubsidy?: number | null;
    merchantSubsidyType?: MerchantSubsidyType | null;
    freeShippingMode: FreeShippingMode;
    freeShippingEnabled: boolean;
    unconditionalFreeShippingEnabled?: boolean;
    minOrderFreeShipping?: number | null;
    pickupFee?: number | null;
    deliveryFee?: number | null;
    tiers: any[];
    zones: any[];
    [key: string]: any;
}
