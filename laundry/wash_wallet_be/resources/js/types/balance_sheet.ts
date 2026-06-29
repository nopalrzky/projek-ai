export interface BalanceSheetAccount {
    id: number | null;
    code: string;
    name: string;
    type: string;
    subtype: string;
    amount: number;
    debit: number;
    credit: number;
    isVirtual?: boolean;
}

export interface BalanceSheetSection {
    items: BalanceSheetAccount[];
    total: number;
}

export interface BalanceSheetSections {
    [key: string]: BalanceSheetSection;
}

export interface BalanceSheetAssets {
    sections: BalanceSheetSections;
    total: number;
}

export interface BalanceSheetLiabilities {
    sections: BalanceSheetSections;
    total: number;
}

export interface BalanceSheetEquity {
    sections: BalanceSheetSections;
    total: number;
}

export interface BalanceSheetSummary {
    totalAssets: number;
    totalLiabilitiesEquity: number;
    difference: number;
    isBalanced: boolean;
}

export interface BalanceSheetReport {
    date: string;
    assets: BalanceSheetAssets;
    liabilities: BalanceSheetLiabilities;
    equity: BalanceSheetEquity;
    summary: BalanceSheetSummary;
}

export interface BalanceSheetFilters {
    outlet_id?: number;
    date?: string;
}
