import { Feature, Outlet, OutletFeature } from "@/types";

export interface OutletFeatureIndexProps {
    outlet: Outlet;
    isLoading?: boolean;
}

export interface OutletFeaturesCreateProps {
    outlet: Outlet;
    features: Feature[];
    ownerCoins: number;
}

export interface OutletExposureCardProps {
    outlet: Outlet;
    outletFeature: OutletFeature;
}
