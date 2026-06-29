import { router } from "@inertiajs/react";
import { UnitFilters } from "@/types";

export const unitService = {
    /**
     * Navigate to units index page with filters
     */
    goToIndex(filters: UnitFilters = {}): void {
        const query = new URLSearchParams(filters as Record<string, string>);
        const url = query.toString()
            ? `${route("units.index")}?${query.toString()}`
            : route("units.index");

        router.visit(url);
    },

    /**
     * Navigate to create unit page
     */
    goToCreate(): void {
        router.visit(route("units.create"));
    },

    /**
     * Navigate to edit unit page
     */
    goToEdit(id: number): void {
        router.visit(route("units.edit", id));
    },

    /**
     * Navigate to unit detail page
     */
    goToView(id: number): void {
        router.visit(route("units.show", id));
    },
};

export default unitService;
