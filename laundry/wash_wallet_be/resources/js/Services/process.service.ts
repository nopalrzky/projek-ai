import { router } from "@inertiajs/react";
export const processService = {
    /**
     * Navigate to processes list
     */
    goToIndex() {
        router.visit(route("processes.index"));
    },

    /**
     * Navigate to create process form
     */
    goToCreate() {
        router.visit(route("processes.create"));
    },

    /**
     * Navigate to view process detail
     */
    goToView(processId: number) {
        router.visit(route("processes.show", processId));
    },

    /**
     * Navigate to edit process form
     */
    goToEdit(processId: number) {
        router.visit(route("processes.edit", processId));
    },
};

export default processService;
