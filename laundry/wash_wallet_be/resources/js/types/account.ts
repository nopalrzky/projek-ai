import { BaseFilters, Expense, JournalDetail, Outlet, User } from ".";

export interface Account {
    amount: number;
    id: number;
    ownerId: number;
    parentId: number | null;
    outletId: number | null;
    code: string;
    name: string;
    slug?: string;
    type: AccountType;
    typeLabel: string;
    level: 1 | 2 | 3;
    isSystem: boolean;
    isTransactional: boolean;
    children?: Account[];
    parent?: Account;
    expenses: Expense[];
    expenseSources: Expense[];
    journalDetails: JournalDetail[];
    outlet?: Outlet;
    journalDetailsCount: number;
    owner: User;
    createdAt: string;
    updatedAt: string;
}

export type AccountType =
    | "asset"
    | "liability"
    | "equity"
    | "revenue"
    | "expense";

export interface AccountFormData {
    parentId: number | null | "";
    code: string;
    name: string;
    type?: AccountType | "";
    typeLabel?: string;
}

export interface AccountFilters extends BaseFilters {
    search?: string;
    type?: AccountType | null;
    level?: number | null;
    isTransactional?: boolean | null;
}
