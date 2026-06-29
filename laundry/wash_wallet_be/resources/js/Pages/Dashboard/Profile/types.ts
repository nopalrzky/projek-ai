export interface ProfileOverview {
    totalOutlets: number;
    activeOutlets: number;
    totalReferrals: number;
    totalCommission: number;
    memberSince: string | null;
    lastLoginAt: string | null;
    status: string;
}

export interface ProfileUser {
    id: number;
    name: string;
    username: string;
    email: string;
    avatar: string | null;
    phone: string | null;
    address: string | null;
    status: string;
    coinBalance: number;
    walletBalance: number;
    referralCode: string | null;
    referredBy: number | null;
    bankAccountName: string | null;
    bankAccountNumber: string | null;
    bankName: string | null;
    lastLoginAt: string | null;
    createdAt: string | null;
    updatedAt: string | null;
}

export interface ProfileOutlet {
    id: number;
    ownerId: number;
    name: string;
    code: string;
    isActive: boolean;
    createdAt: string;
}

export interface ProfileBankAccountSummary {
    id: number;
    bankName: string;
    accountNumberMasked: string;
    accountHolderName: string;
    isDefault: boolean;
    isActive: boolean;
}

export interface ProfileWithdrawalItem {
    id: number;
    code: string;
    requestedAmount: number;
    adminFee: number;
    netAmount: number;
    status: string;
    statusLabel: string;
    createdAt: string;
}

export interface ProfileTransactionItem {
    id: number;
    transactionNumber: string;
    type: string;
    typeLabel: string;
    amount: number;
    isCredit: boolean;
    createdAt: string;
}

export interface ProfileFinanceSummary {
    walletBalance: number;
    coinBalance: number;
    availableBalance: number;
    pendingWdrTotal: number;
    bankAccounts: ProfileBankAccountSummary[];
    recentWithdrawals: ProfileWithdrawalItem[];
    recentTransactions: ProfileTransactionItem[];
    totalWithdrawals: {
        pending: number;
        processing: number;
        paid: number;
        rejected: number;
    };
}

export interface ProfileReferralItem {
    id: number;
    name: string;
    createdAt: string;
}

export interface ProfileReferralSummary {
    referralCode: string | null;
    totalReferrals: number;
    totalCommission: number;
    recentReferrals: ProfileReferralItem[];
}

export interface ProfileSetupChecklist {
    profileComplete: boolean;
    hasPhone: boolean;
    hasAddress: boolean;
    hasOutlet: boolean;
    hasActiveOutlet: boolean;
    hasActiveBankAccount: boolean;
    hasWalletOrCoin: boolean;
}

export interface ProfileIndexProps {
    user: ProfileUser | null;
    overview: ProfileOverview;
    outlets: ProfileOutlet[];
    financeSummary: ProfileFinanceSummary;
    referralSummary: ProfileReferralSummary;
    setupChecklist: ProfileSetupChecklist;
}

export interface ProfileFormData {
    name: string;
    phone: string;
    address: string;
}

export interface ChangePasswordFormData {
    current_password: string;
    password: string;
    password_confirmation: string;
}
