import { router } from "@inertiajs/react";

export const priveService = {
    goToIndex: () => {
        router.visit(route("prives.index"));
    },

    goToCreate: () => {
        router.visit(route("prives.create"));
    },

    goToEdit: (priveId: number) => {
        router.visit(route("prives.edit", priveId));
    },

    goToView: (priveId: number) => {
        router.visit(route("prives.show", priveId));
    },
};

export default priveService;
