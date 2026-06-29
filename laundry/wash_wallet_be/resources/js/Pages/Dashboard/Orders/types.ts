import {
    Order,
    Customer,
    Employee,
    Outlet,
    PaginationMeta,
    OrderItem,
    OrderFilters,
} from "@/types";

export interface OrderStat {
    label: string;
    value: string | number;
    subValue?: string;
    icon: string;
    variant?: "primary" | "success" | "info" | "warning" | "danger";
}
export interface OrderIndexProps {
    orders: {
        data: Order[];
        meta: PaginationMeta;
    };
    stats: OrderStat[];
    filters: OrderFilters;
    filterOptions: OrderFilterOptions;
    flash: {
        success?: string;
        error?: string;
    };
}

export interface OrderFilterOptions {
    outlets: Outlet[];
    customers: Customer[];
    employees: Employee[];
    statusOptions: { value: string; label: string }[];
    paymentStatusOptions: { value: string; label: string }[];
}

export interface OrderStatistics {
    totalOrders: number;
    totalRevenue: number;
    formattedTotalRevenue: string;
    averageOrderValue: number;
    formattedAverageOrderValue: string;
    statusBreakdown: StatusBreakdown[];
    paymentBreakdown: PaymentBreakdown[];
}

export interface StatusBreakdown {
    status: string;
    label: string;
    count: number;
    percentage: number;
}

export interface PaymentBreakdown {
    status: string;
    label: string;
    count: number;
    totalAmount: number;
    percentage: number;
}

export interface OrderStatsCardProps {
    statistics: OrderStatistics;
    onQuickFilter: (type: string) => void;
    isLoading?: boolean;
}

export interface OrderShowProps {
    order: Order;
}

export interface OrderStats {
    itemsCount: number;
    totalQuantity: number;
    averageItemPrice: number;
    discountPercentage: number;
    paymentProgress: number;
    processingTime?: number | null;
    estimatedRemainingTime?: number | null;
}

export interface ItemsByStatusGroup {
    count: number;
    totalAmount: number;
    items: OrderItem[];
}

export interface TimelineItem {
    id: number;
    type: string;
    title: string;
    description?: string;
    employee?: {
        id: number;
        name: string;
    };
    timestamp: string;
    formattedTime: string;
    timeAgo: string;
}

export interface RelatedOrder {
    id: number;
    orderNumber: string;
    status: string;
    statusLabel: string;
    totalAmount: number;
    formattedTotalAmount: string;
    orderDate: string;
    timeAgo: string;
}

export interface ActionButtons {
    canEdit: boolean;
    canCancel: boolean;
    canUpdateStatus: boolean;
    canAddPayment: boolean;
    canPrint: boolean;
    canDownload: boolean;
}

export interface NextAction {
    action: string;
    label: string;
    type: "primary" | "success" | "danger" | "info";
    icon: string;
}

export interface OrderPageHeaderProps {
    order: Order;
}

export interface OrderCustomerProps {
    order: Order;
}

export interface OrderEmployeeProps {
    order: Order;
}

export interface OrderPaymentsProps {
    order: Order;
}

export interface OrderOverviewProps {
    order: Order;
}

export interface OrderSettingsProps {
    order: Order;
}

export interface OrderStatusHistoryProps {
    order: Order;
}
