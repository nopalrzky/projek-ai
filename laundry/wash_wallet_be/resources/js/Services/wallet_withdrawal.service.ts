import { router } from "@inertiajs/react";

export const walletWithdrawalService = {
    goToIndex: () => {
        router.visit(route("wallet-withdrawals.index"));
    },

    goToCreate: () => {
        router.visit(route("wallet-withdrawals.create"));
    },

    goToView: (id: number) => {
        router.visit(route("wallet-withdrawals.show", id));
    },

    goToAdminIndex: () => {
        router.visit(route("admin.wallet-withdrawals.index"));
    },

    goToAdminView: (id: number) => {
        router.visit(route("admin.wallet-withdrawals.show", id));
    },
};
