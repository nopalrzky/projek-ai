import { router } from "@inertiajs/react";

export const fineService = {
    /**
     * Navigate to fines index page
     */
    goToIndex: () => {
        router.visit(route("fines.index"));
    },

    /**
     * Navigate to create fine page
     */
    goToCreate: () => {
        router.visit(route("fines.create"));
    },

    /**
     * Navigate to edit fine page
     */
    goToEdit: (fineId: number) => {
        router.visit(route("fines.edit", fineId));
    },

    /**
     * Navigate to view fine details page
     */
    goToView: (fineId: number) => {
        router.visit(route("fines.show", fineId));
    },
};

export default fineService;
