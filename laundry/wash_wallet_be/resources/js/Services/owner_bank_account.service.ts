import { router } from "@inertiajs/react";

export const ownerBankAccountService = {
    goToIndex: () => {
        router.visit(route("bank-accounts.index"));
    },

    goToCreate: () => {
        router.visit(route("bank-accounts.create"));
    },

    goToEdit: (id: number) => {
        router.visit(route("bank-accounts.edit", id));
    },
};
