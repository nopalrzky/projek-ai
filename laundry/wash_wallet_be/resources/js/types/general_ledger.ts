import { Account, Outlet } from ".";

export interface GeneralLedgerTransaction {
    id: number;
    date: string;
    transactionNumber: string;
    description: string;
    memo?: string;
    debit: number;
    credit: number;
    mutation: number;
    runningBalance: number;
    isManual: boolean;
    referenceType?: string;
    referenceId?: number;
}

export interface GeneralLedgerData {
    account: Account;
    period: {
        start: string;
        end: string;
    };
    openingBalance: number;
    transactions: GeneralLedgerTransaction[];
    closingBalance: number;
}

export interface GeneralLedgerIndexProps {
    outlets: Outlet[];
    accounts: Account[];
    filters: {
        outletId?: number;
        accountId?: number;
        startDate?: string;
        endDate?: string;
    };
    ledger?: GeneralLedgerData | null;
    flash?: {
        success?: string;
        error?: string;
    };
}
