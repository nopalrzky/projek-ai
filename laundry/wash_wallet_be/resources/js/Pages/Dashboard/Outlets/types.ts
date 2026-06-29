import {
    Employee,
    Order,
    Outlet,
    PaginationMeta,
    OperationalDay,
    OutletFilters,
    OutletFormData,
    ImportLog,
} from "@/types";
import type { BadgeVariant } from "@/Components/Badge";
import { OutletFeature } from "@/types/outlet_feature";

export interface FilterOption {
    id: number;
    name: string;
}

export interface OutletFilterOptions {
    provinces: FilterOption[];
    cities: FilterOption[];
    districts: FilterOption[];
    statusOptions: {
        value: boolean;
        label: string;
    }[];
}

export interface ActivateProps {
    outlet: Outlet;
    ownerCoinBalance: number;
    activationFeatureCatalog: any;
    exposureFeatureCatalog: any;
}

export interface OutletFeatureItem {
    id: number;
    key: string;
    name: string;
    description: string | null;
    coinPrice: number;
    durationDays: number;
    unlockedAt?: string | null;
    expiresAt?: string | null;
    trialExpiresAt?: string | null;
    autoRenewal?: boolean;
}

export interface OutletIndexProps {
    outlets: {
        data: Outlet[];
        meta: PaginationMeta;
    };
    filters: OutletFilters;
    filterOptions: OutletFilterOptions;
    flash?: {
        success?: string;
        error?: string;
    };
}

export interface OutletEditProps {
    outlet: Outlet;
    googleMapsApiKey: string;
    onSave?: (data: OutletFormData) => void;
    onCancel?: () => void;
    isLoading?: boolean;
}

export interface OutletCreateProps {
    googleMapsApiKey: string;
    onSave?: (data: OutletFormData) => void;
    onCancel?: () => void;
    isLoading?: boolean;
}

export interface OutletPageHeaderProps {
    outlet: Outlet;
}

export interface OutletFeatureCatalogItem {
    id: number;
    key: string;
    name: string;
    description: string | null;
    coinPrice: number;
    durationDays: number;
}

export interface OutletFeatureDetails {
    trialExpiresAt?: string | null;
    unlockedAt?: string | null;
    expiresAt?: string | null;
    coinSpent?: number;
    autoRenewal?: boolean;
}

export interface OutletShowProps {
    outlet: Outlet;
}

/**
 * Outlet form validation errors
 */
export interface OutletFormErrors {
    name?: string[];
    code?: string[];
    email?: string[];
    phone?: string[];
    provinceId?: string[];
    provinceName?: string[];
    cityId?: string[];
    cityName?: string[];
    districtId?: string[];
    districtName?: string[];
    villageId?: string[];
    villageName?: string[];
    street?: string[];
    isActive?: string[];
}

export interface OutletOverviewStats {
    period: {
        preset: '7d' | '30d' | '90d';
        startDate: string;
        endDate: string;
    };
    todayOrdersCount: number;
    periodOrdersCount: number;
    periodRevenue: number;
    activeOrdersCount: number;
    unpaidOrdersCount: number;
    outstandingAmount: number;
    customersCount: number;
    activeLaundryServicesCount: number;
    activeEmployeesCount: number;
    averageRating: number;
    totalReviews: number;
    coinBalance: number;
    featureStatusSummary: {
        active: number;
        trial: number;
        expired: number;
        inactive: number;
    };
}

export interface RevenueAndOrdersByDay {
    date: string;
    revenue: number;
    ordersCount: number;
}

export interface OrderStatusDistributionItem {
    status: string;
    label: string;
    count: number;
    color: string;
}

export interface PaymentHealthItem {
    paymentStatus: string;
    label: string;
    ordersCount: number;
    totalAmount: number;
    paidAmount: number;
    remainingAmount: number;
}

export interface TopServiceItem {
    name: string;
    categoryName: string | null;
    itemsCount: number;
    quantity: number;
    revenue: number;
}

export interface TopCategoryItem {
    name: string;
    itemsCount: number;
    quantity: number;
    revenue: number;
}

export interface OutletOverviewCharts {
    revenueAndOrdersByDay: RevenueAndOrdersByDay[];
    orderStatusDistribution: OrderStatusDistributionItem[];
    paymentHealth: PaymentHealthItem[];
    topServices: TopServiceItem[];
    topCategories: TopCategoryItem[];
}

