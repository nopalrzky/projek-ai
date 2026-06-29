import { router } from "@inertiajs/react";
import type { InertiaOptions } from "@/types";

export const membershipPlanService = {
    goToIndex(): void {
        router.get(route("membership-plans.index"));
    },

    /**
     * Navigate to create membership plan page
     */
    goToCreate(): void {
        router.get(route("membership-plans.create"));
    },

    /**
     * Navigate to edit membership plan page
     */
    goToEdit(id: number): void {
        router.get(route("membership-plans.edit", id));
    },

    /**
     * Navigate to membership plan detail page
     */
    goToView(id: number): void {
        router.get(route("membership-plans.show", id));
    },

    async getMembershipPlansByOutletId(
        outletId: number,
        options: InertiaOptions = {},
    ): Promise<any[]> {
        try {
            const response = await fetch(
                route("api.membership-plans.by-outlet", outletId),
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                    },
                },
            );
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                return result.data || [];
            } else {
                throw new Error(result.message || "Failed to fetch categories");
            }
        } catch (error) {
            console.error("Failed to get categories by outlet:", error);
            throw error;
        }
    },
};
