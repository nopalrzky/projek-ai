import {
    CustomerSubscription,
    Outlet,
    PaginationMeta,
    CustomerSubscriptionFilters,
} from "@/types";

export interface CustomerSubscriptionIndexProps {
    customerSubscriptions: {
        data: CustomerSubscription[];
        meta: PaginationMeta;
    };
    filterOptions: {
        customers: Array<{ value: number; label: string }>;
        servicePackages: Array<{ value: number; label: string }>;
        statusOptions: Array<{ value: string; label: string }>;
    };
    filters: CustomerSubscriptionFilters & {
        purchaseDateFrom?: string;
        purchaseDateTo?: string;
        expiredAtFrom?: string;
        expiredAtTo?: string;
    };
    flash?: {
        success?: string;
        error?: string;
    };
}

export interface CustomerSubscriptionShowProps {
    subscription: CustomerSubscription;
    flash?: {
        success?: string;
        error?: string;
    };
}

export interface CustomerSubscriptionCreateProps {
    outlets: Outlet[];
    errors?: {
        [key: string]: string[];
    };
    flash?: {
        success?: string;
        error?: string;
    };
}

export interface DeleteCustomerSubscriptionModalProps {
    isOpen: boolean;
    subscription?: CustomerSubscription;
    onClose: () => void;
    onConfirm: (subscription: CustomerSubscription) => void;
    isLoading?: boolean;
}

export type CustomerCustomerSubscriptionProps = {
    subscription: CustomerSubscription;
};

export type CustomerSubscriptionOverviewProps = {
    subscription: CustomerSubscription;
};

export type CustomerSubscriptionServicePackageProps = {
    subscription: CustomerSubscription;
};