export interface OrderSummary {
    id: number;
    orderNumber: string;
    customerName: string | null;
    customerId: number;
    status: string;
    statusLabel: string;
    statusBadgeVariant: BadgeVariant;
    paymentStatus: string;
    paymentStatusLabel: string;
    totalAmount: number;
    remainingAmount: number;
    orderDate: string | null;
    createdAt: string;
}

export interface OperationalChecklistItem {
    key: string;
    label: string;
    status: 'ok' | 'info' | 'warning' | 'critical';
    message: string;
    actionLabel?: string;
    actionTarget?: string;
}

export interface OutletOverviewMeta {
    period: '7d' | '30d' | '90d';
    startDate: string;
    endDate: string;
    generatedAt: string;
}

export interface OutletShowProps {
    outlet: Outlet;
    overviewStats: OutletOverviewStats;
    overviewCharts: OutletOverviewCharts;
    recentOrders: OrderSummary[];
    operationalChecklist: OperationalChecklistItem[];
    overviewMeta: OutletOverviewMeta;
}

export interface OutletOverviewProps {
    outlet: Outlet;
    overviewStats: OutletOverviewStats;
    overviewCharts: OutletOverviewCharts;
    recentOrders: OrderSummary[];
    operationalChecklist: OperationalChecklistItem[];
    overviewMeta: OutletOverviewMeta;
    employees?: Employee[];
    isLoading?: boolean;
}

export type OutletActivationStatus = {
    status: "inactive" | "trial" | "active" | "expired";
    trialStartedAt?: string | null;
    trialExpiresAt?: string | null;
    unlockedAt?: string | null;
    expiresAt?: string | null;
    trialRemainingDays: number;
    trialEligible?: boolean;
    trialEligibilityCode?: string | null;
    trialEligibilityMessage?: string | null;
    trialDurationDays?: number;
};

export interface OutletActivationOverlayProps {
    outlet: Outlet;
    activationFeature: {
        id: number;
        coin_price: number;
        name: string;
    } | null;
    activationStatus: OutletActivationStatus | null;
    ownerCoinBalance?: number;
    children: React.ReactNode;
}

/**
 * Outlet form props
 */
export interface OutletFormProps {
    outlet?: Outlet;
    data: OutletFormData;
    errors: OutletFormErrors;
    isLoading: boolean;
    onDataChange: (key: keyof OutletFormData, value: any) => void;
    onSubmit: (e: React.FormEvent) => void;
    onCancel?: () => void;
}

/**
 * Location selection props
 */
export interface LocationSelectorProps {
    provinceId?: number | null;
    provinceName?: string;
    cityId?: number | null;
    cityName?: string;
    districtId?: number | null;
    districtName?: string;
    villageId?: number | null;
    villageName?: string;
    onProvinceChange: (provinceId: number | null, provinceName: string) => void;
    onCityChange: (cityId: number | null, cityName: string) => void;
    onDistrictChange: (districtId: number | null, districtName: string) => void;
    onVillageChange: (villageId: number | null, villageName: string) => void;
    errors?: {
        provinceId?: string[];
        cityId?: string[];
        districtId?: string[];
        villageId?: string[];
    };
    disabled?: boolean;
}

/**

/**
 * Delete Outlet modal props
 */
export interface DeleteOutletModalProps {
    isOpen: boolean;
    outlet?: Outlet;
    onClose: () => void;
    onConfirm: () => void;
    isLoading?: boolean;
}

/**
 * Outlet operational hours props
 */
export interface OutletOperationalHoursProps {
    outlet: Outlet;
    operationalDays: OperationalDay[];
    onUpdate?: (operationalDays: OperationalDay[]) => void;
    isEditable?: boolean;
    isLoading?: boolean;
}

export interface OutletImportPageProps {
    type: string;
    config: any;
    flash?: {
        success?: string;
        error?: string;
    };
}

export interface OutletPreviewPageProps {
    preview: any[];
    errors: Array<{
        row: number;
        data: any;
        errors: string[];
    }>;
    total_rows: number;
    has_more: boolean;
    file_name: string;
}
export interface OutletResultPageProps {
    importLog: ImportLog;
    outlet?: Outlet;
}
