import { router } from "@inertiajs/react";

export const walletService = {
    goToIndex: () => {
        router.visit(route("wallet.index"));
    },
};
