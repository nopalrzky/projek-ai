import { Account, JournalEntry } from ".";

export interface JournalDetail {
    id: number;
    journalEntryId: number;
    accountId: number;
    debit: number;
    credit: number;
    memo?: string;
    account: Account;
    journalEntry: JournalEntry;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
}
