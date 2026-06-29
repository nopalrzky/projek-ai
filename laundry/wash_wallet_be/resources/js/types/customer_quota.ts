import { BaseFilters, CustomerSubscription, LaundryService } from ".";

export interface CustomerQuota {
    id: number;
    customerSubscriptionId: number;
    laundryServiceId: number;
    totalQuota: number;
    remainingQuota: number;
    createdAt: string;
    updatedAt: string;
    customerSubscription?: CustomerSubscription;
    laundryService?: LaundryService;
    usagePercentage?: number;
    usedQuota?: number;
    hasRemaining?: boolean;
    isExhausted?: boolean;
    formattedQuota?: string;
}

/**
 * Customer quota filter interface
 */
export interface CustomerQuotaFilters extends BaseFilters {
    customerSubscriptionId?: number;
    laundryServiceId?: number;
    customerId?: number;
    hasRemaining?: boolean;
    isExhausted?: boolean;
    minRemainingQuota?: number;
    maxRemainingQuota?: number;
    withRelations?: boolean;
}

/**
 * Customer quota form data
 */
export interface CustomerQuotaFormData {
    customerSubscriptionId: number;
    laundryServiceId: number;
    totalQuota: number;
    remainingQuota?: number;
}

/**
 * Quota usage request
 */
export interface QuotaUsageRequest {
    customerSubscriptionId: number;
    laundryServiceId: number;
    orderItemId: number;
    amountToUse: number;
}

/**
 * Quota availability check
 */
export interface QuotaAvailability {
    available: boolean;
    quotaId?: number;
    remainingQuota: number;
    requestedAmount: number;
    canFulfill: boolean;
    message?: string;
}

/**
 * Customer quota summary
 */
export interface CustomerQuotaSummary {
    customerId: number;
    totalQuotas: number;
    totalRemaining: number;
    totalUsed: number;
    overallUsagePercentage: number;
    quotasByVariant: QuotaByVariant[];
}

/**
 * Quota by variant
 */
export interface QuotaByVariant {
    variantId: number;
    variantName: string;
    serviceName: string;
    unit: string;
    totalQuota: number;
    remainingQuota: number;
    usedQuota: number;
    usagePercentage: number;
    subscriptionCode: string;
    expiredAt?: string | null;
}
