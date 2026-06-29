import { BaseFilters, BaseSortOptions, Outlet, User } from ".";

export interface Topup {
    id: number;
    userId: number;
    outletId: number | null;
    amountMoney: number;
    coinReceived: number;
    status: "pending" | "success" | "failed";
    paymentStatus: "pending" | "waiting" | "paid" | "failed" | "expired";
    paymentProvider: string | null;
    paymentReference: string;
    paymentMethod: string | null;
    paymentData: any | null;
    topupType: "master" | "outlet";
    expiredAt: string | null;
    createdAt: string;
    updatedAt: string;

    user?: User;
    outlet?: Outlet;
    userName?: string;
    userEmail?: string;
    outletName?: string;

    isMasterTopup: boolean;
    isOutletTopup: boolean;
    isPending: boolean;
    isSuccess: boolean;
    isFailed: boolean;
    isPaymentPaid: boolean;

    formattedAmountMoney: string;
    formattedCreatedAt: string;
    topupTypeLabel: string;
}

export interface TopupFilters extends BaseFilters {
    status?: "pending" | "success" | "failed" | null;
    paymentStatus?:
        | "pending"
        | "waiting"
        | "paid"
        | "failed"
        | "expired"
        | null;
    startDate?: string | null;
    endDate?: string | null;
}

export interface TopupSortOptions extends BaseSortOptions {
    sortBy?: "created_at" | "amount_money" | "status" | "payment_status";
}

export interface TopupFormData {
    outletId?: number | null;
    amountMoney: number;
    paymentMethod: string;
    bankCode?: string;
    cstoreType?: string;
    cardlessCreditType?: string;
}
