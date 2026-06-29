import { Account, AccountFilters } from "@/types";
import { router } from "@inertiajs/react";
import axios from "axios";

export const accountService = {
    /**
     * Navigate to accounts index page (COA Tree)
     */
    goToIndex: () => {
        router.visit(route("accounts.index"));
    },

    /**
     * Get all accounts with filters
     */
    async getAll(filters?: AccountFilters): Promise<any[]> {
        try {
            const response = await axios.get(route("api.accounts.index"), {
                params: {
                    search: filters?.search,
                    type: filters?.type,
                    isTransactional: filters?.isTransactional,
                    level: filters?.level,
                },
            });

            if (response.data.success) {
                return response.data.data;
            }

            return [];
        } catch (error) {
            console.error("Error getting accounts:", error);
            return [];
        }
    },

    /**
     * Get account by ID
     */
    async getById(accountId: number): Promise<any | null> {
        try {
            const response = await axios.get(
                route("api.accounts.show", accountId),
            );

            if (response.data.success) {
                return response.data.data;
            }

            return null;
        } catch (error) {
            console.error("Error getting account:", error);
            return null;
        }
    },
    /**
     * Get expense accounts for specific outlet
     */
    getExpenseAccountsByOutlet: async (
        outletId: number,
    ): Promise<Account[]> => {
        try {
            const response = await axios.get(route("api.accounts.index"), {
                params: {
                    outletId,
                    type: "expense",
                },
            });

            if (response.data.success) {
                return response.data.data;
            }

            throw new Error(
                response.data.message || "Failed to fetch expense accounts",
            );
        } catch (error: any) {
            console.error("Error fetching expense accounts:", error);
            throw new Error(
                error.response?.data?.message ||
                    error.message ||
                    "Failed to fetch expense accounts",
            );
        }
    },

    /**
     * Get funding accounts for specific outlet (cash, bank, ewallet)
     */
    getFundingAccountsByOutlet: async (
        outletId: number,
    ): Promise<Account[]> => {
        try {
            const response = await axios.get(route("api.accounts.index"), {
                params: {
                    outletId,
                    type: "funding",
                },
            });

            if (response.data.success) {
                return response.data.data;
            }

            throw new Error(
                response.data.message || "Failed to fetch funding accounts",
            );
        } catch (error: any) {
            console.error("Error fetching funding accounts:", error);
            throw new Error(
                error.response?.data?.message ||
                    error.message ||
                    "Failed to fetch funding accounts",
            );
        }
    },

    /**
     * Get next available account code
     */
    async getNextCode(parentId?: number | null): Promise<string> {
        try {
            const response = await axios.get(route("api.accounts.next-code"), {
                params: {
                    parent_id: parentId || undefined,
                },
            });

            if (response.data.success) {
                return response.data.data.nextCode;
            }

            throw new Error(response.data.message || "Failed to generate code");
        } catch (error: any) {
            console.error("Error getting next account code:", error);
            throw new Error(
                error.response?.data?.message ||
                    "Gagal mendapatkan kode akun berikutnya",
            );
        }
    },

    /**
     * Get transactional accounts
     */
    async getTransactionalAccounts(type?: string): Promise<any[]> {
        try {
            const response = await axios.get(
                route("api.accounts.transactional"),
                {
                    params: { type },
                },
            );

            if (response.data.success) {
                return response.data.data;
            }

            return [];
        } catch (error) {
            console.error("Error getting transactional accounts:", error);
            return [];
        }
    },
};

export default accountService;
