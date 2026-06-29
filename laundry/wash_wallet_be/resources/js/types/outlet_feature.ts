import { Feature, Outlet } from ".";

export type OutletFeatureStatus = "inactive" | "trial" | "active" | "expired";

export interface OutletFeature {
    id: number;
    outletId: number;
    featureId: number;
    status: OutletFeatureStatus;
    trialExpiresAt?: string | null;
    unlockedAt?: string | null;
    expiresAt?: string | null;
    coinSpent?: number;
    autoRenewal?: boolean;
    outlet: Outlet;
    feature: Feature;
    createdAt: string;
    updatedAt: string;
}
