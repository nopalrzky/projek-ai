import { router } from "@inertiajs/react";

export const pettyCashService = {
    goToIndex: () => {
        router.visit(route("petty-cashes.index"));
    },

    goToView: (pettyCashId: number) => {
        router.visit(route("petty-cashes.show", pettyCashId));
    },
};
