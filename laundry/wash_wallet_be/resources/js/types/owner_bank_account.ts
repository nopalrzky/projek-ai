import { User } from "./user";
import { WithdrawalBank } from "./withdrawal_bank";

export interface OwnerBankAccount {
    id: number;
    userId: number;
    withdrawalBankId: number;
    accountNumber: string;
    accountHolderName: string;
    isDefault: boolean;
    isActive: boolean;
    bankName?: string | null;
    adminFee?: number;
    withdrawalBank?: WithdrawalBank;
    user?: User;
    createdAt: string;
    updatedAt: string;
}
