import {
    BaseFilters,
    BaseSortOptions,
    ReferralLog,
    Customer,
    Employee,
    OrderItem,
    OrderStatusHistory,
    Outlet,
} from ".";

export interface OrderReview {
    id: number;
    rating: number;
    review?: string | null;
    createdAt: string;
    formattedCreatedAt: string;
}

export interface CustomerAddress {
    id: number;
    label?: string | null;
    address: string;
    city?: string | null;
    province?: string | null;
    postalCode?: string | null;
    latitude?: number | null;
    longitude?: number | null;
}

export type OrderPaymentMethod = "cash" | "transfer" | "qris" | "debit" | "cod";

export interface OrderPaymentLog {
    id: number;
    orderId: number;
    employeeId?: number | null;
    amount: number;
    formattedAmount: string;
    paymentMethod: OrderPaymentMethod;
    paymentMethodLabel: string;
    referenceNumber?: string | null;
    notes?: string | null;
    employee?: Employee;
    createdAt: string;
    formattedCreatedAt: string;
    canBeDeleted: boolean;
}

export interface Order {
    id: number;
    orderNumber: string;
    source: string;
    sourceLabel: string;
    status:
        | "requested"
        | "cancelled"
        | "accepted"
        | "rejected"
        | "picking_up"
        | "received"
        | "weighing"
        | "ready_to_process"
        | "in_progress"
        | "ready"
        | "delivering"
        | "delivered"
        | "completed";
    statusLabel: string;
    statusBadgeVariant:
        | "default"
        | "primary"
        | "secondary"
        | "success"
        | "warning"
        | "info"
        | "error";
    paymentStatus:
        | "not_yet_priced"
        | "unpaid"
        | "partial"
        | "paid"
        | "refunded"
        | "paid_by_package"
        | "cod";
    paymentStatusLabel: string;
    paymentStatusBadgeVariant:
        | "default"
        | "primary"
        | "secondary"
        | "success"
        | "warning"
        | "info"
        | "error";
    deliveryType: string;
    deliveryTypeLabel: string;
    completionPercentage: number;
    customerId: number;
    customerAccountId?: number | null;
    employeeId: number;
    outletId: number;
    customerAddressId?: number | null;
    updatedBy?: number | null;
    subtotal: number;
    formattedSubtotal: string;
    discountAmount: number;
    formattedDiscountAmount: string;
    taxAmount: number;
    formattedTaxAmount: string;
    pickupFee: number;
    formattedPickupFee: string;
    deliveryFee: number;
    formattedDeliveryFee: string;
    totalAmount: number;
    formattedTotalAmount: string;
    paidAmount: number;
    formattedPaidAmount: string;
    remainingAmount: number;
    formattedRemainingAmount: string;
    orderDate: string;
    formattedOrderDate: string;
    estimatedCompletion?: string | null;
    formattedEstimatedCompletion?: string | null;
    actualCompletion?: string | null;
    formattedActualCompletion?: string | null;
    pickupDate?: string | null;
    formattedPickupDate?: string | null;
    pickupAddress?: string | null;
    pickupSchedule?: string | null;
    formattedPickupSchedule?: string | null;
    deliveryDate?: string | null;
    formattedDeliveryDate?: string | null;
    deliveryAddress?: string | null;
    deliverySchedule?: string | null;
    formattedDeliverySchedule?: string | null;
    lastStatusUpdate?: string | null;
    formattedLastStatusUpdate?: string | null;
    notes?: string | null;
    internalNotes?: string | null;
    specialInstructions?: string[] | null;
    customer: Customer;
    commissionLogs: ReferralLog[];
    employee: Employee;
    orderItems: OrderItem[];
    orderItemsCount?: number;
    paymentMethod?: OrderPaymentMethod | null;
    orderStatusHistories?: OrderStatusHistory[];
    orderPaymentLogs?: OrderPaymentLog[];
    orderPaymentLogsCount?: number;
    canPay?: boolean;
    canScheduleDelivery: boolean;
    requiresPaymentBeforeDelivery: boolean;
    review?: OrderReview | null;
    hasReview: boolean;
    outlet?: Outlet | null;
    customerAddress?: CustomerAddress | null;
    createdAt: string;
    updatedAt: string;
    formattedCreatedAt: string;
    formattedUpdatedAt: string;
    deletedAt?: string | null;
}

/**
 * Order filter interface
 */
export interface OrderFilters extends BaseFilters {
    estimatedCompletionFrom: any;
    estimatedCompletionTo: any;
    status?: string;
    paymentStatus?: string;
    outletId?: number;
    customerId?: number;
    employeeId?: number;
    orderDateFrom?: string;
    orderDateTo?: string;
    totalAmountMin?: number;
    totalAmountMax?: number;
}

/**
 * Order sort options
 */
export interface OrderSortOptions extends BaseSortOptions {
    column:
        | "orderNumber"
        | "status"
        | "paymentStatus"
        | "totalAmount"
        | "paidAmount"
        | "remainingAmount"
        | "orderDate"
        | "estimatedCompletion"
        | "actualCompletion"
        | "createdAt"
        | "updatedAt";
}

/**
 * Order form data
 */
export interface OrderFormData {
    customerId: number;
    employeeId?: number;
    notes?: string;
    internalNotes?: string;
    specialInstructions?: string[];
    estimatedCompletion?: string;
    orderItems: OrderItemFormData[];
}

/**
 * Order item form data
 */
export interface OrderItemFormData {
    laundryServiceId: number;
    quantity: number;
    itemNotes?: string;
}
