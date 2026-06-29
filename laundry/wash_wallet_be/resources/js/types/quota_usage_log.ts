import {
    BaseFilters,
    BaseSortOptions,
    CustomerSubscription,
    OrderItem,
} from ".";

export interface QuotaUsageLog {
    id: number;
    customerSubscriptionId: number;
    orderItemId: number | null;
    amountUsed: number;
    orderNumber?: string | null;
    laundryServiceName?: string | null;
    orderItemQuantity?: number | null;
    createdAt: string;
    updatedAt: string;
    customerSubscription?: CustomerSubscription;
    orderItem?: OrderItem;
}

/**
 * Quota usage log filter interface
 */
export interface QuotaUsageLogFilters extends BaseFilters {
    customerSubscriptionId?: number;
    orderItemId?: number;
    customerId?: number;
    startDate?: string;
    endDate?: string;
    dateBetween?: {
        start: string;
        end: string;
    };
    minAmount?: number;
    maxAmount?: number;
    withRelations?: boolean;
}

/**
 * Quota usage log sort options
 */
export interface QuotaUsageLogSortOptions extends BaseSortOptions {
    column:
        | "amountUsed"
        | "createdAt"
        | "updatedAt"
        | "customerSubscriptionId"
        | "orderItemId";
}

/**
 * Quota usage log form data
 */
export interface QuotaUsageLogFormData {
    customerSubscriptionId: number;
    orderItemId: number;
    amountUsed: number;
}

/**
 * Quota usage statistics
 */
export interface QuotaUsageStatistics {
    totalUsage: number;
    totalLogs: number;
    averageUsagePerLog: number;
    usageByDate: UsageByDate[];
    usageByVariant: UsageByVariant[];
    usageByCustomer: UsageByCustomer[];
}

/**
 * Usage by date
 */
export interface UsageByDate {
    date: string;
    totalUsage: number;
    logsCount: number;
}

/**
 * Usage by variant
 */
export interface UsageByVariant {
    variantId: number;
    variantName: string;
    serviceName: string;
    totalUsage: number;
    logsCount: number;
    unit: string;
}

/**
 * Usage by customer
 */
export interface UsageByCustomer {
    customerId: number;
    customerName: string;
    totalUsage: number;
    logsCount: number;
    subscriptionsCount: number;
}

/**
 * Quota usage timeline
 */
export interface QuotaUsageTimeline {
    logId: number;
    date: string;
    orderCode: string;
    variantName: string;
    amountUsed: number;
    remainingBefore: number;
    remainingAfter: number;
}
