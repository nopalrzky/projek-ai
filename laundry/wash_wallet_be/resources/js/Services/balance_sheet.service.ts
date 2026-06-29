import { router } from "@inertiajs/react";

export interface BalanceSheetFilters {
    outlet_id?: number;
    date?: string;
    current_date?: string;
    previous_date?: string;
}

export interface BalanceSheetExportOptions {
    format?: "excel" | "pdf" | "array";
    onSuccess?: () => void;
    onError?: (errors: any) => void;
}

export const balanceSheetService = {
    goToIndex: (filters?: BalanceSheetFilters) => {
        router.get(route("balance-sheet.index"), { ...filters } as any, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onSuccess: () => {
                console.log("Navigated to balance sheet report");
            },
            onError: (errors) => {
                console.error("Navigation error:", errors);
            },
        });
    },

    goToCompare: (filters?: BalanceSheetFilters) => {
        router.get(route("balance-sheet.compare"), { ...filters } as any, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onSuccess: () => {
                console.log("Navigated to comparative balance sheet report");
            },
            onError: (errors) => {
                console.error("Navigation error:", errors);
            },
        });
    },

    goToPrint: (filters: BalanceSheetFilters) => {
        router.get(route("balance-sheet.print"), { ...filters } as any, {
            preserveState: false,
            preserveScroll: false,
            onSuccess: () => {
                console.log("Navigated to balance sheet print view");
            },
            onError: (errors) => {
                console.error("Navigation error:", errors);
            },
        });
    },

    loadReport: (filters: BalanceSheetFilters) => {
        if (!filters.outlet_id) {
            console.warn("Cannot load report: outlet_id is required");
            return;
        }

        balanceSheetService.goToIndex(filters);
    },

    printReport: (filters: BalanceSheetFilters) => {
        if (!filters.outlet_id || !filters.date) {
            console.warn("Cannot print report: all filter fields are required");
            return;
        }

        balanceSheetService.goToPrint(filters);
    },

    validateFilters: (
        filters: BalanceSheetFilters,
    ): {
        isValid: boolean;
        errors: string[];
    } => {
        const errors: string[] = [];

        if (!filters.outlet_id) {
            errors.push("Outlet harus dipilih");
        }

        if (!filters.date) {
            errors.push("Tanggal harus diisi");
        }

        return {
            isValid: errors.length === 0,
            errors,
        };
    },

    getDefaultFilters: (): BalanceSheetFilters => {
        const now = new Date();
        return {
            date: now.toISOString().split("T")[0],
        };
    },

    formatDate: (date: string): string => {
        const d = new Date(date);
        return d.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    },

    getSectionLabel: (subtype: string): string => {
        const labels: { [key: string]: string } = {
            current_assets: "Aset Lancar",
            fixed_assets: "Aset Tetap",
            other_assets: "Aset Lain-lain",
            current_liabilities: "Kewajiban Jangka Pendek",
            long_term_liabilities: "Kewajiban Jangka Panjang",
            other_liabilities: "Kewajiban Lain-lain",
            owner_equity: "Modal Pemilik",
            retained_earnings: "Laba Ditahan",
            other_equity: "Modal Lain-lain",
        };

        return labels[subtype] || subtype;
    },
};

export default balanceSheetService;
