import { router } from "@inertiajs/react";

export interface GeneralLedgerFilters {
    outletId?: number;
    accountId?: number;
    accountIds?: number[];
    startDate?: string;
    endDate?: string;
    accountType?: string;
    outlet_id?: number;
    account_id?: number;
    account_ids?: number[];
    start_date?: string;
    end_date?: string;
    account_type?: string;
}

const normalizeFilters = (filters?: GeneralLedgerFilters) => ({
    outletId: filters?.outletId ?? filters?.outlet_id,
    accountId: filters?.accountId ?? filters?.account_id,
    accountIds: filters?.accountIds ?? filters?.account_ids,
    startDate: filters?.startDate ?? filters?.start_date,
    endDate: filters?.endDate ?? filters?.end_date,
    accountType: filters?.accountType ?? filters?.account_type,
});

export interface GeneralLedgerExportOptions {
    format?: "excel" | "pdf" | "array";
    onSuccess?: () => void;
    onError?: (errors: any) => void;
}

export const generalLedgerService = {
    goToIndex: (filters?: GeneralLedgerFilters) => {
        router.get(route("general-ledger.index"), normalizeFilters(filters), {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onSuccess: () => {
                console.log("Navigated to general ledger index");
            },
            onError: (errors) => {
                console.error("Navigation error:", errors);
            },
        });
    },

    goToSummary: (filters?: GeneralLedgerFilters) => {
        router.get(route("general-ledger.summary"), normalizeFilters(filters), {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onSuccess: () => {
                console.log("Navigated to general ledger summary");
            },
            onError: (errors) => {
                console.error("Navigation error:", errors);
            },
        });
    },

    goToCompare: (filters?: GeneralLedgerFilters) => {
        router.get(route("general-ledger.compare"), normalizeFilters(filters), {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onSuccess: () => {
                console.log("Navigated to general ledger compare");
            },
            onError: (errors) => {
                console.error("Navigation error:", errors);
            },
        });
    },

    goToPrint: (filters: GeneralLedgerFilters) => {
        router.get(route("general-ledger.print"), normalizeFilters(filters), {
            preserveState: false,
            preserveScroll: false,
            onSuccess: () => {
                console.log("Navigated to general ledger print view");
            },
            onError: (errors) => {
                console.error("Navigation error:", errors);
            },
        });
    },

    loadLedger: (filters: GeneralLedgerFilters) => {
        const normalized = normalizeFilters(filters);

        if (!normalized.outletId || !normalized.accountId) {
            console.warn(
                "Cannot load ledger: outlet_id and account_id are required",
            );
            return;
        }

        generalLedgerService.goToIndex(normalized);
    },

    loadSummary: (filters: GeneralLedgerFilters) => {
        const normalized = normalizeFilters(filters);

        if (!normalized.outletId) {
            console.warn("Cannot load summary: outlet_id is required");
            return;
        }

        generalLedgerService.goToSummary(normalized);
    },

    loadComparison: (filters: GeneralLedgerFilters) => {
        const normalized = normalizeFilters(filters);

        if (!normalized.outletId || !normalized.accountIds?.length) {
            console.warn(
                "Cannot load comparison: outlet_id and account_ids are required",
            );
            return;
        }

        generalLedgerService.goToCompare(normalized);
    },

    printLedger: (filters: GeneralLedgerFilters) => {
        const normalized = normalizeFilters(filters);

        if (
            !normalized.outletId ||
            !normalized.accountId ||
            !normalized.startDate ||
            !normalized.endDate
        ) {
            console.warn("Cannot print ledger: all filter fields are required");
            return;
        }

        generalLedgerService.goToPrint(normalized);
    },

    updateFilters: (
        currentFilters: GeneralLedgerFilters,
        newFilters: Partial<GeneralLedgerFilters>,
    ): GeneralLedgerFilters => {
        return {
            ...currentFilters,
            ...newFilters,
        };
    },

    validateFilters: (
        filters: GeneralLedgerFilters,
    ): {
        isValid: boolean;
        errors: string[];
    } => {
        const errors: string[] = [];

        if (!filters.outlet_id) {
            errors.push("Outlet harus dipilih");
        }

        if (!filters.account_id && !filters.account_ids?.length) {
            errors.push("Akun harus dipilih");
        }

        if (!filters.start_date) {
            errors.push("Tanggal mulai harus diisi");
        }

        if (!filters.end_date) {
            errors.push("Tanggal akhir harus diisi");
        }

        if (
            filters.start_date &&
            filters.end_date &&
            new Date(filters.start_date) > new Date(filters.end_date)
        ) {
            errors.push(
                "Tanggal mulai tidak boleh lebih besar dari tanggal akhir",
            );
        }

        return {
            isValid: errors.length === 0,
            errors,
        };
    },

    getDefaultFilters: (): GeneralLedgerFilters => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        return {
            start_date: startOfMonth.toISOString().split("T")[0],
            end_date: endOfMonth.toISOString().split("T")[0],
        };
    },

    formatDateRange: (startDate: string, endDate: string): string => {
        const start = new Date(startDate);
        const end = new Date(endDate);

        const formatDate = (date: Date) => {
            return date.toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
            });
        };

        return `${formatDate(start)} - ${formatDate(end)}`;
    },

    isValidDateRange: (startDate: string, endDate: string): boolean => {
        try {
            const start = new Date(startDate);
            const end = new Date(endDate);

            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                return false;
            }

            return start <= end;
        } catch {
            return false;
        }
    },

    calculatePeriodInDays: (startDate: string, endDate: string): number => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays + 1;
    },
};

export default generalLedgerService;
