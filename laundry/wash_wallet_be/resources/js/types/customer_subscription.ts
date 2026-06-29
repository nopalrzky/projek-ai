import {
    BaseFilters,
    BaseSortOptions,
    Customer,
    CustomerQuota,
    QuotaUsageLog,
    ServicePackage,
} from ".";

export type SubscriptionStatus =
    | "active"
    | "exhausted"
    | "expired"
    | "canceled";

export type SubscriptionStatusLabel =
    | "Aktif"
    | "Habis"
    | "Kadaluarsa"
    | "Dibatalkan";

export type StatusBadgeVariant = "success" | "warning" | "danger" | "secondary";

export interface CustomerSubscription {
    id: number;
    customerId: number;
    servicePackageId: number;
    subscriptionCode: string;
    pricePaid: number;
    purchaseDate: string;
    expiredAt: string | null;
    purchaseDateFrom?: string;
    purchaseDateTo?: string;
    status: SubscriptionStatus;
    statusLabel?: SubscriptionStatusLabel;
    statusBadgeVariant: StatusBadgeVariant;
    isUnlimited: boolean;
    createdAt: string;
    updatedAt: string;
    customer?: Customer;
    servicePackage?: ServicePackage;
    customerQuotas: CustomerQuota[];
    quotaUsageLogs?: QuotaUsageLog[];
    remainingDays?: number | null;
    isExpired?: boolean;
    isExhausted?: boolean;
}

/**
 * Customer subscription filter interface
 */
export interface CustomerSubscriptionFilters extends BaseFilters {
    customerId?: number;
    servicePackageId?: number;
    status?: SubscriptionStatus;
    subscriptionCode?: string;
    purchaseDate?: string;
    expiredAt?: string;
    purchaseDateFrom?: string;
    purchaseDateTo?: string;
    expiringInDays?: number;
    hasRemainingQuota?: boolean;
    withRelations?: boolean;
    withCounts?: boolean;
    expiredAtFrom?: string;
    expiredAtTo?: string;
}

/**
 * Customer subscription sort options
 */
export interface CustomerSubscriptionSortOptions extends BaseSortOptions {
    column:
        | "subscriptionCode"
        | "pricePaid"
        | "purchaseDate"
        | "expiredAt"
        | "status"
        | "createdAt"
        | "updatedAt"
        | "customerId"
        | "servicePackageId";
}

/**
 * Customer subscription form data
 */
export interface CustomerSubscriptionFormData {
    customerId: number;
    servicePackageId: number;
    pricePaid: number;
    purchaseDate: string;
    expiredAt?: string | null;
}
