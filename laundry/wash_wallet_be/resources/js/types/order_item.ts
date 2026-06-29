import {
    BaseFilters,
    BaseSortOptions,
    CustomerSubscription,
    LaundryService,
    Order,
    OrderItemProcess,
    QuotaUsageLog,
} from ".";

export type ProductionStatus = "pending" | "processing" | "done";

export interface OrderItem {
    id: number;
    orderId: number;
    laundryServiceId: number;
    categoryName: string;
    laundryServiceName: string;
    unitName: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    discountAmount: number;
    totalAmount: number;
    formattedQuantity?: string;
    formattedUnitPrice?: string;
    formattedSubtotal?: string;
    formattedDiscountAmount?: string;
    formattedTotalAmount?: string;
    status: string;
    statusLabel: string;
    itemNotes: string | null;
    formattedCreatedAt?: string;
    formattedUpdatedAt?: string;
    customerSubscription?: CustomerSubscription;
    laundryService: LaundryService;
    order: Order;
    orderItemProcesses?: OrderItemProcess[];
    quotaUsageLog?: QuotaUsageLog;
    createdAt: string;
    updatedAt: string;
}

/**
 * Order item filter interface
 */
export interface OrderItemFilters extends BaseFilters {
    orderId?: number;
    laundryServiceId?: number;
    productionStatus?: ProductionStatus;
    categoryName?: string;
    laundryServiceName?: string;
    isPackageUsage?: boolean;
    isCashPayment?: boolean;
    customerSubscriptionId?: number;
    minAmount?: number;
    maxAmount?: number;
    minQuantity?: number;
    maxQuantity?: number;
    hasDiscount?: boolean;
    noDiscount?: boolean;
    withRelations?: boolean;
}

/**
 * Order item sort options
 */
export interface OrderItemSortOptions extends BaseSortOptions {
    column:
        | "categoryName"
        | "laundryServiceName"
        | "quantity"
        | "unitPrice"
        | "subtotal"
        | "discountAmount"
        | "totalAmount"
        | "paidAmount"
        | "productionStatus"
        | "createdAt"
        | "updatedAt";
}

/**
 * Order item form data
 */
export interface OrderItemFormData {
    orderId: number;
    laundryServiceId: number;
    quantity: number;
    discountAmount?: number;
    itemNotes?: string | null;
    isPackageUsage?: boolean;
    customerSubscriptionId?: number | null;
}
