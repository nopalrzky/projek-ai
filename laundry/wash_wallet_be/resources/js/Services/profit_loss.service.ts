import { router } from "@inertiajs/react";

export interface ProfitLossFilters {
    outlet_id?: number;
    date_range?: string;
    start_date?: string;
    end_date?: string;
    current_date_range?: string;
    current_start_date?: string;
    current_end_date?: string;
    previous_date_range?: string;
    previous_start_date?: string;
    previous_end_date?: string;
}

export interface ProfitLossExportOptions {
    format?: "excel" | "pdf" | "array";
    onSuccess?: () => void;
    onError?: (errors: any) => void;
}

export const profitLossService = {
    goToIndex: (filters?: ProfitLossFilters) => {
        router.get(route("profit-loss.index"), { ...filters } as any, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onSuccess: () => {
                console.log("Navigated to profit & loss report");
            },
            onError: (errors) => {
                console.error("Navigation error:", errors);
            },
        });
    },

    goToCompare: (filters?: ProfitLossFilters) => {
        router.get(route("profit-loss.compare"), { ...filters } as any, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onSuccess: () => {
                console.log("Navigated to comparative profit & loss report");
            },
            onError: (errors) => {
                console.error("Navigation error:", errors);
            },
        });
    },

    goToPrint: (filters: ProfitLossFilters) => {
        router.get(route("profit-loss.print"), { ...filters } as any, {
            preserveState: false,
            preserveScroll: false,
            onSuccess: () => {
                console.log("Navigated to profit & loss print view");
            },
            onError: (errors) => {
                console.error("Navigation error:", errors);
            },
        });
    },

    loadReport: (filters: ProfitLossFilters) => {
        if (!filters.outlet_id) {
            console.warn("Cannot load report: outlet_id is required");
            return;
        }

        profitLossService.goToIndex(filters);
    },

    loadComparison: (filters: ProfitLossFilters) => {
        if (!filters.outlet_id) {
            console.warn("Cannot load comparison: outlet_id is required");
            return;
        }

        profitLossService.goToCompare(filters);
    },

    printReport: (filters: ProfitLossFilters) => {
        if (!filters.outlet_id || !filters.start_date || !filters.end_date) {
            console.warn("Cannot print report: all filter fields are required");
            return;
        }

        profitLossService.goToPrint(filters);
    },

    updateFilters: (
        currentFilters: ProfitLossFilters,
        newFilters: Partial<ProfitLossFilters>,
    ): ProfitLossFilters => {
        return {
            ...currentFilters,
            ...newFilters,
        };
    },

    validateFilters: (
        filters: ProfitLossFilters,
    ): {
        isValid: boolean;
        errors: string[];
    } => {
        const errors: string[] = [];

        if (!filters.outlet_id) {
            errors.push("Outlet harus dipilih");
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

    getDefaultFilters: (): ProfitLossFilters => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        return {
            date_range: "this_month",
            start_date: startOfMonth.toISOString().split("T")[0],
            end_date: endOfMonth.toISOString().split("T")[0],
        };
    },

    parseDateRange: (
        dateRange: string,
        customStart?: string,
        customEnd?: string,
    ): { start: string; end: string } => {
        const now = new Date();

        switch (dateRange) {
            case "today":
                return {
                    start: now.toISOString().split("T")[0],
                    end: now.toISOString().split("T")[0],
                };
            case "yesterday": {
                const yesterday = new Date(now);
                yesterday.setDate(yesterday.getDate() - 1);
                return {
                    start: yesterday.toISOString().split("T")[0],
                    end: yesterday.toISOString().split("T")[0],
                };
            }
            case "this_week": {
                const startOfWeek = new Date(now);
                startOfWeek.setDate(
                    now.getDate() -
                        now.getDay() +
                        (now.getDay() === 0 ? -6 : 1),
                );
                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 6);
                return {
                    start: startOfWeek.toISOString().split("T")[0],
                    end: endOfWeek.toISOString().split("T")[0],
                };
            }
            case "last_week": {
                const startOfWeek = new Date(now);
                startOfWeek.setDate(
                    now.getDate() -
                        now.getDay() +
                        (now.getDay() === 0 ? -6 : 1) -
                        7,
                );
                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 6);
                return {
                    start: startOfWeek.toISOString().split("T")[0],
                    end: endOfWeek.toISOString().split("T")[0],
                };
            }
            case "this_month": {
                const startOfMonth = new Date(
                    now.getFullYear(),
                    now.getMonth(),
                    1,
                );
                const endOfMonth = new Date(
                    now.getFullYear(),
                    now.getMonth() + 1,
                    0,
                );
                return {
                    start: startOfMonth.toISOString().split("T")[0],
                    end: endOfMonth.toISOString().split("T")[0],
                };
            }
            case "last_month": {
                const startOfMonth = new Date(
                    now.getFullYear(),
                    now.getMonth() - 1,
                    1,
                );
                const endOfMonth = new Date(
                    now.getFullYear(),
                    now.getMonth(),
                    0,
                );
                return {
                    start: startOfMonth.toISOString().split("T")[0],
                    end: endOfMonth.toISOString().split("T")[0],
                };
            }
            case "this_quarter": {
                const quarter = Math.floor(now.getMonth() / 3);
                const startOfQuarter = new Date(
                    now.getFullYear(),
                    quarter * 3,
                    1,
                );
                const endOfQuarter = new Date(
                    now.getFullYear(),
                    quarter * 3 + 3,
                    0,
                );
                return {
                    start: startOfQuarter.toISOString().split("T")[0],
                    end: endOfQuarter.toISOString().split("T")[0],
                };
            }
            case "last_quarter": {
                const quarter = Math.floor(now.getMonth() / 3) - 1;
                const year =
                    quarter < 0 ? now.getFullYear() - 1 : now.getFullYear();
                const adjustedQuarter = quarter < 0 ? 3 : quarter;
                const startOfQuarter = new Date(year, adjustedQuarter * 3, 1);
                const endOfQuarter = new Date(year, adjustedQuarter * 3 + 3, 0);
                return {
                    start: startOfQuarter.toISOString().split("T")[0],
                    end: endOfQuarter.toISOString().split("T")[0],
                };
            }
            case "this_year": {
                const startOfYear = new Date(now.getFullYear(), 0, 1);
                const endOfYear = new Date(now.getFullYear(), 11, 31);
                return {
                    start: startOfYear.toISOString().split("T")[0],
                    end: endOfYear.toISOString().split("T")[0],
                };
            }
            case "last_year": {
                const startOfYear = new Date(now.getFullYear() - 1, 0, 1);
                const endOfYear = new Date(now.getFullYear() - 1, 11, 31);
                return {
                    start: startOfYear.toISOString().split("T")[0],
                    end: endOfYear.toISOString().split("T")[0],
                };
            }
            case "custom":
                return {
                    start:
                        customStart ||
                        new Date(now.getFullYear(), now.getMonth(), 1)
                            .toISOString()
                            .split("T")[0],
                    end:
                        customEnd ||
                        new Date(now.getFullYear(), now.getMonth() + 1, 0)
                            .toISOString()
                            .split("T")[0],
                };
            default: {
                const defaultFilters = profitLossService.getDefaultFilters();
                return {
                    start: defaultFilters.start_date || "",
                    end: defaultFilters.end_date || "",
                };
            }
        }
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

    calculatePeriodInDays: (startDate: string, endDate: string): number => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays + 1;
    },
};

export default profitLossService;
