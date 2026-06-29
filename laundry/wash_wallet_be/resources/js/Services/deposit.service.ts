import { router } from "@inertiajs/react";

export const depositService = {
    goToIndex: () => {
        router.visit(route("deposits.index"));
    },

    goToView: (depositId: number) => {
        router.visit(route("deposits.show", depositId));
    },
};
