import {
    Account,
    JournalEntry,
    JournalEntryFilters,
    JournalEntrySortOptions,
    Outlet,
    PaginationMeta,
} from "@/types";

export interface JournalEntryIndexProps {
    journalEntries: {
        data: JournalEntry[];
        meta: PaginationMeta;
    };
    filterOptions: {
        outlets: Outlet[];
    };
    sortOptions: JournalEntrySortOptions;
    filters: JournalEntryFilters;
    flash?: {
        success?: string;
        error?: string;
    };
}

export interface JournalEntryCreateProps {
    outlets: Outlet[];
    accounts: Account[];
    flash?: {
        success?: string;
        error?: string;
    };
}

export interface JournalEntryEditProps {
    journalEntry: JournalEntry;
    accounts: Account[];
    flash?: {
        success?: string;
        error?: string;
    };
}

export interface JournalEntryShowProps {
    journalEntry: JournalEntry;
    flash?: {
        success?: string;
        error?: string;
    };
}

export interface JournalEntryPageHeaderProps {
    journalEntry: JournalEntry;
    isLoading?: boolean;
}
export interface JournalEntryOverviewProps {
    journalEntry: JournalEntry;
}

export interface JournalEntryOutletProps {
    outlet: Outlet;
}
