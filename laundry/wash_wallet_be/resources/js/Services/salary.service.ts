import { router } from "@inertiajs/react";

/**
 * Salary service
 */
export const salaryService = {
    /**
     * Navigate to salaries index page
     */
    goToIndex(): void {
        router.visit(route("salaries.index"));
    },

    /**
     * Navigate to create salary component page
     */
    goToCreate(): void {
        router.visit(route("salaries.create"));
    },

    /**
     * Navigate to edit salary component page
     */
    goToEdit(id: number): void {
        router.visit(route("salaries.edit", id));
    },

    /**
     * Navigate to salary component detail page
     */
    goToView(id: number): void {
        router.visit(route("salaries.show", id));
    },
};

export default salaryService;
