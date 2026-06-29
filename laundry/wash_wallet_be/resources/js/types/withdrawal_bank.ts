export interface WithdrawalBank {
    id: number;
    bankName: string;
    bankCode?: string | null;
    adminFee: number;
    minWithdrawal: number;
    maxWithdrawal?: number | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}
