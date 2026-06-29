import { User } from "./user";
import { Outlet } from "./outlet";
import { BaseFilters } from "./filters";

export interface WalletTransaction {
    id: number;
    userId: number;
    outletId?: number | null;
    orderId?: number | null;
    walletWithdrawalId?: number | null;
    transactionNumber: string;
    type: string;
    typeLabel: string;
    amount: number;
    balanceBefore: number;
    balanceAfter: number;
    description?: string | null;
    isCredit: boolean;
    createdAt: string;
    updatedAt: string;
    user?: User;
    outlet?: Outlet;
}

export interface WalletTransactionFilters extends BaseFilters {
    type?: string;
    startDate?: string;
    endDate?: string;
}
