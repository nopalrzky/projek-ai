import { router } from "@inertiajs/react";

export const loanService = {
    /**
     * Navigate to loans index
     */
    goToIndex(): void {
        router.get(route("loans.index"));
    },

    /**
     * Navigate to loan create form
     */
    goToCreate(): void {
        router.get(route("loans.create"));
    },

    /**
     * Navigate to loan edit form
     */
    goToEdit(loanId: number): void {
        router.get(route("loans.edit", { loan: loanId }));
    },

    /**
     * Navigate to loan show page
     */
    goToView(loanId: number): void {
        router.get(route("loans.show", { loan: loanId }));
    },
};

export default loanService;
