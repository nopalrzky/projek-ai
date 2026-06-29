import { router } from "@inertiajs/react";

export const coinTransactionService = {
    goToIndex: () => {
        router.visit(route("coin-transactions.index"));
    },

    goToView: (transactionId: number) => {
        router.visit(route("coin-transactions.show", transactionId));
    },
};
